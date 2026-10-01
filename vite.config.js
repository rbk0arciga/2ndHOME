import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // react(): soporte para JSX y recarga rápida
  // tailwindcss(): procesa las clases de Tailwind sin necesidad de PostCSS
  plugins: [react(), tailwindcss()],
})