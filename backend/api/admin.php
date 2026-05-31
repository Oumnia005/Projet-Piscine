<?php


require_once __DIR__ . '/../includes/Database.php';
require_once __DIR__ . '/../includes/functions.php';

setCorsHeaders();

$action = $_GET['action'] ?? 'stats';

switch ($action) {
    case 'stats':
        handleGetStats();
        break;
    case 'users':
        handleGetUsers();
        break;
    case 'bookings':
        handleGetAllBookings();
        break;
    case 'revenue':
        handleGetRevenue();
        break;
    default:
        jsonResponse(['error' => 'Action non valide'], 400);
}


function handleGetStats() {
    $user = requireAdmin();
    $db = Database::getInstance()->getConnection();

    
    $stmt = $db->query("SELECT COUNT(*) as count FROM users WHERE role = 'client'");
    $totalUsers = $stmt->fetch()['count'];

    
    $stmt = $db->query("
        SELECT COUNT(*) as count FROM users 
        WHERE role = 'client' AND MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())
    ");
    $newUsersThisMonth = $stmt->fetch()['count'];

    
    $stmt = $db->query("
        SELECT COUNT(*) as count FROM bookings 
        WHERE booking_date = CURDATE() AND status IN ('pending', 'confirmed')
    ");
    $todayBookings = $stmt->fetch()['count'];

    
    $stmt = $db->query("
        SELECT COUNT(*) as count FROM bookings 
        WHERE booking_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) 
        AND status IN ('pending', 'confirmed', 'completed')
    ");
    $weekBookings = $stmt->fetch()['count'];

    
    $stmt = $db->query("
        SELECT COALESCE(SUM(amount), 0) as total FROM payments 
        WHERE status = 'completed' 
        AND MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())
    ");
    $monthlyRevenue = $stmt->fetch()['total'];

    
    $stmt = $db->query("
        SELECT s.name, COUNT(b.id) as bookings_count
        FROM services s
        LEFT JOIN bookings b ON s.id = b.service_id
        WHERE b.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY s.id
        ORDER BY bookings_count DESC
        LIMIT 5
    ");
    $popularServices = $stmt->fetchAll();

    
    $stmt = $db->query("
        SELECT a.name, a.date, a.current_participants, a.max_participants
        FROM activities a
        WHERE a.date >= CURDATE() AND a.is_active = 1
        ORDER BY a.date
        LIMIT 5
    ");
    $upcomingActivities = $stmt->fetchAll();

    
    $stmt = $db->query("
        SELECT status, COUNT(*) as count FROM bookings 
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY status
    ");
    $bookingsByStatus = $stmt->fetchAll();

    jsonResponse([
        'total_users' => (int)$totalUsers,
        'new_users_this_month' => (int)$newUsersThisMonth,
        'today_bookings' => (int)$todayBookings,
        'week_bookings' => (int)$weekBookings,
        'monthly_revenue' => (float)$monthlyRevenue,
        'popular_services' => $popularServices,
        'upcoming_activities' => $upcomingActivities,
        'bookings_by_status' => $bookingsByStatus
    ]);
}


function handleGetUsers() {
    $user = requireAdmin();
    $db = Database::getInstance()->getConnection();

    $role = $_GET['role'] ?? null;
    $search = $_GET['search'] ?? null;
    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = 20;
    $offset = ($page - 1) * $limit;

    $sql = "SELECT id, email, first_name, last_name, phone, role, is_active, created_at FROM users WHERE 1=1";
    $params = [];

    if ($role) {
        $sql .= " AND role = ?";
        $params[] = $role;
    }

    if ($search) {
        $sql .= " AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)";
        $searchTerm = "%$search%";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
    }

    
    $countStmt = $db->prepare(str_replace("SELECT id, email, first_name, last_name, phone, role, is_active, created_at", "SELECT COUNT(*) as total", $sql));
    $countStmt->execute($params);
    $total = $countStmt->fetch()['total'];

    $sql .= " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    $params[] = $limit;
    $params[] = $offset;

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $users = $stmt->fetchAll();

    jsonResponse([
        'users' => $users,
        'pagination' => [
            'current_page' => $page,
            'total_pages' => ceil($total / $limit),
            'total_items' => (int)$total,
            'per_page' => $limit
        ]
    ]);
}


function handleGetAllBookings() {
    $user = requireAdmin();
    $db = Database::getInstance()->getConnection();

    $status = $_GET['status'] ?? null;
    $date = $_GET['date'] ?? null;
    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = 20;
    $offset = ($page - 1) * $limit;

    $sql = "
        SELECT b.*, s.name as service_name, 
               CONCAT(u.first_name, ' ', u.last_name) as client_name, u.email as client_email
        FROM bookings b
        JOIN services s ON b.service_id = s.id
        JOIN users u ON b.user_id = u.id
        WHERE 1=1
    ";
    $params = [];

    if ($status) {
        $sql .= " AND b.status = ?";
        $params[] = $status;
    }

    if ($date) {
        $sql .= " AND b.booking_date = ?";
        $params[] = $date;
    }

    $sql .= " ORDER BY b.booking_date DESC, b.start_time DESC LIMIT ? OFFSET ?";
    $params[] = $limit;
    $params[] = $offset;

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $bookings = $stmt->fetchAll();

    jsonResponse(['bookings' => $bookings]);
}


function handleGetRevenue() {
    $user = requireAdmin();
    $db = Database::getInstance()->getConnection();

    $period = $_GET['period'] ?? 'month';

    switch ($period) {
        case 'week':
            $stmt = $db->query("
                SELECT DATE(created_at) as date, SUM(amount) as total
                FROM payments WHERE status = 'completed'
                AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                GROUP BY DATE(created_at)
                ORDER BY date
            ");
            break;
        case 'year':
            $stmt = $db->query("
                SELECT DATE_FORMAT(created_at, '%Y-%m') as date, SUM(amount) as total
                FROM payments WHERE status = 'completed'
                AND created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
                GROUP BY DATE_FORMAT(created_at, '%Y-%m')
                ORDER BY date
            ");
            break;
        default: 
            $stmt = $db->query("
                SELECT DATE(created_at) as date, SUM(amount) as total
                FROM payments WHERE status = 'completed'
                AND created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                GROUP BY DATE(created_at)
                ORDER BY date
            ");
    }

    $data = $stmt->fetchAll();

    jsonResponse(['revenue_data' => $data, 'period' => $period]);
}
