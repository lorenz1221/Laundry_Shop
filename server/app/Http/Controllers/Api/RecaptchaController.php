<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class RecaptchaController extends Controller
{
    public function siteKey(): JsonResponse
    {
        $siteKey = config('recaptcha.site_key');
        $enabled = (bool) config('recaptcha.enabled')
            && strlen($siteKey) > 10
            && strlen(config('recaptcha.secret_key')) > 10;

        return response()->json([
            'success' => true,
            'siteKey' => $siteKey,
            'enabled' => $enabled,
        ]);
    }
}
