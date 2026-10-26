// 알바가드 중간발표 PPT 생성 (pptxgenjs)
const pptxgen = require('pptxgenjs')
const path = require('path')
const fs = require('fs')
const { applyTheme } = require('C:/Users/user/AppData/Local/Claude-Data/claude_pzs8sxrjxfjjc/local-agent-mode-sessions/skills-plugin/ae12fec3-4bb9-4b95-b7db-f99845d7bf92/63c7127e-611b-410e-85f2-7bc1ca801d1e/skills/pptx/scripts/apply_theme.js')

const PROJ = 'C:/Users/user/Desktop/albaguard기술창업'
const SHOT = (n) => path.join(PROJ, 'docs/screenshots', n)
const OUT = process.argv[2] || path.join(PROJ, 'docs/06_중간발표_PPT.pptx')

const THEME = {
  name: 'Albaguard',
  headFontFace: 'Malgun Gothic',
  bodyFontFace: 'Malgun Gothic',
  colors: {
    dk1: '15171A', lt1: 'FFFFFF', dk2: '2A3193', lt2: 'F4F3EF',
    accent1: '2A3193', accent2: '0F7A55', accent3: 'C2331C', accent4: '5A63E6', accent5: '5D636D', accent6: 'DCD9D0',
    hlink: '2A3193', folHlink: '5A63E6',
  },
}
const HEX = THEME.colors

const pres = new pptxgen()
pres.layout = 'LAYOUT_16x9' // 10 x 5.625
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace }
pres.author = '4조'
pres.title = '알바가드 중간발표'
const C = pres.SchemeColor
const S = pres.ShapeType

// ---------- 레이아웃 ----------
pres.defineSlideMaster({
  title: 'LIGHT',
  background: { color: HEX.lt1 },
  objects: [
    { text: { text: '알바가드 · SW기술창업 중간발표 · 4조', options: { x: 0.5, y: 5.22, w: 5, h: 0.28, fontSize: 9, color: C.accent5, margin: 0 } } },
    { placeholder: { options: { name: 'eyebrow', type: 'body', x: 0.5, y: 0.3, w: 8.5, h: 0.28, fontSize: 10.5, bold: true, color: C.accent5, margin: 0 }, text: '' } },
    { placeholder: { options: { name: 'title', type: 'title', x: 0.5, y: 0.55, w: 9, h: 0.62, fontSize: 24, bold: true, color: C.text2, margin: 0, valign: 'top', align: 'left' }, text: '' } },
  ],
  slideNumber: { x: 9.0, y: 5.22, w: 0.5, h: 0.28, fontSize: 9, color: C.accent5, align: 'right' },
})
pres.defineSlideMaster({
  title: 'DARK',
  background: { color: HEX.dk2 },
  objects: [
    { placeholder: { options: { name: 'title', type: 'title', x: 0.6, y: 0.5, w: 8.8, h: 0.8, fontSize: 30, bold: true, color: C.background1, margin: 0, valign: 'top', align: 'left' }, text: '' } },
  ],
})

// ---------- 도우미 ----------
function head(slide, eyebrow, title) {
  slide.addText(eyebrow, { placeholder: 'eyebrow' })
  slide.addText(title, { placeholder: 'title' })
}
function line(slide, x, y, w, color = HEX.accent6, width = 0.75) {
  slide.addShape(S.line, { x, y, w, h: 0, line: { color, width } })
}
function circleNum(slide, x, y, n, { size = 0.34, fill = C.accent1, color = C.background1, fontSize = 11 } = {}) {
  slide.addShape(S.ellipse, { x, y, w: size, h: size, fill: { color: fill }, line: { color: fill, width: 0 }, objectName: `번호 ${n}` })
  slide.addText(String(n), { x, y, w: size, h: size, fontSize, bold: true, color, align: 'center', valign: 'middle', margin: 0, isTextBox: true })
}
// 통장 줄: 왼쪽 글, 오른쪽 값, 아래 구분선
function rows(slide, x, y, w, items, { rowH = 0.5, labelSize = 12.5, valueSize = 12.5, valueW = 0.3, subSize = 9.5 } = {}) {
  items.forEach((it, i) => {
    const yy = y + i * rowH
    const runs = [{ text: it.label, options: { bold: !!it.bold, color: it.labelColor || C.text1 } }]
    if (it.sub) runs.push({ text: it.sub, options: { fontSize: subSize, color: C.accent5, breakLine: false } })
    if (it.sub) runs[0].options.breakLine = true
    slide.addText(runs, { x, y: yy, w: it.value ? w * (1 - valueW) : w, h: rowH, fontSize: labelSize, margin: 0, valign: 'middle', isTextBox: true, paraSpaceAfter: 0 })
    if (it.value) slide.addText(it.value, { x: x + w * (1 - valueW), y: yy, w: w * valueW, h: rowH, fontSize: valueSize, color: it.color || C.text1, bold: true, align: 'right', margin: 0, valign: 'middle', isTextBox: true })
    line(slide, x, yy + rowH, w)
  })
}
function phone(slide, img, x, y, h, name) {
  const w = h * (750 / 1624)
  slide.addShape(S.roundRect, { x: x - 0.05, y: y - 0.05, w: w + 0.1, h: h + 0.1, fill: { color: HEX.dk1 }, line: { color: HEX.dk1, width: 0 }, rectRadius: 0.16, objectName: `${name} 틀` })
  slide.addImage({ path: img, x, y, w, h, objectName: name })
  return w
}
function card(slide, x, y, w, h, name) {
  slide.addShape(S.roundRect, { x, y, w, h, fill: { color: C.background2 }, line: { color: C.background2, width: 0 }, rectRadius: 0.1, objectName: name })
}
function caption(slide, text, x, y, w, h = 0.3, size = 9.5) {
  slide.addText(text, { x, y, w, h, fontSize: size, color: C.accent5, margin: 0, isTextBox: true, valign: 'top' })
}
function body(slide, text, x, y, w, h, opts = {}) {
  slide.addText(text, { x, y, w, h, fontSize: 12.5, color: C.text1, margin: 0, isTextBox: true, valign: 'top', ...opts })
}
function arrow(slide, x1, y1, x2, y2, color = HEX.accent1, width = 1.5) {
  const x = Math.min(x1, x2), y = Math.min(y1, y2)
  const w = Math.abs(x2 - x1), h = Math.abs(y2 - y1)
  const o = { x, y, w, h, line: { color, width, endArrowType: 'triangle' } }
  if (x2 < x1) o.flipH = true
  if (y2 < y1) o.flipV = true
  slide.addShape(S.line, o)
}

// ======================================================
// ① 표지
// ======================================================
pres.addSection({ title: '① 표지·팀 소개' })
{
  const s = pres.addSlide({ masterName: 'DARK', sectionTitle: '① 표지·팀 소개' })
  s.addImage({ path: path.join(PROJ, 'public/icon-512.png'), x: 0.6, y: 0.6, w: 0.8, h: 0.8, objectName: '앱 아이콘' })
  s.addText('알바가드', { x: 0.6, y: 1.5, w: 6, h: 1.0, fontSize: 54, bold: true, color: C.background1, margin: 0, isTextBox: true })
  s.addText('못 받은 알바비, 기록으로 찾는 앱', { x: 0.6, y: 2.55, w: 6, h: 0.45, fontSize: 20, color: C.background2, margin: 0, isTextBox: true })
  // 서명: 앱 첫 화면의 알림 줄 하나
  const wline = (y) => s.addShape(S.line, { x: 0.6, y, w: 5.4, h: 0.0, line: { color: 'FFFFFF', width: 0.75, transparency: 60 } })
  wline(3.4)
  s.addText('덜 받은 급여 · 2개월', { x: 0.6, y: 3.42, w: 3.4, h: 0.5, fontSize: 14, color: C.background1, margin: 0, isTextBox: true, valign: 'middle' })
  s.addText('269,352원', { x: 4.0, y: 3.42, w: 2.0, h: 0.5, fontSize: 20, bold: true, color: 'F5A08F', margin: 0, isTextBox: true, valign: 'middle', align: 'right' })
  wline(3.94)
  s.addText('앱 첫 화면의 알림 줄 (예시 데이터)', { x: 0.6, y: 3.98, w: 5.4, h: 0.3, fontSize: 9, color: C.background2, margin: 0, isTextBox: true })
  s.addText('SW기술창업 중간발표 · 4조 · 2026.10.27', { x: 0.6, y: 4.7, w: 6, h: 0.35, fontSize: 12, color: C.background2, margin: 0, isTextBox: true })
  // 오른쪽: 팀명 후보 · 팀원
  s.addText('팀명', { x: 6.7, y: 1.55, w: 2.8, h: 0.3, fontSize: 10, bold: true, color: C.background2, margin: 0, isTextBox: true })
  s.addText('알바가드', { x: 6.7, y: 1.85, w: 2.8, h: 0.6, fontSize: 24, bold: true, color: C.background1, margin: 0, isTextBox: true, valign: 'middle' })
  s.addText('4조 · 앱 이름과 같게 정했습니다', { x: 6.7, y: 2.45, w: 2.8, h: 0.3, fontSize: 9.5, color: C.background2, margin: 0, isTextBox: true })
  s.addShape(S.line, { x: 6.7, y: 2.9, w: 2.8, h: 0, line: { color: 'FFFFFF', width: 0.75, transparency: 60 } })
  s.addText('팀원', { x: 6.7, y: 3.0, w: 2.8, h: 0.3, fontSize: 10, bold: true, color: C.background2, margin: 0, isTextBox: true })
  s.addText([
    { text: '팀장 이지훈', options: { bold: true, breakLine: true } },
    { text: '컴퓨터소프트웨어 22학번', options: { fontSize: 10, color: C.background2, breakLine: true } },
    { text: '손유호', options: { bold: true, breakLine: true } },
    { text: '컴퓨터소프트웨어 __학번', options: { fontSize: 10, color: C.background2, breakLine: true } },
    { text: '박명진', options: { bold: true, breakLine: true } },
    { text: '컴퓨터소프트웨어 __학번', options: { fontSize: 10, color: C.background2 } },
  ], { x: 6.7, y: 3.3, w: 2.8, h: 1.9, fontSize: 12.5, color: C.background1, margin: 0, isTextBox: true, valign: 'top', paraSpaceAfter: 2 })
  s.addNotes('팀장이 엽니다. "알바비를 덜 받아도 모르고, 알아도 말을 못 하는 대학생을 위해, 기록 → 비교 → 요청까지 한 앱으로 잇는 알바가드입니다." 팀명은 앱 이름과 같은 알바가드입니다.')
}

