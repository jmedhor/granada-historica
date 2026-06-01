// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    https: {
      cert: fs.readFileSync('../192.168.1.137.pem'),
      key: fs.readFileSync('../192.168.1.137-key.pem'),
    }
  }
})
