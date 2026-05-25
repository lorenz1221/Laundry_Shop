<?php

namespace App\Enums;

class UserRole
{
    public const CUSTOMER = 'customer';
    public const STAFF = 'staff';
    public const ADMIN = 'admin';

    public static function all(): array
    {
        return [self::CUSTOMER, self::STAFF, self::ADMIN];
    }
}
