// 예정 스케줄과 실제 근무를 하루 단위로 비교한다
import { dateKey, fmtDuration, minutesBetween, scheduleMinutes } from './time'

// 이 정도 차이는 '예정대로'로 본다
const TOLERANCE_MIN = 10

// 근무지가 여러 곳이면 근무지마다 따로 비교한다(A 매장 예정이 있는 날 B 매장에서 일해도 '완료'가 되지 않게)
// 한 날에 결과가 여럿이면 예정과 달랐던 쪽을 먼저 보여 준다
const PRIORITY = ['under', 'missed', 'over', 'extra', 'planned', 'match', 'off']

export function dayStatus(key, schedules, records, todayKey) {
  const ids = new Set([
    ...schedules.filter((s) => s.date === key).map((s) => s.workplaceId),
    ...records.filter((r) => !r.deleted && dateKey(r.start) === key).map((r) => r.workplaceId),
  ])
  if (ids.size <= 1) return oneDay(key, schedules, records, todayKey)
  const list = [...ids].map((id) =>
    oneDay(key, schedules.filter((s) => s.workplaceId === id), records.filter((r) => r.workplaceId === id), todayKey),
  )
  const top = list.sort((a, b) => PRIORITY.indexOf(a.type) - PRIORITY.indexOf(b.type))[0]
  return {
    ...top,
    planned: list.reduce((n, x) => n + x.planned, 0),
    actual: list.reduce((n, x) => n + x.actual, 0),
  }
}

// 한 근무지(또는 근무지 구분 없이) 하루 비교
function oneDay(key, schedules, records, todayKey) {
  const daySchedules = schedules.filter((s) => s.date === key)
  // 사장님과 합의해서 쉰 날(off)은 예정에서 빼고 비교한다
  const sched = daySchedules.filter((s) => !s.off)
  const recs = records.filter((r) => !r.deleted && dateKey(r.start) === key)
  if (daySchedules.length === 0 && recs.length === 0) return null

  const planned = sched.reduce((sum, s) => sum + scheduleMinutes(s), 0)
  const actual = recs.reduce((sum, r) => sum + minutesBetween(r.start, r.end), 0)
  const base = { planned, actual }

  if (recs.length === 0) {
    if (sched.length === 0) return { ...base, type: 'off', label: '휴무', detail: '사장님과 합의해서 쉰 날 (결근 아님)' }
    return key < todayKey
      ? { ...base, type: 'missed', label: '미근무', detail: '예정은 있었지만 근무 기록이 없어요' }
      : { ...base, type: 'planned', label: '예정', detail: '근무 예정' }
  }
  if (sched.length === 0) {
    return { ...base, type: 'extra', label: '대타', detail: '예정에 없던 근무 (대타·추가 근무)' }
  }
  const diff = actual - planned
  if (diff >= TOLERANCE_MIN) {
    return { ...base, type: 'over', label: '연장', detail: `예정보다 ${fmtDuration(diff)} 더 일했어요`, diff }
  }
  if (diff <= -TOLERANCE_MIN) {
    return { ...base, type: 'under', label: '단축', detail: `예정보다 ${fmtDuration(-diff)} 덜 일했어요`, diff }
  }
  return { ...base, type: 'match', label: '완료', detail: '예정대로 근무했어요' }
}

// 한 근무지의 기록마다 '대타'·'연장' 같은 꼬리표를 붙인다 (증빙 묶음·요청 문구용)
export function recordTags(workplaceId, schedules, records, todayKey) {
  const sched = schedules.filter((s) => s.workplaceId === workplaceId)
  const recs = records.filter((r) => r.workplaceId === workplaceId)
  const tags = {}
  for (const r of recs) {
    if (r.deleted) continue
    const status = dayStatus(dateKey(r.start), sched, recs, todayKey)
    if (status?.type === 'extra') tags[r.id] = '대타(예정에 없던 근무)'
    if (status?.type === 'over') tags[r.id] = `예정보다 ${fmtDuration(status.diff)} 연장`
  }
  return tags
}
