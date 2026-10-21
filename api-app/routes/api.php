<?php

use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\WalletController;
use App\Http\Middleware\IdentifyDemoUser;
use Illuminate\Support\Facades\Route;


Route::middleware(IdentifyDemoUser::class)->group(function () {
    Route::get('/wallet', [WalletController::class, 'show']);

    Route::post('/orders', [OrderController::class, 'store']);
});

