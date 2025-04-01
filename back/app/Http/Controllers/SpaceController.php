<?php
namespace App\Http\Controllers;

use App\Http\Requests\SpaceRequest;
use App\Models\Space;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SpaceController extends Controller
{

    protected $authController;

    public function __construct(AuthController $authController) {
        $this->authController = $authController;
    }

    public function getUser($token){
        $user = $this->authController->getUserByToken($token);

        if (!$user) {
            return response()->json(['error' => 'Usuario inválido'], 401);
        }

        return $user;
    }

    public function index(Request $request)
    {
        $token = $request->bearerToken();
        $user = $this->getUser($token);
    
        $perPage = $request->input('per_page', 10); 
        $page = $request->input('page', 1); 
    
        $query = Space::query();
        
        if ($request->has('search') && !empty($request->search)) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('description', 'like', "%{$searchTerm}%");
            });
        }
    
        $paginator = $query->paginate($perPage, ['*'], 'page', $page);
        
        return response()->json([
            'spaces' => $paginator->items(),
            'pagination' => [
                'total' => $paginator->total(),
                'per_page' => $paginator->perPage(),
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem()
            ],
            'user' => $user
        ], 200);
    }
    

    public function show(Request $request ,$id)
    {
        $token = $request->bearerToken();
        $user = $this->getUser($token);

        return response()->json([
            'space'=>Space::findOrFail($id),
            'user' => $user
        ],200);
    }


    public function store(SpaceRequest $request)
    {
        $token = $request->bearerToken();
        $user = $this->getUser($token);

        $space = Space::create([
            'name' => $request->name,
            'description' => $request->description,
            'capacity' => $request->capacity,
            'avaliable' => $request->location,
        ]);

        return response()->json([
            'space'=>$space,
            'user'=>$user
        ], 201);
    }


    public function update(SpaceRequest $request, $id)
    {
        $token = $request->bearerToken();
        $user = $this->getUser($token);

        $space = Space::findOrFail($id);

        $space->update($request->only(['name', 'description', 'capacity', 'location']));

        return response()->json([
            'space'=>$space,
            'user'=>$user
        ], 201);    
    }


    public function destroy(Request $request ,$id)
    {
        $token = $request->bearerToken();
        $user = $this->getUser($token);

        $space = Space::findOrFail($id);

        $space->delete();

        return response()->json([
            'message' => 'Espacio eliminado correctamente',
            'user'=>$user
        ], 200);
    }
}
