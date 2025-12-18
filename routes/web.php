<?php
use Illuminate\Support\Facades\Route;

// React SPA - Strona główna
Route::view('/', 'app');

// Strona demonstracyjna dla SPA auth przez Sanctum (React)
Route::view('/auth-demo', 'auth-demo');
// Przyjazny alias aby uniknąć 404
Route::redirect('/login', '/auth-demo');
