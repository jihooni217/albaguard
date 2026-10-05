// 모든 데이터는 브라우저 localStorage 한 칸에 저장한다 (로그인 없음)

const KEY = 'albaguard-v1'

export const emptyData = {
  workplaces: [], // { id, name, wage, fivePlus }
  selectedWorkplaceId: null,
  active: null, // 근무 중일 때 { workplaceId, start }
  records: [], // { id, workplaceId, start, end, source, createdAt, addReason, deleted, history[] }
  schedules: [], // { id, workplaceId, date, start, end }
  payments: {}, // '근무지id|2026-10' → { amount, taxed } 실제 받은 금액
  attachments: [], // { id, workplaceId, kind, date, note, addedAt } 증빙 사진 설명 (사진은 photos.js)
  sudoku: null, // 하던 스도쿠 판 { level, puzzle, solution, cells, elapsed, done }
  sudokuBest: {}, // 난이도별 최고 기록(초)
  lastBackupAt: null, // 마지막으로 백업 파일을 만든 때
  requests: {}, // '근무지id|2026-10' → { 1: { text, source }, 2: { text, source } } 만든 정산 요청 문구
}

export function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY))
    return { ...emptyData, ...saved }
  } catch {
    return emptyData
  }
}

export function saveData(data) {
  localStorage.setItem(KEY, JSON.stringify(data))
}
