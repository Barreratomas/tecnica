<?php
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SpaceController;
use App\Http\Controllers\ReservationController;
use App\Http\Middleware\AdminMiddleware;
use App\Http\Middleware\RoleMiddleware;

use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']); // Inicio de sesión
Route::post('/register', [AuthController::class, 'register']); // Registro de usuario



Route::middleware([ RoleMiddleware::class . ':admin,user'])->group(function () { 
    Route::post('/logout', [AuthController::class, 'logout']);  // Cerrar sesióm



    
    // Espacios (Ver espacios disponibles)
    Route::get('/spaces', [SpaceController::class, 'index']); // Listar espacios
    Route::get('/spaces/{id}', [SpaceController::class, 'show']); // Ver un espacio específico
    
    // Reservas (Usuarios)
    Route::get('/reservations', [ReservationController::class, 'index']); // Listar reservas del usuario
    Route::post('/reservations', [ReservationController::class, 'store']); // Crear reserva
    Route::delete('/reservations/{id}', [ReservationController::class, 'cancel']); // Cancelar reserva

    // Rutas exclusivas para administradores
    Route::middleware([ RoleMiddleware::class . ':admin'])->group(function () {
        Route::post('/spaces', [SpaceController::class, 'store']); // Crear espacios
        Route::put('/spaces/{id}', [SpaceController::class, 'update']); // Editar espacion
        Route::delete('/spaces/{id}', [SpaceController::class, 'destroy']); // Eliminar espacios

        Route::get('/admin/reservations', [ReservationController::class, 'listAll']); // Listar todas las reservas
        Route::put('/admin/reservations/{id}/approve', [ReservationController::class, 'approve']); // Aprobar reserva
        Route::put('/admin/reservations/{id}/reject', [ReservationController::class, 'reject']); // Rechazar reserva
        Route::delete('/admin/reservations/{id}/delete', [ReservationController::class, 'eliminar']); // Eliminar reserva

    });

});