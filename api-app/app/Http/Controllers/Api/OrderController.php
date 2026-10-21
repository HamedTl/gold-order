<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Services\OrderService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function store(StoreOrderRequest $request, OrderService $orderService): JsonResponse
    {
        try {
            $userId = $request->attributes->get('demo_user_id');
            $result = $orderService->create($userId, $request->validated());

            $order = $result['order'];
            $wallet = $result['wallet'];

            return $this->success([
                'order' => [
                    'id' => $order->id,
                    'type' => $order->type,
                    'amount' => $order->amount,
                    'price' => $order->price,
                    'total_price' => $order->total_price,
                ],
                'wallet' => [
                    'rial_balance' => $wallet->rial_balance,
                    'gold_balance' => $wallet->gold_balance,
                ],
            ], 'Order created successfully.', 201);
        } catch (Exception $exception) {
            return $this->error($exception->getMessage(), 400);
        }
    }
}
