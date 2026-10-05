import { calcMonth, paymentKey, tax33 } from '../lib/pay'
import { dateKey, fmtDate, fmtDateTime, fmtDuration, fmtRange, minutesBetween, monthKey } from '../lib/time'

const won = (n) => `${Math.round(n).toLocaleString()}원`
const shortDate = (key) => `${Number(key.slice(5, 7))}/${Number(key.slice(8, 10))}`

// 증빙 묶음: 한 달치 근무 기록·수정 이력·계산 근거·입금 내역을 한 문서로 보여주고 PDF로 저장한다
export default function Evidence({ data, target, onClose }) {
  const workplace = data.workplaces.find((w) => w.id === target.workplaceId)
  const { ym } = target
  const [y, m] = ym.split('-').map(Number)
  const now = new Date()
  const result = calcMonth(workplace, data.records, data.schedules, ym, dateKey(now))
  const payment = data.payments[paymentKey(workplace.id, ym)]
  const expected = payment?.taxed ? result.total - tax33(result.total) : result.total

  const records = data.records
    .filter((r) => r.workplaceId === workplace.id && monthKey(r.start) === ym)
    .sort((a, b) => new Date(a.start) - new Date(b.start))

  // 직접 입력·수정·삭제를 일어난 순서대로 모은다
  const events = records
    .flatMap((r) => [
      ...(r.source === 'manual' ? [{ type: 'manual', at: r.createdAt, reason: r.addReason, record: r }] : []),
      ...r.history.map((h) => ({ ...h, record: r })),
    ])
    .sort((a, b) => new Date(a.at) - new Date(b.at))

  function savePdf() {
    // 인쇄 창에서 'PDF로 저장'을 고르면 파일 이름으로 쓰인다
    const title = document.title
    document.title = `알바가드_증빙_${workplace.name}_${ym}`
    window.addEventListener('afterprint', () => (document.title = title), { once: true })
    window.print()
  }

  return (
    <div className="evidence-screen">
      <div className="evidence-bar">
        <button className="btn small" onClick={onClose}>
          닫기
        </button>
        <button className="btn small primary" onClick={savePdf}>
          PDF로 저장
        </button>
      </div>
      <p className="evidence-hint">인쇄 창이 뜨면 프린터 대신 "PDF로 저장"을 골라 주세요.</p>

      <article className="evidence-doc">
        <h1>근무·급여 증빙 자료</h1>
        <table>
          <tbody>
            <tr>
              <th>근무지</th>
              <td>{workplace.name}</td>
            </tr>
            <tr>
              <th>대상 기간</th>
              <td>
                {y}년 {m}월
              </td>
            </tr>
            <tr>
              <th>시급</th>
              <td>
                {won(workplace.wage)} ({workplace.fivePlus ? '5인 이상' : '5인 미만'} 사업장)
              </td>
            </tr>
            <tr>
              <th>총 근무 시간</th>
              <td>{fmtDuration(result.baseMin)}</td>
            </tr>
            <tr>
              <th>문서 작성</th>
              <td>
                {now.getFullYear()}년 {fmtDateTime(now.toISOString())} (알바가드 앱에서 출력)
              </td>
            </tr>
          </tbody>
        </table>

        <h2>1. 근무 기록</h2>
        {records.length === 0 ? (
          <p>이 달의 근무 기록이 없습니다.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>날짜</th>
                <th>출근 ~ 퇴근</th>
                <th>근무 시간</th>
                <th>비고</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => {
                const edits = r.history.filter((h) => h.type === 'edit').length
                const notes = [
                  r.source === 'manual' ? '나중에 입력' : '버튼 기록',
                  edits > 0 && `수정 ${edits}회`,
                  r.deleted && '삭제됨(합계 제외)',
                ].filter(Boolean)
                return (
                  <tr key={r.id} className={r.deleted ? 'struck' : undefined}>
                    <td>{fmtDate(r.start)}</td>
                    <td>{fmtRange(r.start, r.end)}</td>
                    <td>{fmtDuration(minutesBetween(r.start, r.end))}</td>
                    <td>{notes.join(', ')}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        <h2>2. 수정 이력</h2>
        {events.length === 0 ? (
          <p>모든 기록이 출퇴근 버튼으로 남긴 그대로이며, 수정·삭제·직접 입력한 기록이 없습니다.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>일시</th>
                <th>대상 기록</th>
                <th>내용</th>
                <th>사유</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e, i) => (
                <tr key={i}>
                  <td>{fmtDateTime(e.at)}</td>
                  <td>{fmtDate(e.record.start)}</td>
                  <td>
                    {e.type === 'manual' && '직접 입력'}
                    {e.type === 'delete' &&
                      `삭제 (삭제 전 ${fmtDateTime(e.before.start)} ~ ${fmtDateTime(e.before.end)})`}
                    {e.type === 'edit' &&
                      `수정: ${fmtDateTime(e.before.start)} ~ ${fmtDateTime(e.before.end)} → ${fmtDateTime(
                        e.after.start,
                      )} ~ ${fmtDateTime(e.after.end)}`}
                  </td>
                  <td>{e.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <h2>3. 계산 근거</h2>
        <table>
          <tbody>
            <tr>
              <th>기본급</th>
              <td>
                {fmtDuration(result.baseMin)} × {won(workplace.wage)}
              </td>
              <td className="num">{won(result.basePay)}</td>
            </tr>
            <tr>
              <th>주휴수당</th>
              <td>
                {result.weeks.filter((w) => w.eligible).length === 0
                  ? '대상 주 없음'
                  : result.weeks
                      .filter((w) => w.eligible)
                      .map((w) => (
                        <div key={w.startKey}>
                          {shortDate(w.startKey)}~{shortDate(w.endKey)} 주 {fmtDuration(w.basisMin)} ÷ 40시간 × 8시간 ×
                          시급 = {won(w.pay)}
                        </div>
                      ))}
              </td>
              <td className="num">{won(result.holidayPay)}</td>
            </tr>
            <tr>
              <th>야간수당</th>
              <td>
                {workplace.fivePlus
                  ? `22시~06시 ${fmtDuration(result.nightMin)} × 시급의 50%`
                  : '5인 미만 사업장은 해당 없음'}
              </td>
              <td className="num">{won(result.nightPay)}</td>
            </tr>
            <tr>
              <th>예상 급여</th>
              <td>기본급 + 주휴수당 + 야간수당</td>
              <td className="num strong">{won(result.total)}</td>
            </tr>
          </tbody>
        </table>
        <p className="small">
          주휴수당은 주 15시간 이상 일한 주에 대해 계산했고, 한 주는 월~일, 일요일이 든 달에 포함했습니다. 연장근로 가산과
          휴게시간은 반영하지 않았습니다.
        </p>

        <h2>4. 입금 내역</h2>
        {payment ? (
          <table>
            <tbody>
              {payment.taxed && (
                <tr>
                  <th>3.3% 뗀 예상 급여</th>
                  <td className="num">{won(expected)}</td>
                </tr>
              )}
              {!payment.taxed && (
                <tr>
                  <th>예상 급여</th>
                  <td className="num">{won(expected)}</td>
                </tr>
              )}
              <tr>
                <th>실제 받은 금액 (본인 입력)</th>
                <td className="num">{won(payment.amount)}</td>
              </tr>
              <tr>
                <th>차액</th>
                <td className="num strong">
                  {expected - payment.amount >= 0
                    ? `${won(expected - payment.amount)} 부족`
                    : `${won(payment.amount - expected)} 초과`}
                </td>
              </tr>
            </tbody>
          </table>
        ) : (
          <p>실제 받은 금액이 아직 입력되지 않았습니다.</p>
        )}
        <p className="small">입금 내역은 통장 거래 내역이나 급여명세서 사본을 함께 첨부하면 좋습니다.</p>

        <p className="small footer">
          이 문서는 알바가드 앱에 저장된 기록을 그대로 출력한 것입니다. 기록을 고치거나 지운 경우 그 전후 내용과 시점, 사유가
          2번 항목에 남아 있습니다.
        </p>
      </article>
    </div>
  )
}
