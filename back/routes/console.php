<?php

use App\Observers\ReservationObserver;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Nuevo comando para verificar reservas expiradas
Artisan::command('reservations:check', function () {
    $this->info('Verificando reservaciones expiradas...');
    
    ReservationObserver::checkAllExpiredReservations();
    
    $this->info('¡Verificación completada!');
})->purpose('Verifica y libera espacios de reservaciones vencidas');

