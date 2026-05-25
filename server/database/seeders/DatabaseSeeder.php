<?php

namespace Database\Seeders;

use App\Models\Inventory;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        $hash = '$2y$10$4rZWTrS8L6yfSNwVRy81YO0JS8x9i2Y9GJs3CPC1stgAscIuESkGW'; // staff123

        User::updateOrCreate(
            ['email' => 'staff@spinzone.com'],
            ['name' => 'Demo Admin', 'password' => $hash, 'role' => 'admin']
        );

        User::updateOrCreate(
            ['email' => 'admin@spinzone.com'],
            ['name' => 'Spinzone Admin', 'password' => $hash, 'role' => 'admin']
        );

        // Promote any legacy staff accounts to admin
        User::where('role', 'staff')->update(['role' => 'admin']);

        foreach ([
            ['Detergent', 85, 100, 'L'],
            ['Softener', 72, 100, 'L'],
            ['Bleach', 60, 100, 'L'],
        ] as [$name, $current, $max, $unit]) {
            Inventory::updateOrCreate(
                ['item_name' => $name],
                ['current_level' => $current, 'max_level' => $max, 'unit' => $unit]
            );
        }
    }
}
