// 날짜·시간 계산과 표시를 모아둔 파일

const DAYS = ['일', '월', '화', '수', '목', '금', '토']

export const pad = (n) => String(n).padStart(2, '0')

// 2026-10-05 형태 (그 사람 폰의 현지 날짜 기준)
export function dateKey(value) {
  const d = new Date(value)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function monthKey(value) {
  return dateKey(value).slice(0, 7)
}

// 지금 시각을 분 단위로 잘라서 반환 (초는 버림)
export function nowMinute() {
  const d = new Date()
  d.setSeconds(0, 0)
  return d.toISOString()
}

export function fmtTime(iso) {
  const d = new Date(iso)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// 10월 5일 (월)
export function fmtDate(value) {
  const d = typeof value === 'string' && value.length === 10 ? new Date(`${value}T00:00`) : new Date(value)
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${DAYS[d.getDay()]})`
}

// 10/5 14:30
export function fmtDateTime(iso) {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} ${fmtTime(iso)}`
}

// 09:00 ~ 13:00, 날짜를 넘기면 (다음날) 표시
export function fmtRange(start, end) {
  const nextDay = dateKey(start) !== dateKey(end)
  return `${fmtTime(start)} ~ ${nextDay ? '다음날 ' : ''}${fmtTime(end)}`
}

export function minutesBetween(start, end) {
  return Math.max(0, Math.round((new Date(end) - new Date(start)) / 60000))
}

// 270 → 4시간 30분
export function fmtDuration(min) {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m}분`
  if (m === 0) return `${h}시간`
  return `${h}시간 ${m}분`
}

// <input type="datetime-local"> 에 넣을 값
export function toInputValue(iso) {
  return `${dateKey(iso)}T${fmtTime(iso)}`
}

export function fromInputValue(value) {
  return new Date(value).toISOString()
}

// 예정 스케줄(HH:MM ~ HH:MM)의 길이. 끝이 시작보다 이르면 다음날로 본다
export function scheduleMinutes(s) {
  const [sh, sm] = s.start.split(':').map(Number)
  const [eh, em] = s.end.split(':').map(Number)
  let min = eh * 60 + em - (sh * 60 + sm)
  if (min <= 0) min += 24 * 60
  return min
}
