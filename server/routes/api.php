<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\RecaptchaController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

/*
| Spinzone REST API — session auth for React SPA (credentials: include)
*/

Route::middleware(['web'])->group(function () {
    Route::get('/recaptcha/site-key', [RecaptchaController::class, 'siteKey']);

    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);

        Route::get('/orders', [OrderController::class, 'index']);
        Route::post('/orders', [OrderController::class, 'store']);
        Route::patch('/orders/{id}', [OrderController::class, 'updateStatus']);

        Route::get('/inventory', [InventoryController::class, 'index']);

        Route::middleware('role:staff,admin')->group(function () {
            Route::patch('/orders/{id}/payment', [PaymentController::class, 'update']);
            Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
        });

        Route::middleware('role:admin')->group(function () {
            Route::get('/users', [UserController::class, 'index']);
            Route::post('/users', [UserController::class, 'store']);
            Route::put('/users/{id}', [UserController::class, 'update']);
            Route::delete('/users/{id}', [UserController::class, 'destroy']);
        });
    });

    // Legacy .php filenames for backward compatibility
    Route::post('/register_process.php', [AuthController::class, 'register']);
    Route::post('/login_process.php', [AuthController::class, 'login']);
    Route::get('/me.php', [AuthController::class, 'me'])->middleware('auth');
    Route::post('/logout.php', [AuthController::class, 'logout'])->middleware('auth');
    Route::get('/orders.php', [OrderController::class, 'index'])->middleware('auth');
    Route::post('/orders.php', [OrderController::class, 'store'])->middleware('auth');
    Route::patch('/update_payment.php', [PaymentController::class, 'updateLegacy'])
        ->middleware(['auth', 'role:staff,admin']);
    Route::patch('/orders.php', function (\Illuminate\Http\Request $request) {
        return app(OrderController::class)->updateStatus(
            $request,
            (int) $request->query('id', 0)
        );
    })->middleware(['auth', 'role:staff,admin']);
    Route::get('/dashboard_stats.php', [DashboardController::class, 'stats'])
        ->middleware(['auth', 'role:staff,admin']);
    Route::get('/inventory.php', [InventoryController::class, 'index'])->middleware('auth');
});
