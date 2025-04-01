<?php

namespace App\Console\Commands;

use App\Observers\ReservationObserver;
use Illuminate\Console\Command;

class CheckReservationsCommand extends Command
{
    protected $signature = 'reservations:check';
    protected $description = 'Verifica y libera espacios de reservaciones vencidas';
    
    public function handle()
    {
        $this->info('Iniciando verificación de reservas expiradas...');
        $this->newLine();
        
        // Ejecuta la verificación
        ReservationObserver::checkAllExpiredReservations();
        
        $this->newLine();
        $this->info('¡Proceso completado con éxito!');
    }
}
