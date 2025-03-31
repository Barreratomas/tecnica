<?php
namespace App\Http\Controllers;

use App\Models\Space;
use Illuminate\Http\Request;

class SpaceController extends Controller
{
    // Listar todos los espacios
    public function index()
    {
        return response()->json(Space::all());
    }

    // Mostrar un espacio específico
    public function show($id)
    {
        return response()->json(Space::findOrFail($id));
    }
}
