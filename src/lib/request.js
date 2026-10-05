// 정산 요청에 쓸 근거 자료 정리
import { calcMonth, paymentKey, tax33 } from './pay'
import { fmtDate, fmtDuration, fmtRange, minutesBetween, monthKey } from './time'

const won = (n) => `${Math.round(n).toLocaleString()}원`
const shortDate = (key) => `${Number(key.slice(5, 7))}/${Number(key.slice(8, 10))}`

// 받은 금액을 입력했고, 예상보다 덜 받은 달 목록 (최근 달 먼저)
export function shortfalls(data, todayKey) {
  const list = []
  for (const [key, payment] of Object.entries(data.payments)) {
    const [workplaceId, ym] = key.split('|')
    const workplace = data.workplaces.find((w) => w.id === workplaceId)
    if (!workplace) continue
    const result = calcMonth(workplace, data.records, data.schedules, ym, todayKey)
    const target = payment.taxed ? result.total - tax33(result.total) : result.total
    const diff = target - payment.amount
    if (diff < 10) continue
    const records = data.records
      .filter((r) => !r.deleted && r.workplaceId === workplaceId && monthKey(r.start) === ym)
      .sort((a, b) => new Date(a.start) - new Date(b.start))
    const [y, m] = ym.split('-').map(Number)
    list.push({ key, workplace, ym, label: `${y}년 ${m}월`, month: m, result, payment, target, diff, records })
  }
  return list.sort((a, b) => b.ym.localeCompare(a.ym))
}

export const targetKey = (target) => (target ? paymentKey(target.workplaceId, target.ym) : null)

const recordLine = (r) =>
  `${fmtDate(r.start)} ${fmtRange(r.start, r.end)} (${fmtDuration(minutesBetween(r.start, r.end))})`

// 기본급·주휴수당·야간수당·합계를 한 줄씩
function calcLines(c) {
  const { workplace, result, payment } = c
  const lines = [`기본급: ${fmtDuration(result.baseMin)} × ${won(workplace.wage)} = ${won(result.basePay)}`]
  if (result.holidayPay > 0) {
    lines.push(`주휴수당: ${won(result.holidayPay)} (주 15시간 이상 근무한 주)`)
    for (const w of result.weeks.filter((week) => week.eligible)) {
      lines.push(`  - ${shortDate(w.startKey)}~${shortDate(w.endKey)} 주 ${fmtDuration(w.basisMin)} → ${won(w.pay)}`)
    }
  }
  if (result.nightPay > 0) {
    lines.push(
      `야간수당: 22시~06시 ${fmtDuration(result.nightMin)} × ${won(workplace.wage)} × 50% = ${won(result.nightPay)}`,
    )
  }
  lines.push(`예상 급여 합계: ${won(result.total)}`)
  if (payment.taxed) lines.push(`3.3% 세금을 뗀 예상 금액: ${won(c.target)}`)
  return lines
}

// Claude에게 넘기고, 화면에서 '근거'로도 보여주는 글
export function buildFacts(c) {
  const { workplace, result, payment } = c
  return [
    `[근무지] ${workplace.name} / 시급 ${won(workplace.wage)} / ${workplace.fivePlus ? '5인 이상' : '5인 미만'} 사업장`,
    `[대상] ${c.label} 급여`,
    '',
    '[날짜별 근무 기록]',
    ...c.records.map(recordLine),
    `총 근무 시간: ${fmtDuration(result.baseMin)}`,
    '',
    '[계산 내역]',
    ...calcLines(c),
    '',
    `[실제 받은 금액] ${won(payment.amount)}`,
    `[차액] ${won(c.diff)} 덜 받음`,
  ].join('\n')
}

