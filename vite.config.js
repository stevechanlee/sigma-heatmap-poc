import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  },
  server: {
    port: 5173, // Standard Vite port
    host: true, // Allow external connections
    cors: true, // Enable CORS
    open: true,
    headers: {
      'X-Frame-Options': 'ALLOWALL' // Allow iframe embedding from Sigma
    }
  }
})