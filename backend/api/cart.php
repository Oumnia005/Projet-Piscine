<?php


require_once __DIR__ . '/../includes/Database.php';
require_once __DIR__ . '/../includes/functions.php';

setCorsHeaders();

$action = $_GET['action'] ?? 'get';

switch ($action) {
    case 'get':
        handleGetCart();
        break;
    case 'add':
        handleAddToCart();
        break;
    case 'remove':
        handleRemoveFromCart();
        break;
    case 'clear':
        handleClearCart();
        break;
    case 'checkout':
        handleCheckout();
        break;
    default:
        jsonResponse(['error' => 'Action non valide'], 400);
}


function handleGetCart() {
    $user = requireAuth();
    $db = Database::getInstance()->getConnection();
    
    $stmt = $db->prepare("
        SELECT c.*, 
               CASE 
                   WHEN c.item_type = 'service' THEN s.name
                   WHEN c.item_type = 'activity' THEN a.name
                   WHEN c.item_type = 'program' THEN p.name
               END as item_name,
               CASE 
                   WHEN c.item_type = 'service' THEN s.image
                   WHEN c.item_type = 'activity' THEN a.image
                   WHEN c.item_type = 'program' THEN p.image
               END as item_image,
               ts.date as slot_date, ts.start_time as slot_start_time
        FROM cart c
        LEFT JOIN services s ON c.item_type = 'service' AND c.item_id = s.id
        LEFT JOIN activities a ON c.item_type = 'activity' AND c.item_id = a.id
        LEFT JOIN wellness_programs p ON c.item_type = 'program' AND c.item_id = p.id
        LEFT JOIN time_slots ts ON c.time_slot_id = ts.id
        WHERE c.user_id = ?
        ORDER BY c.created_at DESC
    ");
    $stmt->execute([$user['user_id']]);
    $items = $stmt->fetchAll();

    $total = array_reduce($items, function($sum, $item) {
        return $sum + ($item['price'] * $item['quantity']);
    }, 0);

    jsonResponse([
        'items' => $items,
        'total' => $total,
        'count' => count($items)
    ]);
}


function handleAddToCart() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(['error' => 'Methode non autorisee'], 405);
    }

    $user = requireAuth();
    $data = getJsonInput();
    
    $itemType = $data['item_type'] ?? '';
    $itemId = $data['item_id'] ?? null;
    $timeSlotId = $data['time_slot_id'] ?? null;
    $quantity = $data['quantity'] ?? 1;

    if (!in_array($itemType, ['service', 'activity', 'program']) || empty($itemId)) {
        jsonResponse(['error' => 'Type et ID requis'], 400);
    }

    $db = Database::getInstance()->getConnection();

    
    $price = 0;
    switch ($itemType) {
        case 'service':
            $stmt = $db->prepare("SELECT price, price_promo FROM services WHERE id = ?");
            $stmt->execute([$itemId]);
            $item = $stmt->fetch();
            $price = $item['price_promo'] ?? $item['price'];
            break;
        case 'activity':
            $stmt = $db->prepare("SELECT price FROM activities WHERE id = ?");
            $stmt->execute([$itemId]);
            $item = $stmt->fetch();
            $price = $item['price'];
            break;
        case 'program':
            $stmt = $db->prepare("SELECT price FROM wellness_programs WHERE id = ?");
            $stmt->execute([$itemId]);
            $item = $stmt->fetch();
            $price = $item['price'];
            break;
    }

    if (!$item) {
        jsonResponse(['error' => 'Article non trouve'], 404);
    }

    
    $stmt = $db->prepare("
        SELECT id FROM cart 
        WHERE user_id = ? AND item_type = ? AND item_id = ?
    ");
    $stmt->execute([$user['user_id'], $itemType, $itemId]);
    
    if ($stmt->fetch()) {
        jsonResponse(['error' => 'Deja dans le panier'], 409);
    }

    
    $stmt = $db->prepare("
        INSERT INTO cart (user_id, item_type, item_id, time_slot_id, quantity, price)
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$user['user_id'], $itemType, $itemId, $timeSlotId, $quantity, $price]);

    jsonResponse(['success' => true, 'message' => 'Ajoute au panier'], 201);
}


