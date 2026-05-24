<?php
/**
 * Secure session bootstrap — used by login, logout, and protected endpoints.
 */

declare(strict_types=1);

if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'httponly' => true,
        'samesite' => 'Lax',
        'secure'   => false, // localhost dev; set true behind HTTPS in production
    ]);
    session_start();
}

/**
 * Returns the authenticated user from $_SESSION or null.
 */
function getAuthenticatedUser(): ?array
{
    if (empty($_SESSION['user_id'])) {
        return null;
    }

    return [
        'id'    => (int) $_SESSION['user_id'],
        'name'  => $_SESSION['user_name'] ?? '',
        'email' => $_SESSION['user_email'] ?? '',
        'role'  => $_SESSION['user_role'] ?? 'customer',
    ];
}

/**
 * Sends 401 JSON and exits if no active session.
 */
function requireAuth(): array
{
    $user = getAuthenticatedUser();
    if ($user === null) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Authentication required.']);
        exit;
    }
    return $user;
}