// ② 결론 먼저: 배포돼 있다 + QR
{
  const s = pres.addSlide({ masterName: 'LIGHT', sectionTitle: '① 표지·팀 소개' })
  head(s, '① 오늘 발표', '지금 상태: 앱은 배포됐고, 사용자 검증은 11월부터')
  rows(s, 0.5, 1.45, 5.3, [
    { label: '계획한 기능 8개 모두 동작', sub: '9월 기획서 4개 → 10/13 정의서 8개로 고정. 완성도 평균 약 80%', value: '8 / 8', color: C.text2, bold: true },
    { label: '실제 사용자 검증은 11월부터', sub: '링크 설문 30명 · 직접 인터뷰 5명', value: '설문 열림', color: C.accent5, bold: true },
    { label: '역할: 개발 이지훈 · 시장 손유호 · 검증 박명진', sub: '발표도 같은 순서로 나눠서 합니다', value: '3명', color: C.accent5, bold: true },
  ], { rowH: 0.72, labelSize: 13, valueSize: 13, valueW: 0.2 })
  s.addText('오늘 순서', { x: 0.5, y: 3.75, w: 5.3, h: 0.3, fontSize: 10, bold: true, color: C.accent5, margin: 0, isTextBox: true })
  s.addText('문제 → 솔루션 → 기술 → 시연 3분 → 시장 · 수익 → 검증 · 일정', { x: 0.5, y: 4.05, w: 5.3, h: 0.4, fontSize: 12.5, bold: true, color: C.text2, margin: 0, isTextBox: true })
  s.addText('질문은 끝나고 한 번에 받겠습니다', { x: 0.5, y: 4.5, w: 5.3, h: 0.3, fontSize: 10, color: C.accent5, margin: 0, isTextBox: true })
  // QR 두 개
  const qr = (file, x, label, sub) => {
    s.addImage({ path: path.join(PROJ, 'docs/report_src', file), x, y: 1.45, w: 1.55, h: 1.55, objectName: label })
    s.addText(label, { x: x - 0.15, y: 3.05, w: 1.85, h: 0.3, fontSize: 11, bold: true, color: C.text2, margin: 0, isTextBox: true, align: 'center' })
    s.addText(sub, { x: x - 0.25, y: 3.35, w: 2.05, h: 0.5, fontSize: 9, color: C.accent5, margin: 0, isTextBox: true, align: 'center', valign: 'top' })
  }
  qr('qr_app.png', 6.2, '앱 설치', '폰 브라우저로 열고\n"홈 화면에 추가"')
  qr('qr_survey.png', 8.0, '설문 3분', '이름 · 연락처 없음\n들으시면서 답해도 됩니다')
  s.addText('jihooni217.github.io/albaguard', { x: 6.0, y: 3.95, w: 3.5, h: 0.3, fontSize: 9.5, color: C.accent5, margin: 0, isTextBox: true, align: 'center' })
  s.addNotes('팀장. "교수님이 아직 구현 전일 거라 하셨는데, 저희는 웹앱이라 빨리 만들 수 있어서, 화면을 먼저 만들고 그걸 보여 주며 묻는 순서를 택했습니다. 오늘 보여 드리는 건 완성품이 아니라 검증용 도구입니다." 사용자 검증은 11월에 합니다. 오른쪽 QR은 앱과 설문입니다. 설문은 이름을 받지 않고 3분이라, 들으시면서 답해 주셔도 됩니다. 역할은 개발 이지훈, 시장 · 수익 손유호, 검증 · 일정 박명진이고 발표도 그 순서입니다.')
}

// ======================================================
// ② 문제 정의
// ======================================================
pres.addSection({ title: '② 문제 정의' })
{
  const s = pres.addSlide({ masterName: 'LIGHT', sectionTitle: '② 문제 정의' })
  head(s, '② 문제 정의 · 페인 포인트', '덜 받아도 모르고, 알아도 말하지 못한다')
  card(s, 0.5, 1.3, 9, 0.62, '타깃 칸')
  s.addText([
    { text: '타깃  ', options: { bold: true, color: C.text2 } },
    { text: '주 15시간 이상(주휴수당 기준) 일하는 만 19~26세 시급제 알바 대학생 (카페 · 편의점 · 음식점). 근로계약서가 없거나 사본이 없고, 통장 총액만 확인하고, 사장님께 말을 꺼내기 부담스러워한다', options: {} },
  ], { x: 0.7, y: 1.3, w: 8.6, h: 0.62, fontSize: 11.5, color: C.text1, margin: 0, isTextBox: true, valign: 'middle' })
  const probs = [
    { n: 1, pct: '33.2%', what: '노동절에 일하고도 수당을 받는지 "안내받지 못해 모르겠다"', src: '노동절 근무 알바생 749명, 알바천국 2026.4', title: '얼마를 받아야 하는지\n계산하기 어렵다', desc: '수당 안내를 못 받는 경우가 많고, 주휴 · 야간 계산 기준은 알기 어렵다. 계산기는 있어도 넣을 기록이 없다' },
    { n: 2, pct: '48.0%', what: '임금 관련 문제를 겪었다 (수당 미지급 · 지연 37.3%)', src: '알바생 2,457명, 알바천국 2025.1', title: '덜 받아도\n알아채기 어렵다', desc: '통장에 들어온 총액만 보고 넘어간다. 계약서가 없어 시급도 증명하기 어렵다' },
    { n: 3, pct: '49.3%', what: '최저시급 미달인데 아무 대응도 하지 않았다', src: '최저시급 미달 경험자 기준 · 알바천국 2026.6 (응답 1,804명)', title: '알아도\n말을 꺼내기 어렵다', desc: '관계 걱정, 작은 금액, 근거 없음. 메모장 기록은 "나중에 지어낸 것 아니냐?" 한마디에 무너진다' },
  ]
  probs.forEach((p, i) => {
    const x = 0.5 + i * 3.05, w = 2.9
    s.addText(p.pct, { x, y: 2.1, w, h: 0.7, fontSize: 36, bold: true, color: C.accent3, margin: 0, isTextBox: true, valign: 'bottom' })
    s.addText(p.what, { x, y: 2.82, w, h: 0.5, fontSize: 10.5, color: C.text1, margin: 0, isTextBox: true, valign: 'top' })
    caption(s, p.src, x, 3.3, w, 0.25, 8.5)
    line(s, x, 3.62, w)
    circleNum(s, x, 3.78, p.n, { size: 0.3, fontSize: 10 })
    s.addText(p.title, { x: x + 0.4, y: 3.72, w: w - 0.4, h: 0.6, fontSize: 13, bold: true, color: C.text2, margin: 0, isTextBox: true, valign: 'top' })
    body(s, p.desc, x, 4.38, w, 0.7, { fontSize: 10.5, color: C.accent5 })
  })
  s.addNotes('세 문제를 숫자로 보여 줍니다. 모두 알바천국 설문이라 "플랫폼 설문"이라는 점을 말하고, 그래서 우리도 직접 설문을 돌리고 있다고 잇습니다. 33.2%는 노동절 수당 안내에 대한 숫자라 "수당 자체가 안내되지 않는다"까지만 말하고, 주휴 · 야간 계산 자신감은 우리 설문 문항으로 직접 묻고 있다고 덧붙입니다.')
}

// 기존 해결책의 한계
{
  const s = pres.addSlide({ masterName: 'LIGHT', sectionTitle: '② 문제 정의' })
  head(s, '② 문제 정의 · 기존 해결책의 한계', '기존 서비스: 계산까지는 있지만, 비교와 대응은 없다')
  const hdr = (t, o = {}) => ({ text: t, options: { bold: true, color: HEX.accent5, fill: { color: HEX.lt2 }, fontSize: 9.5, align: 'center', ...o } })
  const name = (t) => ({ text: t, options: { fontSize: 10.5, color: HEX.dk1, bold: true } })
  const mark = (v, note) => {
    const m = { O: ['O', HEX.accent2], X: ['X', HEX.accent3], D: ['△', HEX.accent5], '-': ['해당 없음', HEX.accent5] }[v]
    const runs = [{ text: m[0], options: { bold: true, color: m[1], fontSize: v === '-' ? 8.5 : 12 } }]
    if (note) runs.push({ text: ' ' + note, options: { fontSize: 8, color: HEX.accent5 } })
    return { text: runs, options: { align: 'center' } }
  }
  const ours = (v, note) => { const c = mark(v, note); c.options.fill = { color: HEX.lt2 }; return c }
  const tbl = [
    [hdr('', { align: 'left' }), hdr('메모 · 카톡'), hdr('하우머치'), hdr('기그'), hdr('알바천국 · 알바몬 계산기'), hdr('진정24 · 노동포털'), hdr('알바가드', { color: HEX.dk2 })],
    [name('사장 없이 혼자 기록'), mark('O'), mark('O'), mark('X', '사장 가입'), mark('X'), mark('-'), ours('O')],
    [name('예상 급여 계산'), mark('X'), mark('O'), mark('O'), mark('O', '일회성'), mark('X'), ours('O', '주휴 · 야간')],
    [name('실제 입금액과 비교 · 차액'), mark('X'), mark('X'), mark('X'), mark('X'), mark('X'), ours('O')],
    [name('요청 문구 · 증빙 묶음'), mark('X'), mark('X'), mark('X'), mark('X'), mark('X', '진정서만'), ours('O')],
    [name('수정 이력 · 등록 시각'), mark('D', '보낸 시각만'), mark('X'), mark('X'), mark('X'), mark('X'), ours('O')],
    [name('진정 접수'), mark('X'), mark('X'), mark('X'), mark('X'), mark('O'), ours('X', '연결만')],
  ]
  s.addTable(tbl, { x: 0.5, y: 1.35, w: 9, colW: [2.1, 1.15, 1.15, 1.15, 1.15, 1.15, 1.15], rowH: [0.4, 0.42, 0.42, 0.42, 0.42, 0.42, 0.42], border: { type: 'solid', pt: 0.5, color: HEX.accent6 }, valign: 'middle', margin: [0.03, 0.06, 0.03, 0.06], objectName: '경쟁 서비스 표' })
  card(s, 0.5, 4.38, 9, 0.6, '결론 칸')
  s.addText([
    { text: '알바가드만 O  ', options: { bold: true, color: C.text2 } },
    { text: '가운데 세 줄(비교 · 요청 · 등록 시각)은 다른 서비스가 모두 X다. 진정 접수는 일부러 연결만 한다', options: {} },
  ], { x: 0.7, y: 4.38, w: 8.6, h: 0.6, fontSize: 11.5, color: C.text1, margin: 0, isTextBox: true, valign: 'middle' })
  s.addNotes('무료 앱이 실제로 겨루는 상대는 다른 앱보다 메모장과 통장 확인입니다. 그래서 첫 열에 넣었습니다. 하우머치는 혼자 쓸 수 있지만 예상 급여에서 멈추고, 기그는 사장 연동이 필요하고, 계산기는 기록이 없고, 진정24는 증거가 있어야 시작합니다. 가운데 세 줄은 다른 서비스가 모두 X이고 알바가드만 O입니다. 그 세 줄이 저희가 채우는 부분입니다. 마지막 줄 진정 접수는 저희가 일부러 안 합니다. 1350과 노동포털로 연결만 합니다.')
}

