
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { metaImagesPlugin } from "./vite-plugin-meta-images";


export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    metaImagesPlugin(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  css: {
    postcss: {
      plugins: [],
    },
  },
  root: path.resolve(import.meta.dirname, "client"),

  build: {
    outDir: path.resolve(import.meta.dirname, "build"),
    emptyOutDir: true,
    target: 'esnext',
    minify: 'terser',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      input: path.resolve(import.meta.dirname, "client", "index.html"),
      output: {
        manualChunks: {
          // React and React DOM
          'react-vendor': ['react', 'react-dom'],
          
          // UI Libraries
          'ui-vendor': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-label',
            '@radix-ui/react-menubar',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group',
            '@radix-ui/react-tooltip'
          ],
          
          // Charts and Analytics
          'charts-vendor': ['recharts'],
          
          // Forms and Validation
          'forms-vendor': [
            'react-hook-form',
            '@hookform/resolvers',
            'zod',
            'drizzle-orm'
          ],
          
          // State Management and Query
          'state-vendor': [
            '@tanstack/react-query',
            'wouter'
          ],
          
          // Utilities
          'utils-vendor': [
            'date-fns',
            'clsx',
            'tailwind-merge',
            'lucide-react',
            'class-variance-authority'
          ],
          
          // Material UI
          'mui-vendor': [
            '@mui/material',
            '@mui/icons-material',
            '@emotion/react',
            '@emotion/styled'
          ]
        }
      }
    }
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: true,
    hmr: {
      host: "localhost",
      port: 5173,
      protocol: "ws",
    },
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
