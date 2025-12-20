import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [
        react(),
        laravel({
            input: ['resources/css/app.css', 'src/main.tsx'],
            refresh: true,
        }),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    server: {
        host: 'ls.test',
        port: 5173,
        https: false,
        hmr: {
            host: 'ls.test',
        },
        cors: true,
        proxy: {
            '/api': {
                target: 'http://ls.test',
                changeOrigin: true,
                secure: false,
            },
            '/sanctum': {
                target: 'http://ls.test',
                changeOrigin: true,
                secure: false,
            },
        },
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
