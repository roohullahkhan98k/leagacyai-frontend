import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import type { ProxyOptions } from 'vite';

export default defineConfig(({ mode }) => {
  // Get backend URL from environment, fallback to localhost only in development
  const backendUrl = process.env.VITE_BACKEND_URL || (mode === 'development' ? 'http://localhost:3000' : '');
  
  const proxyConfig: Record<string, ProxyOptions> = {};
  
  if (backendUrl) {
    proxyConfig['/api'] = {
      target: backendUrl,
      changeOrigin: true,
    };
    proxyConfig['/uploads'] = {
      target: backendUrl,
      changeOrigin: true,
    };
  }
  
  return {
    plugins: [react()],
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'framer-motion', 'clsx', 'tailwind-merge']
    },
    define: {
      global: 'window',
    },
    resolve: {
      alias: {
        global: 'window',
      },
    },
    server: {
      proxy: proxyConfig
    }
  };
});