<?php

namespace App\Providers;

use App\Models\Reservation;
use App\Observers\ReservationObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        
        Reservation::observe(ReservationObserver::class);

        $this->app->booted(function() {
            $schedule = app(\Illuminate\Console\Scheduling\Schedule::class);
            $schedule->job(new \App\Jobs\CheckReservationsJob)->everyFiveMinutes();
        });
    }
}
