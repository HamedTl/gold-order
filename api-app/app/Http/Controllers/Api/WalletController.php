<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Wallet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $userId = $request->attributes->get('demo_user_id');
        $wallet = Wallet::where('user_id', $userId)->firstOrFail();

        return $this->success([
            'user_id' => $wallet->user_id,
            'rial_balance' => $wallet->rial_balance,
            'gold_balance' => $wallet->gold_balance,
        ]);
    }
}