// ======================================================
// ③ 솔루션
// ======================================================
pres.addSection({ title: '③ 솔루션·핵심 가치' })
{
  const s = pres.addSlide({ masterName: 'LIGHT', sectionTitle: '③ 솔루션·핵심 가치' })
  head(s, '③ 솔루션 · 서비스 개요   ·   문제 1 · 2는 비교로, 문제 3은 요청으로 푼다. 기록이 그 바탕', '기록 → 비교 → 요청, 신고 이전 단계를 채운다')
  const steps = [
    { n: 1, t: '기록', d: '출근 · 퇴근 버튼 하나. 고치면 수정 전후와 사유가 남고, 삭제도 흔적이 남는다', img: '1-home.jpg' },
    { n: 2, t: '비교', d: '기본급 + 주휴 + 야간수당으로 "받았어야 할 돈"을 계산하고, 실제 받은 돈과의 차액을 보여 준다', img: '3-pay.jpg' },
    { n: 3, t: '요청', d: '정중한 메시지 → 내용증명 초안 → 진정 절차 안내(1350 · 노동포털). 대화로 먼저 푼다', img: '4-request.jpg' },
  ]
  const ph = 2.55, pw = ph * 750 / 1624
  steps.forEach((st, i) => {
    const x = 0.5 + i * 3.05, w = 2.9
    circleNum(s, x, 1.38, st.n)
    s.addText(st.t, { x: x + 0.45, y: 1.33, w: 1.5, h: 0.45, fontSize: 18, bold: true, color: C.text2, margin: 0, isTextBox: true, valign: 'middle' })
    body(s, st.d, x, 1.85, w, 0.75, { fontSize: 10.5 })
    phone(s, SHOT(st.img), x + (w - pw) / 2, 2.62, ph, `${st.t} 화면`)
    if (i < 2) arrow(s, x + w + 0.02, 1.55, x + w + 0.13, 1.55, HEX.accent6, 2)
  })
  s.addNotes('세 단계를 한 앱에서 잇는 것이 핵심입니다. 사장 연동 없이, 로그인 없이, 근무 내용은 폰 안에만 둡니다. 화면은 통장처럼 "일하면 돈이 쌓인다"가 보이게 만들었습니다.')
}

// 차별화 포인트
{
  const s = pres.addSlide({ masterName: 'LIGHT', sectionTitle: '③ 솔루션·핵심 가치' })
  head(s, '③ 솔루션 · 차별화 포인트', '차별점과 한계')
  const pts = [
    { t: '사장 연동 없이 혼자 쓴다', tag: '사장 협조가 없어도', d: '근무지만 직접 등록한다. 기그와 달리 사장이 가입하지 않아도 된다' },
    { t: '입금액 비교 → 차액 → 요청 · 증빙까지', tag: '문제 1 · 2 · 3의 답', d: '실제 받은 돈과 비교해 차액을 찾고, 요청 문구와 증빙 묶음까지 잇는다. 네 서비스 모두 없는 부분' },
    { t: '기록 등록: 확인 번호 + 등록 시각', tag: '문제 3의 근거', d: '기록할 때마다 확인 번호와 서버 등록 시각이 남고, 누구나 확인 페이지에서 등록 시각을 볼 수 있다. 내용으로 번호를 다시 계산하는 방법은 기말까지 만든다' },
  ]
  pts.forEach((p, i) => {
    const y = 1.4 + i * 1.12
    circleNum(s, 0.5, y + 0.05, i + 1)
    s.addText([{ text: p.t, options: { bold: true } }, { text: '   ' + p.tag, options: { fontSize: 9, bold: false, color: C.accent5 } }], { x: 1.0, y, w: 4.9, h: 0.42, fontSize: 13.5, color: C.text2, margin: 0, isTextBox: true, valign: 'middle' })
    body(s, p.d, 1.0, y + 0.42, 4.9, 0.66, { fontSize: 11, color: C.accent5 })
    line(s, 0.5, y + 1.08, 5.4)
  })
  // 약점 칸
  card(s, 6.4, 1.4, 3.1, 1.75, '약점 칸')
  s.addText('한계', { x: 6.65, y: 1.55, w: 2.6, h: 0.35, fontSize: 11, bold: true, color: C.accent3, margin: 0, isTextBox: true })
  s.addText('비교 기능은 하우머치가 "받은 금액 입력" 칸 하나로 따라올 수 있다. 3번은 기록 구조 자체(사유 없이 못 고침 · 삭제도 흔적 · 고치면 다시 등록)라 따라오기 어렵다.', { x: 6.65, y: 1.95, w: 2.6, h: 1.1, fontSize: 11, color: C.text1, margin: 0, isTextBox: true, valign: 'top' })
  s.addText([
    { text: '통장 내역 · 메시지와 함께 내야 힘이 생긴다', options: { bold: true, color: C.text2, breakLine: true } },
    { text: '앱의 증빙 문서 맨 아래에 그렇게 적어 두었다', options: { fontSize: 9.5, color: C.accent5 } },
  ], { x: 6.4, y: 3.35, w: 3.1, h: 0.7, fontSize: 10.5, color: C.text1, margin: 0, isTextBox: true, valign: 'top' })
  s.addText('법적 효력을 보장한다고 말하지 않는다. 근로감독관 · 법원이 판단할 자료를 정리해 준다.', { x: 0.5, y: 4.8, w: 9, h: 0.35, fontSize: 10.5, italic: true, color: C.accent5, margin: 0, isTextBox: true })
  s.addNotes('세 번째가 따라 하기 어려운 차별점입니다. 기능 하나가 아니라 기록 구조라서, 사유 없이는 못 고치고 삭제해도 흔적이 남고 고치면 다시 등록됩니다. 기존 급여 앱이 넣으려면 사용자가 기록을 마음대로 고치던 방식을 포기해야 합니다. 지금 확인 페이지는 번호의 서버 등록 시각까지 보여 주고, 기록 내용에서 번호를 다시 계산해 맞춰 보는 방법은 기말까지 만듭니다(그래서 12장에서 70%). 근무지 · 시각 · 금액은 서버로 가지 않고, "그날 실제로 일했다"까지는 증명하지 못합니다. 한계는 먼저 말합니다. "법적 효력" 질문이 오면 보장하지 않는다고 답하고, 판단할 자료를 정리해 준다고 말합니다.')
}

// ======================================================
// ④ 기술 아키텍처
// ======================================================
pres.addSection({ title: '④ SW 기술 아키텍처' })
{
  const s = pres.addSlide({ masterName: 'LIGHT', sectionTitle: '④ SW 기술 아키텍처' })
  head(s, '④ SW 기술 아키텍처 · 기술 스택', '기술 스택: 앱은 폰에서, 서버는 확인 번호 등록에만')
  const hdr = (t) => ({ text: t, options: { bold: true, color: HEX.accent5, fill: { color: HEX.lt2 }, fontSize: 10.5 } })
  const cell = (t, o = {}) => ({ text: t, options: { fontSize: 10.5, color: HEX.dk1, ...o } })
  const tbl = [
    [hdr('구분'), hdr('선택'), hdr('이유')],
    [cell('프론트엔드', { bold: true }), cell('React + Vite, PWA (홈 화면에 추가, 오프라인 실행)'), cell('스토어 없이 링크로 배포. 의견을 듣고 바로 고친다')],
    [cell('백엔드', { bold: true }), cell('별도 서버 없음 + Supabase REST'), cell('근무 내용은 폰 밖으로 안 나감. 서버는 확인 번호 등록 · 설문 수집에만')],
    [cell('데이터베이스', { bold: true }), cell('폰: localStorage(기록) · IndexedDB(사진)\n서버: Supabase PostgreSQL (stamps · survey)'), cell('기록은 사용자 폰에. 공개키로는 넣기 · 읽기만(RLS), 시각은 서버가 찍음. 운영자 조작은 못 막음')],
    [cell('클라우드 · 인프라', { bold: true }), cell('GitHub Pages + GitHub Actions'), cell('main에 올리면 자동 빌드 · 배포')],
    [cell('AI', { bold: true }), cell('Claude API (선택, 개발 환경에서만)'), cell('배포 앱은 API 키 없이 정해진 문구로 동작. 기록을 밖으로 안 보내려고 기본은 끔')],
    [cell('SaaS · 분석', { bold: true }), cell('설문 페이지 + 자동 집계 페이지, 직접 인터뷰'), cell('로그인이 없어 사용 로그 대신 설문 · 인터뷰로 측정')],
  ]
  s.addTable(tbl, { x: 0.5, y: 1.35, w: 9, colW: [1.4, 3.6, 4.0], rowH: [0.36, 0.5, 0.5, 0.8, 0.42, 0.52, 0.5], border: { type: 'solid', pt: 0.5, color: HEX.accent6 }, valign: 'middle', margin: [0.04, 0.1, 0.04, 0.1], objectName: '기술 스택 표' })
  s.addNotes('한 학기 안에 혼자 만들 수 있는 구성입니다. 서버를 최소로 둔 이유는 개인정보와 비용 둘 다입니다. 배포는 링크 하나라 사용자 의견을 듣고 바로 고칠 수 있습니다.')
}

