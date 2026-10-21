<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->restrictOnDelete();
            $table->decimal('rial_balance', 24, 0)->default(0);
            $table->decimal('gold_balance', 18, 6)->default(0);
            $table->timestamps();
        });

        // Extra protection at database level (MySQL)
        if (DB::getDriverName() === 'mysql') {
            DB::statement("
                ALTER TABLE wallets
                ADD CONSTRAINT chk_wallet_balances
                CHECK (
                    rial_balance >= 0
                    AND gold_balance >= 0
                )
            ");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wallets');
    }
};
