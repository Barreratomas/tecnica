<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        User::create([
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'user'
        ]);

        return response()->json(['message' => 'Usuario registrado correctamente'], 201);
    }

    public function login(LoginRequest $request)
    {

        $user = User::where('email', $request->email)->first();
    
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Credenciales incorrectas'], 401);
        }
    
        $token = $this->generateToken($user->username, $user->email);
        $user->update(['token' => $token]);
    
        return response()->json([
            'user' => $user
        ],200);
    }
    

    private function generateToken($username, $email)
    {
        return hash_hmac('sha256', $username . $email, env('APP_KEY'));
    }
    


    public function getUserByToken($token)
    {
        return User::where('token', $token)->first();
    }
    
    
    

    public function logout(Request $request)
{
    $token = $request->bearerToken();



    $user = $this->getUserByToken($token);;

    if (!$user) {
        return response()->json(['message' => 'usuario no encontrado'], 401);
    }

    $user->update(['token' => null]);

    return response()->json(['message' => 'Sesión cerrada correctamente']);
}


    
}