// 시스템 구성도
{
  const s = pres.addSlide({ masterName: 'LIGHT', sectionTitle: '④ SW 기술 아키텍처' })
  head(s, '④ SW 기술 아키텍처 · 시스템 구성도와 데이터 흐름', '근무 내용은 폰 안에, 서버에는 확인 번호와 등록 시각만')
  // 폰
  s.addShape(S.roundRect, { x: 0.5, y: 1.4, w: 3.4, h: 3.45, fill: { color: C.background2 }, line: { color: C.background2, width: 0 }, rectRadius: 0.12, objectName: '폰 영역' })
  s.addText('폰 (PWA, 홈 화면에 추가)', { x: 0.7, y: 1.5, w: 3.0, h: 0.3, fontSize: 11, bold: true, color: C.text2, margin: 0, isTextBox: true })
  const box = (x, y, w, h, t, name) => {
    s.addShape(S.roundRect, { x, y, w, h, fill: { color: C.background1 }, line: { color: HEX.accent6, width: 0.75 }, rectRadius: 0.06, objectName: name })
    s.addText(t, { x: x + 0.1, y, w: w - 0.2, h, fontSize: 11, color: C.text1, margin: 0, isTextBox: true, valign: 'middle', align: 'center' })
  }
  box(0.7, 1.9, 3.0, 0.6, [{ text: '화면 (React)', options: { bold: true, breakLine: true } }, { text: '근무 기록 · 캘린더 · 급여 비교 · 정산 요청 · 설정', options: { fontSize: 10, color: C.accent5 } }], '화면 상자')
  arrow(s, 2.2, 2.5, 2.2, 2.72, HEX.accent5, 1)
  box(0.7, 2.72, 3.0, 0.7, [{ text: '계산 모듈', options: { bold: true, breakLine: true } }, { text: '급여(주휴 · 야간) · 예정 vs 실제 · 요청 문구 · PDF · 확인 번호', options: { fontSize: 10, color: C.accent5 } }], '계산 상자')
  arrow(s, 2.2, 3.42, 2.2, 3.64, HEX.accent5, 1)
  box(0.7, 3.64, 3.0, 0.6, [{ text: '저장', options: { bold: true, breakLine: true } }, { text: 'localStorage(기록 · 수정 이력) · IndexedDB(사진)', options: { fontSize: 10, color: C.accent5 } }], '저장 상자')
  s.addText('로그인 없음 · 근무 내용은 여기에만', { x: 0.7, y: 4.35, w: 3.0, h: 0.35, fontSize: 9.5, bold: true, color: C.accent2, margin: 0, isTextBox: true, align: 'center' })
  // 폰 → Supabase
  arrow(s, 3.95, 2.55, 5.55, 2.55, HEX.accent1, 1.75)
  s.addText('확인 번호 · 기록 번호' + String.fromCharCode(10) + '· 무작위 기기 번호', { x: 3.95, y: 1.95, w: 1.55, h: 0.57, fontSize: 9.5, bold: true, color: C.text2, margin: 0, isTextBox: true, align: 'center', valign: 'bottom' })
  s.addText('근무지 · 시각 · 금액은' + String.fromCharCode(10) + '가지 않음', { x: 3.95, y: 2.6, w: 1.55, h: 0.55, fontSize: 9.5, color: C.accent3, margin: 0, isTextBox: true, align: 'center', valign: 'top' })
  // Supabase
  s.addShape(S.roundRect, { x: 5.55, y: 1.4, w: 2.15, h: 2.4, fill: { color: C.background1 }, line: { color: HEX.accent1, width: 1.5 }, rectRadius: 0.1, objectName: 'Supabase 상자' })
  s.addText([
    { text: 'Supabase', options: { bold: true, color: C.text2, breakLine: true } },
    { text: 'stamps 표', options: { bold: true, breakLine: true } },
    { text: '확인 번호 · 기록 번호 · 기기 번호 · 등록 시각', options: { fontSize: 10, color: C.accent5, breakLine: true } },
    { text: '공개키로는 넣기 · 읽기만(RLS). 시각은 서버가 찍음', options: { fontSize: 10, color: C.accent5, breakLine: true } },
    { text: '확인함: 수정 · 삭제 요청은 401로 거부, 2000년 시각을 보내도 서버 시각', options: { fontSize: 9.5, color: C.accent2, bold: true } },
  ], { x: 5.68, y: 1.5, w: 1.9, h: 2.25, fontSize: 11, color: C.text1, margin: 0, isTextBox: true, valign: 'top', paraSpaceAfter: 2 })
  // 확인 페이지
  arrow(s, 6.62, 4.0, 6.62, 3.82, HEX.accent1, 1.25)
  s.addText('등록 시각 조회', { x: 6.72, y: 3.75, w: 1.0, h: 0.3, fontSize: 8.5, color: C.text2, margin: 0, isTextBox: true, valign: 'middle' })
  s.addShape(S.roundRect, { x: 5.55, y: 4.0, w: 2.15, h: 0.85, fill: { color: C.background2 }, line: { color: C.background2, width: 0 }, rectRadius: 0.1, objectName: '확인 페이지 상자' })
  s.addText([
    { text: '확인 페이지 (verify.html)', options: { bold: true, color: C.text2, breakLine: true } },
    { text: '누구나 확인 번호 → 등록 시각. 앱 데이터 없이 동작', options: { fontSize: 10, color: C.accent5 } },
  ], { x: 5.68, y: 4.05, w: 1.9, h: 0.78, fontSize: 11, color: C.text1, margin: 0, isTextBox: true, valign: 'middle' })
  // 데이터 흐름
  s.addText('기록 하나가 남을 때', { x: 7.9, y: 1.4, w: 1.7, h: 0.3, fontSize: 10.5, bold: true, color: C.text2, margin: 0, isTextBox: true })
  const flow = ['출근 · 퇴근 버튼마다 확인 번호를 등록', '고치면 새 내용으로 다시 등록', '인터넷이 없으면 대기열, 연결되면 전송']
  flow.forEach((f, i) => {
    circleNum(s, 7.9, 1.82 + i * 0.95, i + 1, { size: 0.26, fontSize: 9 })
    s.addText(f, { x: 8.22, y: 1.76 + i * 0.95, w: 1.35, h: 0.85, fontSize: 10, color: C.text1, margin: 0, isTextBox: true, valign: 'top' })
  })
  s.addNotes('왼쪽 폰 안에서 모든 계산이 끝나고, 서버로 가는 건 확인 번호뿐입니다. 기기 번호는 처음 기록을 등록할 때 앱이 만든 난수라 휴대전화 번호가 아닙니다. 앱이 쓰는 공개키로는 넣기와 읽기만 되고, 직접 요청을 보내 확인했습니다. 2000년 시각을 보내도 서버 시각으로 들어가고, 수정 · 삭제는 401로 거부됩니다. 다만 운영자 권한으로는 고칠 수 있어서, 지금 막는 건 "사용자가 나중에 고쳐 쓰기"까지입니다. 운영자까지 못 고치게 하는 외부 시점 확인은 비용 때문에 계획입니다. 오른쪽은 기록 하나가 남을 때의 흐름입니다. 증빙 묶음 PDF 7번 표에 기록별 확인 번호와 등록 시각이 들어갑니다. 배포는 GitHub main에 올리면 Actions가 Pages로 자동 배포합니다. 지금 답하고 계신 설문도 같은 서버의 survey 표로 가고, 권한 원칙이 같습니다.')
}

// ======================================================
// ⑤ 개발 현황
// ======================================================
pres.addSection({ title: '⑤ 개발 현황·MVP 시연' })
// UI 화면
{
  const s = pres.addSlide({ masterName: 'LIGHT', sectionTitle: '⑤ 개발 현황·MVP 시연' })
  head(s, '⑤ 개발 현황 · MVP 화면   ·   예시 데이터, 2026.10.25 기준. 모두 배포 주소에서 지금 열린다', '네 화면: 캘린더, 설정, 증빙 묶음 PDF, 확인 페이지')
  const shots = [
    ['2-calendar.jpg', '캘린더', '예정과 실제를 비교해 연장 · 대타만 글자로'],
    ['10-settings.jpg', '설정', '기록 등록 건수 · 무엇이 서버로 가는지 · 백업'],
    ['8-evidence.jpg', '증빙 묶음 PDF', '근무 기록 · 수정 이력 · 계산 · 입금 · 사진 · 등록 확인'],
    ['9-verify.jpg', '확인 페이지', '확인 번호를 넣으면 서버 등록 시각이 나온다'],
  ]
  const ph = 3.0, pw = ph * 750 / 1624, gap = (9 - 4 * pw) / 3
  shots.forEach(([img, t, d], i) => {
    const x = 0.5 + i * (pw + gap)
    phone(s, SHOT(img), x, 1.4, ph, t)
    s.addText(t, { x: x - 0.2, y: 4.5, w: pw + 0.4, h: 0.3, fontSize: 11.5, bold: true, color: C.text2, margin: 0, isTextBox: true, align: 'center' })
    s.addText(d, { x: x - 0.25, y: 4.78, w: pw + 0.5, h: 0.42, fontSize: 9, color: C.accent5, margin: 0, isTextBox: true, align: 'center', valign: 'top' })
  })
  s.addNotes('디자인은 타깃 사용자(하우머치를 쓰는 친구)가 시안 12장 중 고른 통장 구성입니다. 잉크 남색은 "기록을 잉크로 남긴다"라는 뜻입니다. 증빙 묶음은 인쇄 창에서 PDF로 저장합니다.')
}

// 시연 순서
{
  const s = pres.addSlide({ masterName: 'LIGHT', sectionTitle: '⑤ 개발 현황·MVP 시연' })
  head(s, '⑤ MVP 시연', '시연 순서 (녹화 영상 1분 46초, 멈춰 설명하며 약 3분)')
  const steps = [
    ['출근 · 퇴근 버튼 → 설정에서 "2건 등록됨"', '기록할 때마다 서버에 확인 번호가 남는다. 예시 데이터는 등록되지 않으니 시연 중 남긴 2건만 보인다'],
    ['첫 화면 "9월 급여 받으셨나요?" → 받은 금액 입력', '덜 받은 돈이 빨간 숫자로 바뀐다'],
    ['요청 메시지 생성 (3개월 합계) → 증빙 묶음 PDF', '날짜별 기록과 계산 근거가 들어간 정중한 문구. PDF 7번 표에 확인 번호'],
    ['확인 페이지에 확인 번호 → 서버 등록 시각', '앱 밖의 별도 페이지. 제3자도 열 수 있다'],
  ]
  steps.forEach(([t, d], i) => {
    const y = 1.45 + i * 0.86
    circleNum(s, 0.5, y + 0.06, i + 1)
    s.addText(t, { x: 0.98, y, w: 8.5, h: 0.42, fontSize: 13, bold: true, color: C.text2, margin: 0, isTextBox: true, valign: 'middle' })
    s.addText(d, { x: 0.98, y: y + 0.4, w: 8.5, h: 0.4, fontSize: 10, color: C.accent5, margin: 0, isTextBox: true, valign: 'top' })
  })
  s.addNotes('네 단계(등록 → 비교 → 요청 · 증빙 → 확인)가 차별점과 하나씩 맞물립니다. 영상에 안 나오는 것은 말로 짚습니다: 캘린더의 연장 · 대타 표시(9장 캡처), 3단계 진정 안내(1350 · 노동포털 연결, 진정서는 만들지 않음). 예시 데이터는 발표 전에 미리 넣어 둡니다(오늘 날짜는 비어 있어 출근 · 퇴근이 그대로 됩니다). 7번 표에는 시연 중 남긴 2건만 나옵니다. 예시 데이터는 진짜 시각이 아니라 등록하지 않기 때문입니다. 시연은 다음 장의 녹화 영상(1분 46초)으로 하고, 단계마다 멈춰서 설명하면 약 3분입니다. 영상은 배포된 앱을 실제로 눌러 찍은 것이라 서버 등록과 확인 번호가 진짜입니다(10/26 오전 9시 36분 녹화. 화면의 시각은 녹화한 시각). 질문이 오면 실제 앱으로 1단계(출근 · 퇴근 → "2건 등록됨")만 보여 줍니다. 전날 할 일: Supabase 대시보드에서 프로젝트 상태를 확인하고(잠들어 있으면 Restore) 앱에서 출근 · 퇴근을 눌러 설정 탭에 "2건 등록됨"이 뜨는지 본다. 그다음 폰의 와이파이를 끄고 데이터로 확인 페이지(jihooni217.github.io/albaguard/verify.html?h=da3e2a7ad7e298db)를 열어 등록 시각이 나오는지 본다. 당일 아침에도 한 번 더.')
}

// 시연 영상 (한 장 전체)
{
  const s = pres.addSlide({ masterName: 'LIGHT', sectionTitle: '⑤ 개발 현황·MVP 시연' })
  s.addMedia({ type: 'video', path: path.join(PROJ, 'docs/08_시연_영상.mp4'), cover: 'image/png;base64,' + fs.readFileSync(path.join(PROJ, 'docs/report_src/demo_cover.png')).toString('base64'), x: 0, y: 0, w: 10, h: 5.625, objectName: '시연 영상' })
  s.addNotes('재생 전에 한 문장: "보실 것 하나만 말씀드리면 마지막 장면의 등록 시각입니다. 지금 서버에 그대로 있는 값입니다." 영상을 누르면 재생됩니다. 왼쪽이 폰 화면, 오른쪽 위는 지금 단계(기록 · 비교 · 요청 · 확인), 그 아래가 자막입니다. 1 출근 · 퇴근 → 설정 "2건 등록됨"(0:10~0:30), 2 받은 금액 입력 → 빨간 차액(0:30~0:50), 3 메시지 생성 → 증빙 묶음 PDF 7번 표(0:50~1:28), 4 확인 페이지 → 서버 등록 시각(1:28~1:42). 시작 3초는 제목 화면, 끝 4초는 확인 페이지 주소와 확인 번호 화면입니다. 단계가 바뀔 때 멈추고 한두 문장씩 설명합니다. 영상이 안 열리면 docs/08_시연_영상.mp4를 따로 틀어도 됩니다. 영상 마지막에 나오는 확인 번호는 da3e2a7ad7e298db입니다. "녹화라서 못 믿겠다"라는 질문이 오면 "지금 폰으로 jihooni217.github.io/albaguard/verify.html?h=da3e2a7ad7e298db 를 열어 보셔도 됩니다. 서버가 찍은 시각이 녹화 시각(10/26)과 같습니다"라고 답합니다.')
}

