<?php
/**
 * GET /api/inventory.php
 * Returns laundryshop_db.inventory consumable stock levels.
 */

declare(strict_types=1);

require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db_connect.php';
require_once __DIR__ . '/session_init.php';

requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

try {
    $pdo  = getDbConnection();
    $stmt = $pdo->query('SELECT id, item_name, current_level, max_level, unit FROM inventory ORDER BY id ASC');
    $rows = $stmt->fetchAll();

    $items = array_map(static function (array $row): array {
        return [
            'id'           => (int) $row['id'],
            'itemName'     => $row['item_name'],
            'currentLevel' => (int) $row['current_level'],
            'maxLevel'     => (int) $row['max_level'],
            'unit'         => $row['unit'],
        ];
    }, $rows);

    echo json_encode(['success' => true, 'inventory' => $items]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error.']);
}
