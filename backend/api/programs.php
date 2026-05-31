<?php


require_once __DIR__ . '/../includes/Database.php';
require_once __DIR__ . '/../includes/functions.php';

setCorsHeaders();

$action = $_GET['action'] ?? 'list';

switch ($action) {
    case 'list':
        handleListPrograms();
        break;
    case 'get':
        handleGetProgram($_GET['id'] ?? null);
        break;
    case 'enroll':
        handleEnrollProgram();
        break;
    case 'my-programs':
        handleMyPrograms();
        break;
    default:
        jsonResponse(['error' => 'Action non valide'], 400);
}


function handleListPrograms() {
    $db = Database::getInstance()->getConnection();
    
    $stmt = $db->query("
        SELECT * FROM wellness_programs 
        WHERE is_active = 1 
        ORDER BY price
    ");
    $programs = $stmt->fetchAll();

    foreach ($programs as &$program) {
        $program['benefits'] = json_decode($program['benefits'] ?? '[]', true);
    }

    jsonResponse(['programs' => $programs]);
}


function handleGetProgram($identifier) {
    if (empty($identifier)) {
        jsonResponse(['error' => 'ID ou slug requis'], 400);
    }

    $db = Database::getInstance()->getConnection();
    
    $stmt = $db->prepare("
        SELECT * FROM wellness_programs 
        WHERE (id = ? OR slug = ?) AND is_active = 1
    ");
    $stmt->execute([$identifier, $identifier]);
    $program = $stmt->fetch();

    if (!$program) {
        jsonResponse(['error' => 'Programme non trouve'], 404);
    }

    $program['benefits'] = json_decode($program['benefits'] ?? '[]', true);

    
    $user = getAuthUser();
    $program['is_enrolled'] = false;
    
    if ($user) {
        $stmt = $db->prepare("
            SELECT id FROM program_enrollments 
            WHERE program_id = ? AND user_id = ? AND status = 'active'
        ");
        $stmt->execute([$program['id'], $user['user_id']]);
        $program['is_enrolled'] = (bool)$stmt->fetch();
    }

    jsonResponse(['program' => $program]);
}


function handleEnrollProgram() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(['error' => 'Methode non autorisee'], 405);
    }

    $user = requireAuth();
    $data = getJsonInput();
    $programId = $data['program_id'] ?? null;

    if (empty($programId)) {
        jsonResponse(['error' => 'ID programme requis'], 400);
    }

    $db = Database::getInstance()->getConnection();

    
    $stmt = $db->prepare("SELECT * FROM wellness_programs WHERE id = ? AND is_active = 1");
    $stmt->execute([$programId]);
    $program = $stmt->fetch();

    if (!$program) {
        jsonResponse(['error' => 'Programme non trouve'], 404);
    }

    
    $stmt = $db->prepare("
        SELECT id FROM program_enrollments 
        WHERE program_id = ? AND user_id = ? AND status IN ('active', 'paused')
    ");
    $stmt->execute([$programId, $user['user_id']]);
    if ($stmt->fetch()) {
        jsonResponse(['error' => 'Vous etes deja inscrit a ce programme'], 409);
    }

    
    $startDate = date('Y-m-d');
    $endDate = date('Y-m-d', strtotime("+{$program['duration_weeks']} weeks"));

    
    $stmt = $db->prepare("
        INSERT INTO program_enrollments (program_id, user_id, start_date, end_date, status)
        VALUES (?, ?, ?, ?, 'active')
    ");
    $stmt->execute([$programId, $user['user_id'], $startDate, $endDate]);

    
    $stmt = $db->prepare("
        INSERT INTO notifications (user_id, type, title, message, link)
        VALUES (?, 'system', 'Programme demarre', ?, ?)
    ");
    $stmt->execute([
        $user['user_id'],
        "Votre programme {$program['name']} commence aujourd'hui!",
        "/programs/$programId"
    ]);

    jsonResponse(['success' => true, 'message' => 'Inscription au programme reussie'], 201);
}


function handleMyPrograms() {
    $user = requireAuth();
    $db = Database::getInstance()->getConnection();
    
    $stmt = $db->prepare("
        SELECT p.*, pe.start_date, pe.end_date, pe.sessions_completed, pe.status as enrollment_status
        FROM program_enrollments pe
        JOIN wellness_programs p ON pe.program_id = p.id
        WHERE pe.user_id = ?
        ORDER BY pe.start_date DESC
    ");
    $stmt->execute([$user['user_id']]);
    $programs = $stmt->fetchAll();

    foreach ($programs as &$program) {
        $program['benefits'] = json_decode($program['benefits'] ?? '[]', true);
        $program['progress_percent'] = $program['sessions_count'] > 0 
            ? round(($program['sessions_completed'] / $program['sessions_count']) * 100) 
            : 0;
    }

    jsonResponse(['programs' => $programs]);
}
