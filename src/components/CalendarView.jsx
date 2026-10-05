import { useState } from 'react'
import { dayStatus } from '../lib/compare'
import { dateKey, fmtDate, fmtDuration, pad } from '../lib/time'
import Icon from './Icon.jsx'
import Modal from './Modal.jsx'
import RecordItem from './RecordItem.jsx'
import RecordForm from './RecordForm.jsx'

const DOW = ['일', '월', '화', '수', '목', '금', '토']

export default function CalendarView({ data, actions, goTo }) {
  const { workplaces, selectedWorkplaceId, schedules, records } = data
  const todayKey = dateKey(new Date())
  const [month, setMonth] = useState(() => {
    const d = new Date()
    return { y: d.getFullYear(), m: d.getMonth() }
  })
  const [selected, setSelected] = useState(todayKey)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [recordForm, setRecordForm] = useState(null) // null | { record } | { add: true }

  const firstDow = new Date(month.y, month.m, 1).getDay()
  const dayCount = new Date(month.y, month.m + 1, 0).getDate()
  const cells = [...Array(firstDow).fill(null), ...Array.from({ length: dayCount }, (_, i) => i + 1)]
  const keyOf = (day) => `${month.y}-${pad(month.m + 1)}-${pad(day)}`

  function moveMonth(step) {
    const d = new Date(month.y, month.m + step, 1)
    setMonth({ y: d.getFullYear(), m: d.getMonth() })
  }

  const status = dayStatus(selected, schedules, records, todayKey)
  const daySchedules = schedules.filter((s) => s.date === selected)
  const dayRecords = records.filter((r) => dateKey(r.start) === selected)
  const nameOf = (id) => workplaces.find((w) => w.id === id)?.name ?? '삭제된 근무지'

  if (workplaces.length === 0) {
    return (
      <div className="card empty">
        <p className="empty-title">먼저 근무지를 등록해 주세요</p>
        <button className="btn primary" onClick={() => goTo('workplaces')}>
          근무지 등록하기
        </button>
      </div>
    )
  }

  return (
    <>
      <section className="card">
        <div className="cal-head">
          <button className="icon-btn" onClick={() => moveMonth(-1)} aria-label="이전 달">
            <Icon name="chevronLeft" size={20} />
          </button>
          <h2>
            {month.y}년 {month.m + 1}월
          </h2>
          <button className="icon-btn" onClick={() => moveMonth(1)} aria-label="다음 달">
            <Icon name="chevronRight" size={20} />
          </button>
        </div>

        <div className="cal-grid">
          {DOW.map((d) => (
            <div key={d} className="cal-dow">
              {d}
            </div>
          ))}
          {cells.map((day, i) => {
            if (!day) return <div key={`blank-${i}`} />
            const key = keyOf(day)
            const st = dayStatus(key, schedules, records, todayKey)
            const cls = ['cal-cell', key === selected && 'selected', key === todayKey && 'today'].filter(Boolean)
            return (
              <button key={key} className={cls.join(' ')} onClick={() => setSelected(key)}>
                <span className="cal-day">{day}</span>
                {st && <span className={`cal-tag ${st.type}`}>{st.label}</span>}
              </button>
            )
          })}
        </div>

        <div className="legend">
          <span className="cal-tag planned">예정</span>
          <span className="cal-tag match">완료</span>
          <span className="cal-tag over">연장</span>
          <span className="cal-tag extra">대타</span>
          <span className="cal-tag under">단축</span>
          <span className="cal-tag missed">미근무</span>
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>{fmtDate(selected)}</h2>
        </div>

        {status && (
          <div className={`card compare ${status.type}`}>
            <p className="compare-title">{status.detail}</p>
            <div className="compare-row">
              <span>예정 {status.planned ? fmtDuration(status.planned) : '없음'}</span>
              <span>실제 {status.actual ? fmtDuration(status.actual) : '없음'}</span>
            </div>
          </div>
        )}

        <h3 className="sub-head">예정 스케줄</h3>
        {daySchedules.length === 0 && <p className="muted">예정된 근무가 없어요.</p>}
        {daySchedules.map((s) => (
          <div className="card schedule" key={s.id}>
            <div>
              <p className="record-range">
                {s.start} ~ {s.end <= s.start ? '다음날 ' : ''}
                {s.end}
              </p>
              <p className="muted">{nameOf(s.workplaceId)}</p>
            </div>
            <button className="btn small ghost" onClick={() => actions.deleteSchedule(s.id)}>
              삭제
            </button>
          </div>
        ))}
        <button className="btn block" onClick={() => setScheduleOpen(true)}>
          + 예정 스케줄 추가
        </button>

        <h3 className="sub-head">실제 근무</h3>
        {dayRecords.length === 0 && <p className="muted">근무 기록이 없어요.</p>}
        {dayRecords.map((r) => (
          <RecordItem key={r.id} record={r} workplaces={workplaces} onEdit={() => setRecordForm({ record: r })} />
        ))}
        {selected <= todayKey && (
          <button className="btn block" onClick={() => setRecordForm({ add: true })}>
            + 근무 기록 직접 추가
          </button>
        )}
      </section>

      {scheduleOpen && (
        <ScheduleForm
          date={selected}
          workplaces={workplaces}
          defaultWorkplaceId={selectedWorkplaceId}
          actions={actions}
          onClose={() => setScheduleOpen(false)}
        />
      )}
      {recordForm && (
        <RecordForm
          record={recordForm.record}
          workplaces={workplaces}
          defaultWorkplaceId={selectedWorkplaceId}
          defaultDate={selected}
          actions={actions}
          onClose={() => setRecordForm(null)}
        />
      )}
    </>
  )
}

