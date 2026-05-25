<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>Spinzone Laundry — Laravel Server</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-slate-50 flex items-center justify-center p-6">
    <div class="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center">
        <h1 class="text-xl font-bold text-slate-800">Spinzone Laravel API</h1>
        <p class="mt-2 text-sm text-slate-500">React client: <code class="text-blue-600">localhost:5173</code></p>
        <p class="mt-1 text-xs text-slate-400">Models: <code>app/Models/User.php</code>, <code>Order.php</code>, <code>ActivityLog.php</code></p>
        @if ($flash)
            <p class="mt-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">{{ $flash }}</p>
        @endif
        <a href="http://localhost:5173" class="mt-6 inline-block rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white">Open Client App</a>
    </div>
</body>
</html>
