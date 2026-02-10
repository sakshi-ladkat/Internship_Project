<?php
use Illuminate\Support\Facades\Route;

Route::get('/debug-config', function () {
    return [
        'APP_URL' => env('APP_URL'),
        'config_app_url' => config('app.url'),
        'generated_link' => url('/api/test'),
        'frontend_url' => env('FRONTEND_URL')
    ];
});