{
  const s = pres.addSlide({ masterName: 'LIGHT', sectionTitle: '⑤ 개발 현황·MVP 시연' })
  head(s, '⑤ 개발 현황 · 구현된 기능과 계획 대비 비율', 'MVP 기능 8개 모두 동작, 완성도 평균 약 80%')
  const feats = [
    ['근무 기록 (수정 이력 · 퇴근 누락 보호)', 90, '실제 폰 장기 사용'],
    ['캘린더 (예정 vs 실제, 연장 · 대타)', 85, '반복 스케줄 입력'],
    ['급여 계산 (주휴 · 야간 · 최저임금)', 85, '연장근로 가산'],
    ['입금액 비교 · 차액 알림', 80, '매달 넣을지 검증(가설 1)'],
    ['단계별 정산 요청', 75, '문구 톤 사용자 검증'],
    ['증빙 묶음 PDF', 80, '폰에서 PDF 저장'],
    ['기록 등록 (확인 번호 · 등록 시각)', 70, '내용으로 번호 다시 계산'],
    ['기록 백업 · 불러오기', 80, '폰에서 파일 저장'],
  ]
  const y0 = 1.42, rh = 0.42, bx = 4.3, bw = 1.5
  const cx = 6.5
  ;[['동작', cx], ['폰', cx + 0.32], ['사용자', cx + 0.64]].forEach(([t, x]) => s.addText(t, { x: x - 0.17, y: y0 - 0.3, w: 0.66, h: 0.26, fontSize: 9, bold: true, color: C.accent5, margin: 0, isTextBox: true, align: 'center' }))
  s.addText('남은 일', { x: 7.55, y: y0 - 0.3, w: 1.95, h: 0.26, fontSize: 9, bold: true, color: C.accent5, margin: 0, isTextBox: true })
  feats.forEach(([name, pct, left], i) => {
    const y = y0 + i * rh
    s.addText(name, { x: 0.5, y, w: 3.7, h: rh, fontSize: 11.5, color: C.text1, margin: 0, isTextBox: true, valign: 'middle' })
    s.addShape(S.roundRect, { x: bx, y: y + 0.14, w: bw, h: 0.14, fill: { color: C.background2 }, line: { color: C.background2, width: 0 }, rectRadius: 0.07, objectName: `${name} 바탕` })
    s.addShape(S.roundRect, { x: bx, y: y + 0.14, w: bw * pct / 100, h: 0.14, fill: { color: C.accent1 }, line: { color: C.accent1, width: 0 }, rectRadius: 0.07, objectName: `${name} 진행` })
    s.addText(`${pct}%`, { x: bx + bw + 0.06, y, w: 0.5, h: rh, fontSize: 11, bold: true, color: C.text2, margin: 0, isTextBox: true, valign: 'middle' })
    ;[true, false, false].forEach((done, k) => {
      const x = cx + k * 0.32
      s.addShape(S.ellipse, { x: x + 0.06, y: y + 0.11, w: 0.2, h: 0.2, fill: { color: done ? C.accent1 : C.background1 }, line: { color: done ? C.accent1 : HEX.accent5, width: 0.75 }, objectName: `${name} 확인 ${k}` })
    })
    s.addText(left, { x: 7.55, y, w: 1.95, h: rh, fontSize: 10.5, color: C.accent5, margin: 0, isTextBox: true, valign: 'middle' })
    line(s, 0.5, y + rh, 9)
  })
  s.addText([
    { text: '계획 기준  ', options: { bold: true, color: C.text2 } },
    { text: '9월 기획서 4개 → 10/13 포함 8 · 제외 6으로 고정      ', options: {} },
    { text: '% 기준  ', options: { bold: true, color: C.text2 } },
    { text: '구현 · 폰 확인 · 사용자 검증 중 남은 일만큼 뺀 자체 평가', options: {} },
  ], { x: 0.5, y: 4.85, w: 9, h: 0.32, fontSize: 10.5, color: C.text1, margin: 0, isTextBox: true, valign: 'middle' })
  s.addNotes('시연 직후에 보여 줍니다. "방금 보신 것이 8개 중 이만큼"입니다. 100%는 쓰지 않았습니다. 계획 기준은 9월 기획서의 기능 4개에서 출발해, 10/13 MVP 기능 정의서에서 포함 8개 · 제외 6개(금액 자동 인식 · 푸시 알림 · AI 문구 · 광고 · 로그인 · 진정서)로 고정한 것입니다. %는 구현 + 실제 폰 확인 + 사용자 검증을 100으로 보고 남은 일만큼 뺀 자체 평가이고, 동작은 컴퓨터의 폰 크기 화면에서, 실제 폰은 설치까지 확인했습니다. 동그라미 세 칸은 컴퓨터 동작 · 실제 폰 · 사용자 검증이고, 지금은 모두 첫 칸만 찼습니다. 뒤 두 칸이 11월 일정입니다. 세 칸 중 첫 칸만 찼는데 왜 80~90%냐고 물으시면, %는 칸수가 아니라 남은 일의 크기로 어림한 것이고 11월 검증에서 큰 수정이 나오면 내려갈 수 있다고 답합니다. 이 장이 끝나면 손유호에게 넘깁니다.')
}


// ======================================================
// ⑥ 시장 분석·비즈니스 모델
// ======================================================
pres.addSection({ title: '⑥ 시장 분석·비즈니스 모델' })
{
  const s = pres.addSlide({ masterName: 'LIGHT', sectionTitle: '⑥ 시장 분석·비즈니스 모델' })
  head(s, '⑥ 시장 분석 · 시장 규모', '임금체불 2년 연속 2조 원, 30인 미만 사업장에 집중')
  s.addChart(pres.ChartType.bar, [{ name: '임금체불액 (억 원)', labels: ['2023', '2024', '2025'], values: [17845, 20448, 20679] }], {
    x: 0.5, y: 1.35, w: 4.2, h: 3.15, barDir: 'col', barGapWidthPct: 70,
    chartColors: [HEX.accent1], showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '#,##0', dataLabelFontSize: 11, dataLabelColor: HEX.dk1, dataLabelFontFace: '+mn-lt',
    catAxisLabelColor: HEX.accent5, catAxisLabelFontSize: 11, catAxisLabelFontFace: '+mn-lt', catAxisLineShow: false,
    valAxisHidden: true, valAxisMinVal: 0, valAxisMaxVal: 24000, valGridLine: { style: 'none' }, catGridLine: { style: 'none' },
    showLegend: false, showTitle: true, title: '임금체불액 (억 원, 고용노동부)', titleFontSize: 11, titleColor: HEX.accent5, titleFontFace: '+mn-lt',
  })
  const stats = [
    ['26만 2,304명', '2025년 체불 피해 노동자', C.text2],
    ['67.8%', '2025년 체불액 중 30인 미만 사업장 (1조 4,012억 원). 카페 · 편의점 · 음식점이 여기 속한다. 알바생 몫은 따로 알 수 없다', C.accent3],
    ['31.9%', '알바 경험자 중 최저시급 미달 경험 (알바천국, 1,804명, 2026.6)', C.accent3],
  ]
  stats.forEach(([n, d, col], i) => {
    const y = 1.35 + i * 1.08
    s.addText(n, { x: 5.1, y, w: 4.4, h: 0.5, fontSize: 20, bold: true, color: col, margin: 0, isTextBox: true, valign: 'bottom' })
    s.addText(d, { x: 5.1, y: y + 0.5, w: 4.4, h: 0.45, fontSize: 10, color: C.accent5, margin: 0, isTextBox: true, valign: 'top' })
    line(s, 5.1, y + 1.0, 4.4)
  })
  s.addText([
    { text: '타깃 규모(어림)  ', options: { bold: true, color: C.text2 } },
    { text: '재적학생 307만 명 → 알바 경험 67~89% → 지금 알바 중 · 주 15시간 이상: 미상 (경험 기준 상한 약 210~270만 명)', options: { breakLine: true } },
    { text: '타이밍  ', options: { bold: true, color: C.text2 } },
    { text: '2025.9 임금체불 근절 대책 · 2025.10.23 개정 근로기준법 시행. 체불 제재가 세졌고, 근거를 남긴 사람이 받아 내기 쉬워졌다', options: {} },
  ], { x: 0.5, y: 4.62, w: 9, h: 0.58, fontSize: 10.5, color: C.text1, margin: 0, isTextBox: true, valign: 'top', paraSpaceAfter: 1 })
  s.addNotes('손유호. 임금체불은 2년 연속 2조 원이고 30인 미만 사업장에 몰려 있습니다. 타깃 규모는 어림이라 "약"을 붙여 말하고, 없는 숫자(지금 알바 중, 주 15시간 이상)는 미상으로 둡니다. 재적학생은 교육부 2026 교육기본통계(대학원 포함), 알바 경험률은 알바몬 설문(1,193명, 여름방학 알바 88.9%, 2023)과 동대신문 설문(200명, 67.5%)이라 대푯값이 아닙니다. 근절 대책은 대지급금을 3개월분에서 6개월분으로 늘렸고, 개정법은 상습 체불 사업주에게 신용 제재를 겁니다. 체불 통계는 문제의 크기이지 알바 시장의 크기가 아닙니다. 알바생 몫은 이 통계에서 알 수 없어 미상으로 둡니다. "주 15시간 이상이 다수인지의 첫 조각은 지금 답하고 계신 설문에서 나오지만, 규모 추정이 아니라 메시지를 정하는 참고값입니다. 다음 순서에서 박명진이 말씀드립니다." 출처: 고용노동부 노동포털 임금체불 통계현황, 알바천국 설문, 교육부 교육기본통계.')
}

