import { useState } from 'react'
import { baseText, calcMonth, paymentKey, tax33, wageOn, ymOf } from '../lib/pay'
import { minWage } from '../lib/최저임금'
import { dateKey, fmtDuration } from '../lib/time'
import Attachments from './Attachments.jsx'
import Icon from './Icon.jsx'

const won = (n) => `${Math.round(n).toLocaleString()}원`
const shortDate = (key) => `${Number(key.slice(5, 7))}/${Number(key.slice(8, 10))}`

export default function Pay({ data, actions, goTo, openRequest, openEvidence, target }) {
  const { workplaces, selectedWorkplaceId, records, schedules, payments } = data
  const todayKey = dateKey(new Date())
  // target이 있으면(첫 화면 알림에서 넘어옴) 그 근무지·달을 먼저 보여준다
  const [workplaceId, setWorkplaceId] = useState(target?.workplaceId ?? selectedWorkplaceId ?? workplaces[0]?.id)
  const [month, setMonth] = useState(() => {
    if (target) return { y: Number(target.ym.slice(0, 4)), m: Number(target.ym.slice(5, 7)) - 1 }
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
  // 그 달에 적용된 시급을 그 해 최저임금과 비교한다
  const legal = minWage(month.y)
  const monthWage = wageOn(workplace, `${ym}-31`)
  const key = paymentKey(workplace.id, ym)
  const result = calcMonth(workplace, records, schedules, ym, todayKey)

  function moveMonth(step) {
    const d = new Date(month.y, month.m + step, 1)
    setMonth({ y: d.getFullYear(), m: d.getMonth() })
  }

  const eligibleWeeks = result.weeks.filter((w) => w.eligible).length

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
      <div className="rq-top">
        {workplaces.length > 1 ? (
          <label className="rq-pick">
            <select value={workplace.id} onChange={(e) => setWorkplaceId(e.target.value)} aria-label="근무지 선택">
              {workplaces.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
            <Icon name="chevronDown" size={16} />
          </label>
        ) : (
          <p className="rq-pick">{workplace.name}</p>
        )}
      </div>

      {monthWage < legal.wage && (
        <p className="pay-warn">
          시급 {won(monthWage)}은 {legal.year}년 최저시급({won(legal.wage)})보다 낮아요. 아래 금액은 등록한 시급으로
          계산했어요.
        </p>
      )}

      <PaymentCompare
        key={key}
        monthLabel={`${month.m + 1}월`}
        expected={result.total}
        saved={payments[key]}
        onSave={(value) => actions.savePayment(key, value)}
        onRequest={() => openRequest({ workplaceId: workplace.id, ym })}
      />

      <h2 className="rq-title">이렇게 계산했어요</h2>
      <div className="pay-rows">
        <div className="rq-row">
          <span>
            기본급
            <small>{baseText(result)}</small>
          </span>
          <b>{won(result.basePay)}</b>
        </div>
        <div className="rq-row">
          <span>
            주휴수당
            <small>대상 {eligibleWeeks}주</small>
          </span>
          <b>{won(result.holidayPay)}</b>
        </div>
        <div className="rq-row">
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
        <details className="rq-facts">
          <summary className="rq-row link">
            <span>주별 주휴수당 보기</span>
            <Icon name="chevronRight" size={18} />
          </summary>
          <div className="pay-weeks">
            {result.weeks.map((w) => (
              <div className="week" key={w.startKey}>
                <div>
                  <p className="week-range">
                    {shortDate(w.startKey)} ~ {shortDate(w.endKey)}
                    {w.startKey <= todayKey && w.endKey >= todayKey && <span className="pay-thisweek">이번 주</span>}
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
            <p className="muted pay-note">
              주휴수당은 일요일이 들어 있는 달에 넣어 계산했어요. 연장근로 가산은 반영하지 않은 금액이에요.{' '}
              {workplace.breakMin > 0
                ? `무급 휴게시간(4시간마다 ${workplace.breakMin}분)은 뺐어요.`
                : '휴게시간은 빼지 않았어요. 무급 휴게시간이 있다면 설정의 근무지 수정에서 넣어 주세요.'}
            </p>
          </div>
        </details>
      </div>

      <Attachments data={data} actions={actions} workplace={workplace} ym={ym} />

      <div className="pay-rows pay-evidence">
        <button className="rq-row link" onClick={() => openEvidence({ workplaceId: workplace.id, ym })}>
          <span>증빙 묶음 PDF 만들기</span>
          <Icon name="chevronRight" size={18} />
        </button>
      </div>
    </>
  )
}

// 실제 받은 금액을 넣고 예상 급여와 비교한다. 넣기 전에는 묻고, 넣은 뒤에는 차액을 맨 위에 크게 보여준다
function PaymentCompare({ monthLabel, expected, saved, onSave, onRequest }) {
  const [amount, setAmount] = useState(saved?.amount ?? '')
  const [taxed, setTaxed] = useState(saved?.taxed ?? false)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')

  function save() {
    if (amount === '' || Number(amount) < 0) return setError('받은 금액을 입력해 주세요.')
    setError('')
    setEditing(false)
    onSave({ amount: Number(amount), taxed })
  }

  const big = (n) => (
    <>
      {Math.round(n).toLocaleString()}
      <small>원</small>
    </>
  )

  if (!saved || editing) {
    return (
      <section className="rq-top">
        <p className="rq-label">{monthLabel}에 받았어야 할 돈</p>
        <p className="rq-owed plain">{big(expected)}</p>

        <div className="pay-ask">
          <label>
            <span className="pay-ask-title">실제로 얼마 받았나요?</span>
            <span className="pay-ask-input">
              <input
                type="number"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="통장에 들어온 금액"
              />
              <b>원</b>
            </span>
          </label>
          <label className="check pay-check">
            <input type="checkbox" checked={taxed} onChange={(e) => setTaxed(e.target.checked)} />
            <span>
              3.3% 세금을 떼고 받아요 <small className="muted">(모르면 비워 두세요)</small>
            </span>
          </label>
          {error && <p className="error">{error}</p>}
          <button className="btn primary block" onClick={save}>
            비교하기
          </button>
          {saved && (
            <button className="pay-fix" onClick={() => setEditing(false)}>
              그만두기
            </button>
          )}
        </div>
      </section>
    )
  }

  const target = saved.taxed ? expected - tax33(expected) : expected
  const diff = target - saved.amount
  const less = diff >= 10
  const more = diff <= -10
  const widest = Math.max(target, saved.amount, 1)

  return (
    <section className="rq-top">
      <p className="rq-label">
        {less && `${monthLabel}에 덜 받은 돈`}
        {more && `${monthLabel}에 더 받은 돈`}
        {!less && !more && `${monthLabel}에 받은 돈 · 예상 급여와 같아요`}
      </p>
      <p className={less ? 'rq-owed' : 'rq-owed plain'}>{big(less || more ? Math.abs(diff) : saved.amount)}</p>

      <div className="bars">
        <div className="bar-row">
          <span>{saved.taxed ? '받았어야 할 돈 (3.3% 제외)' : '받았어야 할 돈'}</span>
          <b>{won(target)}</b>
        </div>
        <div className="bar">
          <i style={{ width: `${Math.min(100, (target / widest) * 100)}%` }} />
        </div>
        <div className="bar-row">
          <span>실제로 받은 돈</span>
          <b>{won(saved.amount)}</b>
        </div>
        <div className="bar">
          <i style={{ width: `${Math.min(100, (saved.amount / widest) * 100)}%` }} />
          {less && <em />}
        </div>
      </div>
      {less && !saved.taxed && (
        <p className="diff-detail">세금이나 4대보험을 떼고 받았다면 그만큼은 차액에서 빼고 봐야 해요.</p>
      )}
      {less && (
        <button className="btn primary block" onClick={onRequest}>
          사장님께 보낼 메시지 만들기
        </button>
      )}
      <button className="pay-fix" onClick={() => setEditing(true)}>
        받은 금액 고치기
      </button>
    </section>
  )
}
