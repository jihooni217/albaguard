// 예상 급여 계산 (기본급 + 주휴수당 + 야간수당)
import { dateKey, fmtDuration, minutesBetween, monthKey, pad, scheduleMinutes } from './time'

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

// 무급 휴게시간을 뺀, 급여를 받는 시간(분). 근무지에 '4시간마다 몇 분'으로 넣어 둔 만큼 뺀다
export function paidMinutes(min, workplace) {
  const breakPer4h = workplace.breakMin ?? 0
  return Math.max(0, min - Math.floor(min / 240) * breakPer4h)
}

// 그 날짜에 적용되는 시급. 시급이 바뀐 적이 있으면 wageHistory([{ from, wage }], 날짜순)에서 찾는다
export function wageOn(workplace, key) {
  const history = workplace.wageHistory
  if (!history?.length) return workplace.wage
  const current = history.filter((h) => h.from <= key).at(-1)
  return (current ?? history[0]).wage
}

// 시급을 글로: "10,320원" 또는 "10,030원 → 2026-07-01부터 10,320원"
export function wageText(workplace) {
  const history = workplace.wageHistory
  if (!history || history.length < 2) return `${workplace.wage.toLocaleString()}원`
  return history
    .map((h, i) => (i === 0 ? `${h.wage.toLocaleString()}원` : `${h.from}부터 ${h.wage.toLocaleString()}원`))
    .join(' → ')
}

// 시급을 바꿀 때 새 이력을 만든다. from이 없으면 잘못 넣은 시급을 고치는 것(가장 최근 시급만 교체)
export function nextWageHistory(workplace, wage, from) {
  const history = workplace.wageHistory ?? [{ from: '2000-01-01', wage: workplace.wage }]
  if (!from) return history.length > 1 ? [...history.slice(0, -1), { ...history.at(-1), wage }] : undefined
  return [...history.filter((h) => h.from < from), { from, wage }]
}

// 기본급 계산식을 글로: "54시간 (휴게 2시간 제외) × 10,320원"
export function baseText(result) {
  const breakNote = result.breakMin > 0 ? ` (휴게 ${fmtDuration(result.breakMin)} 제외)` : ''
  const wages = result.wages.map((w) => `${w.toLocaleString()}원`)
  const wageNote = wages.length > 1 ? `시급 (기간 중 변경: ${wages.join(' → ')})` : wages[0]
  return `${fmtDuration(result.baseMin)}${breakNote} × ${wageNote}`
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
  const actualMin = recs.reduce((sum, r) => sum + paidMinutes(minutesBetween(r.start, r.end), workplace), 0)
  const plannedMin = sched.reduce((sum, s) => sum + paidMinutes(scheduleMinutes(s), workplace), 0)

  // 예정 스케줄이 있으면 그것을 약속된 근무 시간으로 보고, 없으면 실제 근무 시간으로 계산
  const usePlan = plannedMin > 0
  const basisMin = usePlan ? plannedMin : actualMin
  const workedDays = new Set(recs.map((r) => dateKey(r.start)))
  // 합의해서 쉰 날(off)은 결근으로 보지 않는다. 약속된 근무 시간(plannedMin)에는 그대로 포함
  const missed = sched.some((s) => !s.off && s.date < todayKey && !workedDays.has(s.date))
  const inProgress = endKey >= todayKey

  let reason = ''
  if (actualMin === 0) reason = '근무 기록 없음'
  else if (basisMin < HOLIDAY_PAY_MIN) reason = '주 15시간 미만'
  else if (missed) reason = '예정된 날에 빠진 근무가 있어요'
  else if (inProgress && actualMin < HOLIDAY_PAY_MIN) reason = '아직 15시간을 채우지 않았어요'
  const eligible = reason === ''
  const wage = wageOn(workplace, endKey)
  const pay = eligible ? Math.round((Math.min(basisMin, WEEK_CAP_MIN) / WEEK_CAP_MIN) * 8 * wage) : 0

  return { startKey, endKey, actualMin, plannedMin, basisMin, usePlan, inProgress, eligible, reason, pay }
}

// 한 달 예상 급여. ym은 '2026-10' 형태
export function calcMonth(workplace, records, schedules, ym, todayKey) {
  const monthRecs = records.filter(
    (r) => !r.deleted && r.workplaceId === workplace.id && monthKey(r.start) === ym,
  )
  // baseMin은 휴게시간을 뺀 시간, breakMin은 뺀 휴게시간
  const grossMin = monthRecs.reduce((sum, r) => sum + minutesBetween(r.start, r.end), 0)
  const baseMin = monthRecs.reduce((sum, r) => sum + paidMinutes(minutesBetween(r.start, r.end), workplace), 0)
  const breakMin = grossMin - baseMin
  // 시급은 근무한 날짜에 적용되던 금액으로 계산한다
  const wageOf = (r) => wageOn(workplace, dateKey(r.start))
  const basePay = Math.round(
    monthRecs.reduce((sum, r) => sum + (paidMinutes(minutesBetween(r.start, r.end), workplace) / 60) * wageOf(r), 0),
  )
  const wages = [...new Set(monthRecs.map(wageOf))]
  if (wages.length === 0) wages.push(wageOn(workplace, `${ym}-01`))

  // 야간수당은 5인 이상 사업장만
  const nightMin = monthRecs.reduce((sum, r) => sum + nightMinutes(r.start, r.end), 0)
  const nightPay = workplace.fivePlus
    ? Math.round(monthRecs.reduce((sum, r) => sum + (nightMinutes(r.start, r.end) / 60) * wageOf(r) * 0.5, 0))
    : 0

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

  return { baseMin, breakMin, basePay, wages, nightMin, nightPay, weeks, holidayPay, total: basePay + nightPay + holidayPay }
}

// 3.3% 공제 (10원 미만 버림)
export function tax33(amount) {
  return Math.floor((amount * 0.033) / 10) * 10
}

export const paymentKey = (workplaceId, ym) => `${workplaceId}|${ym}`
export const ymOf = (y, m) => `${y}-${pad(m + 1)}`
