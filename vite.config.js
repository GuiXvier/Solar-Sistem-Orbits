import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: "/Solar-Sistem-Orbits/", // Substitua pelo nome do seu repositório
  plugins: [react()],
})