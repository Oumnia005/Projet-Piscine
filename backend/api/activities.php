<?php


require_once __DIR__ . '/../includes/Database.php';
require_once __DIR__ . '/../includes/functions.php';

setCorsHeaders();

$action = $_GET['action'] ?? 'list';

switch ($action) {
    case 'list':
        handleListActivities();
        break;
    case 'get':
        handleGetActivity($_GET['id'] ?? null);
        break;
    case 'upcoming':
        handleUpcomingActivities();
        break;
    case 'register':
        handleRegisterActivity();
        break;
    case 'unregister':
        handleUnregisterActivity();
        break;
    case 'my-registrations':
        handleMyRegistrations();
        break;
    default:
        jsonResponse(['error' => 'Action non valide'], 400);
}


function handleListActivities() {
    $db = Database::getInstance()->getConnection();
    
    $category = $_GET['category'] ?? null;
    $level = $_GET['level'] ?? null;
    
    $sql = "
        SELECT a.*, c.name as category_name,
               u.first_name as instructor_first_name, u.last_name as instructor_last_name
        FROM activities a
        LEFT JOIN categories c ON a.category_id = c.id
        LEFT JOIN practitioners p ON a.practitioner_id = p.id
        LEFT JOIN users u ON p.user_id = u.id
        WHERE a.is_active = 1 AND a.date >= CURDATE()
    ";
    
    $params = [];
    
    if ($category) {
        $sql .= " AND c.slug = ?";
        $params[] = $category;
    }
    
    if ($level) {
        $sql .= " AND a.level = ?";
        $params[] = $level;
    }
    
    $sql .= " ORDER BY a.date, a.start_time";
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $activities = $stmt->fetchAll();

    
    foreach ($activities as &$activity) {
        $activity['places_remaining'] = $activity['max_participants'] - $activity['current_participants'];
    }

    jsonResponse(['activities' => $activities]);
}


