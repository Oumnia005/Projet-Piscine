<?php


require_once __DIR__ . '/../includes/Database.php';
require_once __DIR__ . '/../includes/functions.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'list';
$id = $_GET['id'] ?? null;

switch ($action) {
    case 'list':
        handleListServices();
        break;
    case 'get':
        handleGetService($id);
        break;
    case 'featured':
        handleFeaturedServices();
        break;
    case 'by-category':
        handleServicesByCategory($_GET['category'] ?? '');
        break;
    case 'search':
        handleSearchServices($_GET['q'] ?? '');
        break;
    default:
        jsonResponse(['error' => 'Action non valide'], 400);
}


function handleListServices() {
    $db = Database::getInstance()->getConnection();
    
    $stmt = $db->query("
        SELECT s.*, c.name as category_name, c.slug as category_slug
        FROM services s
        JOIN categories c ON s.category_id = c.id
        WHERE s.is_active = 1
        ORDER BY s.is_featured DESC, c.sort_order, s.name
    ");
    
    $services = $stmt->fetchAll();
    
    
    foreach ($services as &$service) {
        $service['benefits'] = json_decode($service['benefits'] ?? '[]', true);
    }

    jsonResponse(['services' => $services]);
}


function handleGetService($identifier) {
    if (empty($identifier)) {
        jsonResponse(['error' => 'ID ou slug requis'], 400);
    }

    $db = Database::getInstance()->getConnection();
    
    
    $stmt = $db->prepare("
        SELECT s.*, c.name as category_name, c.slug as category_slug
        FROM services s
        JOIN categories c ON s.category_id = c.id
        WHERE (s.id = ? OR s.slug = ?) AND s.is_active = 1
    ");
    $stmt->execute([$identifier, $identifier]);
    $service = $stmt->fetch();

    if (!$service) {
        jsonResponse(['error' => 'Service non trouve'], 404);
    }

    $service['benefits'] = json_decode($service['benefits'] ?? '[]', true);

    
    $stmt = $db->prepare("
        SELECT p.*, u.first_name, u.last_name, u.avatar
        FROM practitioners p
        JOIN users u ON p.user_id = u.id
        JOIN practitioner_services ps ON p.id = ps.practitioner_id
        WHERE ps.service_id = ? AND p.is_available = 1
    ");
    $stmt->execute([$service['id']]);
    $practitioners = $stmt->fetchAll();

    
    $stmt = $db->prepare("
        SELECT r.*, u.first_name, u.last_name
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.service_id = ? AND r.is_approved = 1
        ORDER BY r.created_at DESC
        LIMIT 10
    ");
    $stmt->execute([$service['id']]);
    $reviews = $stmt->fetchAll();

    $service['practitioners'] = $practitioners;
    $service['reviews'] = $reviews;

    jsonResponse(['service' => $service]);
}


function handleFeaturedServices() {
    $db = Database::getInstance()->getConnection();
    
    $stmt = $db->query("
        SELECT s.*, c.name as category_name, c.slug as category_slug
        FROM services s
        JOIN categories c ON s.category_id = c.id
        WHERE s.is_active = 1 AND s.is_featured = 1
        ORDER BY RAND()
        LIMIT 6
    ");
    
    $services = $stmt->fetchAll();
    
    foreach ($services as &$service) {
        $service['benefits'] = json_decode($service['benefits'] ?? '[]', true);
    }

    jsonResponse(['services' => $services]);
}


function handleServicesByCategory($categorySlug) {
    if (empty($categorySlug)) {
        jsonResponse(['error' => 'Categorie requise'], 400);
    }

    $db = Database::getInstance()->getConnection();
    
    
    $stmt = $db->prepare("SELECT * FROM categories WHERE slug = ? AND is_active = 1");
    $stmt->execute([$categorySlug]);
    $category = $stmt->fetch();

    if (!$category) {
        jsonResponse(['error' => 'Categorie non trouvee'], 404);
    }

    
    $stmt = $db->prepare("
        SELECT s.*, c.name as category_name, c.slug as category_slug
        FROM services s
        JOIN categories c ON s.category_id = c.id
        WHERE s.category_id = ? AND s.is_active = 1
        ORDER BY s.is_featured DESC, s.name
    ");
    $stmt->execute([$category['id']]);
    $services = $stmt->fetchAll();

    foreach ($services as &$service) {
        $service['benefits'] = json_decode($service['benefits'] ?? '[]', true);
    }

    jsonResponse([
        'category' => $category,
        'services' => $services
    ]);
}


function handleSearchServices($query) {
    if (empty($query) || strlen($query) < 2) {
        jsonResponse(['error' => 'Requete trop courte'], 400);
    }

    $db = Database::getInstance()->getConnection();
    $searchTerm = '%' . $query . '%';
    
    $stmt = $db->prepare("
        SELECT s.*, c.name as category_name, c.slug as category_slug
        FROM services s
        JOIN categories c ON s.category_id = c.id
        WHERE s.is_active = 1 
        AND (s.name LIKE ? OR s.description LIKE ? OR c.name LIKE ?)
        ORDER BY s.is_featured DESC, s.name
        LIMIT 20
    ");
    $stmt->execute([$searchTerm, $searchTerm, $searchTerm]);
    $services = $stmt->fetchAll();

    foreach ($services as &$service) {
        $service['benefits'] = json_decode($service['benefits'] ?? '[]', true);
    }

    jsonResponse(['services' => $services, 'query' => $query]);
}
