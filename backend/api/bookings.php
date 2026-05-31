<?php


require_once __DIR__ . '/../includes/Database.php';
require_once __DIR__ . '/../includes/functions.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'list';

switch ($action) {
    case 'list':
        handleListBookings();
        break;
    case 'get':
        handleGetBooking($_GET['id'] ?? null);
        break;
    case 'create':
        handleCreateBooking();
        break;
    case 'cancel':
        handleCancelBooking($_GET['id'] ?? null);
        break;
    case 'available-slots':
        handleAvailableSlots();
        break;
    case 'history':
        handleBookingHistory();
        break;
    default:
        jsonResponse(['error' => 'Action non valide'], 400);
}


function handleListBookings() {
    $user = requireAuth();
    $db = Database::getInstance()->getConnection();
    
    $status = $_GET['status'] ?? null;
    $upcoming = isset($_GET['upcoming']);
    
    $sql = "
        SELECT b.*, s.name as service_name, s.image as service_image,
               u.first_name as practitioner_first_name, u.last_name as practitioner_last_name
        FROM bookings b
        JOIN services s ON b.service_id = s.id
        LEFT JOIN practitioners p ON b.practitioner_id = p.id
        LEFT JOIN users u ON p.user_id = u.id
        WHERE b.user_id = ?
    ";
    
    $params = [$user['user_id']];
    
    if ($status) {
        $sql .= " AND b.status = ?";
        $params[] = $status;
    }
    
    if ($upcoming) {
        $sql .= " AND b.booking_date >= CURDATE() AND b.status IN ('pending', 'confirmed')";
    }
    
    $sql .= " ORDER BY b.booking_date DESC, b.start_time DESC";
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $bookings = $stmt->fetchAll();

    jsonResponse(['bookings' => $bookings]);
}


