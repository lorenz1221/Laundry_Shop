<?php
/**
 * POST /api/logout.php — destroys PHP session.
 * GET  /api/me.php       — returns current session user.
 */

declare(strict_types=1);

require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/session_init.php';

$script = basename($_SERVER['SCRIPT_NAME']);

if ($script === 'logout.php') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
        exit;
    }

    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
    }
    session_destroy();

    echo json_encode(['success' => true, 'message' => 'Logged out successfully.']);
    exit;
}

// me.php handler (included separately but also here for clarity)
http_response_code(404);
echo json_encode(['success' => false, 'message' => 'Not found.']);
