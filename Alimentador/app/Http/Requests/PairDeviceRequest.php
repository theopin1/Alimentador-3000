<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PairDeviceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'serial_code' => ['required', 'string', 'size:16', 'exists:devices,serial_code'],
            'name'        => ['nullable', 'string', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'serial_code.required' => 'O código serial do alimentador é obrigatório.',
            'serial_code.size'     => 'O código serial deve ter exatamente 16 caracteres.',
            'serial_code.exists'   => 'Alimentador não encontrado. Verifique o código serial.',
        ];
    }
}
