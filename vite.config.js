import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { settlementApi } from './server/settlementApi.js'

export default defineConfig(({ mode }) => {
  // .env 의 ANTHROPIC_API_KEY 는 서버 쪽에서만 읽는다 (화면 코드에는 들어가지 않음)
  const env = loadEnv(mode, process.cwd(), '')
  return {
    // 어느 주소에 올려도 파일을 찾도록 상대 경로로 만든다
    base: './',
    plugins: [react(), settlementApi(env.ANTHROPIC_API_KEY)],
    // host: true → 같은 와이파이의 폰에서도 접속할 수 있다
    server: { port: 5173, host: true },
  }
})