// 경쟁 포지션
{
  const s = pres.addSlide({ masterName: 'LIGHT', sectionTitle: '⑥ 시장 분석·비즈니스 모델' })
  head(s, '⑥ 시장 분석 · 경쟁사', '경쟁 서비스 위치')
  const ox = 0.9, oy = 1.45, W = 5.2, H = 3.3
  s.addShape(S.rect, { x: ox, y: oy, w: W, h: H, fill: { color: C.background2 }, line: { color: C.background2, width: 0 }, objectName: '포지션 바탕' })
  s.addShape(S.line, { x: ox + W / 2, y: oy, w: 0, h: H, line: { color: HEX.accent6, width: 1 } })
  s.addShape(S.line, { x: ox, y: oy + H / 2, w: W, h: 0, line: { color: HEX.accent6, width: 1 } })
  s.addText('혼자 쓴다', { x: ox + 0.1, y: oy + H / 2 - 0.3, w: 1.2, h: 0.3, fontSize: 9, bold: true, color: C.accent5, margin: 0, isTextBox: true })
  s.addText('사장 가입 · 증거가 먼저', { x: ox + W - 2.0, y: oy + H / 2 - 0.3, w: 1.9, h: 0.3, fontSize: 9, bold: true, color: C.accent5, margin: 0, isTextBox: true, align: 'right' })
  s.addText('대응까지', { x: ox + W / 2 + 0.08, y: oy + 0.05, w: 1.2, h: 0.3, fontSize: 9, bold: true, color: C.accent5, margin: 0, isTextBox: true })
  s.addText('계산까지', { x: ox + W / 2 + 0.08, y: oy + H - 0.35, w: 1.2, h: 0.3, fontSize: 9, bold: true, color: C.accent5, margin: 0, isTextBox: true })
  const chip = (x, y, t, sub, main, w = 1.75) => {
    const h = sub ? 0.62 : 0.42
    s.addShape(S.roundRect, { x, y, w, h, fill: { color: main ? C.accent1 : C.background1 }, line: { color: main ? C.accent1 : HEX.accent6, width: 1 }, rectRadius: 0.08, objectName: `${t} 칩` })
    const runs = [{ text: t, options: { bold: true, breakLine: !!sub } }]
    if (sub) runs.push({ text: sub, options: { fontSize: 8.5, color: main ? C.background2 : C.accent5 } })
    s.addText(runs, { x: x + 0.08, y, w: w - 0.16, h, fontSize: 10.5, color: main ? C.background1 : C.text1, margin: 0, isTextBox: true, valign: 'middle', align: 'center' })
  }
  chip(ox + 0.25, oy + 2.45, '알바천국 · 알바몬 계산기', '일회성 계산, 기록 없음', false, 2.05)
  chip(ox + 0.6, oy + 1.8, '하우머치', '혼자 기록, 예상 급여까지')
  chip(ox + 3.1, oy + 1.95, '기그', '사장 연동 필요, 기록 · 계약서')
  chip(ox + 3.1, oy + 0.3, '진정24 · 노동포털', '증거가 있어야 시작')
  chip(ox + 0.55, oy + 0.45, '알바가드', '혼자 기록 → 비교 → 요청 → 증빙', true)
  s.addText('혼자 대응까지 가는 건 알바가드뿐', { x: 6.5, y: 1.5, w: 3, h: 0.6, fontSize: 13, bold: true, color: C.text2, margin: 0, isTextBox: true, valign: 'top' })
  s.addText([
    { text: '하우머치 · 계산기는 계산에서 멈추고, 기그는 사장이 있어야 하고, 진정24는 증거가 있어야 한다. 그래서 왼쪽 위 칸은 알바가드뿐이다.', options: { breakLine: true } },
    { text: ' ', options: { breakLine: true, fontSize: 6 } },
    { text: '첫 사용자로 보는 사람은 하우머치 사용자가 아니다. 카톡 · 메모에 적거나 아예 안 적고 통장 총액만 보는 학생이다. 하우머치가 비교 칸을 넣으면 따라올 수 있으니, 따라 하기 어려운 쪽(기록 등록)을 키운다.', options: {} },
  ], { x: 6.5, y: 2.15, w: 3, h: 2.6, fontSize: 10.5, color: C.text1, margin: 0, isTextBox: true, valign: 'top' })
  s.addNotes('손유호. 2×2에서 알바가드는 "혼자 쓴다 × 대응까지"에 있습니다. 오른쪽 열은 혼자서는 시작할 수 없는 서비스입니다. 기그는 사장이 가입해야 하고, 진정24는 증거가 먼저 있어야 합니다. 경쟁 서비스 정보는 2026년 9월 각 앱의 공식 소개와 리뷰 기준입니다.')
}

// 비즈니스 모델
{
  const s = pres.addSlide({ masterName: 'LIGHT', sectionTitle: '⑥ 시장 분석·비즈니스 모델' })
  head(s, '⑥ 비즈니스 모델 · 유저 확보 전략', '핵심 화면은 무료, 수익은 게임 화면에서')
  s.addText('출퇴근은 날마다 누르지만, 돈을 확인하는 건 급여일에 한 번. 그 사이 앱을 열 이유로 게임을 넣었고, 그 화면이 광고 자리다.', { x: 0.5, y: 1.28, w: 9, h: 0.32, fontSize: 11, color: C.text1, margin: 0, isTextBox: true, valign: 'middle' })
  rows(s, 0.5, 1.65, 9, [
    { label: '핵심 화면: 기록 · 비교 · 요청 · 증빙', sub: '신뢰가 핵심인 화면에는 광고를 섞지 않는다', value: '무료 · 광고 없음', color: C.accent2, bold: true },
    { label: '1차 (가설): 쉬는 틈 게임 화면 광고', sub: '웹앱이라 배너 · 전면이 기본, 보상형은 승인 뒤. 단가를 모르니 매출 추정은 적지 않는다', value: '게임 화면만', color: C.text2, bold: true },
    { label: '2차 (후보): 편의 기능 구독', sub: '폰을 바꾸거나 잃어버려도 기록이 남게 하는 선택 기능 (동기화 · 자동 백업)', value: '구독', color: C.text2, bold: true },
    { label: '하지 않는 것: 정산 문구 · 내용증명 · 증빙 묶음 유료화', sub: '돈을 받고 문서를 만들면 변호사법 · 공인노무사법 문제에 가까워진다', value: '유료화 안 함', color: C.accent3, labelColor: C.accent3, bold: true },
  ], { rowH: 0.64, labelSize: 13, valueSize: 13, valueW: 0.2, subSize: 10.5 })
  s.addText('유저 확보', { x: 0.5, y: 4.4, w: 1.3, h: 0.35, fontSize: 10.5, bold: true, color: C.text2, margin: 0, isTextBox: true })
  s.addText('에브리타임 · 학과 단톡 · 알바 커뮤니티에 링크를 올린다. "주휴수당 계산법" 짧은 영상도 만든다', { x: 1.8, y: 4.4, w: 7.7, h: 0.38, fontSize: 11, color: C.text1, margin: 0, isTextBox: true, valign: 'top' })
  s.addText('지표 (앞으로)', { x: 0.5, y: 4.82, w: 1.3, h: 0.35, fontSize: 10.5, bold: true, color: C.text2, margin: 0, isTextBox: true })
  s.addText('홈 화면 추가 → 첫 기록 → 받은 금액 입력 → 차액 발견 → 요청 보냄 → 실제로 받음 (인터뷰)', { x: 1.8, y: 4.82, w: 7.7, h: 0.35, fontSize: 11, bold: true, color: C.text2, margin: 0, isTextBox: true, valign: 'top' })
  s.addNotes('손유호. 알바비 앱에 왜 게임이 있나: 출퇴근은 일하는 날마다 누르지만, 돈을 확인하는 건 급여일에 한 번이라, 그 사이에도 앱을 열 이유로 넣었고 그 화면이 광고 자리입니다. 처음엔 근무 중에만 열렸는데 팀원 의견으로 10/25에 조건을 풀고 설정에서 숨길 수 있게 했습니다. 광고 형식은 웹앱이라 배너 · 전면이 기본이고 보상형은 승인이 필요합니다. 2차 구독은 폰을 바꾸거나 잃어버려도 기록이 남게 하는 선택 기능이고, 원하는 사람만 쓰므로 "근무 내용은 폰 안에만" 원칙과 부딪히지 않습니다. 문서를 돈 받고 만들어 주는 건 법적 이유로 하지 않습니다(웹 조사 기준, 전문가 검토 아님). 광고 가설은 설문의 "게임 화면 광고" 문항과 승인 뒤 게임 화면 열람 수로 확인합니다. 운영 비용은 지금 서버 0원 · 배포 0원이라 수익이 0이어도 서비스는 돌아가고, 인건비는 팀 3명입니다.')
}

// ======================================================
// ⑦ 초기 시장 검증
// ======================================================
pres.addSection({ title: '⑦ 초기 시장 검증' })
{
  const s = pres.addSlide({ masterName: 'LIGHT', sectionTitle: '⑦ 초기 시장 검증' })
  head(s, '⑦ 초기 시장 검증 성과와 계획', '검증 계획: 11월에 설문 · 인터뷰로 다섯 가지를 확인한다')
  s.addText([
    { text: '가설  ', options: { bold: true, color: C.text2 } },
    { text: '알바생은 자신의 근무 기록을 근거로 한 정산 요청 문구가 있으면, 사장에게 말을 꺼낼 수 있다고 느끼고 쓸 것이다', options: {} },
  ], { x: 0.5, y: 1.3, w: 9, h: 0.35, fontSize: 11, color: C.text1, margin: 0, isTextBox: true, valign: 'middle' })
  const th = (t) => ({ text: t, options: { bold: true, color: HEX.accent5, fill: { color: HEX.lt2 }, fontSize: 10 } })
  const td = (t, o = {}) => ({ text: t, options: { fontSize: 10.5, color: HEX.dk1, ...o } })
  s.addTable([
    [th('확인할 것'), th('어떻게 · 기준 (팀이 정함)'), th('못 미치면')],
    [td('매달 받은 금액을 직접 넣는다', { bold: true }), td('인터뷰 5명 + 설문 · 5명 중 3명 "넣겠다"'), td('입금 문자 자동 인식을 앞당긴다')],
    [td('요청 문구를 실제로 보낼 수 있다', { bold: true }), td('인터뷰(문구를 보여 주고) · 5명 중 3명'), td('문구 톤 · 단계를 다시 짠다')],
    [td('확인 번호 설명이 이해된다', { bold: true }), td('인터뷰 · 5명 중 4명'), td('설정 · 증빙 문구를 고친다')],
    [td('타깃 중 주 15시간 이상이 다수다', { bold: true }), td('설문 · 30명 넘으면, 알바 중 반 이상'), td('주휴수당 중심 메시지를 바꾼다')],
    [td('게임 화면 광고를 받아들인다', { bold: true }), td('설문 + 인터뷰 · "싫다"가 반 미만'), td('11/23 광고 대신 새 게임으로')],
  ], { x: 0.5, y: 1.72, w: 9, colW: [3.0, 3.4, 2.6], rowH: [0.32, 0.38, 0.38, 0.38, 0.38, 0.38], border: { type: 'solid', pt: 0.5, color: HEX.accent6 }, valign: 'middle', margin: [0.02, 0.08, 0.02, 0.08], objectName: '검증 계획 표' })
  rows(s, 0.5, 4.05, 9, [
    { label: '모집: 학과 · 동아리 단톡, 에브리타임, 오늘 이 자리(QR). 인터뷰 5명은 지인 중 알바 중인 사람, 11/3~11/9' },
    { label: '왜 먼저 만들었나: 웹앱이라 빨리 만들 수 있고, 화면을 보여 주며 물어야 답이 정확하다' },
  ], { rowH: 0.42, labelSize: 10.5 })
  s.addNotes('박명진. 가설은 9월 기획서 문장 그대로입니다. 표의 기준은 팀이 정한 목표이지 데이터가 아닙니다. 인터뷰 문항은 설문지 20~24번입니다. 지금까지 들은 것은 정식 조사가 아닙니다: 타깃 사용자 1명이 디자인 시안 12장 중 통장 구성을 골랐고, 링크 설문은 10/23에 공개했습니다. 기말 발표에서 이 표에 결과를 더해 보고합니다. 응답 수는 슬라이드에 적지 않고 당일 아침 결과 페이지에서 읽습니다. 0명이면 0명이라고 말합니다. 다만 당일 아침 응답이 10명 이상이고, 강의실 인터넷이 되고, 교수님 양해를 받았으면 결과 페이지(survey-results.html)를 60초만 띄워 세 문항(주당 근무 시간 · 적게 받은 것 같았던 적 · 매달 받은 금액 직접 넣기)만 읽습니다. 자유 의견은 띄우지 않습니다. 아니면 당일 아침 캡처로 대신합니다. 테스트 응답 2건(10/23)은 미리 지워 둡니다. 결과는 사람 수로만 말하고 %는 30명을 넘을 때만 씁니다. 1행은 의향을 묻는 것이라 한계가 있습니다. 인터뷰 때 앱을 설치하게 하고, 실제로 넣는지는 급여일이 지난 뒤 따로 봅니다(기말 이후까지 걸릴 수 있음). 지인은 호의적으로 답하기 쉬워서 "넣겠다"를 그대로 믿지 않습니다.')
}

