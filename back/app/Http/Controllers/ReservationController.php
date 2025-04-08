<?php

namespace App\Http\Controllers;

use App\Http\Requests\ReservationRequest;
use App\Http\Requests\AdminReservationRequest;
use App\Models\Reservation;
use App\Models\Space;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Events\ReservationTimePassed;

class ReservationController extends Controller
{
    protected $authController;

    public function __construct(AuthController $authController) {
        $this->authController = $authController;
    }


    public function getUser($token){
        try {
            $user = $this->authController->getUserByToken($token);

            if (!$user) {
                throw new \Exception('Usuario inválido');
            }

            return $user;
        } catch (\Exception $e) {
            Log::error('Error al obtener usuario por token: ' . $e->getMessage());
            throw $e;
        }
    }

    public function index(Request $request)
    {
        try {
            $token = $request->bearerToken();
            $user = $this->getUser($token);
        
            $perPage = $request->input('per_page', 10);
            $page = $request->input('page', 1);
        
            $query = $user->reservations()->with(['space' => function($query) {
                $query->select('id', 'name', 'description');
            }]);
            
            if ($request->has('search') && !empty($request->search)) {
                $searchTerm = $request->search;
                $query->whereHas('space', function($q) use ($searchTerm) {
                    $q->where('name', 'like', "%{$searchTerm}%")
                      ->orWhere('description', 'like', "%{$searchTerm}%");
                });
            }
            
            if ($request->has('status') && !empty($request->status)) {
                $query->where('status', $request->status);
            }
            
            if ($request->has('start_date') && !empty($request->start_date)) {
                $query->where('start_time', '>=', $request->start_date);
            }
            
            if ($request->has('end_date') && !empty($request->end_date)) {
                $query->where('end_time', '<=', $request->end_date);
            }
        
            // Ordenar por fecha más reciente primero
            $paginator = $query->orderBy('start_time', 'desc')
                              ->paginate($perPage, ['*'], 'page', $page);
            
            return response()->json([
                'message' => 'Reservas del usuario obtenidas con éxito',
                'reservations' => $paginator->items(),
                'pagination' => [
                    'total' => $paginator->total(),
                    'per_page' => $paginator->perPage(),
                    'current_page' => $paginator->currentPage(),
                    'last_page' => $paginator->lastPage(),
                    'from' => $paginator->firstItem(),
                    'to' => $paginator->lastItem()
                ],
                'user' => $user,
                'user_id' => $user->id,

            ], 200);
            
        } catch (\Exception $e) {
            Log::error('Error al obtener reservas: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error al cargar las reservas'
            ], 500);
        }
    }


    public function store(ReservationRequest $request)
    {
        try {
            $token = $request->bearerToken();
            $user = $this->getUser($token);

            $space = Space::find($request->space_id);
            if (!$space || !$space->available) {
                throw new \Exception('El espacio no está disponible o no existe');
            }

            $overlapping = Reservation::where('space_id', $request->space_id)
                ->where('status', 'approved')
                ->where('end_time', '>', now())
                ->where(function($query) use ($request) {
                    $query->whereBetween('start_time', [$request->start_time, $request->end_time])
                          ->orWhereBetween('end_time', [$request->start_time, $request->end_time])
                          ->orWhere(function($q) use ($request) {
                              $q->where('start_time', '<', $request->start_time)
                                ->where('end_time', '>', $request->end_time);
                          });
                })
                ->exists();

            if ($overlapping) {
                throw new \Exception('El espacio ya está reservado en este rango de fechas');
            }
            
            $reservation = Reservation::create([
                'user_id' => $user->id,
                'space_id' => $request->space_id,
                'start_time' => $request->start_time,
                'end_time' => $request->end_time,
                'status' => 'pending',
            ]);

            return response()->json([
                'message' => 'Reserva creada exitosamente',
                'reservation' => $reservation,
                'user' => $user,
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error en ReservationController@store: ' . $e->getMessage());
            return response()->json([
                'error' => $e->getMessage(),
                'details' => env('APP_DEBUG') ? $e->getTraceAsString() : null
            ], 400);
        }
    }


    public function cancel(Request $request, $id)
    {
        try {
            $token = $request->bearerToken();
            $user = $this->getUser($token);      
            
            $reservation = Reservation::where('id', $id)
                ->where('user_id', $user->id) 
                ->first();  

            if (!$reservation) {
                throw new \Exception('Reserva no encontrada');
            }
        
            $reservation->delete();

            return response()->json([
                'message' => 'Reserva cancelada correctamente',
                'user' => $user,	
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error en ReservationController@cancel: ' . $e->getMessage());
            return response()->json([
                'error' => $e->getMessage(),
                'details' => env('APP_DEBUG') ? $e->getTraceAsString() : null
            ], 500);
        }
    }

    // Métodos de administrador
    public function listAll(Request $request)
    {
        try {
            $token = $request->bearerToken();
            $user = $this->getUser($token); 

            $reservations = Reservation::with(['user', 'space'])
                ->orderBy('start_time', 'asc')
                ->get();
    
            return response()->json([
                'reservations' => $reservations,
                'user' => $user,
                'user_id' => $user->id,

                
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error en ReservationController@listAll: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error al obtener todas las reservas',
                'details' => env('APP_DEBUG') ? $e->getMessage() : null
            ], 500);
        }
    }

    public function approve(Request $request,$id)
    {
        try {
            $token = $request->bearerToken();
            $user = $this->getUser($token); 

            $reservation = Reservation::findOrFail($id);
            $reservation->update(['status' => 'approved']);
            $reservation->space()->update(['available' => false]);

            // Rechazar reservas solapadas en el mismo espacio
            Reservation::where('space_id', $reservation->space_id)
            ->where('id', '!=', $reservation->id)
            ->where('status', '=', 'pending')
            ->where(function ($query) use ($reservation) {
                $query->whereBetween('start_time', [$reservation->start_time, $reservation->end_time])
                    ->orWhereBetween('end_time', [$reservation->start_time, $reservation->end_time])
                    ->orWhere(function ($q) use ($reservation) {
                        $q->where('start_time', '<=', $reservation->start_time)
                            ->where('end_time', '>=', $reservation->end_time);
                    });
            })
            ->update(['status' => 'rejected']);


            return response()->json([
                'message' => 'Reserva aprobada exitosamente',
                'reservation' => $reservation,
                'user' => $user,
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error en ReservationController@approve: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error al aprobar la reserva',
                'details' => env('APP_DEBUG') ? $e->getMessage() : null
            ], 500);
        }
    }
    public function reject(Request $request,$id)
    {
        try {
            $token = $request->bearerToken();
            $user = $this->getUser($token); 
            $reservation = Reservation::findOrFail($id);
            $reservation->update(['status' => 'rejected']);

            return response()->json([
                'message' => 'Reserva rechazada exitosamente',
                'reservation' => $reservation,
                'user' => $user,
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error en ReservationController@reject: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error al rechazar la reserva',
                'details' => env('APP_DEBUG') ? $e->getMessage() : null
            ], 500);
        }
    }


    public function eliminar(Request $request,$id)
    {
        try {
            $token = $request->bearerToken();
            $user = $this->getUser($token); 
            $reservation = Reservation::findOrFail($id);
            $reservation->delete();

            return response()->json([
                'message' => 'Reserva eliminada correctamente',
                'user' => $user,
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error en ReservationController@eliminar: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error al eliminar la reserva',
                'details' => env('APP_DEBUG') ? $e->getMessage() : null
            ], 500);
        }
    }

  

}