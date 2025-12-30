import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Initialize Laravel Echo
declare global {
  interface Window {
    Echo: any;
    Pusher: typeof Pusher;
  }
}

// Configure Pusher (disabled for MVP - WebSockets not available)
window.Pusher = Pusher;

// Use null broadcaster for MVP (polling instead of WebSockets)
// Real-time features require Laravel Reverb or Pusher to be set up
window.Echo = new (Echo as any)({
  broadcaster: 'null', // Use null broadcaster - no real-time for MVP
});

export default window.Echo;