function handleGetBooking($id) {
    $user = requireAuth();
    
    if (empty($id)) {
        jsonResponse(['error' => 'ID requis'], 400);
    }

    $db = Database::getInstance()->getConnection();
    
    $stmt = $db->prepare("
        SELECT b.*, s.name as service_name, s.image as service_image, s.description as service_description,
               u.first_name as practitioner_first_name, u.last_name as practitioner_last_name,
               u.avatar as practitioner_avatar
        FROM bookings b
        JOIN services s ON b.service_id = s.id
        LEFT JOIN practitioners p ON b.practitioner_id = p.id
        LEFT JOIN users u ON p.user_id = u.id
        WHERE b.id = ? AND (b.user_id = ? OR ? = 'admin')
    ");
    $stmt->execute([$id, $user['user_id'], $user['role']]);
    $booking = $stmt->fetch();

    if (!$booking) {
        jsonResponse(['error' => 'Reservation non trouvee'], 404);
    }

    jsonResponse(['booking' => $booking]);
}


function handleCreateBooking() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(['error' => 'Methode non autorisee'], 405);
    }

    $user = requireAuth();
    $data = getJsonInput();
    
    $serviceId = $data['service_id'] ?? null;
    $practitionerId = $data['practitioner_id'] ?? null;
    $bookingDate = $data['booking_date'] ?? null;
    $startTime = $data['start_time'] ?? null;
    $notes = sanitize($data['notes'] ?? '');

    
    if (empty($serviceId) || empty($bookingDate) || empty($startTime)) {
        jsonResponse(['error' => 'Service, date et heure requis'], 400);
    }

    $db = Database::getInstance()->getConnection();

    
    $stmt = $db->prepare("SELECT * FROM services WHERE id = ? AND is_active = 1");
    $stmt->execute([$serviceId]);
    $service = $stmt->fetch();

    if (!$service) {
        jsonResponse(['error' => 'Service non trouve'], 404);
    }

    
    $startDateTime = new DateTime("$bookingDate $startTime");
    $endDateTime = clone $startDateTime;
    $endDateTime->modify("+{$service['duration']} minutes");
    $endTime = $endDateTime->format('H:i:s');

    
    $stmt = $db->prepare("
        SELECT id FROM bookings 
        WHERE service_id = ? 
        AND booking_date = ? 
        AND status IN ('pending', 'confirmed')
        AND (
            (start_time <= ? AND end_time > ?) OR
            (start_time < ? AND end_time >= ?) OR
            (start_time >= ? AND end_time <= ?)
        )
    ");
    $stmt->execute([
        $serviceId, $bookingDate,
        $startTime, $startTime,
        $endTime, $endTime,
        $startTime, $endTime
    ]);
    
    if ($stmt->fetch()) {
        jsonResponse(['error' => 'Ce creneau n\'est plus disponible'], 409);
    }

    
    $stmt = $db->prepare("
        INSERT INTO bookings (user_id, service_id, practitioner_id, booking_date, start_time, end_time, total_price, notes, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')
    ");
    
    $stmt->execute([
        $user['user_id'],
        $serviceId,
        $practitionerId,
        $bookingDate,
        $startTime,
        $endTime,
        $service['price_promo'] ?? $service['price'],
        $notes
    ]);

    $bookingId = $db->lastInsertId();

    
    $stmt = $db->prepare("
        INSERT INTO notifications (user_id, type, title, message, link)
        VALUES (?, 'booking', 'Reservation confirmee', ?, ?)
    ");
    $stmt->execute([
        $user['user_id'],
        "Votre reservation pour {$service['name']} le $bookingDate a $startTime est confirmee.",
        "/dashboard/bookings/$bookingId"
    ]);

    
    $stmt = $db->prepare("SELECT * FROM bookings WHERE id = ?");
    $stmt->execute([$bookingId]);
    $booking = $stmt->fetch();

    jsonResponse(['success' => true, 'booking' => $booking], 201);
}


function handleCancelBooking($id) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(['error' => 'Methode non autorisee'], 405);
    }

    $user = requireAuth();
    
    if (empty($id)) {
        jsonResponse(['error' => 'ID requis'], 400);
    }

    $data = getJsonInput();
    $reason = sanitize($data['reason'] ?? '');

    $db = Database::getInstance()->getConnection();

    
    $stmt = $db->prepare("
        SELECT * FROM bookings 
        WHERE id = ? AND user_id = ? AND status IN ('pending', 'confirmed')
    ");
    $stmt->execute([$id, $user['user_id']]);
    $booking = $stmt->fetch();

    if (!$booking) {
        jsonResponse(['error' => 'Reservation non trouvee ou non annulable'], 404);
    }

    
    $stmt = $db->prepare("
        UPDATE bookings 
        SET status = 'cancelled', cancellation_reason = ?, updated_at = NOW()
        WHERE id = ?
    ");
    $stmt->execute([$reason, $id]);

    
    $stmt = $db->prepare("
        INSERT INTO notifications (user_id, type, title, message)
        VALUES (?, 'booking', 'Reservation annulee', 'Votre reservation a ete annulee avec succes.')
    ");
    $stmt->execute([$user['user_id']]);

    jsonResponse(['success' => true, 'message' => 'Reservation annulee']);
}


function handleAvailableSlots() {
    $serviceId = $_GET['service_id'] ?? null;
    $date = $_GET['date'] ?? date('Y-m-d');
    $practitionerId = $_GET['practitioner_id'] ?? null;

    if (empty($serviceId)) {
        jsonResponse(['error' => 'Service requis'], 400);
    }

    $db = Database::getInstance()->getConnection();

    
    $stmt = $db->prepare("SELECT duration FROM services WHERE id = ?");
    $stmt->execute([$serviceId]);
    $service = $stmt->fetch();

    if (!$service) {
        jsonResponse(['error' => 'Service non trouve'], 404);
    }

    
    $slots = [];
    $startHour = 9;
    $endHour = 19;
    $duration = $service['duration'];

    for ($hour = $startHour; $hour < $endHour; $hour++) {
        for ($minute = 0; $minute < 60; $minute += 30) {
            $slotStart = sprintf('%02d:%02d:00', $hour, $minute);
            $slotEnd = date('H:i:s', strtotime($slotStart) + ($duration * 60));
            
            if (strtotime($slotEnd) > strtotime("$endHour:00:00")) {
                continue;
            }

            
            $sql = "
                SELECT id FROM bookings 
                WHERE service_id = ? 
                AND booking_date = ? 
                AND status IN ('pending', 'confirmed')
                AND (
                    (start_time <= ? AND end_time > ?) OR
                    (start_time < ? AND end_time >= ?)
                )
            ";
            $params = [$serviceId, $date, $slotStart, $slotStart, $slotEnd, $slotEnd];
            
            if ($practitionerId) {
                $sql .= " AND practitioner_id = ?";
                $params[] = $practitionerId;
            }

            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            
            $isAvailable = !$stmt->fetch();

            $slots[] = [
                'start_time' => substr($slotStart, 0, 5),
                'end_time' => substr($slotEnd, 0, 5),
                'is_available' => $isAvailable
            ];
        }
    }

    jsonResponse(['slots' => $slots, 'date' => $date]);
}


function handleBookingHistory() {
    $user = requireAuth();
    $db = Database::getInstance()->getConnection();
    
    $stmt = $db->prepare("
        SELECT b.*, s.name as service_name, s.image as service_image
        FROM bookings b
        JOIN services s ON b.service_id = s.id
        WHERE b.user_id = ? AND b.status IN ('completed', 'cancelled', 'no_show')
        ORDER BY b.booking_date DESC
        LIMIT 50
    ");
    $stmt->execute([$user['user_id']]);
    $bookings = $stmt->fetchAll();

    jsonResponse(['bookings' => $bookings]);
}
