<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class SpaceRequest extends FormRequest
{
    /**
     * Determina si el usuario está autorizado para hacer esta solicitud.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Obtiene las reglas de validación para la solicitud.
     */
    public function rules(): array
    {
        $esCreacion = $this->isMethod('post');

        Log::info('Método de la solicitud: ' . $this->method());
        Log::info('Es creación: ' . ($esCreacion ? 'Sí' : 'No'));

        $id = $this->route('id'); 
        if (!$esCreacion) {
            Log::info('ID del espacio en actualización: ' . ($id ?? 'No disponible'));
        }

        $rules = [
            'name' => $esCreacion 
                ? 'required|string|max:255|unique:spaces,name' 
                : 'nullable|string|max:255|unique:spaces,name,' . $id,
            'description' => $esCreacion ? 'required|string' : 'nullable|string',
            'capacity' => 'required|integer|min:1',
            'available' => 'required|boolean',
        ];

        Log::info('Reglas de validación generadas: ', $rules);

        return $rules;
    }

    /**
     * Maneja los errores de validación y devuelve una respuesta en JSON.
     */
    protected function failedValidation(Validator $validator)
    {
        Log::error('Error de validación: ', $validator->errors()->toArray());

        throw new HttpResponseException(response()->json([
            'success' => false,
            'errors' => $validator->errors(),
            'message' => 'Error de validación en los datos enviados.',
        ], 422));
    }
}
