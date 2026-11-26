<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTelemetryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; 
    }

    public function rules(): array
    {
        return [
            'reservoir_level_cm' => ['nullable', 'numeric', 'min:0', 'max:400'],
            'temperature'        => ['nullable', 'numeric', 'min:-40', 'max:80'],
            'humidity'           => ['nullable', 'numeric', 'min:0', 'max:100'],
            'battery_voltage'    => ['nullable', 'numeric', 'min:0', 'max:25'],
            'read_at'            => ['nullable', 'date'],
        ];
    }

    public function messages(): array
    {
        return [
            'temperature.min' => 'Temperatura fora do range válido (-40°C a 80°C).',
            'temperature.max' => 'Temperatura fora do range válido (-40°C a 80°C).',
            'humidity.min'    => 'Umidade fora do range válido (0% a 100%).',
            'humidity.max'    => 'Umidade fora do range válido (0% a 100%).',
        ];
    }
}
