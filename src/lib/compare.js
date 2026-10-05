// 예정 스케줄과 실제 근무를 하루 단위로 비교한다
import { dateKey, fmtDuration, minutesBetween, scheduleMinutes } from './time'

// 이 정도 차이는 '예정대로'로 본다
const TOLERANCE_MIN = 10

export function dayStatus(key, schedules, records, todayKey) {
  const sched = schedules.filter((s) => s.date === key)
  const recs = records.filter((r) => !r.deleted && dateKey(r.start) === key)
  if (sched.length === 0 && recs.length === 0) return null

  const planned = sched.reduce((sum, s) => sum + scheduleMinutes(s), 0)
  const actual = recs.reduce((sum, r) => sum + minutesBetween(r.start, r.end), 0)
  const base = { planned, actual }

  if (recs.length === 0) {
    return key < todayKey
      ? { ...base, type: 'missed', label: '미근무', detail: '예정은 있었지만 근무 기록이 없어요' }
      : { ...base, type: 'planned', label: '예정', detail: '근무 예정' }
  }
  if (sched.length === 0) {
    return { ...base, type: 'extra', label: '대타', detail: '예정에 없던 근무 (대타·추가 근무)' }
  }
  const diff = actual - planned
  if (diff >= TOLERANCE_MIN) {
    return { ...base, type: 'over', label: '연장', detail: `예정보다 ${fmtDuration(diff)} 더 일했어요` }
  }
  if (diff <= -TOLERANCE_MIN) {
    return { ...base, type: 'under', label: '단축', detail: `예정보다 ${fmtDuration(-diff)} 덜 일했어요` }
  }
  return { ...base, type: 'match', label: '완료', detail: '예정대로 근무했어요' }
}
