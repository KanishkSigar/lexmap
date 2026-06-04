import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Deployed at https://kanishksigar.github.io/lexmap/
// In dev, base resolves to '/' automatically.
export default defineConfig({
    base: '/lexmap/',
    plugins: [react()],
})
