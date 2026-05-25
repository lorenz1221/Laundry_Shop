<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\RecaptchaService;
use App\Services\SecurityService;
use App\Traits\LogsActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    use LogsActivity;

    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'            => 'required|string|max:255',
            'email'           => 'required|email|max:255',
            'password'        => 'required|string|min:6',
            'role'            => 'nullable|in:customer,admin',
            'recaptchaToken'  => 'nullable|string',
        ]);

        if (! RecaptchaService::verify($data['recaptchaToken'] ?? null)) {
            return response()->json([
                'success' => false,
                'message' => 'Please complete the CAPTCHA verification.',
            ], 422);
        }

        $injection = SecurityService::rejectInjection([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => $data['password'],
        ]);
        if ($injection) {
            return response()->json(['success' => false, 'message' => $injection], 400);
        }

        $email = strtolower($data['email']);
        if (User::where('email', $email)->exists()) {
            return response()->json(['success' => false, 'message' => 'An account with this email already exists.'], 409);
        }

        $role = $data['role'] ?? 'customer';
        if (! in_array($role, ['customer', 'admin'], true)) {
            $role = 'customer';
        }

        // SECURITY COMPLIANCE CHECK: PASSWORD_BCRYPT via Hash::make before save
        $user = User::create([
            'name'     => $data['name'],
            'email'    => $email,
            'password' => Hash::make($data['password']),
            'role'     => $role,
        ]);

        $this->logActivity($user->id, 'REGISTER', 'New account: ' . $email . ' (' . $role . ')');

        return response()->json([
            'success' => true,
            'message' => 'Account created successfully. You can now sign in.',
            'user'    => $this->formatUser($user),
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email'           => 'required|email',
            'password'        => 'required|string',
            'recaptchaToken'  => 'nullable|string',
        ]);

        if (! RecaptchaService::verify($data['recaptchaToken'] ?? null)) {
            return response()->json([
                'success' => false,
                'message' => 'Please complete the CAPTCHA verification.',
            ], 422);
        }

        $injection = SecurityService::rejectInjection([
            'email'    => $data['email'],
            'password' => $data['password'],
        ]);
        if ($injection) {
            return response()->json(['success' => false, 'message' => $injection], 400);
        }

        // SECURITY COMPLIANCE CHECK: Eloquent uses prepared statements (blocks SQLi bypass)
        $user = User::where('email', strtolower($data['email']))->first();

        // SECURITY COMPLIANCE CHECK: password_verify equivalent via Hash::check
        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json(['success' => false, 'message' => 'Invalid email or password.'], 401);
        }

        Auth::login($user);
        $request->session()->regenerate();

        $this->logActivity($user->id, 'LOGIN', 'User signed in: ' . $user->email);

        return response()->json([
            'success' => true,
            'message' => 'Login successful.',
            'user'    => $this->formatUser($user),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['success' => false, 'message' => 'Not authenticated.', 'user' => null], 401);
        }

        return response()->json(['success' => true, 'user' => $this->formatUser($user)]);
    }

    public function logout(Request $request): JsonResponse
    {
        if ($request->user()) {
            $this->logActivity($request->user()->id, 'LOGOUT', 'User signed out');
        }

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['success' => true, 'message' => 'Logged out successfully.']);
    }

    private function formatUser(User $user): array
    {
        return [
            'id'    => $user->id,
            'name'  => $user->name,
            'email' => $user->email,
            'role'  => $user->role,
        ];
    }
}
