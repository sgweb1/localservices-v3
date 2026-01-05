import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Load .env
const env = dotenv.config().parsed || {};
const APP_URL = env.APP_URL || 'http://localhost';
const isHttps = APP_URL.startsWith('https://');

// Extract domain from APP_URL
const urlObj = new URL(APP_URL);
const hmrHost = urlObj.hostname;
const hmrProtocol = isHttps ? 'wss' : 'ws';
const hmrUrl = `${hmrProtocol}://${hmrHost}:5173`;

export default defineConfig({
    plugins: [
        react(),
        laravel({
            input: ['resources/css/app.css', 'src/main.tsx'],
            refresh: true,
            hotFile: 'public/hot',
        }),
        tailwindcss(),
        {
            // Middleware - Replace HTTP with HTTPS w każdej odpowiedzi
            name: 'force-https-middleware',
            configureServer(server) {
                return () => {
                    server.middlewares.use((req, res, next) => {
                        const originalSend = res.send;
                        res.send = function(data) {
                            if (typeof data === 'string' && req.url.endsWith('.html')) {
                                // Replace all http://ls.test:5173 with https://ls.test:5173
                                data = data.replace(/http:\/\/([\w.-]+):5173/g, 'https://$1:5173');
                            }
                            originalSend.call(this, data);
                        };
                        next();
                    });
                };
            }
        }
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
        https: {
            key: fs.readFileSync(path.resolve(__dirname, 'certs/ls.test.key')),
            cert: fs.readFileSync(path.resolve(__dirname, 'certs/ls.test.crt')),
        },
        hmr: {
            host: hmrHost,
            protocol: hmrProtocol,
            port: 5173,
        },
        cors: true,
        middlewareMode: false,
        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
                secure: false,
            },
            '/sanctum': {
                target: 'http://localhost:8000',
                changeOrigin: true,
                secure: false,
            },
        },
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
