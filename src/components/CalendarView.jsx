import { useState } from 'react'
import { dayStatus } from '../lib/compare'
import { recordPay } from '../lib/pay'
import { dateKey, fmtDate, fmtDuration, fmtRange, minutesBetween, pad, scheduleMinutes } from '../lib/time'
import Icon from './Icon.jsx'
import Modal from './Modal.jsx'
import RecordItem from './RecordItem.jsx'
import RecordForm from './RecordForm.jsx'

const DOW = ['일', '월', '화', '수', '목', '금', '토']

// 예정과 달랐던 날. 달력에서 이 날들만 글자로 표시한다
const CHANGED = ['over', 'extra', 'under', 'missed']
// 초록 = 더 일했다, 빨강 = 덜 일했다
const TONE = { over: 'up', extra: 'up', under: 'down', missed: 'down' }

// 날짜 아래 표시: 완료는 초록 점, 예정은 빈 고리, 휴무는 짧은 줄, 달랐던 날은 글자
function Mark({ status }) {
  if (status.type === 'match') return <i className="cv-dot" />
  if (status.type === 'planned') return <i className="cv-ring" />
  if (status.type === 'off') return <i className="cv-dash" />
  return <span className={TONE[status.type]}>{status.label}</span>
}

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

  // 이 달에 지금까지 일한 시간과, 예정과 달랐던 날 수
  const monthPrefix = `${month.y}-${pad(month.m + 1)}`
  const workedMin = records
    .filter((r) => !r.deleted && dateKey(r.start).startsWith(monthPrefix))
    .reduce((sum, r) => sum + minutesBetween(r.start, r.end), 0)
  const statusOf = (day) => dayStatus(keyOf(day), schedules, records, todayKey)
  const changedDays = cells.filter((day) => day && CHANGED.includes(statusOf(day)?.type)).length
  // 종류별 개수: 있는 것만 "연장 1 · 대타 1"처럼 보여준다
  const changedCounts = CHANGED.map((type) => {
    const days = cells.filter((day) => day && statusOf(day)?.type === type)
    return { type, label: days[0] && statusOf(days[0]).label, count: days.length }
  }).filter((c) => c.count > 0)

  const plannedList = daySchedules.filter((x) => !x.off)
  const actualList = dayRecords.filter((r) => !r.deleted)
  const wageFor = (r) => workplaces.find((w) => w.id === r.workplaceId) ?? workplaces[0]

  return (
    <>
      <div className="cv-month">
        <h2>
          {month.y}년 {month.m + 1}월
        </h2>
        <div className="cv-nav">
          <button onClick={() => moveMonth(-1)} aria-label="이전 달">
            <Icon name="chevronLeft" size={20} />
          </button>
          <button onClick={() => moveMonth(1)} aria-label="다음 달">
            <Icon name="chevronRight" size={20} />
          </button>
        </div>
      </div>

      <div className="cv-summary">
        <span>
          {month.m + 1}월에 일한 시간 <b>{workedMin > 0 ? fmtDuration(workedMin) : '없음'}</b>
        </span>
        {changedDays > 0 && (
          <span>
            예정과 달랐던 날 <b>{changedDays}일</b>
          </span>
        )}
      </div>

      <div className="cv-dow">
        {DOW.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="cv-grid">
        {cells.map((day, i) => {
          if (!day) return <span key={`blank-${i}`} />
          const key = keyOf(day)
          const st = statusOf(day)
          const cls = [
            'cv-day',
            !st && 'empty',
            CHANGED.includes(st?.type) && 'changed',
            key === selected && 'selected',
            key === todayKey && 'today',
          ].filter(Boolean)
          return (
            <button
              key={key}
              className={cls.join(' ')}
              onClick={() => setSelected(key)}
              aria-label={`${month.m + 1}월 ${day}일${st ? ` ${st.label}` : ''}`}
            >
              <span className="cv-num">{day}</span>
              <span className="cv-mark">{st && <Mark status={st} />}</span>
            </button>
          )
        })}
      </div>

      <div className="cv-legend">
        <span>
          <i className="cv-dot" />
          완료
        </span>
        <span>
          <i className="cv-ring" />
          예정
        </span>
        <span>
          <i className="cv-dash" />
          휴무
        </span>
        {changedCounts.length > 0 && (
          <span className="cv-counts">
            {changedCounts.map((c) => (
              <span key={c.type}>
                <b className={TONE[c.type]}>{c.label}</b> {c.count}
              </span>
            ))}
          </span>
        )}
      </div>

      <div className="cv-day-head">
        <h2>{fmtDate(selected)}</h2>
        {status && <span className={`cv-status ${TONE[status.type] ?? ''}`}>{status.label}</span>}
      </div>

      {status && (
        <div className="cv-rows">
          <div className="cv-row">
            <span className="cv-key">예정</span>
            <span className="cv-val">
              {plannedList.length > 0 ? plannedList.map((x) => `${x.start} ~ ${x.end}`).join(', ') : '없음'}
            </span>
            {status.planned > 0 && <b>{fmtDuration(status.planned)}</b>}
          </div>
          <div className="cv-row">
            <span className="cv-key">실제</span>
            <span className="cv-val">
              {actualList.length > 0 ? actualList.map((r) => fmtRange(r.start, r.end)).join(', ') : '없음'}
            </span>
            {status.actual > 0 && <b>{fmtDuration(status.actual)}</b>}
          </div>
          <div className="cv-row">
            <span className="cv-key">차이</span>
            <span className={`cv-val cv-diff ${TONE[status.type] ?? ''}`}>{status.detail}</span>
          </div>
        </div>
      )}

      <h3 className="cv-sec">예정 스케줄</h3>
      {daySchedules.length === 0 && <p className="cv-none">예정된 근무가 없어요</p>}
      {daySchedules.map((x) => (
        <div className={x.off ? 'cv-item off' : 'cv-item'} key={x.id}>
          <div className="cv-info">
            <p className="cv-range">
              {x.start} ~ {x.end <= x.start ? '다음날 ' : ''}
              {x.end}
            </p>
            <p className="cv-meta">
              {x.off ? '합의해서 쉼 · 결근 아님' : fmtDuration(scheduleMinutes(x))} · {nameOf(x.workplaceId)}
            </p>
          </div>
          <div className="cv-acts">
            <button className="cv-quiet" onClick={() => actions.toggleScheduleOff(x.id)}>
              {x.off ? '쉼 취소' : '합의해서 쉼'}
            </button>
            <button className="cv-text" onClick={() => actions.deleteSchedule(x.id)}>
              삭제
            </button>
          </div>
        </div>
      ))}
      <button className="cv-add" onClick={() => setScheduleOpen(true)}>
        <span>+</span>예정 스케줄 추가
      </button>

      <h3 className="cv-sec">실제 근무</h3>
      {dayRecords.length === 0 && <p className="cv-none">근무 기록이 없어요</p>}
      {dayRecords.map((r) => (
        <RecordItem
          key={r.id}
          record={r}
          workplaces={workplaces}
          amount={recordPay(r, wageFor(r))}
          onEdit={() => setRecordForm({ record: r })}
        />
      ))}
      {selected <= todayKey && (
        <button className="cv-add" onClick={() => setRecordForm({ add: true })}>
          <span>+</span>근무 기록 직접 추가
        </button>
      )}

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
