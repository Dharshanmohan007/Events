import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],

  server: {
    port: 5127,
    host: '0.0.0.0',
    strictPort: false,

    hmr: {
      clientPort: 5127
    },

    allowedHosts: [
      'srieshwarevents.com',
      'www.srieshwarevents.com',
      '.trycloudflare.com',
      'localhost',
      '127.0.0.1'
    ]
  }
})