<!doctype html>
<html lang="pl">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title>Powiadomienie</title>
		<style>
			body { background-color:#f8fafc; color:#0f172a; margin:0; font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, "Helvetica Neue", Arial, "Noto Sans", sans-serif; }
			.container { max-width:600px; margin:0 auto; padding:24px; }
			.card { background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; overflow:hidden; }
			.header { padding:20px 24px; border-bottom:1px solid #e2e8f0; }
			.brand { font-weight:600; font-size:18px; }
			.content { padding:24px; line-height:1.6; }
			.btn { display:inline-block; background:#0ea5e9; color:#ffffff; text-decoration:none; padding:12px 16px; border-radius:8px; font-weight:600; }
			.footer { padding:16px 24px; font-size:12px; color:#64748b; border-top:1px solid #e2e8f0; }
		</style>
	</head>
	<body>
		<div class="container">
			<div class="card">
				<div class="header">
					<div class="brand">LS2 • Powiadomienie</div>
				</div>
				<div class="content">
					{!! nl2br(e($body)) !!}
					@if(!empty($actionUrl))
						<div style="margin-top:20px;">
							<a class="btn" href="{{ $actionUrl }}" target="_blank" rel="noopener">{{ $actionLabel ?? 'Przejdź' }}</a>
						</div>
					@endif
				</div>
				<div class="footer">
					Ten e‑mail został wysłany automatycznie. Jeśli nie chcesz otrzymywać takich powiadomień, zaktualizuj preferencje w ustawieniach konta.
				</div>
			</div>
		</div>
	</body>
</html>
