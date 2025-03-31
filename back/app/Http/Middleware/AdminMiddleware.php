<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        Log::info($request);

        if (Auth::user() && Auth::user()->role === 'admin') {
            return $next($request);
        }
        return response()->json(['error' => 'Acceso no autorizado'], 403);
    }
}
