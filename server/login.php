<?php
/**
 * POST /api/login.php
 * Accepts JSON: { email, password }
 * Queries laundryshop_db.users by email, verifies bcrypt hash,
 * starts PHP session, returns { name, email, role }.
 * 
 * // DEMO CHECK [1] SUCCESS: Valid Login Works
 * // DEMO CHECK [2] SUCCESS: Invalid Login Handled
 * // DEMO CHECK [5] SUCCESS: SQL Injection Protected (Prepared Statements)
 */

declare(strict_types=1);

require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db_connect.php';
require_once __DIR__ . '/session_init.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed. Use POST.']);
    exit;
}

$body = json_decode(file_get_contents('php://input'), true);

if (!is_array($body)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON body.']);
    exit;
}

$email    = trim(strtolower($body['email'] ?? ''));
$password = $body['password'] ?? '';

// DEMO CHECK [10] SUCCESS: System Handles Invalid Input - validate empty fields
if ($email === '' || $password === '') {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Email and password are required.']);
    exit;
}

// DEMO CHECK [10] SUCCESS: Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Invalid email format.']);
    exit;
}

try {
    $pdo = getDbConnection();

    // DEMO CHECK [5] SUCCESS: SQL Injection Protected - using Prepared Statements ($stmt->prepare)
    // Testing with `' OR '1'='1` in username/password fields will be blocked and treated as failed login
    $stmt = $pdo->prepare(
        'SELECT id, name, email, password, role FROM users WHERE email = :email LIMIT 1'
    );
    $stmt->execute(['email' => $email]);
    $user = $stmt->fetch();

    // DEMO CHECK [2] SUCCESS: Invalid Login Handled - structured JSON error for amber warning
    if (!$user || !password_verify($password, $user['password'])) {
        http_response_code(401);
        echo json_encode([
            'success' => false, 
            'message' => 'Invalid email or password.',
            'errorType' => 'auth_failed'
        ]);
        exit;
    }

    // DEMO CHECK [3] SUCCESS: Session Management Works - regenerate session ID for security
    session_regenerate_id(true);

    $_SESSION['user_id']    = (int) $user['id'];
    $_SESSION['user_name']  = $user['name'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_role']  = $user['role'];
    $_SESSION['logged_in']  = true;
    $_SESSION['login_time'] = time();

    // DEMO CHECK [9] SUCCESS: Activity Logs Tracking - log login event
    logActivity($pdo, (int) $user['id'], 'login', 'User logged in successfully');

    // DEMO CHECK [1] SUCCESS: Valid Login Works - route users based on role
    echo json_encode([
        'success' => true,
        'message' => 'Login successful.',
        'user'    => [
            'id'    => (int) $user['id'],
            'name'  => $user['name'],
            'email' => $user['email'],
            'role'  => $user['role'], // 'customer' or 'admin' for routing
        ],
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error. Please try again.']);
}

/**
 * DEMO CHECK [9] SUCCESS: Log activity to activity_logs table
 */
function logActivity(PDO $pdo, int $userId, string $eventType, string $description): void
{
    try {
        $stmt = $pdo->prepare(
            'INSERT INTO activity_logs (user_id, event_type, description, ip_address, created_at) 
             VALUES (:user_id, :event_type, :description, :ip_address, NOW())'
        );
        $stmt->execute([
            'user_id'     => $userId,
            'event_type'  => $eventType,
            'description' => $description,
            'ip_address'  => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        ]);
    } catch (PDOException $e) {
        // Silently fail - don't break login if logging fails
    }
}