// ======================================================
// ⑧ 향후 계획·팀 역량
// ======================================================
pres.addSection({ title: '⑧ 향후 계획·팀 역량' })
{
  const s = pres.addSlide({ masterName: 'LIGHT', sectionTitle: '⑧ 향후 계획·팀 역량' })
  head(s, '⑧ 향후 계획 · 간트 차트', '기말(12/15)까지 일정')
  const weeks = ['10/27', '11/3', '11/10', '11/17', '11/24', '12/1', '12/8']
  const tasks = [
    ['설문 30명 수집 · 집계', '손유호', 0, 2],
    ['직접 인터뷰 5명', '손유호 3 · 박명진 2', 1, 1],
    ['피드백 반영 1차', '이지훈', 2, 3],
    ['실제 폰 검증 (아이폰 · 갤럭시)', '이지훈 · 박명진', 2, 4],
    ['기록 등록 보강', '이지훈', 3, 5],
    ['광고 실험 또는 새 게임 (11/23 결정)', '손유호 · 이지훈', 4, 5],
    ['최종 보고서 · 발표 준비', '전원', 5, 6],
  ]
  const lx = 0.5, lw = 2.95, ax = 3.5, aw = 1.2, gx = 4.75, cw = (9.5 - 4.75) / 7, hy = 1.35, rh = 0.38
  // 마일스톤
  const ms = [[2, '11/9 인터뷰 · 설문 1차'], [4, '11/23 반영 배포'], [5, '11/30 폰 검증'], [6, '12/7 동결'], [7, '12/15 기말']]
  const my = hy + 0.42
  s.addShape(S.line, { x: gx, y: my + 0.07, w: 7 * cw, h: 0, line: { color: HEX.accent6, width: 0.5, dashType: 'dash' } })
  ms.forEach(([col, t], i) => {
    const x = gx + col * cw
    s.addShape(S.diamond, { x: x - 0.07, y: my, w: 0.14, h: 0.14, fill: { color: C.accent3 }, line: { color: C.accent3, width: 0 }, objectName: `마일스톤 ${i + 1}` })
    s.addText(t, { x: x - 0.75, y: my + 0.14 + (i % 2) * 0.19, w: 1.5, h: 0.2, fontSize: 9, color: C.accent3, bold: true, margin: 0, isTextBox: true, align: 'center', valign: 'top' })
  })
  s.addText('마일스톤', { x: lx, y: my - 0.05, w: 1.5, h: 0.25, fontSize: 9.5, bold: true, color: C.accent3, margin: 0, isTextBox: true })
  weeks.forEach((w, i) => s.addText(w, { x: gx + i * cw, y: hy, w: cw, h: 0.3, fontSize: 10, bold: true, color: C.accent5, margin: 0, isTextBox: true, align: 'center' }))
  s.addText('담당', { x: ax, y: hy, w: aw, h: 0.3, fontSize: 10, bold: true, color: C.accent5, margin: 0, isTextBox: true })
  line(s, lx, hy + 0.32, 9)
  tasks.forEach(([t, who, a, b], i) => {
    const y = hy + 0.95 + i * rh
    s.addText(t, { x: lx, y, w: lw, h: rh, fontSize: 11, color: C.text1, margin: 0, isTextBox: true, valign: 'middle' })
    s.addText(who, { x: ax, y, w: aw, h: rh, fontSize: 9.5, color: C.accent5, margin: 0, isTextBox: true, valign: 'middle' })
    for (let k = 0; k < 7; k++) s.addShape(S.line, { x: gx + k * cw, y, w: 0, h: rh, line: { color: HEX.accent6, width: 0.5 } })
    s.addShape(S.roundRect, { x: gx + a * cw + 0.05, y: y + 0.12, w: (b - a + 1) * cw - 0.1, h: rh - 0.24, fill: { color: i === 6 ? C.accent2 : C.accent1 }, line: { color: i === 6 ? C.accent2 : C.accent1, width: 0 }, rectRadius: 0.06, objectName: `${t} 막대` })
    line(s, lx, y + rh, 9)
  })
  s.addText('중간발표 10/27 (화) → 기말 발표 12/15 (화) 예정', { x: 0.5, y: 4.98, w: 9, h: 0.24, fontSize: 9.5, color: C.accent5, margin: 0, isTextBox: true })
  s.addNotes('박명진. 7주 일정이고 빨간 마름모가 마일스톤입니다. 설문은 오늘 이 자리에서 시작해 11/16까지 손유호가 30명을 모으고, 인터뷰 5명은 11/3~11/9에 손유호 3명, 제가 2명을 합니다. 폰 검증은 아이폰은 팀장, 갤럭시는 제가 주관합니다. 광고 승인 신청은 손유호, 코드는 팀장입니다. 마일스톤: 11/9 설문 1차 집계 · 인터뷰 마감, 11/23 피드백 반영 배포와 광고 결정, 11/30 폰 검증 끝, 12/7 기록 등록 보강 배포와 기능 동결, 12/15 기말. 11/23에 설문의 광고 문항 결과로 광고 실험과 새 게임 중 하나를 정합니다. 12/7 이후에는 코드를 바꾸지 않고 보고서와 발표를 준비합니다. 위험과 대안은 보고서 5.4에 적었습니다.')
}

// R&R + 마무리
{
  const s = pres.addSlide({ masterName: 'DARK', sectionTitle: '⑧ 향후 계획·팀 역량' })
  s.addText('⑧ 팀원별 R&R', { placeholder: 'title' })
  const rr = [
    ['이지훈', '팀장 · 개발', ['기획 · 개발 · 배포', '기록 등록 보강, 아이폰 검증', '기술 · 법적 효력 질의응답']],
    ['손유호', '시장 · 수익', ['설문 30명 · 집계, 인터뷰 3명', '비즈니스 모델, 광고 승인 신청', '시장 · 경쟁사 조사']],
    ['박명진', '검증 · 일정', ['인터뷰 2명, 갤럭시 설치 · 테스트', '일정 관리, 마일스톤 점검', '보고서 편집']],
  ]
  rr.forEach(([n, r, jobs], i) => {
    const x = 0.6 + i * 3.0
    if (i > 0) s.addShape(S.line, { x: x - 0.2, y: 1.55, w: 0, h: 1.9, line: { color: 'FFFFFF', width: 0.75, transparency: 60 } })
    s.addText([{ text: n, options: { bold: true, fontSize: 18 } }, { text: `  ${r}`, options: { fontSize: 10, color: C.background2 } }], { x, y: 1.5, w: 2.6, h: 0.45, color: C.background1, margin: 0, isTextBox: true, valign: 'middle' })
    s.addText(jobs.map((j, k) => ({ text: j, options: { bullet: { indent: 12 }, breakLine: k < jobs.length - 1 } })), { x, y: 2.05, w: 2.6, h: 1.7, fontSize: 11.5, color: C.background1, margin: 0, isTextBox: true, valign: 'top', paraSpaceAfter: 4 })
  })
  s.addText('각자 맡은 일이 오늘 발표한 장과 같습니다', { x: 0.6, y: 4.3, w: 8.8, h: 0.4, fontSize: 12, color: C.background2, margin: 0, isTextBox: true })
  s.addNotes('박명진. 앞으로 맡는 일은 오늘 각자 발표한 장과 같습니다. 개발은 팀장, 시장과 설문 · 인터뷰 3명은 손유호, 인터뷰 2명과 갤럭시 테스트 · 일정 · 보고서는 저입니다. 다음 장으로 넘겨 팀장이 마무리합니다.')
}

