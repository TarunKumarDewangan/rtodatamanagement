<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Import Controllers
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\CitizenController;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\TaxController;
use App\Http\Controllers\InsuranceController;
use App\Http\Controllers\PuccController;
use App\Http\Controllers\FitnessController;
use App\Http\Controllers\PermitController;
use App\Http\Controllers\SpeedGovernorController;
use App\Http\Controllers\VltdController;
use App\Http\Controllers\ReportController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// 1. Public Routes
Route::post('/login', [AuthController::class, 'login']);

// 2. Protected Routes (Logged In)
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Citizen
    Route::get('/citizens', [CitizenController::class, 'index']);
    Route::post('/citizens', [CitizenController::class, 'store']);
    Route::get('/citizens/{citizen}', [CitizenController::class, 'show']);

    // Vehicle
    Route::post('/citizens/{citizen}/vehicles', [VehicleController::class, 'store']);
    Route::put('/vehicles/{vehicle}', [VehicleController::class, 'update']);
    Route::delete('/vehicles/{vehicle}', [VehicleController::class, 'destroy']);

    // Documents
    Route::post('/vehicles/{vehicle}/taxes', [TaxController::class, 'store']);
    Route::put('/taxes/{tax}', [TaxController::class, 'update']);
    Route::delete('/taxes/{tax}', [TaxController::class, 'destroy']);

    Route::post('/vehicles/{vehicle}/insurances', [InsuranceController::class, 'store']);
    Route::put('/insurances/{insurance}', [InsuranceController::class, 'update']);
    Route::delete('/insurances/{insurance}', [InsuranceController::class, 'destroy']);

    Route::post('/vehicles/{vehicle}/puccs', [PuccController::class, 'store']);
    Route::put('/puccs/{pucc}', [PuccController::class, 'update']);
    Route::delete('/puccs/{pucc}', [PuccController::class, 'destroy']);

    Route::post('/vehicles/{vehicle}/fitnesses', [FitnessController::class, 'store']);
    Route::put('/fitnesses/{fitness}', [FitnessController::class, 'update']);
    Route::delete('/fitnesses/{fitness}', [FitnessController::class, 'destroy']);

    Route::post('/vehicles/{vehicle}/permits', [PermitController::class, 'store']);
    Route::put('/permits/{permit}', [PermitController::class, 'update']);
    Route::delete('/permits/{permit}', [PermitController::class, 'destroy']);

    Route::post('/vehicles/{vehicle}/speed-governors', [SpeedGovernorController::class, 'store']);
    Route::put('/speed-governors/{speedGovernor}', [SpeedGovernorController::class, 'update']);
    Route::delete('/speed-governors/{speedGovernor}', [SpeedGovernorController::class, 'destroy']);

    Route::post('/vehicles/{vehicle}/vltds', [VltdController::class, 'store']);
    Route::put('/vltds/{vltd}', [VltdController::class, 'update']);
    Route::delete('/vltds/{vltd}', [VltdController::class, 'destroy']);

    // Reports
    Route::get('/reports/expiry', [ReportController::class, 'expiryReport']);

    Route::put('/citizens/{citizen}', [CitizenController::class, 'update']); // Needed for Edit
    Route::delete('/citizens/{citizen}', [CitizenController::class, 'destroy']); // Needed for Delete

    // Admin Only
    Route::middleware('isAdmin')->prefix('admin')->group(function () {
        Route::get('/users', [AdminController::class, 'getUserLevel1Users']);
        Route::get('/users/{user}', [AdminController::class, 'getSingleUser']);
        Route::post('/users', [AdminController::class, 'createUser']);
        Route::put('/users/{user}', [AdminController::class, 'updateUser']);
        Route::delete('/users/{user}', [AdminController::class, 'deleteUser']);
        Route::put('/users/{user}/status', [AdminController::class, 'toggleStatus']);

        Route::get('/activities', [AdminController::class, 'getActivities']);
        Route::post('/users/{user}/activities', [AdminController::class, 'syncUserActivities']);
    });
});
