import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { applyTheme, getTheme } from './lib/theme'
import './styles.css'

applyTheme(getTheme())

// 배포된 앱에서만: 인터넷 없이도 열리도록 화면 파일을 폰에 저장
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js')
}

// 브라우저가 저장 공간이 모자랄 때 기록을 마음대로 지우지 않도록 요청
navigator.storage?.persist?.()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
