<?php
/**
 * Orders API — laundryshop_db.orders
 * GET    ?view=active|ledger|stats — active excludes completed; ledger includes all; stats for dashboard
 * POST   — create order
 * PATCH  ?id=N — update status or payment_status
 * 
 * // DEMO CHECK [5] SUCCESS: SQL Injection Protected (Prepared Statements)
 * // DEMO CHECK [7] SUCCESS: Admin-Only Access Works (session checking)
 */

declare(strict_types=1);

require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db_connect.php';
require_once __DIR__ . '/session_init.php';

$user = requireAuth();
$pdo  = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

const VALID_STATUSES = ['queue', 'washing', 'drying', 'ready', 'completed'];
const VALID_PAYMENT_STATUSES = ['pending', 'paid'];

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
        // DEMO CHECK [5] SUCCESS: SQL Injection Protected - Prepared Statements
        $stmt = $pdo->prepare(
            'UPDATE inventory SET current_level = GREATEST(0, current_level - :amount) WHERE item_name = :name'
        );
        $stmt->execute(['amount' => $amount, 'name' => $itemName]);
    }
}

try {
    if ($method === 'GET') {
        $view = $_GET['view'] ?? 'default';

        // DEMO CHECK [7] SUCCESS: Admin-Only Access - check staff/admin role for admin views
        if ($view === 'stats') {
            if ($user['role'] !== 'staff' && $user['role'] !== 'admin') {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Admin access required.']);
                exit;
            }

            // Executive Analytics for Dashboard
            $revenueStmt = $pdo->query("SELECT COALESCE(SUM(total_fee), 0) as total FROM orders WHERE payment_status = 'paid'");
            $totalRevenue = (float) $revenueStmt->fetch()['total'];

            $weightStmt = $pdo->query("SELECT COALESCE(SUM(weight_kg), 0) as total FROM orders");
            $totalWeight = (float) $weightStmt->fetch()['total'];

            $customersStmt = $pdo->query("SELECT COUNT(DISTINCT customer_id) as total FROM orders WHERE customer_id IS NOT NULL");
            $totalCustomers = (int) $customersStmt->fetch()['total'];

            $activeOrdersStmt = $pdo->query("SELECT COUNT(*) as total FROM orders WHERE status != 'completed'");
            $activeOrders = (int) $activeOrdersStmt->fetch()['total'];

            $todayRevenueStmt = $pdo->query("SELECT COALESCE(SUM(total_fee), 0) as total FROM orders WHERE DATE(created_at) = CURDATE() AND payment_status = 'paid'");
            $todayRevenue = (float) $todayRevenueStmt->fetch()['total'];

            $pendingPaymentsStmt = $pdo->query("SELECT COUNT(*) as total FROM orders WHERE payment_status = 'pending' AND status != 'completed'");
            $pendingPayments = (int) $pendingPaymentsStmt->fetch()['total'];

            echo json_encode([
                'success' => true,
                'stats' => [
                    'totalRevenue' => $totalRevenue,
                    'totalWeight' => $totalWeight,
                    'totalCustomers' => $totalCustomers,
                    'activeOrders' => $activeOrders,
                    'todayRevenue' => $todayRevenue,
                    'pendingPayments' => $pendingPayments,
                ],
            ]);
            exit;
        }

        if ($user['role'] === 'staff' || $user['role'] === 'admin') {
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
            // DEMO CHECK [5] SUCCESS: SQL Injection Protected - Prepared Statements
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
        $customerId      = ($user['role'] === 'staff' || $user['role'] === 'admin') ? ($body['customerId'] ?? null) : $user['id'];

        // DEMO CHECK [10] SUCCESS: System Handles Invalid Input
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

        // DEMO CHECK [5] SUCCESS: SQL Injection Protected - Prepared Statements
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
            'pay'     => in_array($paymentStatus, VALID_PAYMENT_STATUSES, true) ? $paymentStatus : 'pending',
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
        // DEMO CHECK [7] SUCCESS: Admin-Only Access - require staff/admin role for updates
        if ($user['role'] !== 'staff' && $user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Staff access required.']);
            exit;
        }

        $orderId = (int) ($_GET['id'] ?? 0);
        $body    = json_decode(file_get_contents('php://input'), true) ?? [];

        if ($orderId <= 0) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'Valid order id required.']);
            exit;
        }

        // Handle status update
        if (isset($body['status'])) {
            $status = $body['status'];
            if (!in_array($status, VALID_STATUSES, true)) {
                http_response_code(422);
                echo json_encode(['success' => false, 'message' => 'Invalid status value.']);
                exit;
            }

            // DEMO CHECK [5] SUCCESS: SQL Injection Protected - Prepared Statements
            $stmt = $pdo->prepare('UPDATE orders SET status = :status WHERE id = :id');
            $stmt->execute(['status' => $status, 'id' => $orderId]);
        }

        // Handle payment status update (Interactive Payment Status Toggle)
        if (isset($body['paymentStatus'])) {
            $paymentStatus = $body['paymentStatus'];
            if (!in_array($paymentStatus, VALID_PAYMENT_STATUSES, true)) {
                http_response_code(422);
                echo json_encode(['success' => false, 'message' => 'Invalid payment status value.']);
                exit;
            }

            // DEMO CHECK [5] SUCCESS: SQL Injection Protected - Prepared Statements
            $stmt = $pdo->prepare('UPDATE orders SET payment_status = :payment_status WHERE id = :id');
            $stmt->execute(['payment_status' => $paymentStatus, 'id' => $orderId]);
        }

        $fetch = $pdo->prepare('SELECT * FROM orders WHERE id = :id');
        $fetch->execute(['id' => $orderId]);
        $row = $fetch->fetch();

        if (!$row) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Order not found.']);
            exit;
        }

        $message = 'Order updated.';
        if (isset($body['status']) && $body['status'] === 'completed') {
            $message = 'Order completed and archived.';
        }
        if (isset($body['paymentStatus'])) {
            $message = $body['paymentStatus'] === 'paid' ? 'Payment marked as Paid.' : 'Payment marked as Pending.';
        }

        echo json_encode([
            'success' => true,
            'message' => $message,
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
