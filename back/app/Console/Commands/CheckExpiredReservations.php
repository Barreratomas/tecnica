<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Observers\ReservationObserver;

class CheckExpiredReservations extends Command
{
    protected $signature = 'reservations:check-expired';
    protected $description = 'Libera espacios de reservas vencidas';

    public function handle()
    {
        ReservationObserver::checkAllExpiredReservations();
        $this->info('Verificación de reservas vencidas completada.');
    }
}