import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import localCms from './vite-plugin-local-cms'

export default defineConfig({
  plugins: [react(), localCms()],
  server: { watch: { ignored: ['**/src/data/content.json', '**/public/uploads/**'] } },
})
