<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\SecurityService;
use App\Traits\LogsActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    use LogsActivity;

    /**
     * Get all users with pagination
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->query('per_page', 10);
        $search = $request->query('search', '');
        $role = $request->query('role', '');

        $query = User::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($role) {
            $query->where('role', $role);
        }

        $users = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $users->items(),
            'pagination' => [
                'total' => $users->total(),
                'per_page' => $users->perPage(),
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
            ],
        ]);
    }

    /**
     * Create a new user
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            'role'     => 'required|in:customer,staff,admin',
            'phone'    => 'nullable|string|max:50',
        ]);

        // Injection prevention
        $injection = SecurityService::rejectInjection([
            'name'  => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? '',
        ]);
        if ($injection) {
            return response()->json(['success' => false, 'message' => $injection], 400);
        }

        try {
            $user = User::create([
                'name'     => $data['name'],
                'email'    => strtolower($data['email']),
                'password' => $data['password'],
                'role'     => $data['role'],
                'phone'    => $data['phone'] ?? null,
            ]);

            $this->logActivity(auth()->id(), 'USER_CREATE', "Created user: {$user->name}");

            return response()->json([
                'success' => true,
                'message' => 'User created successfully',
                'user' => $user,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create user: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update an existing user
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|max:255|unique:users,email,'.$id,
            'password' => 'nullable|string|min:6',
            'role'     => 'required|in:customer,staff,admin',
            'phone'    => 'nullable|string|max:50',
        ]);

        // Injection prevention
        $injection = SecurityService::rejectInjection([
            'name'  => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? '',
        ]);
        if ($injection) {
            return response()->json(['success' => false, 'message' => $injection], 400);
        }

        try {
            $user->name = $data['name'];
            $user->email = strtolower($data['email']);
            $user->role = $data['role'];
            $user->phone = $data['phone'] ?? null;

            if (isset($data['password']) && $data['password']) {
                $user->password = $data['password'];
            }

            $user->save();

            $this->logActivity(auth()->id(), 'USER_UPDATE', "Updated user: {$user->name}");

            return response()->json([
                'success' => true,
                'message' => 'User updated successfully',
                'user' => $user,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update user: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a user
     */
    public function destroy(int $id): JsonResponse
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        // Prevent deleting the last admin
        if ($user->role === 'admin') {
            $adminCount = User::where('role', 'admin')->count();
            if ($adminCount <= 1) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete the last admin user',
                ], 400);
            }
        }

        // Prevent self-deletion
        if (auth()->id() === $id) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot delete your own account',
            ], 400);
        }

        try {
            $userName = $user->name;
            $user->delete();

            $this->logActivity(auth()->id(), 'USER_DELETE', "Deleted user: {$userName}");

            return response()->json([
                'success' => true,
                'message' => 'User deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete user: '.$e->getMessage(),
            ], 500);
        }
    }
}