function ScheduleForm({ date, workplaces, defaultWorkplaceId, actions, onClose }) {
  const [workplaceId, setWorkplaceId] = useState(defaultWorkplaceId ?? workplaces[0]?.id)
  const [start, setStart] = useState('18:00')
  const [end, setEnd] = useState('22:00')
  const [repeat, setRepeat] = useState(false)
  const [error, setError] = useState('')
  const base = new Date(`${date}T00:00`)

  function save() {
    if (!start || !end) return setError('시작·종료 시각을 입력해 주세요.')
    if (start === end) return setError('시작과 종료 시각이 같아요.')
    // 반복이면 이 날부터 월말까지 같은 요일 모두
    const dates = []
    const d = new Date(base)
    while (d.getMonth() === base.getMonth()) {
      dates.push(dateKey(d))
      if (!repeat) break
      d.setDate(d.getDate() + 7)
    }
    actions.addSchedules(dates.map((day) => ({ workplaceId, date: day, start, end })))
    onClose()
  }

  return (
    <Modal title={`${fmtDate(date)} 예정 스케줄`} onClose={onClose}>
      <label className="field">
        근무지
        <select className="input" value={workplaceId} onChange={(e) => setWorkplaceId(e.target.value)}>
          {workplaces.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
      </label>
      <div className="row">
        <label className="field">
          시작
          <input className="input" type="time" value={start} onChange={(e) => setStart(e.target.value)} />
        </label>
        <label className="field">
          종료
          <input className="input" type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
        </label>
      </div>
      {end && start && end < start && <p className="muted">종료가 시작보다 일러서 다음날 {end}까지로 저장돼요.</p>}
      <label className="check">
        <input type="checkbox" checked={repeat} onChange={(e) => setRepeat(e.target.checked)} />
        <span>
          이번 달 남은 {DOW[base.getDay()]}요일에도 모두 추가
        </span>
      </label>

      {error && <p className="error">{error}</p>}

      <button className="btn primary block" onClick={save}>
        저장
      </button>
    </Modal>
  )
}
