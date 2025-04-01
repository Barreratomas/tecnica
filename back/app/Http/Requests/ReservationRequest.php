<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReservationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'space_id' => 'required|exists:spaces,id',
            'start_time' => 'required|date|after_or_equal:today',  
            'end_time' => 'required|date|after:start_time|after_or_equal:start_time',  
        ];
    }


    public function messages()
    {
        return [
            'space_id.required' => 'El espacio es obligatorio',
            'space_id.exists' => 'El espacio seleccionado no existe',
            'start_time.required' => 'La fecha de inicio es obligatoria',
            'start_time.date' => 'La fecha de inicio no es válida',
            'start_time.after_or_equal' => 'La fecha de inicio no puede ser anterior al día de hoy',
            'end_time.required' => 'La fecha de fin es obligatoria',
            'end_time.date' => 'La fecha de fin no es válida',
            'end_time.after' => 'La fecha de fin debe ser posterior a la fecha de inicio',
            'end_time.after_or_equal' => 'La fecha de fin no puede ser anterior a la fecha de inicio',
        ];
    }
}
