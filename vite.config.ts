import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        // This will transform your SVG to a React component
        exportType: 'named',
        namedExport: 'ReactComponent',
      },
    }),
  ],
  base: '/',
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Source maps for production debugging (can be disabled for smaller builds)
    sourcemap: false,
    // Target modern browsers for smaller bundle size
    target: 'es2015',
    // Clear output directory before build to prevent stale files
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching and smaller initial load
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            // React core
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }

            // Charts
            if (id.includes('apexcharts') || id.includes('react-apexcharts')) {
              return 'charts';
            }

            // Calendar
            if (id.includes('@fullcalendar')) {
              return 'calendar';
            }

            // Maps
            if (id.includes('@react-jvectormap')) {
              return 'maps';
            }

            // Forms and validation
            if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
              return 'forms';
            }

            // i18n
            if (id.includes('i18next') || id.includes('react-i18next')) {
              return 'i18n';
            }

            // CASL permissions
            if (id.includes('@casl')) {
              return 'casl';
            }

            // UI utilities
            if (
              id.includes('flatpickr') ||
              id.includes('swiper') ||
              id.includes('react-dropzone') ||
              id.includes('react-dnd')
            ) {
              return 'ui-utils';
            }

            // Data fetching
            if (id.includes('axios') || id.includes('swr')) {
              return 'data-fetching';
            }

            // Other vendor code
            return 'vendor';
          }

          // Application code splitting by feature
          if (id.includes('/src/pages/vendors/')) {
            return 'vendors';
          }
          if (id.includes('/src/pages/customers/')) {
            return 'customers';
          }
          if (id.includes('/src/pages/companies/')) {
            return 'companies';
          }
          if (id.includes('/src/pages/vendor-groups/')) {
            return 'vendor-groups';
          }
          if (id.includes('/src/pages/customer-groups/')) {
            return 'customer-groups';
          }
          if (id.includes('/src/pages/Charts/')) {
            return 'charts-pages';
          }
          if (id.includes('/src/pages/UiElements/')) {
            return 'ui-pages';
          }
        },
        // Optimize asset file names
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return `assets/[name]-[hash][extname]`;
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          } else if (/woff|woff2/.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
    // Enable minification with esbuild (faster and included by default)
    minify: 'esbuild',
    // CSS code splitting
    cssCodeSplit: true,
    // Report compressed size
    reportCompressedSize: true,
    // Optimize dependencies
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  // Performance optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'swr',
      'react-hook-form',
      '@hookform/resolvers',
      'zod',
      'i18next',
      'react-i18next',
    ],
    exclude: ['@fullcalendar/core', '@fullcalendar/react'],
  },
  // Server configuration
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5173,
    strictPort: false,
    host: true,
    open: false,
  },
  // Preview configuration
  preview: {
    port: 4173,
    strictPort: false,
    host: true,
    open: false,
  },
});
