<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EnsureWebRole
{
    /**
     * SECURITY COMPLIANCE CHECK: block wrong roles from admin/staff/customer web zones.
     */
    public function handle(Request $request, Closure $next, ...$roles)
    {
        if (! Auth::check()) {
            return redirect('/')->with('flash_error', 'Please sign in to continue.');
        }

        if (! in_array(Auth::user()->role, $roles, true)) {
            return redirect('/')->with(
                'flash_error',
                'Access denied: your role "' . Auth::user()->role . '" cannot open this area.'
            );
        }

        return $next($request);
    }
}
