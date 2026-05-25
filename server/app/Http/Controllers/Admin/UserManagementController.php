<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class UserManagementController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::select('id', 'name', 'email', 'role', 'created_at')
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['success' => true, 'users' => $users]);
    }
}