// 18장: 질의응답 대기 화면
{
  const s = pres.addSlide({ masterName: 'DARK', sectionTitle: '⑧ 향후 계획·팀 역량' })
  s.addText('못 받은 알바비, 기록으로 찾는 앱', { placeholder: 'title' })
  rows_dark(s)
  function rows_dark(sl) {
    const items = [['배포됨', 'jihooni217.github.io/albaguard\n시연 기록 확인 번호 da3e2a7ad7e298db'], ['기능 8 / 8 동작', '완성도 평균 약 80%, 사용자 검증은 11월'], ['11월', '링크 설문 30명 + 직접 인터뷰 5명']]
    items.forEach(([a, b], i) => {
      const y = 1.6 + i * 0.72
      sl.addShape(S.line, { x: 0.6, y, w: 5.2, h: 0, line: { color: 'FFFFFF', width: 0.75, transparency: 60 } })
      sl.addText(a, { x: 0.6, y: y + 0.05, w: 2.2, h: 0.6, fontSize: 16, bold: true, color: C.background1, margin: 0, isTextBox: true, valign: 'middle' })
      sl.addText(b, { x: 2.8, y: y + 0.05, w: 3.0, h: 0.6, fontSize: 11, color: C.background2, margin: 0, isTextBox: true, valign: 'middle', align: 'right' })
    })
    sl.addShape(S.line, { x: 0.6, y: 1.6 + 3 * 0.72, w: 5.2, h: 0, line: { color: 'FFFFFF', width: 0.75, transparency: 60 } })
  }
  const qrd = (file, x, label, sub) => {
    s.addShape(S.rect, { x: x - 0.08, y: 1.52, w: 1.56, h: 1.56, fill: { color: 'FFFFFF' }, line: { color: 'FFFFFF', width: 0 }, objectName: `${label} 바탕` })
    s.addImage({ path: path.join(PROJ, 'docs/report_src', file), x, y: 1.6, w: 1.4, h: 1.4, objectName: label })
    s.addText(label, { x: x - 0.2, y: 3.15, w: 1.8, h: 0.3, fontSize: 11.5, bold: true, color: C.background1, margin: 0, isTextBox: true, align: 'center' })
    s.addText(sub, { x: x - 0.3, y: 3.45, w: 2.0, h: 0.45, fontSize: 9, color: C.background2, margin: 0, isTextBox: true, align: 'center', valign: 'top' })
  }
  qrd('qr_app.png', 6.3, '앱 설치', '홈 화면에 추가')
  qrd('qr_survey.png', 8.05, '설문 3분', '이름 · 연락처 없음')
  s.addText('지금 답해 주시면 기말 발표 때 결과로 보여 드립니다', { x: 0.6, y: 4.35, w: 8.8, h: 0.4, fontSize: 13, color: C.background2, margin: 0, isTextBox: true })
  s.addText('감사합니다', { x: 0.6, y: 4.75, w: 8.8, h: 0.4, fontSize: 14, bold: true, color: C.background1, margin: 0, isTextBox: true })
  s.addNotes([
    '팀장 마무리(20초): "저희가 여쭙고 싶은 것 두 가지입니다. 문서 유료화를 피하면서 가능한 수익 모델이 더 있을지, 그리고 설문 30명 · 인터뷰 5명이면 충분한지입니다. 질문받겠습니다." 이 장은 질의응답 내내 띄워 둔다.',
    '',
    '예상 질문 (이름 붙은 사람이 먼저 답하고, 모자라면 팀장이 보탠다)',
    '· [이지훈] 법적 효력 있나? → 보장하지 않는다. 판단은 감독관 · 법원. 우리는 판단할 자료를 정리하고, 수정 이력과 확인 번호로 "나중에 고친 게 아니다"까지 보여 준다. 통장 내역 · 카톡과 함께 내야 한다고 앱에도 적어 뒀다.',
    '· [이지훈] 서버는 여러분이 관리하는데 고치면 그만 아닌가? → 맞다. 공개키로는 넣기 · 읽기만 되고 시각은 서버가 찍는 것까지 확인했지만, 프로젝트 소유자 권한으로는 고칠 수 있다. 한계로 인정한다. 지금 막는 건 "사용자 본인이 나중에 고쳐 쓰기"까지. 운영자까지 못 고치게 하는 외부 공인 시점 확인은 비용 때문에 계획. 서버에는 번호만 있어서 운영자가 서버를 고쳐도 폰의 근무 내용 자체는 못 바꾼다. (확인 페이지 본문의 "고치거나 지울 수 없습니다"는 "앱 쪽에서는"이라고 범위를 붙여 말할 것)',
    '· [이지훈] 확인 번호가 그 기록에서 나온 건지 어떻게 아나? → 지금은 번호와 서버 등록 시각까지 보여 주고, 기록 내용에서 번호를 다시 계산해 맞춰 보는 방법은 기말까지 만든다(그래서 70%). 지금은 앱 · 백업 파일을 함께 봐야 한다.',
    '· [이지훈] 본인이 쓴 기록을 믿을 수 있나? → 거짓 기록은 막을 수 없다고 인정. 막는 건 "나중에 고쳐 쓰기". 영세 사업장은 기록이 없는 경우가 많아 알바생 기록이 거의 유일한 자료가 되기 쉽다. 사장에게는 임금대장 · 계약 서류 보존 의무가 있다(근로기준법 48 · 42조).',
    '· [이지훈] 앱 계산이 틀리면 분쟁이 커지는 것 아닌가? 책임은? → 계산을 단정으로 내놓지 않는다. 항목별 · 주별 이유를 펼쳐 보여 주고, 안 넣은 것(연장근로 가산)과 유리하게 본 것(합의 휴무)은 화면에 적었다. 1단계 문구는 청구서가 아니라 "제가 계산을 잘 몰라서 여쭤본다"라는 확인 요청. 법률 자문 아님을 적어 두었고 1350 확인을 안내한다.',
    '· [이지훈] 고객 검증도 전에 왜 먼저 만들었나? → 맞다. 다만 링크로 배포되는 웹앱이라 빨리 만들 수 있었고, 말로 설명하기보다 화면을 보여 주며 물어야 정확한 답을 듣는다고 봤다. 9월 경쟁 앱 리뷰로 빈자리를 확인하고 10/13 정의서로 범위를 8개로 잘랐다. 설문에 캡처 3장을 넣고 "실제로 있다면 쓰겠나"를 묻는다. 12/7까지는 고치는 기간.',
    '· [박명진] 받은 금액을 매달 직접 넣어야 하는데 넣을까? → 가장 큰 가설이라 인터뷰 1번. 첫 화면에서 "9월 급여 받으셨나요?"라고 묻고 넣는 순간 덜 받은 돈이 보이게 했다. 5명 중 3명이 아니면 자동 인식을 앞당긴다.',
    '· [이지훈] 하우머치가 따라 하면? → 비교 기능은 따라올 수 있다. 해시를 서버에 넣는 기술 자체도 어렵지 않다고 인정한다. 어려운 것은 그 번호가 뜻이 있게 기록 구조를 짜는 일이다. 사유 없이 못 고치고, 삭제도 흔적이 남고, 고칠 때마다 다시 등록돼야 "몇 번 고쳤나"가 보인다. 기존 앱이 따라오려면 기록을 마음대로 고치던 방식을 바꿔야 해서 쉽게 따라오지 않는다고 본다. 그래도 따라오면 요청 · 증빙까지 잇는 흐름으로 간다. 우리도 "내용으로 번호 다시 계산"이 남아 70%다.',
    '· [손유호] 급여 앱에 게임이 왜? 근무 중에 게임을 권하나? → 출퇴근은 일하는 날마다 누르지만, 돈을 확인하는 건 급여일에 한 번이라, 그 사이에도 앱을 열 이유로 넣은 것. 처음엔 근무 중에만이었는데 팀원 의견으로 10/25 조건을 풀고 설정에서 숨길 수 있게 했다. 게임 기록은 문서에 안 섞인다. 안 되면 게임을 빼도 기록 → 비교 → 요청은 그대로.',
    '· [박명진] 같은 과 학생 설문이 무슨 의미? 편향 아닌가? → 맞다. "정식 조사 아님"을 적고 사람 수로만 말한다. 중복 응답도 막지 않았다(이름 · 기기 정보를 안 받는 대가). 11월 30명은 과 밖에서, 인터뷰 5명으로 이유를 듣는다.',
    '· [이지훈] 법률 서비스 아닌가? → 무료, 본인 기록을 정해진 양식에 채울 뿐, 개별 사안 검토 · 대행 없음, 진정은 1350 · 노동포털로 연결만.',
    '· [손유호] 수익은? → 게임 화면 광고(가설). 운영 비용은 0원. 문서 유료화는 안 한다.',
    '· [이지훈] 정의서를 개발 중에 썼는데 계획 대비가 의미 있나? → 맞다. 원래 계획은 9월 기획서의 기능 4개(기록 · 비교 · 요청 · 증빙)다. 10/13 정의서는 만들면서 필요해진 것(기록 등록 · 백업)을 더해 8개로 고정하고, 넣지 않을 6개를 정한 문서다. 그 뒤 포함 기능을 늘리지 않았고 뺀 6개는 지금도 없다. 8/8은 "다 했다"가 아니라 "범위를 지켰다"로 읽어 달라.',
    '· [이지훈] 등록 시각이 출근 시각인가? 인터넷이 없을 때 기록하면? → 아니다. 등록 시각은 확인 번호가 서버에 도착한 시각이고, 보여 주는 것은 "늦어도 이 시각에는 이 내용이 있었다"까지다. 인터넷이 없으면 대기열에 있다가 연결될 때 보내지므로 그만큼 늦어진다. "나중에 입력"한 기록도 입력했을 때 등록되고, 기록에는 나중에 입력했다는 표시와 사유가 같이 남는다. 출근 시각 자체를 증명하는 것은 아니다.',
    '· [이지훈] 아무 번호나 넣으면? 두 기록이 같은 번호가 될 수 있나? → 확인 페이지는 앞 16자와 64자 전체를 둘 다 받고, 서버에 없는 번호는 등록된 것이 없다고 나온다. 서버 표에서 번호는 중복을 허용하지 않는다. 재료에 기록 번호와 만든 시각이 들어가서 서로 다른 기록이 같은 번호가 될 일은 사실상 없다.',
    '· [이지훈] 카톡 나에게 보내기로 매일 적으면 같지 않나? → 시각만 보면 카톡이 더 믿을 만하다. 카카오가 찍은 시각이라 우리와 무관하다. 다른 점은 둘이다. 카톡은 고치면 새 메시지가 하나 더 생길 뿐 무엇을 왜 고쳤는지 안 남고, 그 기록으로 계산 · 비교 · 요청 · 증빙 묶음까지 이어지지 않는다. 그래서 카톡에 적던 사람이 첫 타깃이고, 카톡 캡처는 함께 내라고 앱에도 적었다.',
    '· [이지훈] AI는 어디에 썼나? Claude 문구는 실제로 써 봤나? → 앱 기능으로는 정산 요청 문구 생성 하나이고 선택 사항이다. 배포 앱은 API 키 없이 근무 기록과 계산 내역을 채운 정해진 문장으로 만든다. 기본을 끈 이유는 기록 내용이 폰 밖으로 나가면 개인정보 안내와 동의가 먼저 필요해서다. 키가 없어 Claude 문구를 실제로 돌려 본 적은 아직 없다.',
    '· [이지훈] 코드는 누가 짰고 이해하고 있나? → (사실대로. 틀: 개발 도구로 AI 코딩 도우미를 썼다. 기능 범위 8개, 계산 규칙(주휴 · 야간 · 휴게시간 · 연도별 최저임금), 기록 구조(수정 이력, 삭제 흔적, 사유 없이는 저장 안 됨), 법적 문구 원칙은 팀장이 정하고 하나씩 확인하며 올렸다. 서버 권한은 2000년 시각과 수정 · 삭제 요청을 직접 보내 확인했다.)',
    '· [이지훈] 왜 Supabase인가? 설문은 서버에 두면서 근무 기록은 왜 안 두나? → 서버 코드 없이 REST로 표에 넣고 읽을 수 있고, 표 단위 권한(RLS)과 트리거로 "시각은 서버가 찍는다"를 걸 수 있어서다. 일주일 요청이 없으면 멈추는 단점은 알고 있다. 설문은 이름 없는 답 묶음이고 근무 기록은 근무지 · 시각 · 금액이라 민감도가 다르다. 권한 원칙은 두 표가 같다.',
    '· [이지훈] 폰을 바꾸거나 서비스가 없어지면 기록은? → 폰을 바꾸면 백업 파일로 옮긴다(설정 탭). 서비스가 없어져도 폰의 기록, 백업 파일, 저장해 둔 증빙 묶음 PDF는 사용자 손에 남는다. 이 문제를 푸는 것이 2차 구독(동기화 · 자동 백업)이다.',
    '· [이지훈] 개인정보는? 동의는? → 로그인이 없고 서버에는 이름 · 근무지 · 시각 · 금액이 가지 않는다. 가는 것은 확인 번호 · 기록 번호 · 무작위 기기 번호뿐이고, 무엇이 가는지 설정 탭에 적고 끌 수 있게 했다. 설문도 이름 · 연락처를 받지 않는다. 기록 내용을 밖으로 보내는 기능을 켜면 그때 안내와 동의가 필요하다.',
    '· [박명진] 왜 설문 30명 · 인터뷰 5명인가? → 9월 기획서는 인터뷰 10~15명이었다. 사람 수는 링크 설문으로 채우고, 앱을 써 보게 하는 20분 인터뷰는 7주 안에 셋이 할 수 있는 5명으로 줄였다. 충분한지는 마지막에 여쭙는 것 중 하나다.',
    '· [손유호] 광고 수익이 생기면 "무료라서 괜찮다"가 깨지지 않나? → 광고는 게임 화면에만 나오고 문서 기능과 떼어 놓았다. 문서를 만든 대가로 받는 돈이 아니게 구조를 잡은 것이다. 다만 웹 조사 기준 판단이고 전문가 검토는 아니다.',
    '· [박명진 → 손유호 순으로 각자] 팀원은 뭘 했나? → 개발은 이지훈. 손유호는 수업 시간의 계획서 일부를 썼고(내용은 팀장이 반영), 앞으로 시장 · 설문 · 인터뷰 3명. 박명진은 지금까지 의견을 낸 정도이고, 앞으로 인터뷰 2명 · 갤럭시 테스트 · 일정 · 보고서 편집.',
  ].join('\n'))
}

;(async () => {
  await pres.writeFile({ fileName: OUT })
  await applyTheme(OUT, THEME)
  console.log('written', OUT)
})().catch((e) => { console.error(e); process.exit(1) })
