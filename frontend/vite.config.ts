import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Deployed at https://kanishksigar.github.io/legal-reasoning-explorer/
// In dev, base resolves to '/' automatically.
export default defineConfig({
    base: '/legal-reasoning-explorer/',
    plugins: [react()],
})
