// 시연용 예시 데이터. 오늘 날짜를 기준으로 지난달~이번 달 기록을 만든다
import { newId } from './id'
import { calcMonth, paymentKey } from './pay'
import { dateKey, monthKey } from './time'

const WORK_DAYS = [1, 3, 5, 6] // 월·수·금·토 18~22시 (주 16시간)

export function buildDemoData() {
  const workplace = { id: newId(), name: '모퉁이카페 (예시)', wage: 10320, fivePlus: true }
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const at = (day, hour, minute = 0) => {
    const d = new Date(day)
    d.setHours(hour, minute, 0, 0)
    return d.toISOString()
  }
  const nextDay = (day) => {
    const d = new Date(day)
    d.setDate(d.getDate() + 1)
    return d
  }
  const record = (day, startHour, endHour, extra = {}) => ({
    id: newId(),
    workplaceId: workplace.id,
    start: at(day, startHour),
    end: at(day, endHour),
    source: 'button',
    createdAt: at(day, endHour),
    deleted: false,
    history: [],
    ...extra,
  })

  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  const schedules = []
  const records = []
  let count = 0

  for (let day = new Date(lastMonthStart); day <= thisMonthEnd; day.setDate(day.getDate() + 1)) {
    // 대타: 지난달 둘째 일요일, 예정에 없던 근무
    if (day.getDay() === 0 && day.getDate() >= 8 && day.getDate() <= 14 && day < today && day.getMonth() !== today.getMonth()) {
      records.push(record(day, 12, 16))
    }
    if (!WORK_DAYS.includes(day.getDay())) continue

    // 예정 스케줄은 이번 달 말까지, 실제 근무는 어제까지 (오늘은 시연에서 직접 출근)
    schedules.push({ id: newId(), workplaceId: workplace.id, date: dateKey(day), start: '18:00', end: '22:00' })
    if (day >= today) continue

    count += 1
    if (count === 3) {
      // 연장 근무: 23시까지 (22시 이후 1시간은 야간)
      records.push(record(day, 18, 23))
    } else if (count === 5) {
      // 퇴근 버튼을 늦게 눌러 다음 날 고친 기록
      const pressed = at(day, 22, 40)
      records.push(
        record(day, 18, 22, {
          createdAt: pressed,
          history: [
            {
              type: 'edit',
              at: at(nextDay(day), 9, 10),
              reason: '퇴근 버튼을 늦게 눌렀어요',
              before: { start: at(day, 18), end: pressed },
              after: { start: at(day, 18), end: at(day, 22) },
            },
          ],
        }),
      )
    } else if (count === 8) {
      // 버튼을 깜빡해 다음 날 직접 넣은 기록
      records.push(
        record(day, 18, 22, {
          source: 'manual',
          createdAt: at(nextDay(day), 8, 30),
          addReason: '출근 버튼을 깜빡했어요',
        }),
      )
    } else {
      records.push(record(day, 18, 22))
    }
  }

  // 지난달 급여는 기본급만 들어온 상황 (주휴수당·야간수당이 빠짐)
  const lastYm = monthKey(lastMonthStart)
  const lastMonth = calcMonth(workplace, records, schedules, lastYm, dateKey(today))

  return {
    workplaces: [workplace],
    selectedWorkplaceId: workplace.id,
    active: null,
    records,
    schedules,
    payments: { [paymentKey(workplace.id, lastYm)]: { amount: lastMonth.basePay, taxed: false } },
    requests: {},
    attachments: [],
    lastBackupAt: null,
  }
}
