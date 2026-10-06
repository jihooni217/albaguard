// 퇴직금: 한 곳에서 1년 이상, 주 15시간 이상 일했으면 알바도 받을 수 있다. 모르고 못 받는 경우가 많아 미리 알려준다
// 법정 기준을 단순하게 옮긴 추정이다. 평균임금 = 그만두기 전 3개월 임금 ÷ 그 기간의 날수, 퇴직금 = 평균임금 × 30 × (근속일 ÷ 365)
import { calcMonth, mondayOf, weekSummary } from './pay'
import { dateKey, monthKey } from './time'

const YEAR_DAYS = 365
const NOTICE_DAYS = 30 // 1년이 되기 이만큼 전부터 미리 알려준다
const WEEK_MIN = 15 * 60

const daysBetween = (a, b) => Math.round((new Date(`${b}T00:00`) - new Date(`${a}T00:00`)) / 86400000)

// 한 근무지의 퇴직금 상태. 아직 1년이 한 달 넘게 남았거나 기록이 없으면 null
export function severanceInfo(workplace, records, schedules, todayKey) {
  const recs = records
    .filter((r) => !r.deleted && r.workplaceId === workplace.id)
    .sort((a, b) => new Date(a.start) - new Date(b.start))
  if (recs.length === 0) return null

  // 근무지에 '일 시작한 날'을 넣어 뒀으면 그 날, 아니면 첫 기록 날을 시작으로 본다
  const startKey = workplace.startDate || dateKey(recs[0].start)
  const days = daysBetween(startKey, todayKey) + 1
  if (days < YEAR_DAYS - NOTICE_DAYS) return null

  // 최근 4주(이번 주 제외)의 평균 근무 시간으로 주 15시간을 넘는지 본다
  const thisMonday = mondayOf(`${todayKey}T00:00`)
  let weekTotal = 0
  for (let k = 1; k <= 4; k++) {
    const monday = new Date(thisMonday)
    monday.setDate(monday.getDate() - 7 * k)
    weekTotal += weekSummary(workplace, records, schedules, monday, todayKey).actualMin
  }
  const avgWeekMin = Math.round(weekTotal / 4)

  // 최근 3개월(이번 달 제외)의 급여로 평균임금을 낸다
  const today = new Date(`${todayKey}T00:00`)
  let paySum = 0
  let daySum = 0
  for (let k = 1; k <= 3; k++) {
    const d = new Date(today.getFullYear(), today.getMonth() - k, 1)
    paySum += calcMonth(workplace, records, schedules, monthKey(d), todayKey).total
    daySum += new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  }
  const dailyAvg = daySum > 0 ? paySum / daySum : 0
  const estimate = Math.round(dailyAvg * 30 * (days / YEAR_DAYS))

  return {
    startKey,
    days,
    daysLeft: Math.max(0, YEAR_DAYS - days),
    avgWeekMin,
    hoursOk: avgWeekMin >= WEEK_MIN,
    eligible: days >= YEAR_DAYS && avgWeekMin >= WEEK_MIN,
    estimate,
  }
}

// 모든 근무지 중 알려줄 것 (대상이거나 한 달 안에 대상이 되는 곳)
export function severanceAlerts(data, todayKey) {
  return data.workplaces
    .map((w) => ({ workplace: w, info: severanceInfo(w, data.records, data.schedules, todayKey) }))
    .filter((x) => x.info && x.info.hoursOk)
}
