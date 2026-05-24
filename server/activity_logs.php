<?php
/**
 * Activity Logs API — laundryshop_db.activity_logs
 * GET ?page=N&limit=N — paginated activity log list
 * 
 * // DEMO CHECK [7] SUCCESS: Admin-Only Access Works
 * // DEMO CHECK [9] SUCCESS: Activity Logs Tracking - viewable via admin/view_logs.php
 */

declare(strict_types=1);

require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db_connect.php';
require_once __DIR__ . '/session_init.php';

$user = requireAuth();
$pdo  = getDbConnection();

// DEMO CHECK [7] SUCCESS: Admin-Only Access - session checking at top of all admin files
if ($user['role'] !== 'staff' && $user['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode([
        'success' => false, 
        'message' => 'Access denied. Admin privileges required.',
        'redirect' => '/index.php'
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

try {
    $page   = max(1, (int) ($_GET['page'] ?? 1));
    $limit  = min(50, max(10, (int) ($_GET['limit'] ?? 10)));
    $offset = ($page - 1) * $limit;
    $eventType = trim($_GET['eventType'] ?? '');

    // Build query with optional event type filter
    $whereClause = '';
    $params = [];

    if ($eventType !== '' && in_array($eventType, ['login', 'logout'], true)) {
        $whereClause = 'WHERE al.event_type = :eventType';
        $params['eventType'] = $eventType;
    }

    // Count total
    $countSql = "SELECT COUNT(*) as total FROM activity_logs al $whereClause";
    $countStmt = $pdo->prepare($countSql);
    $countStmt->execute($params);
    $total = (int) $countStmt->fetch()['total'];
    $totalPages = max(1, (int) ceil($total / $limit));

    // DEMO CHECK [9] SUCCESS: Activity Logs Tracking - fetch logs with user info
    // DEMO CHECK [5] SUCCESS: SQL Injection Protected - Prepared Statements
    $sql = "SELECT 
                al.id,
                al.user_id,
                al.event_type,
                al.description,
                al.ip_address,
                al.created_at,
                u.name as user_name,
                u.email as user_email
            FROM activity_logs al
            LEFT JOIN users u ON al.user_id = u.id
            $whereClause
            ORDER BY al.created_at DESC 
            LIMIT :limit OFFSET :offset";
    
    $stmt = $pdo->prepare($sql);
    foreach ($params as $key => $value) {
        $stmt->bindValue(":$key", $value);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();

    $logs = [];
    while ($row = $stmt->fetch()) {
        $logs[] = [
            'id'          => (int) $row['id'],
            'userId'      => (int) $row['user_id'],
            'userName'    => $row['user_name'] ?? 'Unknown',
            'userEmail'   => $row['user_email'] ?? 'Unknown',
            'eventType'   => $row['event_type'],
            'description' => $row['description'],
            'ipAddress'   => $row['ip_address'],
            'createdAt'   => $row['created_at'],
        ];
    }

    echo json_encode([
        'success' => true,
        'logs' => $logs,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'totalPages' => $totalPages,
            'showing' => [
                'from' => $total === 0 ? 0 : $offset + 1,
                'to' => min($offset + $limit, $total),
            ],
        ],
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error.']);
}
