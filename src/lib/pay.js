// 예상 급여 계산 (기본급 + 주휴수당 + 야간수당)
import { dateKey, minutesBetween, monthKey, pad, scheduleMinutes } from './time'

export const MIN_WAGE_2026 = 10320
const HOLIDAY_PAY_MIN = 15 * 60 // 주 15시간 이상이면 주휴수당 대상
const WEEK_CAP_MIN = 40 * 60 // 주휴수당 계산은 주 40시간까지만

// 그 날짜가 속한 주의 월요일 (한 주는 월~일)
export function mondayOf(value) {
  const d = new Date(value)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return d
}

// 22시~06시에 걸친 근무 시간(분)
export function nightMinutes(start, end) {
  const s = new Date(start)
  const e = new Date(end)
  let total = 0
  const day = new Date(s)
  day.setHours(0, 0, 0, 0)
  day.setDate(day.getDate() - 1)
  for (; day < e; day.setDate(day.getDate() + 1)) {
    const from = new Date(day)
    from.setHours(22)
    const to = new Date(day)
    to.setDate(to.getDate() + 1)
    to.setHours(6)
    const overlap = Math.min(e, to) - Math.max(s, from)
    if (overlap > 0) total += overlap
  }
  return Math.round(total / 60000)
}

// 한 주의 근무 시간과 주휴수당 대상 여부
export function weekSummary(workplace, records, schedules, monday, todayKey) {
  const sunday = new Date(monday)
  sunday.setDate(sunday.getDate() + 6)
  const startKey = dateKey(monday)
  const endKey = dateKey(sunday)
  const inWeek = (key) => key >= startKey && key <= endKey

  const recs = records.filter((r) => !r.deleted && r.workplaceId === workplace.id && inWeek(dateKey(r.start)))
  const sched = schedules.filter((s) => s.workplaceId === workplace.id && inWeek(s.date))
  const actualMin = recs.reduce((sum, r) => sum + minutesBetween(r.start, r.end), 0)
  const plannedMin = sched.reduce((sum, s) => sum + scheduleMinutes(s), 0)

  // 예정 스케줄이 있으면 그것을 약속된 근무 시간으로 보고, 없으면 실제 근무 시간으로 계산
  const usePlan = plannedMin > 0
  const basisMin = usePlan ? plannedMin : actualMin
  const workedDays = new Set(recs.map((r) => dateKey(r.start)))
  const missed = sched.some((s) => s.date < todayKey && !workedDays.has(s.date))
  const inProgress = endKey >= todayKey

  let reason = ''
  if (actualMin === 0) reason = '근무 기록 없음'
  else if (basisMin < HOLIDAY_PAY_MIN) reason = '주 15시간 미만'
  else if (missed) reason = '예정된 날에 빠진 근무가 있어요'
  else if (inProgress && actualMin < HOLIDAY_PAY_MIN) reason = '아직 15시간을 채우지 않았어요'
  const eligible = reason === ''
  const pay = eligible ? Math.round((Math.min(basisMin, WEEK_CAP_MIN) / WEEK_CAP_MIN) * 8 * workplace.wage) : 0

  return { startKey, endKey, actualMin, plannedMin, basisMin, usePlan, inProgress, eligible, reason, pay }
}

// 한 달 예상 급여. ym은 '2026-10' 형태
export function calcMonth(workplace, records, schedules, ym, todayKey) {
  const monthRecs = records.filter(
    (r) => !r.deleted && r.workplaceId === workplace.id && monthKey(r.start) === ym,
  )
  const baseMin = monthRecs.reduce((sum, r) => sum + minutesBetween(r.start, r.end), 0)
  const basePay = Math.round((baseMin / 60) * workplace.wage)

  // 야간수당은 5인 이상 사업장만
  const nightMin = monthRecs.reduce((sum, r) => sum + nightMinutes(r.start, r.end), 0)
  const nightPay = workplace.fivePlus ? Math.round((nightMin / 60) * workplace.wage * 0.5) : 0

  // 주휴수당은 일요일이 이 달에 들어 있는 주를 이 달 몫으로 본다
  const [y, m] = ym.split('-').map(Number)
  const dayCount = new Date(y, m, 0).getDate()
  const weeks = []
  for (let day = 1; day <= dayCount; day++) {
    const d = new Date(y, m - 1, day)
    if (d.getDay() !== 0) continue
    weeks.push(weekSummary(workplace, records, schedules, mondayOf(d), todayKey))
  }
  const holidayPay = weeks.reduce((sum, w) => sum + w.pay, 0)

  return { baseMin, basePay, nightMin, nightPay, weeks, holidayPay, total: basePay + nightPay + holidayPay }
}

// 3.3% 공제 (10원 미만 버림)
export function tax33(amount) {
  return Math.floor((amount * 0.033) / 10) * 10
}

export const paymentKey = (workplaceId, ym) => `${workplaceId}|${ym}`
export const ymOf = (y, m) => `${y}-${pad(m + 1)}`
