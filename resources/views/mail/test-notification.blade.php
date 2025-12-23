@component('mail::message')
# Test: {{ $eventName }}

Oto testowe powiadomienie wysłane w {{ $timestamp }}.

Ta wiadomość potwierdzana, że kanał email dla eventu **{{ $eventName }}** działa prawidłowo.

@component('mail::button', ['url' => config('app.url')])
Wróć do panelu
@endcomponent

Dziękujemy,<br>
{{ config('app.name') }}
@endcomponent
