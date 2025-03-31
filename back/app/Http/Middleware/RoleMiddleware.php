<?php

namespace App\Http\Middleware;

use App\Http\Controllers\AuthController;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class RoleMiddleware
{

    protected $authController;

    public function __construct(AuthController $authController)
    {
        $this->authController = $authController;
    }

    
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $token = $request->bearerToken();
         if (!$token) {
            return response()->json(['error' => 'Acceso no autorizado'], 403);
        }


        $user = $this->authController->getUserByToken($token);
        if (!$user) {
          return response()->json(['message' => 'Acceso no autorizado'], 404);
        }

        $role = $user->role;

        Log::info("{$role}");
        Log::info($roles);



        if (in_array($role, $roles)) {

            Log::info('Rol autorizado, accediendo a la siguiente fase');

            return $next($request);
        }
        Log::info('Rol no autorizado');

        return response()->json(['message' => 'Acceso denegado: rol no autorizado'], 401);
    }
}

