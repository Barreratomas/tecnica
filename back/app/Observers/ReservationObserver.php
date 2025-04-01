<?php

namespace App\Observers;

use App\Models\Reservation;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ReservationObserver
{
    /**
     * Handle the Reservation "created" event.
     */
    public function created(Reservation $reservation): void
    {
        $this->checkAndReleaseSpace($reservation);
    }

    /**
     * Handle the Reservation "updated" event.
     */
    public function updated(Reservation $reservation): void
    {
        $this->checkAndReleaseSpace($reservation);
    }

    /**
     * Handle the Reservation "deleted" event.
     */
    public function deleted(Reservation $reservation): void
    {
        DB::transaction(function () use ($reservation) {
            $reservation->space()->update(['available' => true]);
            Log::info('Espacio liberado por eliminación de reserva', [
                'space_id' => $reservation->space_id,
                'reservation_id' => $reservation->id
            ]);
        });
    }

    /**
     * Verificación global de todas las reservas vencidas
     */
    public static function checkAllExpiredReservations(): void
    {
        $now = Carbon::now();
        Log::info("Iniciando verificación global de reservas vencidas", ['fecha' => $now]);

        Reservation::with('space')
            ->whereHas('space', fn($query) => $query->where('available', false))
            ->where('end_time', '<', $now)
            ->each(function ($reservation) {
                DB::transaction(function () use ($reservation) {
                    $reservation->space()->update(['available' => true]);
                    Log::info('Espacio liberado por verificación global', [
                        'space_id' => $reservation->space_id,
                        'reservation_id' => $reservation->id,
                        'end_time' => $reservation->end_time
                    ]);
                });
            });
    }

    /**
     * Método común para verificar y liberar espacio
     */
    protected function checkAndReleaseSpace(Reservation $reservation): void
    {
        Log::info('Verificando reserva', [
            'reservation_id' => $reservation->id,
            'end_time' => $reservation->end_time,
            'now' => Carbon::now()
        ]);

        if (Carbon::now()->greaterThan($reservation->end_time) && 
            $reservation->space->available === false) {
            DB::transaction(function () use ($reservation) {
                $reservation->space()->update(['available' => true]);
                Log::info('Espacio liberado por actualización de reserva', [
                    'space_id' => $reservation->space_id,
                    'reservation_id' => $reservation->id
                ]);
            });
        }
    }
}