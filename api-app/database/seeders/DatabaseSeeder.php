<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Wallet;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'Demo User 1',
                'email' => 'demo1@example.test',
                'rial_balance' => '100000000',
                'gold_balance' => '5.000000',
            ],
            [
                'name' => 'Demo User 2',
                'email' => 'demo2@example.test',
                'rial_balance' => '50000000',
                'gold_balance' => '2.500000',
            ],
        ];

        foreach ($users as $data) {
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'password' => Hash::make(Str::random(32)),
                ]
            );

            Wallet::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'rial_balance' => $data['rial_balance'],
                    'gold_balance' => $data['gold_balance'],
                ]
            );
        }
    }
}
