<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class CorsServiceProvider extends ServiceProvider
{
    public function boot()
    {
        // Handle OPTIONS requests
        if ($this->app->request->isMethod('OPTIONS')) {
            $this->setCorsHeaders($this->app->request, $this->app['response']);
            return $this->app['response']->setContent('')->setStatusCode(200);
        }
    }

    public function register()
    {
        //
    }

    protected function setCorsHeaders($request, $response)
    {
        $response->headers->set('Access-Control-Allow-Origin', '*');
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
        $response->headers->set('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization, X-Requested-With');
        $response->headers->set('Access-Control-Max-Age', '3600');
    }
}