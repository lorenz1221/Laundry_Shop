<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class RecaptchaService
{
    public static function verify(?string $token): bool
    {
        if (! config('recaptcha.enabled')) {
            return true;
        }

        $secret = config('recaptcha.secret_key');
        if ($secret === '' || $secret === null) {
            return true;
        }

        if ($token === null || trim($token) === '') {
            return false;
        }

        // SECURITY COMPLIANCE CHECK: verify captcha token with Google before auth
        $response = Http::asForm()->post(config('recaptcha.verify_url'), [
            'secret'   => $secret,
            'response' => $token,
            'remoteip' => request()->ip(),
        ]);

        if (! $response->successful()) {
            return false;
        }

        return $response->json('success') === true;
    }
}
