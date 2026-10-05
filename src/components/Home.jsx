import { useEffect, useState } from 'react'
import { calcMonth, mondayOf, recordPay, weekSummary } from '../lib/pay'
import { shortfallTotal, unpaidMonths } from '../lib/request'
import { dateKey, fmtDuration, fmtTime, minutesBetween, monthKey } from '../lib/time'
import RecordItem from './RecordItem.jsx'
import RecordForm from './RecordForm.jsx'

// 지금 시각. 이 부분만 1초마다 다시 그린다
function LiveClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  return <span className="clock-now">{fmtTime(now)}</span>
}

export default function Home({ data, actions, goTo, openPay, openGame }) {
  const { workplaces, selectedWorkplaceId, active, records } = data
  const [, setTick] = useState(0)
  const [form, setForm] = useState(null) // null | { record } | { add: true }

  // 근무 중일 때 경과 시간을 다시 그린다
  useEffect(() => {
    if (!active) return
    const timer = setInterval(() => setTick((t) => t + 1), 15000)
    return () => clearInterval(timer)
  }, [active])

  if (workplaces.length === 0) {
    return (
      <div className="card empty">
        <p className="empty-title">먼저 근무지를 등록해 주세요</p>
        <p className="muted">매장 이름과 시급만 넣으면 바로 기록을 시작할 수 있어요.</p>
        <button className="btn primary" onClick={() => goTo('workplaces')}>
          근무지 등록하기
        </button>
        <button className="btn ghost block" onClick={actions.loadDemo}>
          예시 데이터로 둘러보기
        </button>
      </div>
    )
  }

  const now = new Date()
  const thisMonth = monthKey(now)
  const monthRecords = records
    .filter((r) => monthKey(r.start) === thisMonth)
    .sort((a, b) => new Date(b.start) - new Date(a.start))
  const totalMin = monthRecords
    .filter((r) => !r.deleted)
    .reduce((sum, r) => sum + minutesBetween(r.start, r.end), 0)
  // 이번 달 받을 돈: 모든 근무지의 예상 급여 합계
  const earned = workplaces
    .map((w) => calcMonth(w, records, data.schedules, thisMonth, dateKey(now)))
    .reduce((sum, r) => ({ total: sum.total + r.total, holidayPay: sum.holidayPay + r.holidayPay }), {
      total: 0,
      holidayPay: 0,
    })
  const selectedWorkplace = workplaces.find((w) => w.id === selectedWorkplaceId)
  const thisWeek =
    selectedWorkplace && weekSummary(selectedWorkplace, records, data.schedules, mondayOf(now), dateKey(now))
  const owed = shortfallTotal(data, dateKey(now))
  const pending = unpaidMonths(data, dateKey(now))
  const activeWorkplace = active && workplaces.find((w) => w.id === active.workplaceId)

  // 이번 달 내역: 근무 기록과 주휴수당을 입금 내역처럼 한 줄씩, 최근 것부터
  const entries = [
    ...monthRecords.map((r) => ({ kind: 'record', key: r.id, at: dateKey(r.start), record: r })),
    ...workplaces.flatMap((w) =>
      calcMonth(w, records, data.schedules, thisMonth, dateKey(now))
        .weeks.filter((week) => week.eligible)
        .map((week) => ({
          kind: 'holiday',
          key: `${w.id}-${week.startKey}`,
          at: week.endKey > dateKey(now) ? dateKey(now) : week.endKey,
          week,
          workplace: w,
        })),
    ),
  ].sort((x, y) => y.at.localeCompare(x.at) || (x.kind === 'holiday' ? -1 : 1))
  const shortDay = (key) => `${Number(key.slice(5, 7))}.${key.slice(8, 10)}`

  return (
    <>
      <section className={active ? 'top working' : 'top'}>
        <div className="top-bar">
          <span className="top-brand">알바가드</span>
          {active ? (
            <span className="top-place">{activeWorkplace?.name ?? '근무지'}</span>
          ) : (
            <select
              className="top-place"
              value={selectedWorkplaceId ?? ''}
              onChange={(e) => actions.selectWorkplace(e.target.value)}
              aria-label="근무지 선택"
            >
              {workplaces.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <p className="top-label">{now.getMonth() + 1}월에 받을 돈 · 지금까지 {fmtDuration(totalMin)}</p>
        <p className="top-amount">
          {earned.total.toLocaleString()}
          <span> 원</span>
        </p>

        {active ? (
          <>
            <p className="top-status">
              <span className="dot" /> {fmtTime(active.start)} 출근 · {fmtDuration(minutesBetween(active.start, now))} 지났어요
            </p>
            <button className="clock-btn out" onClick={actions.clockOut}>
              <LiveClock /> 퇴근
            </button>
          </>
        ) : (
          <div className="top-actions">
            <button className="clock-btn in" onClick={actions.clockIn}>
              <LiveClock /> 출근
            </button>
            <button className="top-add" onClick={() => setForm({ add: true })}>
              직접 추가
            </button>
          </div>
        )}
      </section>

      {active && (
        <section className="card alerts">
          <button className="alert-row ask" onClick={() => openGame('sudoku')}>
            <span>손님 없는 틈에 · 스도쿠</span>
            <b>{data.sudoku && !data.sudoku.done ? '이어 하기' : '한 판 하기'}</b>
          </button>
          <button className="alert-row ask" onClick={() => openGame('spot')}>
            <span>손님 없는 틈에 · 틀린 그림 찾기</span>
            <b>한 판 하기</b>
          </button>
        </section>
      )}

      {(pending.length > 0 || owed.count > 0 || thisWeek?.eligible) && (
        <section className="card alerts">
          {pending.length > 0 && (
            <button className="alert-row ask" onClick={() => openPay(pending[0])}>
              <span>{pending[0].month}월 급여 받으셨나요?</span>
              <b>받은 금액 넣기</b>
            </button>
          )}
          {owed.count > 0 && (
            <button className="alert-row owed" onClick={() => goTo('request')}>
              <span>덜 받은 급여 · {owed.count}개월</span>
              <b>{owed.amount.toLocaleString()}원</b>
            </button>
          )}
          {thisWeek?.eligible && (
            <button className="alert-row" onClick={() => goTo('pay')}>
              <span>이번 주 주휴수당 대상</span>
              <b>+{thisWeek.pay.toLocaleString()}원</b>
            </button>
          )}
        </section>
      )}

      <section>
        <div className="section-head">
          <h2>{now.getMonth() + 1}월 내역</h2>
        </div>
        {entries.length === 0 ? (
          <p className="muted center">아직 기록이 없어요. 출근 버튼을 눌러 시작해 보세요.</p>
        ) : (
          entries.map((e) =>
            e.kind === 'record' ? (
              <RecordItem
                key={e.key}
                record={e.record}
                workplaces={workplaces}
                amount={recordPay(e.record, workplaces.find((w) => w.id === e.record.workplaceId) ?? workplaces[0])}
                onEdit={() => setForm({ record: e.record })}
              />
            ) : (
              <div className="card record" key={e.key}>
                <div className="record-main">
                  <div className="record-day">
                    <span>주휴</span>
                    <b>{Number(e.at.slice(8, 10))}</b>
                  </div>
                  <div className="record-info">
                    <p className="record-range">주휴수당</p>
                    <p className="record-meta">
                      {shortDay(e.week.startKey)} – {shortDay(e.week.endKey)} 주 · {fmtDuration(e.week.basisMin)} 기준
                    </p>
                  </div>
                  <div className="record-side">
                    <p className="record-amount">+{e.week.pay.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ),
          )
        )}
      </section>

      {form && (
        <RecordForm
          record={form.record}
          workplaces={workplaces}
          defaultWorkplaceId={selectedWorkplaceId}
          actions={actions}
          onClose={() => setForm(null)}
        />
      )}
    </>
  )
}
