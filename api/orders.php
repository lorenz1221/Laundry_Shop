<?php
/**
 * Orders API — laundryshop_db.orders
 * GET    ?view=active|ledger  — active excludes completed; ledger includes all
 * POST   — create order
 * PATCH  ?id=N — update status (queue|washing|drying|ready|completed)
 */

declare(strict_types=1);

require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db_connect.php';
require_once __DIR__ . '/session_init.php';

$user = requireAuth();
$pdo  = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

const VALID_STATUSES = ['queue', 'washing', 'drying', 'ready', 'completed'];

function formatOrder(array $row): array
{
    return [
        'id'               => (int) $row['id'],
        'customerId'       => $row['customer_id'] !== null ? (int) $row['customer_id'] : null,
        'customerName'     => $row['customer_name'],
        'contactPhone'     => $row['contact_phone'] ?? null,
        'addressLine1'     => $row['address_line1'] ?? null,
        'addressLine2'     => $row['address_line2'] ?? null,
        'specialNotes'     => $row['special_notes'] ?? null,
        'weightKg'         => (float) $row['weight_kg'],
        'serviceType'      => $row['service_type'],
        'scheduledDate'    => $row['scheduled_date'],
        'scheduledTime'    => $row['scheduled_time'],
        'fulfillmentType'  => $row['fulfillment_type'],
        'status'           => $row['status'],
        'totalFee'         => (float) $row['total_fee'],
        'paymentStatus'    => $row['payment_status'],
        'createdAt'        => $row['created_at'],
    ];
}

function calculateFee(float $weight, string $service): float
{
    $rates = [
        'wash-dry-fold'  => 45,
        'wash-dry-press' => 65,
        'premium-care'   => 95,
    ];
    return round($weight * ($rates[$service] ?? 45), 2);
}

function deductInventory(PDO $pdo, float $weightKg): void
{
    $deductions = [
        'Detergent' => max(1, (int) ceil($weightKg * 0.5)),
        'Softener'  => max(1, (int) ceil($weightKg * 0.3)),
        'Bleach'    => max(0, (int) ceil($weightKg * 0.15)),
    ];
    foreach ($deductions as $itemName => $amount) {
        if ($amount <= 0) continue;
        $stmt = $pdo->prepare(
            'UPDATE inventory SET current_level = GREATEST(0, current_level - :amount) WHERE item_name = :name'
        );
        $stmt->execute(['amount' => $amount, 'name' => $itemName]);
    }
}

try {
    if ($method === 'GET') {
        $view = $_GET['view'] ?? 'default';

        if ($user['role'] === 'staff') {
            if ($view === 'ledger') {
                // Fiscal ledger: all records including completed
                $stmt = $pdo->query('SELECT * FROM orders ORDER BY created_at DESC');
            } else {
                // Active operational queue: excludes completed
                $stmt = $pdo->query(
                    "SELECT * FROM orders WHERE status != 'completed' ORDER BY created_at ASC"
                );
            }
        } else {
            $stmt = $pdo->prepare(
                'SELECT * FROM orders WHERE customer_id = :uid ORDER BY created_at DESC'
            );
            $stmt->execute(['uid' => $user['id']]);
        }

        $orders = array_map('formatOrder', $stmt->fetchAll());
        echo json_encode(['success' => true, 'orders' => $orders]);
        exit;
    }

    if ($method === 'POST') {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $customerName    = trim($body['customerName'] ?? $user['name']);
        $contactPhone    = trim($body['contactPhone'] ?? '') ?: null;
        $addressLine1    = trim($body['addressLine1'] ?? '') ?: null;
        $addressLine2    = trim($body['addressLine2'] ?? '') ?: null;
        $specialNotes    = trim($body['specialNotes'] ?? '') ?: null;
        $weightKg        = (float) ($body['weightKg'] ?? 0);
        $serviceType     = $body['serviceType'] ?? 'wash-dry-fold';
        $scheduledDate   = $body['scheduledDate'] ?? null;
        $scheduledTime   = $body['scheduledTime'] ?? null;
        $fulfillmentType = $body['fulfillmentType'] ?? 'dropoff';
        $paymentStatus   = $body['paymentStatus'] ?? 'pending';
        $customerId      = $user['role'] === 'staff' ? ($body['customerId'] ?? null) : $user['id'];

        if ($weightKg <= 0 || $weightKg > 50) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'Weight must be between 0.5 and 50 kg.']);
            exit;
        }

        $validServices = ['wash-dry-fold', 'wash-dry-press', 'premium-care'];
        if (!in_array($serviceType, $validServices, true)) {
            $serviceType = 'wash-dry-fold';
        }

        $totalFee = calculateFee($weightKg, $serviceType);

        $stmt = $pdo->prepare(
            'INSERT INTO orders (
                customer_id, customer_name, contact_phone, address_line1, address_line2, special_notes,
                weight_kg, service_type, scheduled_date, scheduled_time, fulfillment_type,
                status, total_fee, payment_status
            ) VALUES (
                :cid, :cname, :phone, :addr1, :addr2, :notes,
                :weight, :service, :sdate, :stime, :fulfill,
                \'queue\', :fee, :pay
            )'
        );
        $stmt->execute([
            'cid'     => $customerId,
            'cname'   => $customerName,
            'phone'   => $contactPhone,
            'addr1'   => $addressLine1,
            'addr2'   => $addressLine2,
            'notes'   => $specialNotes,
            'weight'  => $weightKg,
            'service' => $serviceType,
            'sdate'   => $scheduledDate ?: null,
            'stime'   => $scheduledTime ?: null,
            'fulfill' => in_array($fulfillmentType, ['dropoff', 'delivery'], true) ? $fulfillmentType : 'dropoff',
            'fee'     => $totalFee,
            'pay'     => in_array($paymentStatus, ['pending', 'paid'], true) ? $paymentStatus : 'pending',
        ]);

        $orderId = (int) $pdo->lastInsertId();
        deductInventory($pdo, $weightKg);

        $fetch = $pdo->prepare('SELECT * FROM orders WHERE id = :id');
        $fetch->execute(['id' => $orderId]);

        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Order created successfully.',
            'order'   => formatOrder($fetch->fetch()),
        ]);
        exit;
    }

    if ($method === 'PATCH') {
        if ($user['role'] !== 'staff') {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Staff access required.']);
            exit;
        }

        $orderId = (int) ($_GET['id'] ?? 0);
        $body    = json_decode(file_get_contents('php://input'), true) ?? [];
        $status  = $body['status'] ?? '';

        if ($orderId <= 0 || !in_array($status, VALID_STATUSES, true)) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'Valid order id and status required.']);
            exit;
        }

        $stmt = $pdo->prepare('UPDATE orders SET status = :status WHERE id = :id');
        $stmt->execute(['status' => $status, 'id' => $orderId]);

        $fetch = $pdo->prepare('SELECT * FROM orders WHERE id = :id');
        $fetch->execute(['id' => $orderId]);
        $row = $fetch->fetch();

        if (!$row) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Order not found.']);
            exit;
        }

        echo json_encode([
            'success' => true,
            'message' => $status === 'completed' ? 'Order completed and archived.' : 'Order status updated.',
            'order'   => formatOrder($row),
        ]);
        exit;
    }

    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error.']);
}
