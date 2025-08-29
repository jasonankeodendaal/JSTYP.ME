import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  // FIX: Cast `process` to `any` to resolve TypeScript error about missing `cwd` property.
  // This is a safe fix as Vite runs in a Node.js environment where `process.cwd()` is available.
  const env = loadEnv(mode, (process as any).cwd(), '')
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  }
})