// 내용증명 기본 초안 (2단계). [대괄호]는 사용자가 직접 채운다
export function buildCertifiedTemplate(c) {
  const { workplace, result, payment } = c
  return [
    '임금 지급 요청',
    '',
    `수신인: [수신인 성명] (${workplace.name} 대표)`,
    '주소: [사업장 주소]',
    '발신인: [발신인 성명]',
    '주소: [발신인 주소]',
    '',
    `1. 발신인은 ${workplace.name}에서 시급 ${won(workplace.wage)}으로 근무한 근로자입니다.`,
    '',
    `2. 발신인은 ${c.label}에 아래와 같이 총 ${fmtDuration(result.baseMin)} 근무하였습니다.`,
    ...c.records.map((r) => `  - ${recordLine(r)}`),
    '',
    '3. 위 근무에 대한 임금은 다음과 같이 계산됩니다.',
    ...calcLines(c).map((line) => `  ${line.startsWith(' ') ? line : `- ${line}`}`),
    '',
    `4. 그러나 발신인이 실제로 지급받은 금액은 ${won(payment.amount)}으로, ${won(c.diff)}이 지급되지 않았습니다.`,
    '',
    `5. 이에 미지급 임금 ${won(c.diff)}을 [지급 기한]까지 아래 계좌로 지급하여 주시기 바랍니다.`,
    '  입금 계좌: [은행명 / 계좌번호 / 예금주]',
    '',
    '6. 위 기한까지 지급되지 않을 경우, 고용노동부에 임금체불 진정을 제기하는 등 필요한 절차를 진행할 수 있음을 알려드립니다.',
    '',
    '[작성일]',
    '발신인 [발신인 성명] (서명 또는 인)',
  ].join('\n')
}

// AI 연결이 안 될 때 쓰는 기본 문구 (1단계)
export function buildTemplate(c) {
  const { result, payment } = c
  const items = [`기본급 ${won(result.basePay)}`]
  if (result.holidayPay > 0) items.push(`주휴수당 ${won(result.holidayPay)}`)
  if (result.nightPay > 0) items.push(`야간수당 ${won(result.nightPay)}`)
  return [
    `사장님 안녕하세요. ${c.month}월 급여 관련해서 여쭤볼 게 있어서 연락드려요.`,
    '',
    `제가 기록해 둔 근무 시간으로 계산해 보니 ${c.month}월에 총 ${fmtDuration(result.baseMin)} 일했고, ${items.join(', ')}${
      payment.taxed ? '에서 3.3% 세금을 빼면' : '을 더하면'
    } ${won(c.target)}이 나오는데요. 실제로 받은 금액은 ${won(payment.amount)}이라 ${won(c.diff)} 정도 차이가 나서요.`,
    '',
    '제가 계산을 잘 몰라서 틀렸을 수도 있어서, 한번 확인 부탁드려도 될까요?',
    '',
    '제가 기록한 근무 시간은 아래와 같아요.',
    ...c.records.map(recordLine),
    '',
    '바쁘신데 번거롭게 해 드려 죄송해요. 확인해 주시면 감사하겠습니다.',
  ].join('\n')
}

// 문구를 만든다. API 키가 있으면 Claude가 쓰고, 없거나 실패하면 기본 문구를 쓴다
export async function makeMessage(stage, c) {
  const result = await requestMessage(stage, buildFacts(c))
  if (result.text) return { text: result.text, source: 'ai' }
  const text = stage === 1 ? buildTemplate(c) : buildCertifiedTemplate(c)
  return { text, source: 'template', notice: errorText(result.error) }
}

// 서버(Claude)에 문구를 요청한다. 실패하면 { error } 를 돌려준다
async function requestMessage(stage, facts) {
  try {
    const res = await fetch('./api/settlement-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage, facts }),
    })
    const body = await res.json()
    return res.ok && body.text ? { text: body.text } : { error: body.error ?? 'UNKNOWN' }
  } catch {
    return { error: 'OFFLINE' }
  }
}

export const ERROR_TEXT = {
  NO_KEY: '', // 키 없이 쓰는 것은 정상이라 안내하지 않는다
  BAD_KEY: 'API 키가 올바르지 않아요. .env 파일의 키를 확인해 주세요.',
  RATE_LIMIT: '요청이 잠시 몰렸어요. 조금 뒤에 다시 시도해 주세요.',
  REFUSED: 'AI가 이 요청에는 문구를 만들지 못했어요.',
  OFFLINE: '', // 서버 없이(배포된 화면만) 쓰는 것도 정상
}

const errorText = (code) => ERROR_TEXT[code] ?? 'AI 문구를 만드는 중 문제가 생겼어요.'

// 주소가 https가 아니어도(같은 와이파이의 폰) 복사가 되도록 예비 방법을 둔다
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const area = document.createElement('textarea')
    area.value = text
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    area.remove()
    return ok
  }
}
