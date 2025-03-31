<?php

return [
    'global' => [
        \Illuminate\Http\Middleware\TrustProxies::class,
        \Illuminate\Http\Middleware\HandleCors::class,
        \Illuminate\Foundation\Http\Middleware\PreventRequestsDuringMaintenance::class,
        \Illuminate\Http\Middleware\ValidatePostSize::class,
        \Illuminate\Foundation\Http\Middleware\TrimStrings::class,
        \Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull::class,
    ],

    'route' => [
        'admin' => \App\Http\Middleware\AdminMiddleware::class,
        'role' => \App\Http\Middleware\RoleMiddleware::class,
    ],
];
