<?php

return [
    'site_key'   => trim((string) env('RECAPTCHA_SITE_KEY', '')),
    'secret_key' => trim((string) env('RECAPTCHA_SECRET_KEY', '')),
    'verify_url' => 'https://www.google.com/recaptcha/api/siteverify',
    // Set RECAPTCHA_ENABLED=false in .env to allow login without CAPTCHA (local dev)
    'enabled'    => filter_var(env('RECAPTCHA_ENABLED', false), FILTER_VALIDATE_BOOLEAN),
];
