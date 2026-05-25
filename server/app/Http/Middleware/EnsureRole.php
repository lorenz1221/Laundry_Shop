<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureRole
{
    /**
     * SECURITY COMPLIANCE CHECK: role-based access barrier for admin/staff routes.
     */
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = $request->user();

        if (! $user || ! in_array($user->role, $roles, true)) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Insufficient privileges for this resource.',
            ], 403);
        }

        return $next($request);
    }
}
