<?php

use Illuminate\Support\Facades\Route;

Route::get('/healthz', function () {
    return response('OK', 200);
});

Route::get('/', function () {
    return view('welcome');
});
