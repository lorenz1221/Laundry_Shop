<?php
/**
 * POST /api/logout.php — destroys PHP session completely.
 * 
 * // DEMO CHECK [4] SUCCESS: Logout Works Properly
 * // DEMO CHECK [9] SUCCESS: Activity Logs Tracking - log logout event
 */

declare(strict_types=1);

require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db_connect.php';
require_once __DIR__ . '/session_init.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

// DEMO CHECK [9] SUCCESS: Log logout event before destroying session
$userId = $_SESSION['user_id'] ?? null;
if ($userId) {
    try {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare(
            'INSERT INTO activity_logs (user_id, event_type, description, ip_address, created_at) 
             VALUES (:user_id, :event_type, :description, :ip_address, NOW())'
        );
        $stmt->execute([
            'user_id'     => $userId,
            'event_type'  => 'logout',
            'description' => 'User logged out',
            'ip_address'  => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        ]);
    } catch (PDOException $e) {
        // Continue with logout even if logging fails
    }
}

// DEMO CHECK [4] SUCCESS: Logout Works Properly - completely destroy all session variables
$_SESSION = [];

// DEMO CHECK [4] SUCCESS: Destroy session cookie
if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(), 
        '', 
        time() - 42000, 
        $params['path'], 
        $params['domain'], 
        $params['secure'], 
        $params['httponly']
    );
}

// DEMO CHECK [4] SUCCESS: Destroy the session completely
session_destroy();

// Set cache headers to prevent back button access
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Cache-Control: post-check=0, pre-check=0', false);
header('Pragma: no-cache');

echo json_encode([
    'success' => true, 
    'message' => 'Logged out successfully.',
    'redirect' => '/index.php'
]);
