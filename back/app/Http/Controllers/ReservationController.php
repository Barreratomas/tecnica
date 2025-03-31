<?php

namespace App\Http\Controllers;

use App\Http\Requests\ReservationRequest;
use App\Http\Requests\AdminReservationRequest;
use App\Models\Reservation;
use Illuminate\Support\Facades\Auth;

class ReservationController extends Controller
{
    public function index()
    {
        return response()->json(Auth::user()->reservations);
    }

    // public function store(ReservationRequest $request)
    // {
    //     $reservation = Auth::user()->reservations()->create($request->validated());

    //     return response()->json([
    //         'message' => 'Reserva creada',
    //         'reservation' => $reservation
    //     ], 201);
    // }

    // public function cancel($id)
    // {
    //     $reservation = Auth::user()->reservations()->findOrFail($id);
    //     $reservation->delete();

    //     return response()->json(['message' => 'Reserva cancelada']);
    // }

    // Métodos de administrador
    // public function listAll()
    // {
    //     $this->authorize('viewAny', Reservation::class);
    //     return response()->json(Reservation::all());
    // }

    public function approve($id, AdminReservationRequest $request)
    {
        $reservation = Reservation::findOrFail($id);
        $reservation->update(['status' => 'approved']);

        return response()->json(['message' => 'Reserva aprobada']);
    }

    public function reject($id, AdminReservationRequest $request)
    {
        $reservation = Reservation::findOrFail($id);
        $reservation->update(['status' => 'rejected']);

        return response()->json(['message' => 'Reserva rechazada']);
    }
}