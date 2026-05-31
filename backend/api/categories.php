<?php


require_once __DIR__ . '/../includes/Database.php';
require_once __DIR__ . '/../includes/functions.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'list';

switch ($action) {
    case 'list':
        handleListCategories();
        break;
    case 'get':
        handleGetCategory($_GET['id'] ?? $_GET['slug'] ?? null);
        break;
    default:
        jsonResponse(['error' => 'Action non valide'], 400);
}


function handleListCategories() {
    $db = Database::getInstance()->getConnection();
    
    $stmt = $db->query("
        SELECT c.*, COUNT(s.id) as services_count
        FROM categories c
        LEFT JOIN services s ON c.id = s.category_id AND s.is_active = 1
        WHERE c.is_active = 1
        GROUP BY c.id
        ORDER BY c.sort_order, c.name
    ");
    
    $categories = $stmt->fetchAll();

    jsonResponse(['categories' => $categories]);
}


function handleGetCategory($identifier) {
    if (empty($identifier)) {
        jsonResponse(['error' => 'ID ou slug requis'], 400);
    }

    $db = Database::getInstance()->getConnection();
    
    $stmt = $db->prepare("
        SELECT c.*, COUNT(s.id) as services_count
        FROM categories c
        LEFT JOIN services s ON c.id = s.category_id AND s.is_active = 1
        WHERE (c.id = ? OR c.slug = ?) AND c.is_active = 1
        GROUP BY c.id
    ");
    $stmt->execute([$identifier, $identifier]);
    $category = $stmt->fetch();

    if (!$category) {
        jsonResponse(['error' => 'Categorie non trouvee'], 404);
    }

    jsonResponse(['category' => $category]);
}
