<?php

use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\OrderController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('spinzone-home', [
        'flash' => session('flash_error'),
    ]);
});

// SECURITY COMPLIANCE CHECK: admin zone — staff & admin only
Route::prefix('admin')->middleware(['web', 'auth', 'web.role:admin,staff'])->group(function () {
    Route::get('/user_management.php', [UserManagementController::class, 'index']);
    Route::get('/admin_dashboard.php', [DashboardController::class, 'stats']);
});

// SECURITY COMPLIANCE CHECK: staff zone
Route::prefix('staff')->middleware(['web', 'auth', 'web.role:staff,admin'])->group(function () {
    Route::get('/orders_panel.php', [OrderController::class, 'index']);
});

// SECURITY COMPLIANCE CHECK: customer zone
Route::prefix('customer')->middleware(['web', 'auth', 'web.role:customer'])->group(function () {
    Route::get('/my_orders.php', [OrderController::class, 'index']);
});
