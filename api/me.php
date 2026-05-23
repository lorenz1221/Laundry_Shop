<?php
/**
 * GET /api/me.php
 * Returns the currently authenticated user from PHP session.
 */

declare(strict_types=1);

require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/session_init.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

$user = getAuthenticatedUser();

if ($user === null) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated.', 'user' => null]);
    exit;
}

echo json_encode(['success' => true, 'user' => $user]);
