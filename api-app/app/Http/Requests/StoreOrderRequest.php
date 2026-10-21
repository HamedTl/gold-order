<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Override;

class StoreOrderRequest extends FormRequest
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
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'type' => [
                'required',
                Rule::in(['buy', 'sell']),
            ],

            'amount' => [
                'bail',
                'required',
                'numeric',
                'gt:0',
                'regex:/^[0-9]{1,12}(\.[0-9]{1,6})?$/D',
            ],

            'price' => [
                'bail',
                'required',
                'numeric',
                'gt:0',
                'regex:/^[1-9][0-9]{0,17}$/D',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'type.in' => 'Order type must be buy or sell.',
            'amount.regex' => 'Invalid gold amount or precision.',
            'price.regex' => 'Price must be a positive integer within the supported range.',
        ];
    }
}
