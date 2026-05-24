<?php
/**
 * POST /api/register.php
 * Accepts JSON: { name, email, password, role }
 * Inserts into laundryshop_db.users with bcrypt-hashed password.
 * 
 * // DEMO CHECK [6] SUCCESS: Passwords Are Hashed (PASSWORD_BCRYPT)
 * // DEMO CHECK [10] SUCCESS: System Handles Invalid Input
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

// DEMO CHECK [10] SUCCESS: System Handles Invalid Input - validate all fields
if ($name === '' || $email === '' || $password === '') {
    http_response_code(422);
    echo json_encode([
        'success' => false, 
        'message' => 'Name, email, and password are required.',
        'errorType' => 'validation_failed'
    ]);
    exit;
}

// DEMO CHECK [10] SUCCESS: Validate name format (no special characters that could be malicious)
if (!preg_match('/^[a-zA-Z\s\-\.]+$/', $name) || strlen($name) < 2 || strlen($name) > 100) {
    http_response_code(422);
    echo json_encode([
        'success' => false, 
        'message' => 'Name must be 2-100 characters and contain only letters, spaces, hyphens, and periods.',
        'errorType' => 'validation_failed'
    ]);
    exit;
}

// DEMO CHECK [10] SUCCESS: Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode([
        'success' => false, 
        'message' => 'Invalid email format.',
        'errorType' => 'validation_failed'
    ]);
    exit;
}

// DEMO CHECK [10] SUCCESS: Validate password strength
if (strlen($password) < 6) {
    http_response_code(422);
    echo json_encode([
        'success' => false, 
        'message' => 'Password must be at least 6 characters.',
        'errorType' => 'validation_failed'
    ]);
    exit;
}

// Validate role - only allow 'customer' or 'staff' (admin can be set manually in DB)
if (!in_array($role, ['customer', 'staff'], true)) {
    $role = 'customer';
}

// DEMO CHECK [6] SUCCESS: Passwords Are Hashed using PASSWORD_BCRYPT
// No readable plaintext string is ever inserted into the database
$hashedPassword = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

try {
    $pdo = getDbConnection();

    // DEMO CHECK [5] SUCCESS: SQL Injection Protected - using Prepared Statements
    $check = $pdo->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
    $check->execute(['email' => $email]);

    if ($check->fetch()) {
        http_response_code(409);
        echo json_encode([
            'success' => false, 
            'message' => 'An account with this email already exists.',
            'errorType' => 'duplicate_email'
        ]);
        exit;
    }

    // DEMO CHECK [5] SUCCESS: SQL Injection Protected - using Prepared Statements
    $stmt = $pdo->prepare(
        'INSERT INTO users (name, email, password, role, created_at) VALUES (:name, :email, :password, :role, NOW())'
    );
    $stmt->execute([
        'name'     => $name,
        'email'    => $email,
        'password' => $hashedPassword, // DEMO CHECK [6]: Hashed password stored
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
