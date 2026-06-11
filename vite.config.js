import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2015',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor':   ['react', 'react-dom'],
          'supabase': ['@supabase/supabase-js'],
          'charts':   ['recharts'],
        }
      }
    }
  }
})
