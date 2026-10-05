import { useEffect, useState } from 'react'
import { mondayOf, weekSummary } from '../lib/pay'
import { dateKey, fmtDuration, fmtTime, minutesBetween, monthKey } from '../lib/time'
import RecordItem from './RecordItem.jsx'
import RecordForm from './RecordForm.jsx'

export default function Home({ data, actions, goTo }) {
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
  const workDays = monthRecords.filter((r) => !r.deleted).length
  const selectedWorkplace = workplaces.find((w) => w.id === selectedWorkplaceId)
  const thisWeek =
    selectedWorkplace && weekSummary(selectedWorkplace, records, data.schedules, mondayOf(now), dateKey(now))
  const activeWorkplace = active && workplaces.find((w) => w.id === active.workplaceId)

  return (
    <>
      <section className="card clock-card">
        {active ? (
          <>
            <p className="clock-status">
              <span className="dot" /> {activeWorkplace?.name ?? '근무지'}에서 근무 중
            </p>
            <p className="clock-time">출근 {fmtTime(active.start)}</p>
            <p className="muted">{fmtDuration(minutesBetween(active.start, now))} 지났어요</p>
            <button className="clock-btn out" onClick={actions.clockOut}>
              퇴근
            </button>
          </>
        ) : (
          <>
            <select
              className="input"
              value={selectedWorkplaceId ?? ''}
              onChange={(e) => actions.selectWorkplace(e.target.value)}
              aria-label="근무지 선택"
            >
              {workplaces.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} · 시급 {w.wage.toLocaleString()}원
                </option>
              ))}
            </select>
            <button className="clock-btn in" onClick={actions.clockIn}>
              출근
            </button>
            <p className="muted">버튼을 누르면 지금 시각으로 출근이 기록돼요</p>
          </>
        )}
      </section>

      <section className="card summary">
        <div>
          <p className="muted">{now.getMonth() + 1}월 총 근무 시간</p>
          <p className="summary-value">{fmtDuration(totalMin)}</p>
        </div>
        <div>
          <p className="muted">근무 횟수</p>
          <p className="summary-value">{workDays}회</p>
        </div>
      </section>

      {thisWeek?.eligible && (
        <button className="card holiday-banner" onClick={() => goTo('pay')}>
          🎉 이번 주 주휴수당 대상이에요 <b>+{thisWeek.pay.toLocaleString()}원</b>
        </button>
      )}

      <section>
        <div className="section-head">
          <h2>{now.getMonth() + 1}월 근무 기록</h2>
          <button className="btn small" onClick={() => setForm({ add: true })}>
            + 직접 추가
          </button>
        </div>
        {monthRecords.length === 0 ? (
          <p className="muted center">아직 기록이 없어요. 출근 버튼을 눌러 시작해 보세요.</p>
        ) : (
          monthRecords.map((r) => (
            <RecordItem key={r.id} record={r} workplaces={workplaces} onEdit={() => setForm({ record: r })} />
          ))
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
