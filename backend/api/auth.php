<?php


require_once __DIR__ . '/../includes/Database.php';
require_once __DIR__ . '/../includes/functions.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'login':
        handleLogin();
        break;
    case 'register':
        handleRegister();
        break;
    case 'me':
        handleGetCurrentUser();
        break;
    case 'logout':
        handleLogout();
        break;
    default:
        jsonResponse(['error' => 'Action non valide'], 400);
}


function handleLogin() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(['error' => 'Methode non autorisee'], 405);
    }

    $data = getJsonInput();
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';

    if (empty($email) || empty($password)) {
        jsonResponse(['error' => 'Email et mot de passe requis'], 400);
    }

    $db = Database::getInstance()->getConnection();
    
    $stmt = $db->prepare("SELECT * FROM users WHERE email = ? AND is_active = 1");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password'])) {
        jsonResponse(['error' => 'Identifiants invalides'], 401);
    }

    $token = generateToken($user['id'], $user['role']);

    
    unset($user['password']);

    jsonResponse([
        'success' => true,
        'token' => $token,
        'user' => $user
    ]);
}


function handleRegister() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(['error' => 'Methode non autorisee'], 405);
    }

    $data = getJsonInput();
    
    $email = sanitize($data['email'] ?? '');
    $password = $data['password'] ?? '';
    $firstName = sanitize($data['first_name'] ?? '');
    $lastName = sanitize($data['last_name'] ?? '');
    $phone = sanitize($data['phone'] ?? '');

    
    if (empty($email) || empty($password) || empty($firstName) || empty($lastName)) {
        jsonResponse(['error' => 'Tous les champs obligatoires doivent etre remplis'], 400);
    }

    if (!isValidEmail($email)) {
        jsonResponse(['error' => 'Adresse email invalide'], 400);
    }

    if (strlen($password) < 6) {
        jsonResponse(['error' => 'Le mot de passe doit contenir au moins 6 caracteres'], 400);
    }

    $db = Database::getInstance()->getConnection();

    
    $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        jsonResponse(['error' => 'Cette adresse email est deja utilisee'], 409);
    }

    
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    
    $stmt = $db->prepare("
        INSERT INTO users (email, password, first_name, last_name, phone, role)
        VALUES (?, ?, ?, ?, ?, 'client')
    ");
    
    $stmt->execute([$email, $hashedPassword, $firstName, $lastName, $phone]);
    $userId = $db->lastInsertId();

    
    $token = generateToken($userId, 'client');

    
    $stmt = $db->prepare("SELECT id, email, first_name, last_name, phone, role, created_at FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    
    $stmt = $db->prepare("
        INSERT INTO notifications (user_id, type, title, message)
        VALUES (?, 'system', 'Bienvenue chez VitaCare!', 'Decouvrez nos services de bien-etre et reservez votre premiere seance.')
    ");
    $stmt->execute([$userId]);

    jsonResponse([
        'success' => true,
        'token' => $token,
        'user' => $user
    ], 201);
}


function handleGetCurrentUser() {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        jsonResponse(['error' => 'Methode non autorisee'], 405);
    }

    $authUser = requireAuth();
    
    $db = Database::getInstance()->getConnection();
    $stmt = $db->prepare("
        SELECT id, email, first_name, last_name, phone, avatar, role, created_at 
        FROM users WHERE id = ?
    ");
    $stmt->execute([$authUser['user_id']]);
    $user = $stmt->fetch();

    if (!$user) {
        jsonResponse(['error' => 'Utilisateur non trouve'], 404);
    }

    jsonResponse(['user' => $user]);
}


function handleLogout() {
    jsonResponse(['success' => true, 'message' => 'Deconnecte avec succes']);
}
