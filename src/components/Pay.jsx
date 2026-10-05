import { useState } from 'react'
import { MIN_WAGE_2026, baseText, calcMonth, paymentKey, tax33, ymOf } from '../lib/pay'
import { dateKey, fmtDuration } from '../lib/time'
import Attachments from './Attachments.jsx'
import Icon from './Icon.jsx'

const won = (n) => `${Math.round(n).toLocaleString()}원`
const shortDate = (key) => `${Number(key.slice(5, 7))}/${Number(key.slice(8, 10))}`

export default function Pay({ data, actions, goTo, openRequest, openEvidence }) {
  const { workplaces, selectedWorkplaceId, records, schedules, payments } = data
  const todayKey = dateKey(new Date())
  const [workplaceId, setWorkplaceId] = useState(selectedWorkplaceId ?? workplaces[0]?.id)
  const [month, setMonth] = useState(() => {
    const d = new Date()
    return { y: d.getFullYear(), m: d.getMonth() }
  })

  const workplace = workplaces.find((w) => w.id === workplaceId) ?? workplaces[0]
  if (!workplace) {
    return (
      <div className="card empty">
        <p className="empty-title">먼저 근무지를 등록해 주세요</p>
        <button className="btn primary" onClick={() => goTo('workplaces')}>
          근무지 등록하기
        </button>
      </div>
    )
  }

  const ym = ymOf(month.y, month.m)
  const key = paymentKey(workplace.id, ym)
  const result = calcMonth(workplace, records, schedules, ym, todayKey)

  function moveMonth(step) {
    const d = new Date(month.y, month.m + step, 1)
    setMonth({ y: d.getFullYear(), m: d.getMonth() })
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
        {workplaces.length > 1 && (
          <select
            className="input"
            value={workplace.id}
            onChange={(e) => setWorkplaceId(e.target.value)}
            aria-label="근무지 선택"
          >
            {workplaces.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        )}
      </section>

      {workplace.wage < MIN_WAGE_2026 && (
        <p className="card warn">
          시급 {won(workplace.wage)}은 2026년 최저시급({won(MIN_WAGE_2026)})보다 낮아요. 아래 금액은 등록한 시급으로
          계산했어요.
        </p>
      )}

      <section className="card">
        <p className="muted">
          {workplace.name} · {month.m + 1}월 예상 급여
        </p>
        <p className="pay-total">{won(result.total)}</p>

        <div className="pay-row">
          <span>
            기본급
            <small>
              {baseText(result)}
            </small>
          </span>
          <b>{won(result.basePay)}</b>
        </div>
        <div className="pay-row">
          <span>
            주휴수당
            <small>대상 {result.weeks.filter((w) => w.eligible).length}주</small>
          </span>
          <b>{won(result.holidayPay)}</b>
        </div>
        <div className="pay-row">
          <span>
            야간수당
            <small>
              {workplace.fivePlus
                ? `22시~06시 ${fmtDuration(result.nightMin)} × 시급의 50%`
                : '5인 미만 사업장은 해당 없음'}
            </small>
          </span>
          <b>{won(result.nightPay)}</b>
        </div>
      </section>

      <PaymentCompare
        key={key}
        monthLabel={`${month.m + 1}월`}
        expected={result.total}
        saved={payments[key]}
        onSave={(value) => actions.savePayment(key, value)}
        onRequest={() => openRequest({ workplaceId: workplace.id, ym })}
      />

      <details className="card fold">
        <summary>
          <span className="stage-title">주별 주휴수당</span>
          <span className="muted">대상 {result.weeks.filter((w) => w.eligible).length}주</span>
          <Icon name="chevronRight" size={18} />
        </summary>
        {result.weeks.map((w) => (
          <div className="week" key={w.startKey}>
            <div>
              <p className="week-range">
                {shortDate(w.startKey)} ~ {shortDate(w.endKey)}
                {w.startKey <= todayKey && w.endKey >= todayKey && <span className="badge gray">이번 주</span>}
              </p>
              <p className="muted">
                실제 {fmtDuration(w.actualMin)}
                {w.usePlan && ` · 예정 ${fmtDuration(w.plannedMin)}`}
              </p>
              {w.eligible ? (
                <p className="week-ok">
                  {w.inProgress ? '이번 주 주휴수당 대상' : '주휴수당 대상'} · {w.usePlan ? '예정' : '실제'}{' '}
                  {fmtDuration(w.basisMin)} 기준
                </p>
              ) : (
                <p className="muted">대상 아님 · {w.reason}</p>
              )}
            </div>
            <p className={w.eligible ? 'week-pay' : 'week-pay none'}>{w.eligible ? `+${won(w.pay)}` : '-'}</p>
          </div>
        ))}
        <p className="muted note">
          주휴수당은 일요일이 들어 있는 달에 넣어 계산했어요. 연장근로 가산은 반영하지 않은 금액이에요.{' '}
          {workplace.breakMin > 0
            ? `무급 휴게시간(4시간마다 ${workplace.breakMin}분)은 뺐어요.`
            : '휴게시간은 빼지 않았어요. 무급 휴게시간이 있다면 설정의 근무지 수정에서 넣어 주세요.'}
        </p>
      </details>

      <Attachments data={data} actions={actions} workplace={workplace} ym={ym} />

      <section>
        <button className="btn primary block with-icon" onClick={() => openEvidence({ workplaceId: workplace.id, ym })}>
          <Icon name="file" size={20} /> 증빙 묶음 PDF 만들기
        </button>
      </section>
    </>
  )
}

// 실제 받은 금액을 넣고 예상 급여와 비교한다
function PaymentCompare({ monthLabel, expected, saved, onSave, onRequest }) {
  const [amount, setAmount] = useState(saved?.amount ?? '')
  const [taxed, setTaxed] = useState(saved?.taxed ?? false)
  const [error, setError] = useState('')

  function save() {
    if (amount === '' || Number(amount) < 0) return setError('받은 금액을 입력해 주세요.')
    setError('')
    onSave({ amount: Number(amount), taxed })
  }

  const target = saved?.taxed ? expected - tax33(expected) : expected
  const diff = saved ? target - saved.amount : 0

  return (
    <section className="card">
      <label className="field">
        {monthLabel}에 실제 받은 금액 (원)
        <input
          className="input"
          type="number"
          inputMode="numeric"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="통장에 들어온 금액"
        />
      </label>
      <label className="check">
        <input type="checkbox" checked={taxed} onChange={(e) => setTaxed(e.target.checked)} />
        <span>
          3.3% 세금을 떼고 받아요
          <small className="muted"> (모르면 비워 두세요)</small>
        </span>
      </label>
      {error && <p className="error">{error}</p>}
      <button className="btn primary block" onClick={save}>
        예상 급여와 비교하기
      </button>

      {saved && (
        <div className={diff >= 10 ? 'diff less' : diff <= -10 ? 'diff more' : 'diff same'}>
          {diff >= 10 && (
            <p className="diff-title">
              {monthLabel}에 {won(diff)} 덜 받았어요
            </p>
          )}
          {diff <= -10 && (
            <p className="diff-title">
              {monthLabel}에 {won(-diff)} 더 받았어요
            </p>
          )}
          {Math.abs(diff) < 10 && <p className="diff-title">예상 급여와 같아요</p>}
          <p className="diff-detail">
            {saved.taxed ? `3.3% 뗀 예상 급여 ${won(target)}` : `예상 급여 ${won(target)}`} − 받은 금액{' '}
            {won(saved.amount)}
          </p>
          {diff >= 10 && !saved.taxed && (
            <p className="diff-detail">세금이나 4대보험을 떼고 받았다면 그만큼은 차액에서 빼고 봐야 해요.</p>
          )}
          {diff >= 10 && (
            <button className="btn primary block" onClick={onRequest}>
              사장님께 보낼 메시지 만들기
            </button>
          )}
        </div>
      )}
    </section>
  )
}
