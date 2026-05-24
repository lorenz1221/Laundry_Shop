<?php
/**
 * POST /api/register.php
 * Accepts JSON: { name, email, password, role }
 * Inserts into laundryshop_db.users with bcrypt-hashed password.
 */

declare(strict_types=1);

require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db_connect.php';

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

$name     = trim($body['name'] ?? '');
$email    = trim(strtolower($body['email'] ?? ''));
$password = $body['password'] ?? '';
$role     = strtolower(trim($body['role'] ?? 'customer'));

// Validate required fields
if ($name === '' || $email === '' || $password === '') {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Name, email, and password are required.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Invalid email format.']);
    exit;
}

if (strlen($password) < 6) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters.']);
    exit;
}

if (!in_array($role, ['customer', 'staff'], true)) {
    $role = 'customer';
}

// Hash password with bcrypt (PASSWORD_BCRYPT)
$hashedPassword = password_hash($password, PASSWORD_BCRYPT);

try {
    $pdo = getDbConnection();

    // Check duplicate email in users.email
    $check = $pdo->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
    $check->execute(['email' => $email]);

    if ($check->fetch()) {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'An account with this email already exists.']);
        exit;
    }

    // INSERT INTO users (name, email, password, role)
    $stmt = $pdo->prepare(
        'INSERT INTO users (name, email, password, role) VALUES (:name, :email, :password, :role)'
    );
    $stmt->execute([
        'name'     => $name,
        'email'    => $email,
        'password' => $hashedPassword,
        'role'     => $role,
    ]);

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Account created successfully. You can now sign in.',
        'user'    => [
            'id'    => (int) $pdo->lastInsertId(),
            'name'  => $name,
            'email' => $email,
            'role'  => $role,
        ],
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error. Please try again.']);
}
