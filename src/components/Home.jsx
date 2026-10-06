import { useEffect, useState } from 'react'
import { calcMonth, mondayOf, recordPay, weekSummary } from '../lib/pay'
import { shortfallTotal, staleRequests, unpaidMonths } from '../lib/request'
import { severanceAlerts } from '../lib/severance'
import { dateKey, fmtDate, fmtDuration, fmtTime, fromInputValue, minutesBetween, monthKey, toInputValue } from '../lib/time'
import Modal from './Modal.jsx'
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

// 출근한 지 이만큼 지나면 퇴근을 잊은 것으로 본다(분)
const OVERDUE_MIN = 12 * 60

export default function Home({ data, actions, goTo, openPay, openGame }) {
  const { workplaces, selectedWorkplaceId, active, records } = data
  const [, setTick] = useState(0)
  const [form, setForm] = useState(null) // null | { record } | { add: true }
  const [lateOut, setLateOut] = useState(false) // 퇴근을 잊었을 때 시각을 넣는 창
  const [severanceOpen, setSeveranceOpen] = useState(null) // 퇴직금 설명 창에 보여줄 근무지

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
  const stale = staleRequests(data, dateKey(now))
  const severance = severanceAlerts(data, dateKey(now))
  const activeWorkplace = active && workplaces.find((w) => w.id === active.workplaceId)
  // 출근한 지 12시간이 넘으면 퇴근 버튼을 잊은 것으로 보고, 바로 끝내지 않고 시각을 묻는다
  const overdue = active && minutesBetween(active.start, now) >= OVERDUE_MIN

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
            <button className="clock-btn out" onClick={() => (overdue ? setLateOut(true) : actions.clockOut())}>
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

      {overdue && (
        <section className="card alerts">
          <button className="alert-row warn" onClick={() => setLateOut(true)}>
            <span>퇴근을 안 눌렀나요? · {fmtDate(active.start)} 출근</span>
            <b>퇴근 시각 넣기</b>
          </button>
        </section>
      )}

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

      {(pending.length > 0 || owed.count > 0 || thisWeek?.eligible || stale.length > 0 || severance.length > 0) && (
        <section className="card alerts">
          {severance.map(({ workplace, info }) => (
            <button key={workplace.id} className="alert-row ask" onClick={() => setSeveranceOpen({ workplace, info })}>
              <span>
                {info.eligible
                  ? `퇴직금 대상이에요 · ${workplace.name}`
                  : `${info.daysLeft}일 뒤 퇴직금 대상 · ${workplace.name}`}
              </span>
              <b>약 {info.estimate.toLocaleString()}원</b>
            </button>
          ))}
          {stale.length > 0 && (
            <button className="alert-row ask" onClick={() => goTo('request')}>
              <span>
                {stale[0].stage === 1 ? '메시지' : '내용증명'} 보낸 지 {stale[0].days}일 · 답이 없나요?
              </span>
              <b>다음 단계 보기</b>
            </button>
          )}
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


      {severanceOpen && (
        <Modal title="퇴직금" onClose={() => setSeveranceOpen(null)}>
          <SeveranceInfo workplace={severanceOpen.workplace} info={severanceOpen.info} />
        </Modal>
      )}
      {lateOut && active && (
        <LateOutForm
          active={active}
          schedules={data.schedules}
          now={now}
          onSave={(end, reason) => {
            actions.clockOutAt(end, reason)
            setLateOut(false)
          }}
          onClose={() => setLateOut(false)}
        />
      )}
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

// 퇴근을 잊었을 때 끝난 시각을 넣는 창. 그날 예정 스케줄이 있으면 그 끝 시각을 미리 채워 둔다
function LateOutForm({ active, schedules, now, onSave, onClose }) {
  const start = new Date(active.start)
  const planned = schedules.find((s) => s.date === dateKey(start) && s.workplaceId === active.workplaceId && !s.off)
  const guess = new Date(start)
  if (planned) {
    const [h, m] = planned.end.split(':').map(Number)
    guess.setHours(h, m, 0, 0)
    if (guess <= start) guess.setDate(guess.getDate() + 1)
  } else {
    guess.setHours(guess.getHours() + 4)
  }
  if (guess > now) guess.setTime(now.getTime())
  const [end, setEnd] = useState(toInputValue(guess.toISOString()))
  const [reason, setReason] = useState('퇴근 버튼을 못 눌러서 나중에 넣음')
  const [error, setError] = useState('')

  function save() {
    if (!end) return setError('끝난 시각을 넣어 주세요.')
    const endIso = fromInputValue(end)
    if (new Date(endIso) <= start) return setError('끝난 시각이 출근 시각보다 늦어야 해요.')
    if (new Date(endIso) > now) return setError('아직 오지 않은 시각이에요.')
    if (!reason.trim()) return setError('사유를 적어 주세요.')
    onSave(endIso, reason.trim())
  }

  return (
    <Modal title="퇴근 시각 넣기" onClose={onClose}>
      <p className="muted">
        {fmtDate(start)} {fmtTime(active.start)}에 출근한 뒤 퇴근 버튼이 눌리지 않았어요. 실제로 끝난 시각을 넣으면
        그 시각으로 기록돼요. 지금 넣었다는 것과 사유가 함께 남아요.
      </p>
      <label className="field">
        끝난 시각
        <input className="input" type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
      </label>
      {planned && (
        <p className="muted field-help">
          그날 예정이 {planned.start} ~ {planned.end}이라 그 끝 시각을 미리 넣어 뒀어요.
        </p>
      )}
      <label className="field">
        사유
        <input className="input" value={reason} onChange={(e) => setReason(e.target.value)} />
      </label>
      {error && <p className="error">{error}</p>}
      <button className="btn primary block" onClick={save}>
        이 시각으로 퇴근 기록
      </button>
      <button className="btn ghost block" onClick={onClose}>
        아직 일하는 중이에요
      </button>
    </Modal>
  )
}

// 퇴직금 설명: 왜 대상인지, 얼마쯤인지, 어떻게 계산했는지
function SeveranceInfo({ workplace, info }) {
  const months = Math.floor(info.days / 30)
  return (
    <>
      <p className="rq-label">{info.eligible ? '받을 수 있는 퇴직금 (추정)' : `${info.daysLeft}일 뒤부터 받을 수 있는 퇴직금 (추정)`}</p>
      <p className="rq-owed plain">
        {info.estimate.toLocaleString()}
        <small>원</small>
      </p>
      <div className="pay-rows sev-rows">
        <div className="rq-row">
          <span>일 시작한 날</span>
          <b>
            {info.startKey.slice(0, 4)}년 {fmtDate(info.startKey)}
          </b>
        </div>
        <div className="rq-row">
          <span>근속</span>
          <b>
            {info.days}일 (약 {months}개월)
          </b>
        </div>
        <div className="rq-row">
          <span>최근 4주 평균</span>
          <b>주 {fmtDuration(info.avgWeekMin)}</b>
        </div>
      </div>
      <p className="muted sev-note">
        알바도 한 곳에서 <b>1년 이상</b>, <b>주 15시간 이상</b> 일했으면 퇴직금을 받을 수 있어요. 그만둔 날부터 14일 안에
        받는 것이 원칙이에요. 금액은 그만두기 전 3개월 급여로 낸 하루 평균 × 30일 × (근속일 ÷ 365)로 어림한 것이라, 실제와
        다를 수 있어요.
      </p>
      <p className="muted sev-note">
        일 시작한 날이 다르면 설정 → 근무지 수정에서 고칠 수 있어요. 정확한 금액은 고용노동부 퇴직금 계산기나 1350 상담으로
        확인해 주세요. 법률 자문이 아니에요.
      </p>
    </>
  )
}
