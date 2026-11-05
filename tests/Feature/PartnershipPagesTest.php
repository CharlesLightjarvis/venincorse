<?php

use Inertia\Testing\AssertableInertia;

test('visitors can view the about and partnership pages without an account', function (string $routeName, string $component) {
    $this->get(route($routeName))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->component($component));
})->with([
    ['about', 'home/about'],
    ['partners', 'home/partners'],
    ['partners.request', 'home/partner-request'],
]);
