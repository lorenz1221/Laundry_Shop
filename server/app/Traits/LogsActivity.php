<?php

namespace App\Traits;

use App\Models\ActivityLog;

trait LogsActivity
{
    protected function logActivity(?int $userId, string $action, ?string $details = null): void
    {
        // SECURITY COMPLIANCE CHECK: persist action to activity_logs table
        ActivityLog::create([
            'user_id'    => $userId,
            'action'     => $action,
            'details'    => $details,
            'ip_address' => request()->ip(),
        ]);
    }
}
