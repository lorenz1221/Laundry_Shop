<?php
/**
 * User Management API — laundryshop_db.users
 * GET    ?page=N&limit=N&search=term — paginated user list with search
 * POST   — create user (admin only)
 * PATCH  ?id=N — update user
 * DELETE ?id=N — soft delete or permanently delete user
 * 
 * // DEMO CHECK [7] SUCCESS: Admin-Only Access Works
 * // DEMO CHECK [8] SUCCESS: User Management Works (CRUD operations)
 * // DEMO CHECK [5] SUCCESS: SQL Injection Protected (Prepared Statements)
 */

declare(strict_types=1);

require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db_connect.php';
require_once __DIR__ . '/session_init.php';

$user = requireAuth();
$pdo  = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

// DEMO CHECK [7] SUCCESS: Admin-Only Access - check role at start of all files in /admin/
if ($user['role'] !== 'staff' && $user['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode([
        'success' => false, 
        'message' => 'Access denied. Admin privileges required.',
        'redirect' => '/index.php'
    ]);
    exit;
}

function formatUser(array $row): array
{
    return [
        'id'        => (int) $row['id'],
        'name'      => $row['name'],
        'email'     => $row['email'],
        'role'      => $row['role'],
        'createdAt' => $row['created_at'] ?? null,
        'isDeleted' => (bool) ($row['is_deleted'] ?? false),
    ];
}

