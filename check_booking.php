<?php
require 'vendor/autoload.php';
 = require_once 'bootstrap/app.php';
->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

 = App\Models\Booking::first();
echo 
