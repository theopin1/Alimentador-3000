<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFeedingScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; 
    }

    public function rules(): array
    {
        return [
            'scheduled_time' => ['required', 'date_format:H:i'],
            'portion_grams'  => ['required', 'integer', 'min:10', 'max:500'],
            'days_of_week'   => ['nullable', 'array', 'min:1', 'max:7'],
            'days_of_week.*' => ['integer', 'min:1', 'max:7'],
            'is_active'      => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'scheduled_time.required'    => 'O horário de alimentação é obrigatório.',
            'scheduled_time.date_format' => 'Formato de horário inválido. Use HH:MM.',
            'portion_grams.required'     => 'A porção em gramas é obrigatória.',
            'portion_grams.min'          => 'Porção mínima: 10g.',
            'portion_grams.max'          => 'Porção máxima: 500g.',
        ];
    }
}
