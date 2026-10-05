// 기록 백업: 모든 데이터를 파일 하나로 내보내고, 그 파일로 되돌린다
import { dateKey } from './time'

// 파일을 폰에 저장한다. 공유 창을 쓸 수 있으면 공유 창으로, 아니면 바로 내려받기
export async function exportBackup(data) {
  const payload = { app: 'albaguard', version: 1, exportedAt: new Date().toISOString(), data }
  const name = `알바가드_백업_${dateKey(new Date())}.json`
  const file = new File([JSON.stringify(payload)], name, { type: 'application/json' })

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: name })
      return true
    } catch (error) {
      if (error.name === 'AbortError') return false // 사용자가 공유 창을 닫음
    }
  }
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  return true
}

// 백업 파일을 읽어 내용을 확인한다. 알바가드 파일이 아니면 오류
export async function readBackup(file) {
  let payload
  try {
    payload = JSON.parse(await file.text())
  } catch {
    throw new Error('백업 파일을 읽을 수 없어요.')
  }
  const d = payload?.data
  if (payload?.app !== 'albaguard' || !Array.isArray(d?.workplaces) || !Array.isArray(d?.records)) {
    throw new Error('알바가드 백업 파일이 아니에요.')
  }
  return payload
}
