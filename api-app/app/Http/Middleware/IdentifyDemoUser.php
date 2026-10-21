<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IdentifyDemoUser
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $userId = filter_var(
            $request->header('X-User-Id'),
            FILTER_VALIDATE_INT,
            ['options' => ['min_range' => 1]],
        );

        if (!$userId) {
            return response()->json([
                'message' => 'Invalid or missing X-User-Id header.',
            ], 422);
        }

        $request->attributes->set('demo_user_id', $userId);
        return $next($request);
    }
}
