import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Initialize Laravel Echo
declare global {
  interface Window {
    Echo: any;
    Pusher: typeof Pusher;
  }
}

// Configure Pusher
window.Pusher = Pusher;

// Determine WebSocket configuration based on environment
const isDev = import.meta.env.DEV;
const wsHost = isDev ? 'localhost' : window.location.hostname;
const wsPort = isDev ? 8080 : (window.location.protocol === 'https:' ? 443 : 80);
const wssPort = isDev ? 8080 : 443;

window.Echo = new (Echo as any)({
  broadcaster: 'reverb',
  key: 'local', // Laravel Reverb uses 'local' for development
  wsHost,
  wsPort,
  wssPort,
  forceTLS: window.location.protocol === 'https:',
  encrypted: true,
  enabledTransports: ['ws', 'wss'],
});

export default window.Echo;
