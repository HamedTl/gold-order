<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Wallet;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderService
{
    private const MAX_RIAL = '999999999999999999999999';
    private const MAX_GOLD = '999999999999.999999';

    public function create(int $userId, array $data): array
    {
        $type = $data['type'];
        $amount = (string) $data['amount'];
        $price = (string) $data['price'];

        $exactTotal = bcmul($amount, $price, 6);
        $totalPrice = bcadd($exactTotal, '0.5', 0);

        if (bccomp($totalPrice, '0', 0) <= 0) {
            throw ValidationException::withMessages([
                'amount' => 'Order total must be at least 1 rial.',
            ]);
        }

        return DB::transaction(function () use (
            $userId,
            $type,
            $amount,
            $price,
            $totalPrice
        ) {
            $wallet = Wallet::where('user_id', $userId)
                ->lockForUpdate()
                ->firstOrFail();

            $rialBalance = (string) $wallet->rial_balance;
            $goldBalance = (string) $wallet->gold_balance;

            if ($type === 'buy') {
                if (bccomp($rialBalance, $totalPrice, 0) < 0) {
                    throw ValidationException::withMessages([
                        'amount' => 'Insufficient rial balance.',
                    ]);
                }

                $newRial = bcsub($rialBalance, $totalPrice, 0);
                $newGold = bcadd($goldBalance, $amount, 6);
            } else {
                if (bccomp($goldBalance, $amount, 6) < 0) {
                    throw ValidationException::withMessages([
                        'amount' => 'Insufficient gold balance.',
                    ]);
                }

                $newGold = bcsub($goldBalance, $amount, 6);
                $newRial = bcadd($rialBalance, $totalPrice, 0);
            }

            if (
                bccomp($newRial, self::MAX_RIAL, 0) > 0 ||
                bccomp($newGold, self::MAX_GOLD, 6) > 0
            ) {
                throw ValidationException::withMessages([
                    'amount' => 'Wallet balance limit exceeded.',
                ]);
            }

            $wallet->rial_balance = $newRial;
            $wallet->gold_balance = $newGold;
            $wallet->save();

            $order = Order::create([
                'user_id' => $userId,
                'type' => $type,
                'amount' => $amount,
                'price' => $price,
                'total_price' => $totalPrice,
            ]);

            return [
                'order' => $order,
                'wallet' => $wallet->fresh(),
            ];
        }, 3);
    }
}
