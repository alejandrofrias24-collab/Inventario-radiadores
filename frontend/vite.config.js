import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const gatewayUrl = process.env.VITE_GATEWAY_URL || 'http://127.0.0.1:3100';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: gatewayUrl,
        changeOrigin: true,
        configure(proxy) {
          proxy.on('error', () => {
            console.error(`No se puede conectar con el API Gateway (${gatewayUrl}). Inicia los servicios con docker compose up.`);
          });
        }
      }
    }
  }
});
