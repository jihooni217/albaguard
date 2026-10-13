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
  spotBest: {}, // 틀린 그림 찾기의 난이도별 최고 기록(초)
  spotSeen: {}, // 난이도별로 지금까지 연 그림 수. 다음 그림은 이 다음 번호라서 본 그림이 다시 나오지 않는다
  spotCleared: {}, // 난이도별로 답을 보지 않고 다 찾은 그림 수
  block: null, // 하던 블록 채우기 판 { board, pieces, score, over }
  blockBest: 0, // 블록 채우기 최고 점수
  lastBackupAt: null, // 마지막으로 백업 파일을 만든 때
  deviceId: null, // 이 폰을 구분하는 무작위 번호 (기록 등록에만 씀. 처음 등록할 때 만든다)
  stampOff: false, // true면 기록 지문을 서버에 등록하지 않는다 (설정 탭)
  stamps: {}, // 기록id → [{ hash, at, serverId, stage }] 서버에 등록된 지문과 서버가 찍은 시각
  pendingStamps: [], // 아직 서버에 못 보낸 지문 [{ recordId, stage, payload }] (오프라인이면 여기 쌓였다가 나중에 보낸다)
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
