import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // host: true → 같은 와이파이의 폰에서도 접속할 수 있다
  server: { port: 5173, host: true },
})
