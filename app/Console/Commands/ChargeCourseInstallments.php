<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Actions\CreateCourseInstallmentCharges;
use Illuminate\Console\Command;

final class ChargeCourseInstallments extends Command
{
    protected $signature = 'courses:charge-installments';

    protected $description = 'Charge the due course instalments on the saved cards, retrying declined ones';

    public function handle(CreateCourseInstallmentCharges $createCharges): int
    {
        $this->info('Course instalments charged: '.$createCharges->handle().'.');

        return self::SUCCESS;
    }
}