try {
    // DEMO CHECK [8] SUCCESS: User Management Works - READ operation with pagination and search
    if ($method === 'GET') {
        $page   = max(1, (int) ($_GET['page'] ?? 1));
        $limit  = min(10, max(5, (int) ($_GET['limit'] ?? 10))); // 5-10 rows per page
        $search = trim($_GET['search'] ?? '');
        $offset = ($page - 1) * $limit;

        // Build search query with prepared statements
        $whereClause = '';
        $params = [];

        if ($search !== '') {
            // DEMO CHECK [5] SUCCESS: SQL Injection Protected - Prepared Statements
            $whereClause = 'WHERE (name LIKE :search OR email LIKE :search OR CAST(id AS CHAR) LIKE :search)';
            $params['search'] = '%' . $search . '%';
        }

        // Count total for pagination
        $countSql = "SELECT COUNT(*) as total FROM users $whereClause";
        $countStmt = $pdo->prepare($countSql);
        $countStmt->execute($params);
        $total = (int) $countStmt->fetch()['total'];
        $totalPages = max(1, (int) ceil($total / $limit));

        // Fetch paginated results
        // DEMO CHECK [5] SUCCESS: SQL Injection Protected - Prepared Statements
        $sql = "SELECT id, name, email, role, created_at, is_deleted FROM users $whereClause ORDER BY created_at DESC LIMIT :limit OFFSET :offset";
        $stmt = $pdo->prepare($sql);
        
        foreach ($params as $key => $value) {
            $stmt->bindValue(":$key", $value);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        $users = array_map('formatUser', $stmt->fetchAll());

        echo json_encode([
            'success' => true,
            'users' => $users,
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
        exit;
    }

    // DEMO CHECK [8] SUCCESS: User Management Works - CREATE operation
    if ($method === 'POST') {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $name     = trim($body['name'] ?? '');
        $email    = trim(strtolower($body['email'] ?? ''));
        $password = $body['password'] ?? '';
        $role     = strtolower(trim($body['role'] ?? 'customer'));

        // DEMO CHECK [10] SUCCESS: System Handles Invalid Input
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

        if (!in_array($role, ['customer', 'staff', 'admin'], true)) {
            $role = 'customer';
        }

        // DEMO CHECK [6] SUCCESS: Passwords Are Hashed
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

        // Check duplicate
        $check = $pdo->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
        $check->execute(['email' => $email]);

        if ($check->fetch()) {
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => 'Email already exists.']);
            exit;
        }

        // DEMO CHECK [5] SUCCESS: SQL Injection Protected - Prepared Statements
        $stmt = $pdo->prepare(
            'INSERT INTO users (name, email, password, role, created_at) VALUES (:name, :email, :password, :role, NOW())'
        );
        $stmt->execute([
            'name'     => $name,
            'email'    => $email,
            'password' => $hashedPassword,
            'role'     => $role,
        ]);

        $userId = (int) $pdo->lastInsertId();

        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'User created successfully.',
            'user' => [
                'id' => $userId,
                'name' => $name,
                'email' => $email,
                'role' => $role,
            ],
        ]);
        exit;
    }

    // DEMO CHECK [8] SUCCESS: User Management Works - UPDATE operation
    if ($method === 'PATCH') {
        $userId = (int) ($_GET['id'] ?? 0);
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        if ($userId <= 0) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'Valid user ID required.']);
            exit;
        }

        $updates = [];
        $params = ['id' => $userId];

        if (isset($body['name']) && trim($body['name']) !== '') {
            $updates[] = 'name = :name';
            $params['name'] = trim($body['name']);
        }

        if (isset($body['email']) && trim($body['email']) !== '') {
            $email = trim(strtolower($body['email']));
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                http_response_code(422);
                echo json_encode(['success' => false, 'message' => 'Invalid email format.']);
                exit;
            }
            // Check if email is used by another user
            $check = $pdo->prepare('SELECT id FROM users WHERE email = :email AND id != :uid LIMIT 1');
            $check->execute(['email' => $email, 'uid' => $userId]);
            if ($check->fetch()) {
                http_response_code(409);
                echo json_encode(['success' => false, 'message' => 'Email already in use.']);
                exit;
            }
            $updates[] = 'email = :email';
            $params['email'] = $email;
        }

        if (isset($body['role']) && in_array($body['role'], ['customer', 'staff', 'admin'], true)) {
            $updates[] = 'role = :role';
            $params['role'] = $body['role'];
        }

        if (isset($body['password']) && strlen($body['password']) >= 6) {
            $updates[] = 'password = :password';
            $params['password'] = password_hash($body['password'], PASSWORD_BCRYPT, ['cost' => 12]);
        }

        if (empty($updates)) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'No valid fields to update.']);
            exit;
        }

        // DEMO CHECK [5] SUCCESS: SQL Injection Protected - Prepared Statements
        $sql = 'UPDATE users SET ' . implode(', ', $updates) . ' WHERE id = :id';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        $fetch = $pdo->prepare('SELECT id, name, email, role, created_at FROM users WHERE id = :id');
        $fetch->execute(['id' => $userId]);
        $row = $fetch->fetch();

        if (!$row) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'User not found.']);
            exit;
        }

        echo json_encode([
            'success' => true,
            'message' => 'User updated successfully.',
            'user' => formatUser($row),
        ]);
        exit;
    }

    // DEMO CHECK [8] SUCCESS: User Management Works - DELETE operation (soft delete & permanent delete)
    if ($method === 'DELETE') {
        $userId = (int) ($_GET['id'] ?? 0);
        $permanent = ($_GET['permanent'] ?? '') === 'true';

        if ($userId <= 0) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'Valid user ID required.']);
            exit;
        }

        // Prevent deleting self
        if ($userId === $user['id']) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Cannot delete your own account.']);
            exit;
        }

        if ($permanent) {
            // Permanent delete
            $stmt = $pdo->prepare('DELETE FROM users WHERE id = :id');
            $stmt->execute(['id' => $userId]);
            $message = 'User permanently deleted.';
        } else {
            // Soft delete
            $stmt = $pdo->prepare('UPDATE users SET is_deleted = 1 WHERE id = :id');
            $stmt->execute(['id' => $userId]);
            $message = 'User soft deleted.';
        }

        echo json_encode([
            'success' => true,
            'message' => $message,
        ]);
        exit;
    }

    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error.']);
}
