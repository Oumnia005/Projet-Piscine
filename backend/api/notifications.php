<?php


require_once __DIR__ . '/../includes/Database.php';
require_once __DIR__ . '/../includes/functions.php';

setCorsHeaders();

$action = $_GET['action'] ?? 'list';

switch ($action) {
    case 'list':
        handleListNotifications();
        break;
    case 'mark-read':
        handleMarkRead();
        break;
    case 'mark-all-read':
        handleMarkAllRead();
        break;
    case 'delete':
        handleDeleteNotification();
        break;
    case 'unread-count':
        handleUnreadCount();
        break;
    default:
        jsonResponse(['error' => 'Action non valide'], 400);
}


function handleListNotifications() {
    $user = requireAuth();
    $db = Database::getInstance()->getConnection();
    
    $limit = min((int)($_GET['limit'] ?? 20), 100);
    $unreadOnly = isset($_GET['unread_only']);
    
    $sql = "SELECT * FROM notifications WHERE user_id = ?";
    if ($unreadOnly) {
        $sql .= " AND is_read = 0";
    }
    $sql .= " ORDER BY created_at DESC LIMIT ?";
    
    $stmt = $db->prepare($sql);
    $stmt->execute([$user['user_id'], $limit]);
    $notifications = $stmt->fetchAll();

    jsonResponse(['notifications' => $notifications]);
}


function handleMarkRead() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(['error' => 'Methode non autorisee'], 405);
    }

    $user = requireAuth();
    $data = getJsonInput();
    $notificationId = $data['notification_id'] ?? null;

    if (empty($notificationId)) {
        jsonResponse(['error' => 'ID requis'], 400);
    }

    $db = Database::getInstance()->getConnection();
    
    $stmt = $db->prepare("
        UPDATE notifications SET is_read = 1 
        WHERE id = ? AND user_id = ?
    ");
    $stmt->execute([$notificationId, $user['user_id']]);

    jsonResponse(['success' => true]);
}


function handleMarkAllRead() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(['error' => 'Methode non autorisee'], 405);
    }

    $user = requireAuth();
    $db = Database::getInstance()->getConnection();
    
    $stmt = $db->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?");
    $stmt->execute([$user['user_id']]);

    jsonResponse(['success' => true, 'message' => 'Toutes les notifications marquees comme lues']);
}


function handleDeleteNotification() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(['error' => 'Methode non autorisee'], 405);
    }

    $user = requireAuth();
    $data = getJsonInput();
    $notificationId = $data['notification_id'] ?? null;

    if (empty($notificationId)) {
        jsonResponse(['error' => 'ID requis'], 400);
    }

    $db = Database::getInstance()->getConnection();
    
    $stmt = $db->prepare("DELETE FROM notifications WHERE id = ? AND user_id = ?");
    $stmt->execute([$notificationId, $user['user_id']]);

    jsonResponse(['success' => true]);
}


function handleUnreadCount() {
    $user = requireAuth();
    $db = Database::getInstance()->getConnection();
    
    $stmt = $db->prepare("
        SELECT COUNT(*) as count FROM notifications 
        WHERE user_id = ? AND is_read = 0
    ");
    $stmt->execute([$user['user_id']]);
    $result = $stmt->fetch();

    jsonResponse(['count' => (int)$result['count']]);
}
