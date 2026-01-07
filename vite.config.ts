import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    server: {
        port: 5173,
        host: true,
    },
    plugins: [react()],
    define: {
        'process.env.API_KEY': JSON.stringify('AIzaSyBxH2JTiA2TzgAcfNrhIgkHLLB5YLhoGXI'),
        'process.env.GEMINI_API_KEY': JSON.stringify('AIzaSyBxH2JTiA2TzgAcfNrhIgkHLLB5YLhoGXI'),
        'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify('AIzaSyBxH2JTiA2TzgAcfNrhIgkHLLB5YLhoGXI'),
        'import.meta.env.GEMINI_API_KEY': JSON.stringify('AIzaSyBxH2JTiA2TzgAcfNrhIgkHLLB5YLhoGXI'),
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, '.'),
        }
    }
});
