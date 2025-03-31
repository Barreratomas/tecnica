<?php
namespace App\Http\Controllers;

use App\Http\Requests\SpaceRequest;
use App\Models\Space;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SpaceController extends Controller
{
    public function index()
    {
        return response()->json(Space::all());
    }

    public function show($id)
    {
        return response()->json(Space::findOrFail($id));
    }


    public function store(SpaceRequest $request)
    {
        Log::info("#");

        $space = Space::create([
            'name' => $request->name,
            'description' => $request->description,
            'capacity' => $request->capacity,
            'avaliable' => $request->location,
        ]);

        return response()->json($space, 201);
    }


    public function update(SpaceRequest $request, $id)
    {
        $space = Space::findOrFail($id);

    

        $space->update($request->only(['name', 'description', 'capacity', 'location']));

        return response()->json($space);
    }


    public function destroy($id)
    {
        $space = Space::findOrFail($id);

        $space->delete();

        return response()->json(['message' => 'Espacio eliminado correctamente'], 200);
    }
}
