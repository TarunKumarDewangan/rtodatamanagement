<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::middleware('web')->group(function () {
    // Sanctum SPA Login Endpoint
    Route::post('/api/login', [AuthController::class, 'login']);
});

Route::get('/', function () {
    return view('welcome');
});
