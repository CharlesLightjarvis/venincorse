<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Schedule::command('trials:expire-reservations')->everyMinute()->withoutOverlapping()->onOneServer();
Schedule::command('trials:publish-slots')->daily()->withoutOverlapping()->onOneServer();
Schedule::command('trials:end-sessions')->everyMinute()->withoutOverlapping()->onOneServer();
Schedule::command('trials:send-reminders')->everyFifteenMinutes()->withoutOverlapping()->onOneServer();

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');