function handleRemoveFromCart() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(['error' => 'Methode non autorisee'], 405);
    }

    $user = requireAuth();
    $data = getJsonInput();
    $cartItemId = $data['cart_item_id'] ?? null;

    if (empty($cartItemId)) {
        jsonResponse(['error' => 'ID requis'], 400);
    }

    $db = Database::getInstance()->getConnection();

    $stmt = $db->prepare("DELETE FROM cart WHERE id = ? AND user_id = ?");
    $stmt->execute([$cartItemId, $user['user_id']]);

    if ($stmt->rowCount() === 0) {
        jsonResponse(['error' => 'Article non trouve'], 404);
    }

    jsonResponse(['success' => true, 'message' => 'Retire du panier']);
}


function handleClearCart() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(['error' => 'Methode non autorisee'], 405);
    }

    $user = requireAuth();
    $db = Database::getInstance()->getConnection();

    $stmt = $db->prepare("DELETE FROM cart WHERE user_id = ?");
    $stmt->execute([$user['user_id']]);

    jsonResponse(['success' => true, 'message' => 'Panier vide']);
}


function handleCheckout() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(['error' => 'Methode non autorisee'], 405);
    }

    $user = requireAuth();
    $data = getJsonInput();
    $paymentMethod = $data['payment_method'] ?? 'card';

    $db = Database::getInstance()->getConnection();

    
    $stmt = $db->prepare("SELECT * FROM cart WHERE user_id = ?");
    $stmt->execute([$user['user_id']]);
    $cartItems = $stmt->fetchAll();

    if (empty($cartItems)) {
        jsonResponse(['error' => 'Panier vide'], 400);
    }

    $total = array_reduce($cartItems, function($sum, $item) {
        return $sum + ($item['price'] * $item['quantity']);
    }, 0);

    try {
        $db->beginTransaction();

        
        $transactionId = 'TXN_' . uniqid() . '_' . time();
        
        $stmt = $db->prepare("
            INSERT INTO payments (user_id, amount, payment_method, status, transaction_id)
            VALUES (?, ?, ?, 'completed', ?)
        ");
        $stmt->execute([$user['user_id'], $total, $paymentMethod, $transactionId]);
        $paymentId = $db->lastInsertId();

        
        foreach ($cartItems as $item) {
            switch ($item['item_type']) {
                case 'service':
                    
                    $stmt = $db->prepare("
                        INSERT INTO bookings (user_id, service_id, booking_date, start_time, end_time, total_price, status)
                        VALUES (?, ?, CURDATE(), '10:00:00', '11:00:00', ?, 'confirmed')
                    ");
                    $stmt->execute([$user['user_id'], $item['item_id'], $item['price']]);
                    break;
                    
                case 'activity':
                    
                    $stmt = $db->prepare("
                        INSERT INTO activity_registrations (activity_id, user_id, status)
                        VALUES (?, ?, 'registered')
                        ON DUPLICATE KEY UPDATE status = 'registered'
                    ");
                    $stmt->execute([$item['item_id'], $user['user_id']]);
                    
                    $stmt = $db->prepare("
                        UPDATE activities SET current_participants = current_participants + 1 
                        WHERE id = ? AND current_participants < max_participants
                    ");
                    $stmt->execute([$item['item_id']]);
                    break;
                    
                case 'program':
                    
                    $stmt = $db->prepare("SELECT duration_weeks FROM wellness_programs WHERE id = ?");
                    $stmt->execute([$item['item_id']]);
                    $program = $stmt->fetch();
                    
                    $endDate = date('Y-m-d', strtotime("+{$program['duration_weeks']} weeks"));
                    
                    $stmt = $db->prepare("
                        INSERT INTO program_enrollments (program_id, user_id, start_date, end_date, status)
                        VALUES (?, ?, CURDATE(), ?, 'active')
                    ");
                    $stmt->execute([$item['item_id'], $user['user_id'], $endDate]);
                    break;
            }
        }

        
        $stmt = $db->prepare("DELETE FROM cart WHERE user_id = ?");
        $stmt->execute([$user['user_id']]);

        
        $stmt = $db->prepare("
            INSERT INTO notifications (user_id, type, title, message)
            VALUES (?, 'system', 'Paiement confirme', ?)
        ");
        $stmt->execute([
            $user['user_id'],
            "Votre paiement de {$total}€ a ete accepte. Transaction: $transactionId"
        ]);

        $db->commit();

        jsonResponse([
            'success' => true,
            'message' => 'Paiement effectue avec succes',
            'transaction_id' => $transactionId,
            'total' => $total
        ]);

    } catch (Exception $e) {
        $db->rollBack();
        jsonResponse(['error' => 'Erreur lors du paiement: ' . $e->getMessage()], 500);
    }
}
