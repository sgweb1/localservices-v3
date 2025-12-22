import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Initialize Laravel Echo
declare global {
  interface Window {
    Echo: Echo;
    Pusher: typeof Pusher;
  }
}

// Configure Pusher
window.Pusher = Pusher;

window.Echo = new Echo({
  broadcaster: 'reverb',
  key: 'local', // Laravel Reverb uses 'local' for development
  wsHost: window.location.hostname,
  wsPort: 8080,
  wssPort: 8080,
  forceTLS: window.location.protocol === 'https:',
  encrypted: true,
  enabledTransports: ['ws', 'wss'],
});

export default window.Echo;