function handleGetActivity($id) {
    if (empty($id)) {
        jsonResponse(['error' => 'ID requis'], 400);
    }

    $db = Database::getInstance()->getConnection();
    
    $stmt = $db->prepare("
        SELECT a.*, c.name as category_name,
               u.first_name as instructor_first_name, u.last_name as instructor_last_name,
               u.avatar as instructor_avatar, p.bio as instructor_bio
        FROM activities a
        LEFT JOIN categories c ON a.category_id = c.id
        LEFT JOIN practitioners p ON a.practitioner_id = p.id
        LEFT JOIN users u ON p.user_id = u.id
        WHERE a.id = ?
    ");
    $stmt->execute([$id]);
    $activity = $stmt->fetch();

    if (!$activity) {
        jsonResponse(['error' => 'Activite non trouvee'], 404);
    }

    $activity['places_remaining'] = $activity['max_participants'] - $activity['current_participants'];

    
    $user = getAuthUser();
    $activity['is_registered'] = false;
    
    if ($user) {
        $stmt = $db->prepare("
            SELECT id FROM activity_registrations 
            WHERE activity_id = ? AND user_id = ? AND status = 'registered'
        ");
        $stmt->execute([$id, $user['user_id']]);
        $activity['is_registered'] = (bool)$stmt->fetch();
    }

    jsonResponse(['activity' => $activity]);
}


function handleUpcomingActivities() {
    $db = Database::getInstance()->getConnection();
    
    $stmt = $db->query("
        SELECT a.*, c.name as category_name,
               u.first_name as instructor_first_name, u.last_name as instructor_last_name
        FROM activities a
        LEFT JOIN categories c ON a.category_id = c.id
        LEFT JOIN practitioners p ON a.practitioner_id = p.id
        LEFT JOIN users u ON p.user_id = u.id
        WHERE a.is_active = 1 
        AND a.date >= CURDATE() 
        AND a.date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
        ORDER BY a.date, a.start_time
        LIMIT 10
    ");
    $activities = $stmt->fetchAll();

    foreach ($activities as &$activity) {
        $activity['places_remaining'] = $activity['max_participants'] - $activity['current_participants'];
    }

    jsonResponse(['activities' => $activities]);
}


function handleRegisterActivity() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(['error' => 'Methode non autorisee'], 405);
    }

    $user = requireAuth();
    $data = getJsonInput();
    $activityId = $data['activity_id'] ?? null;

    if (empty($activityId)) {
        jsonResponse(['error' => 'ID activite requis'], 400);
    }

    $db = Database::getInstance()->getConnection();

    
    $stmt = $db->prepare("
        SELECT * FROM activities 
        WHERE id = ? AND is_active = 1 AND date >= CURDATE()
    ");
    $stmt->execute([$activityId]);
    $activity = $stmt->fetch();

    if (!$activity) {
        jsonResponse(['error' => 'Activite non disponible'], 404);
    }

    
    if ($activity['current_participants'] >= $activity['max_participants']) {
        jsonResponse(['error' => 'Plus de places disponibles'], 409);
    }

    
    $stmt = $db->prepare("
        SELECT id FROM activity_registrations 
        WHERE activity_id = ? AND user_id = ? AND status = 'registered'
    ");
    $stmt->execute([$activityId, $user['user_id']]);
    if ($stmt->fetch()) {
        jsonResponse(['error' => 'Vous etes deja inscrit'], 409);
    }

    
    $stmt = $db->prepare("
        INSERT INTO activity_registrations (activity_id, user_id, status)
        VALUES (?, ?, 'registered')
    ");
    $stmt->execute([$activityId, $user['user_id']]);

    
    $stmt = $db->prepare("
        UPDATE activities SET current_participants = current_participants + 1 WHERE id = ?
    ");
    $stmt->execute([$activityId]);

    
    $stmt = $db->prepare("
        INSERT INTO notifications (user_id, type, title, message, link)
        VALUES (?, 'activity', 'Inscription confirmee', ?, ?)
    ");
    $stmt->execute([
        $user['user_id'],
        "Vous etes inscrit a {$activity['name']} le {$activity['date']}.",
        "/activities/$activityId"
    ]);

    jsonResponse(['success' => true, 'message' => 'Inscription reussie'], 201);
}


function handleUnregisterActivity() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(['error' => 'Methode non autorisee'], 405);
    }

    $user = requireAuth();
    $data = getJsonInput();
    $activityId = $data['activity_id'] ?? null;

    if (empty($activityId)) {
        jsonResponse(['error' => 'ID activite requis'], 400);
    }

    $db = Database::getInstance()->getConnection();

    
    $stmt = $db->prepare("
        SELECT id FROM activity_registrations 
        WHERE activity_id = ? AND user_id = ? AND status = 'registered'
    ");
    $stmt->execute([$activityId, $user['user_id']]);
    $registration = $stmt->fetch();

    if (!$registration) {
        jsonResponse(['error' => 'Inscription non trouvee'], 404);
    }

    
    $stmt = $db->prepare("
        UPDATE activity_registrations SET status = 'cancelled' WHERE id = ?
    ");
    $stmt->execute([$registration['id']]);

    
    $stmt = $db->prepare("
        UPDATE activities SET current_participants = current_participants - 1 WHERE id = ?
    ");
    $stmt->execute([$activityId]);

    jsonResponse(['success' => true, 'message' => 'Desinscription reussie']);
}


function handleMyRegistrations() {
    $user = requireAuth();
    $db = Database::getInstance()->getConnection();
    
    $stmt = $db->prepare("
        SELECT a.*, ar.registered_at, ar.status as registration_status,
               c.name as category_name,
               u.first_name as instructor_first_name, u.last_name as instructor_last_name
        FROM activity_registrations ar
        JOIN activities a ON ar.activity_id = a.id
        LEFT JOIN categories c ON a.category_id = c.id
        LEFT JOIN practitioners p ON a.practitioner_id = p.id
        LEFT JOIN users u ON p.user_id = u.id
        WHERE ar.user_id = ? AND ar.status = 'registered'
        ORDER BY a.date, a.start_time
    ");
    $stmt->execute([$user['user_id']]);
    $registrations = $stmt->fetchAll();

    jsonResponse(['registrations' => $registrations]);
}
