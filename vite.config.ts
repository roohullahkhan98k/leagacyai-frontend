import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import type { ProxyOptions } from 'vite';
import path from 'path';

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
      include: [
        'react',
        'react/jsx-runtime',
        'react-dom',
        'react-dom/client',
        'react-router-dom',
        'react-i18next',
        'i18next',
        'i18next-browser-languagedetector',
        '@xyflow/react',
        'framer-motion',
        'clsx',
        'tailwind-merge'
      ],
      force: true,
      esbuildOptions: {
        // Ensure all React packages use the same instance
        jsx: 'automatic',
      }
    },
    define: {
      global: 'window',
    },
    resolve: {
      dedupe: ['react', 'react-dom', 'react/jsx-runtime', '@xyflow/react'],
      alias: {
        global: 'window',
        // Force all React imports to use the same instance
        'react': path.resolve(__dirname, './node_modules/react'),
        'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
      },
    },
    build: {
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true
      },
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Put React and react-dom in a single chunk
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
              return 'react-vendor';
            }
            // Put i18next related packages together
            if (id.includes('node_modules/i18next') || id.includes('node_modules/react-i18next')) {
              return 'i18n-vendor';
            }
          }
        }
      }
    },
    server: {
      proxy: proxyConfig,
      hmr: {
        overlay: true
      }
    }
  };
});