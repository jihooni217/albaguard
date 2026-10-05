// 화면 밝기: 'system'(폰 설정대로) | 'light' | 'dark'. 기록과 별개로 이 폰에만 저장한다
const KEY = 'albaguard-theme'
const BAR_COLOR = { light: '#f4f3ef', dark: '#0e1116' }

export const getTheme = () => localStorage.getItem(KEY) ?? 'system'

export function applyTheme(theme) {
  const root = document.documentElement
  if (theme === 'system') delete root.dataset.theme
  else root.dataset.theme = theme
  // 폰 상태 표시줄 색도 화면에 맞춘다
  const dark = theme === 'dark' || (theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', BAR_COLOR[dark ? 'dark' : 'light'])
}

export function setTheme(theme) {
  localStorage.setItem(KEY, theme)
  applyTheme(theme)
}
