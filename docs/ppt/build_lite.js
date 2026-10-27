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
// 빈 제목 상자가 남지 않게, 제목을 쓰지 않는 장(표지·시연 영상)은 자리 없는 레이아웃으로
pres.defineSlideMaster({
  title: 'LIGHT_PLAIN',
  background: { color: HEX.lt1 },
  objects: [
    { text: { text: '알바가드 · SW기술창업 중간발표 · 4조', options: { x: 0.5, y: 5.22, w: 5, h: 0.28, fontSize: 9, color: C.accent5, margin: 0 } } },
  ],
  slideNumber: { x: 9.0, y: 5.22, w: 0.5, h: 0.28, fontSize: 9, color: C.accent5, align: 'right' },
})
pres.defineSlideMaster({ title: 'DARK_PLAIN', background: { color: HEX.dk2 }, objects: [] })
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
// 폰 화면: 영상과 같은 진짜 폰 모양 그림(3배 해상도, docs/screenshots/phone, 여백 없이 자른 것). h는 폰 그림 높이
const PHONE_R = 1240 / 2673
function phone(slide, img, x, y, h, name) {
  const w = h * PHONE_R
  const file = path.join(PROJ, 'docs/screenshots/phone', path.basename(img).replace('.jpg', '.png'))
  slide.addImage({ path: file, x, y, w, h, objectName: name })
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
  const s = pres.addSlide({ masterName: 'DARK_PLAIN', sectionTitle: '① 표지·팀 소개' })
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
  s.addText('4조', { x: 6.7, y: 2.45, w: 2.8, h: 0.3, fontSize: 9.5, color: C.background2, margin: 0, isTextBox: true })
  s.addShape(S.line, { x: 6.7, y: 2.9, w: 2.8, h: 0, line: { color: 'FFFFFF', width: 0.75, transparency: 60 } })
  s.addText('팀원', { x: 6.7, y: 3.0, w: 2.8, h: 0.3, fontSize: 10, bold: true, color: C.background2, margin: 0, isTextBox: true })
  s.addText([
    { text: '팀장 이지훈', options: { bold: true, breakLine: true } },
    { text: '컴퓨터소프트웨어 22학번', options: { fontSize: 10, color: C.background2, breakLine: true } },
    { text: '손유호', options: { bold: true, breakLine: true } },
    { text: '컴퓨터소프트웨어 20학번', options: { fontSize: 10, color: C.background2, breakLine: true } },
    { text: '박명진', options: { bold: true, breakLine: true } },
    { text: '컴퓨터소프트웨어 18학번', options: { fontSize: 10, color: C.background2 } },
  ], { x: 6.7, y: 3.3, w: 2.8, h: 1.9, fontSize: 12.5, color: C.background1, margin: 0, isTextBox: true, valign: 'top', paraSpaceAfter: 2 })
  s.addNotes('안녕하세요, 4조 발표를 맡은 팀장 이지훈입니다. 혹시 지난달 알바비, 정확히 얼마를 받아야 했는지 아시나요? 아마 정확히 아는 분은 많지 않으실 겁니다. 저희가 만든 앱은 알바가드입니다. 화면에 보이는 금액은 저희 앱 예시 데이터에서 두 달 동안 덜 받은 알바비인데요. 통장에 들어온 총액만 봐서는 잘 안 보이는 돈입니다. 알바가드는 이렇게 놓치기 쉬운 돈을 근무 기록으로 찾아 주는 앱입니다. 알바비를 덜 받아도 모르거나, 알아도 말을 꺼내기 어려운 대학생을 위해 기록, 비교, 요청을 한 앱에 담았습니다.')
}

// ② 결론 먼저: 배포돼 있다 + QR
{
  const s = pres.addSlide({ masterName: 'LIGHT', sectionTitle: '① 표지·팀 소개' })
  head(s, '① 오늘 발표', '지금 상태: 앱은 배포, 설문 13명 응답, 인터뷰는 11월')
  rows(s, 0.5, 1.45, 5.3, [
    { label: '계획한 기능 8개 모두 동작', sub: '9월 기획서 4개 → 10/13 정의서 8개로 고정. 완성도 평균 약 80%', value: '8 / 8', color: C.text2, bold: true },
    { label: '사용자 검증', sub: '링크 설문 30명 · 직접 인터뷰 5명', value: '설문 13명', color: C.accent5, bold: true },
  ], { rowH: 0.95, labelSize: 15, valueSize: 15, valueW: 0.2 })
  // QR 두 개
  const qr = (file, x, label, sub) => {
    s.addImage({ path: path.join(PROJ, 'docs/report_src', file), x, y: 1.45, w: 1.55, h: 1.55, objectName: label })
    s.addText(label, { x: x - 0.15, y: 3.05, w: 1.85, h: 0.3, fontSize: 11, bold: true, color: C.text2, margin: 0, isTextBox: true, align: 'center' })
    s.addText(sub, { x: x - 0.25, y: 3.35, w: 2.05, h: 0.5, fontSize: 9, color: C.accent5, margin: 0, isTextBox: true, align: 'center', valign: 'top' })
  }
  qr('qr_app.png', 6.2, '앱 설치', '폰 브라우저로 열고\n"홈 화면에 추가"')
  qr('qr_survey.png', 8.0, '설문 3분', '이름 · 연락처 없음\n발표 뒤 답해도 됨')
  s.addText('jihooni217.github.io/albaguard', { x: 6.0, y: 3.95, w: 3.5, h: 0.3, fontSize: 9.5, color: C.accent5, margin: 0, isTextBox: true, align: 'center' })
  s.addNotes('먼저 지금 상태부터 말씀드리겠습니다. 계획했던 기능 8개는 모두 동작하는 상태로 배포까지 했고, 완성도는 평균 80% 정도로 보고 있습니다. 설문은 지금까지 13명이 답해 줬고, 앱을 직접 써 보게 하는 인터뷰는 11월에 진행할 예정입니다. 오른쪽 QR을 찍으시면 앱과 설문을 바로 열 수 있습니다. 설문은 이름 없이 3분이면 끝나니까, 발표가 끝나고 한번 답해 주시면 정말 감사하겠습니다. 오늘은 문제, 해결 방법, 기술과 시연, 시장과 수익, 검증과 일정 순서로 말씀드리겠습니다. 발표는 저와 손유호, 박명진 세 명이 나눠서 진행하겠습니다.')
}

// ======================================================
// ② 문제 정의
// ======================================================
pres.addSection({ title: '② 문제 정의' })
{
  const s = pres.addSlide({ masterName: 'LIGHT', sectionTitle: '② 문제 정의' })
  head(s, '② 문제 정의 · 페인 포인트', '세 문제의 원인은 하나: 근거가 될 기록이 없음')
  card(s, 0.5, 1.3, 9, 0.62, '타깃 칸')
  s.addText([
    { text: '타깃  ', options: { bold: true, color: C.text2 } },
    { text: '주 15시간 이상 · 만 19~26세 시급제 알바 대학생 · 계약서 없음 · 통장 총액만 확인', options: {} },
  ], { x: 0.7, y: 1.3, w: 8.6, h: 0.62, fontSize: 11.5, color: C.text1, margin: 0, isTextBox: true, valign: 'middle' })
  const probs = [
    { n: 1, pct: '33.2%', what: '노동절에 일하고도 수당을 받는지 "안내받지 못해 모르겠다"', src: '노동절 근무 알바생 749명, 알바천국 2026.4', title: '얼마를 받아야 하는지\n계산하기 어려움', desc: '수당 안내를 못 받는 경우가 많고, 주휴 · 야간 계산 기준은 알기 어려움. 계산기는 있어도 넣을 기록이 없음' },
    { n: 2, pct: '48.0%', what: '임금 관련 문제를 겪음 (수당 미지급 · 지연 37.3%)', src: '알바생 2,457명, 알바천국 2025.1\n우리 설문: 통장 총액만 봄 12명 중 7명', title: '덜 받아도\n알아채기 어려움', desc: '통장에 들어온 총액만 보고 넘어감. 계약서가 없어 시급도 증명하기 어려움' },
    { n: 3, pct: '49.3%', what: '최저시급 미달인데 아무 대응도 안 함', src: '미달 경험자 기준 · 알바천국 2026.6 (1,804명)', title: '알아도\n말을 꺼내기 어려움', desc: '관계 걱정, 작은 금액, 근거 없음. 메모장 기록은 "나중에 지어낸 것 아니냐?" 한마디에 무너짐' },
  ]
  probs.forEach((p, i) => {
    const x = 0.5 + i * 3.05, w = 2.9
    s.addText(p.pct, { x, y: 2.25, w, h: 0.75, fontSize: 40, bold: true, color: C.accent3, margin: 0, isTextBox: true, valign: 'bottom' })
    s.addText(p.what, { x, y: 3.02, w, h: 0.5, fontSize: 10.5, color: C.text1, margin: 0, isTextBox: true, valign: 'top' })
    caption(s, p.src, x, 3.5, w, 0.25, 8.5)
    line(s, x, 3.85, w)
    circleNum(s, x, 4.05, p.n, { size: 0.34, fontSize: 11 })
    s.addText(p.title, { x: x + 0.45, y: 3.99, w: w - 0.45, h: 0.66, fontSize: 14, bold: true, color: C.text2, margin: 0, isTextBox: true, valign: 'top' })
  })
  s.addNotes('저희가 주목한 문제는 세 가지입니다. 화면의 큰 숫자 세 개는 알바천국 설문 결과인데요. 먼저, 얼마를 받아야 하는지부터 어렵습니다. 노동절에 일한 알바생 셋 중 한 명은 수당을 받는지조차 몰랐습니다. 다음은 덜 받아도 잘 모른다는 점입니다. 저희 설문에서도 12명 중 7명이 통장에 들어온 총액만 본다고 했습니다. 마지막으로, 알아도 말을 못 합니다. 최저시급보다 덜 받은 사람 중 절반 가까이가 아무 대응도 하지 않았습니다. 기록이 없으면 "나중에 지어낸 거 아니냐"라는 한마디에 할 말이 없어지니까요. (멈춤) 결국 세 문제의 원인은 하나입니다. 근거가 될 기록이 없다는 겁니다.')
}

// 기존 해결책의 한계
{
  const s = pres.addSlide({ masterName: 'LIGHT', sectionTitle: '② 문제 정의' })
  head(s, '② 문제 정의 · 기존 해결책의 한계', '기존 서비스: 계산까지는 있지만, 비교와 대응은 없음')
  const hdr = (t, o = {}) => ({ text: t, options: { bold: true, color: HEX.accent5, fill: { color: HEX.lt2 }, fontSize: 9.5, align: 'center', ...o } })
  const name = (t) => ({ text: t, options: { fontSize: 10.5, color: HEX.dk1, bold: true } })
  const mark = (v, note) => {
    const m = { O: ['O', HEX.accent2], X: ['X', HEX.accent3], D: ['△', HEX.accent5], '-': ['해당 없음', HEX.accent5] }[v]
    const runs = [{ text: m[0], options: { bold: true, color: m[1], fontSize: v === '-' ? 8.5 : 12 } }]
    if (note) runs.push({ text: ' ' + note, options: { fontSize: 9, color: HEX.accent5 } })
    return { text: runs, options: { align: 'center' } }
  }
  const ours = (v, note) => { const c = mark(v, note); c.options.fill = { color: HEX.lt2 }; return c }
  const tbl = [
    [hdr('', { align: 'left' }), hdr('메모 · 카톡'), hdr('하우머치'), hdr('기그'), hdr('알바천국 ·\n알바몬 계산기'), hdr('진정24 ·\n노동포털'), hdr('알바가드', { color: HEX.dk2 })],
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
    { text: '가운데 세 줄(비교 · 요청 · 등록 시각)은 알바가드에만 있음. 진정 접수는 일부러 연결만', options: {} },
  ], { x: 0.7, y: 4.38, w: 8.6, h: 0.6, fontSize: 11.5, color: C.text1, margin: 0, isTextBox: true, valign: 'middle' })
  s.addNotes('그럼 기존 서비스들은 어떨까요? 알바생들이 실제로 제일 많이 쓰는 건 앱보단 메모장이나 카톡이라서 맨 앞 열에 같이 넣었습니다. 표를 다 보실 필요는 없고, 실제 받은 돈과 비교하기, 요청 문구와 증빙 만들기, 수정 이력과 등록 시각, 이 가운데 세 줄만 봐 주시면 됩니다. 이 세 줄은 알바가드에만 O가 있습니다. 다른 서비스는 대부분 예상 급여 계산에서 멈추거나, 사장님이 가입해야 하거나, 증거가 이미 있어야 시작할 수 있습니다. 진정서를 대신 써 주거나 접수하는 건 노무사 같은 전문가가 할 일이라, 저희는 그 앞 단계인 기록, 비교, 요청에 집중하고 진정은 1350과 노동포털로 연결해 드립니다.')
}

// ======================================================
// ③ 솔루션
// ======================================================
pres.addSection({ title: '③ 솔루션·핵심 가치' })
{
  const s = pres.addSlide({ masterName: 'LIGHT', sectionTitle: '③ 솔루션·핵심 가치' })
  head(s, '③ 솔루션 · 서비스 개요   ·   문제 1 · 2는 비교로, 문제 3은 요청으로. 기록이 그 바탕', '기록 → 비교 → 요청, 신고 이전 단계를 채움')
  const steps = [
    { n: 1, t: '근무 기록', d: '출근 · 퇴근 버튼 하나. 고치면 수정 전후와 사유가 남고, 삭제도 흔적이 남음', img: '1-home.jpg' },
    { n: 2, t: '급여 비교', d: '"받았어야 할 돈"(기본급 · 주휴 · 야간)과\n실제 받은 돈의 차액 표시', img: '3-pay.jpg' },
    { n: 3, t: '정산 요청', d: '정중한 메시지 → 내용증명 → 진정 안내\n1350 · 노동포털 연결. 대화로 먼저 해결', img: '4-request.jpg' },
  ]
  const ph = 2.78, pw = ph * 1240 / 2673
  steps.forEach((st, i) => {
    const x = 0.5 + i * 3.05, w = 2.9
    circleNum(s, x, 1.38, st.n)
    s.addText(st.t, { x: x + 0.45, y: 1.33, w: 1.5, h: 0.45, fontSize: 18, bold: true, color: C.text2, margin: 0, isTextBox: true, valign: 'middle' })
    body(s, st.d, x, 1.82, w, 0.62, { fontSize: 10.5 })
    phone(s, SHOT(st.img), x + (w - pw) / 2, 2.45, ph, `${st.t} 화면`)
    if (i < 2) arrow(s, x + w + 0.02, 1.55, x + w + 0.13, 1.55, HEX.accent6, 2)
  })
  s.addNotes('그래서 저희는 기록, 비교, 요청 세 단계를 앱 하나로 연결했습니다. 출근과 퇴근은 버튼 하나로 기록하고, 나중에 그 시각을 고치면 원래 시각과 고친 이유가 함께 남습니다. 그다음 받았어야 할 돈과 실제로 받은 돈의 차이를 보여 주고, 덜 받았다면 정중한 메시지부터 내용증명 초안, 진정 절차 안내까지 단계별로 도와줍니다. 사장님 연동이나 로그인은 필요 없고, 근무 내용은 사용자 폰 안에만 저장됩니다.')
}

// 차별화 포인트
{
  const s = pres.addSlide({ masterName: 'LIGHT', sectionTitle: '③ 솔루션·핵심 가치' })
  head(s, '③ 솔루션 · 차별화 포인트', '다른 앱은 계산에서 멈추고, 알바가드는 받아내기까지')
  const pts = [
    { t: '사장 연동 없이 혼자 씀', tag: '사장 협조가 없어도', d: '근무지만 직접 등록. 사장 가입 필요 없음' },
    { t: '입금액 비교 → 차액 → 요청 · 증빙까지', tag: '문제 1 · 2 · 3의 답', d: '실제 받은 돈과 비교해 요청 문구 · 증빙까지. 네 서비스 모두 없음' },
    { t: '기록 등록: 확인 번호 + 등록 시각', tag: '문제 3의 근거', d: '기록할 때마다 확인 번호와 서버 등록 시각이 남음' },
  ]
  pts.forEach((p, i) => {
    const y = 1.4 + i * 1.12
    circleNum(s, 0.5, y + 0.05, i + 1)
    s.addText([{ text: p.t, options: { bold: true } }, { text: '   ' + p.tag, options: { fontSize: 9, bold: false, color: C.accent5 } }], { x: 1.0, y, w: 4.9, h: 0.42, fontSize: 13.5, color: C.text2, margin: 0, isTextBox: true, valign: 'middle' })
    body(s, p.d, 1.0, y + 0.46, 4.9, 0.4, { fontSize: 11.5, color: C.accent5 })
    line(s, 0.5, y + 1.08, 5.4)
  })
  // 약점 칸
  card(s, 6.4, 1.4, 3.1, 1.3, '약점 칸')
  s.addText('한계', { x: 6.65, y: 1.55, w: 2.6, h: 0.35, fontSize: 11, bold: true, color: C.accent3, margin: 0, isTextBox: true })
  s.addText('비교 기능은 하우머치가 칸 하나로 따라올 수 있음. 3번은 기록 구조 자체라 따라오기 어려움', { x: 6.65, y: 1.95, w: 2.6, h: 1.1, fontSize: 12, color: C.text1, margin: 0, isTextBox: true, valign: 'top' })
  s.addText([
    { text: '통장 내역 · 메시지와 함께 내야 설득력이 생김', options: { bold: true, color: C.text2 } },
  ], { x: 6.4, y: 2.9, w: 3.1, h: 0.7, fontSize: 10.5, color: C.text1, margin: 0, isTextBox: true, valign: 'top' })
  s.addNotes('저희 차별점은 크게 세 가지입니다. 첫 번째로, 기그와 다르게 사장님 가입 없이 혼자 쓸 수 있습니다. 두 번째로, 실제로 받은 돈과 비교해서 요청 문구와 증빙까지 이어집니다. 세 번째로, 기록할 때마다 확인 번호와 서버 등록 시각이 남습니다. 사유 없이는 기록을 고칠 수 없고, 지워도 흔적이 남고, 고치면 다시 등록됩니다. 이 부분은 다른 앱이 쉽게 따라 하기 어렵다고 생각합니다. (멈춤) 한마디로, 다른 앱은 얼마를 받아야 하는지에서 멈추고, 알바가드는 덜 받았을 때 어떻게 받아내는지까지 갑니다. 물론 한계도 있습니다. 비교 기능 자체는 다른 앱도 충분히 따라올 수 있습니다. 그리고 이 기록이 법적 효력을 보장하지는 않습니다. 통장 내역이나 메시지와 같이 내야 설득력이 생기고, 최종적인 판단은 근로감독관과 법원이 합니다.')
}

// ======================================================
// ④ 기술 아키텍처
// ======================================================
pres.addSection({ title: '④ SW 기술 아키텍처' })
{
  const s = pres.addSlide({ masterName: 'LIGHT', sectionTitle: '④ SW 기술 아키텍처' })
  head(s, '④ SW 기술 아키텍처 · 기술 스택', '기술 스택: 앱은 폰에서, 서버는 확인 번호 · 설문에만')
  const hdr = (t) => ({ text: t, options: { bold: true, color: HEX.accent5, fill: { color: HEX.lt2 }, fontSize: 11 } })
  const cell = (t, o = {}) => ({ text: t, options: { fontSize: 12.5, color: HEX.dk1, ...o } })
  const tbl = [
    [hdr('구분'), hdr('선택')],
    [cell('프런트엔드', { bold: true }), cell('React + Vite, PWA (홈 화면에 추가, 오프라인 실행)')],
    [cell('백엔드', { bold: true }), cell('별도 서버 없음 + Supabase REST')],
    [cell('데이터베이스', { bold: true }), cell('폰: localStorage(기록) · IndexedDB(사진)\n서버: Supabase PostgreSQL (stamps · survey)')],
    [cell('클라우드 · 인프라', { bold: true }), cell('GitHub Pages + GitHub Actions')],
    [cell('AI', { bold: true }), cell('Claude API (선택, 개발 환경에서만)')],
    [cell('SaaS · 분석', { bold: true }), cell('설문 페이지 + 자동 집계 페이지, 직접 인터뷰')],
  ]
  s.addTable(tbl, { x: 0.5, y: 1.35, w: 9, colW: [2.2, 6.8], rowH: [0.4, 0.5, 0.5, 0.72, 0.5, 0.5, 0.5], border: { type: 'solid', pt: 0.5, color: HEX.accent6 }, valign: 'middle', margin: [0.04, 0.1, 0.04, 0.1], objectName: '기술 스택 표' })
  s.addNotes('다음은 기술 스택입니다. 앱은 폰 안에서 돌아가고, 서버는 꼭 필요한 곳에만 씁니다. React(리액트)와 Vite(비트)로 만든 웹앱이라 앱스토어 없이 링크로 바로 설치하고, 홈 화면에 추가하면 인터넷이 없어도 열립니다. 저희가 직접 운영하는 서버는 없고, 외부 서비스인 Supabase(수파베이스)를 확인 번호 등록과 설문 수집에만 씁니다. 이렇게 한 이유는 개인정보와 비용 때문입니다.')
}

// 시스템 구성도
{
  const s = pres.addSlide({ masterName: 'LIGHT', sectionTitle: '④ SW 기술 아키텍처' })
  head(s, '④ SW 기술 아키텍처 · 시스템 구성도와 데이터 흐름', '근무 내용은 폰 안에, 서버에는 번호와 등록 시각만')
  // 폰
  s.addShape(S.roundRect, { x: 0.5, y: 1.4, w: 3.4, h: 3.45, fill: { color: C.background2 }, line: { color: C.background2, width: 0 }, rectRadius: 0.12, objectName: '폰 영역' })
  s.addText('폰 (PWA, 홈 화면에 추가)', { x: 0.7, y: 1.5, w: 3.0, h: 0.3, fontSize: 11, bold: true, color: C.text2, margin: 0, isTextBox: true })
  const box = (x, y, w, h, t, name) => {
    s.addShape(S.roundRect, { x, y, w, h, fill: { color: C.background1 }, line: { color: HEX.accent6, width: 0.75 }, rectRadius: 0.06, objectName: name })
    s.addText(t, { x: x + 0.1, y, w: w - 0.2, h, fontSize: 11, color: C.text1, margin: 0, isTextBox: true, valign: 'middle', align: 'center' })
  }
  box(0.7, 1.9, 3.0, 0.6, [{ text: '화면 (React)', options: { bold: true, breakLine: true } }, { text: '기록 · 캘린더 · 비교 · 요청', options: { fontSize: 10, color: C.accent5 } }], '화면 상자')
  arrow(s, 2.2, 2.5, 2.2, 2.72, HEX.accent5, 1)
  box(0.7, 2.72, 3.0, 0.7, [{ text: '계산 모듈', options: { bold: true, breakLine: true } }, { text: '급여 · 요청 문구 · PDF · 확인 번호', options: { fontSize: 10, color: C.accent5 } }], '계산 상자')
  arrow(s, 2.2, 3.42, 2.2, 3.64, HEX.accent5, 1)
  box(0.7, 3.64, 3.0, 0.6, [{ text: '저장', options: { bold: true, breakLine: true } }, { text: 'localStorage · IndexedDB', options: { fontSize: 10, color: C.accent5 } }], '저장 상자')
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
    { text: '확인 번호 · 등록 시각', options: { fontSize: 11.5, color: C.accent5, breakLine: true } },
    { text: '시각은 서버가 찍음', options: { fontSize: 11.5, color: C.accent5, breakLine: true } },
    { text: '앱에서 수정 · 삭제 안 됨', options: { fontSize: 11.5, color: C.accent2, bold: true } },
  ], { x: 5.68, y: 1.5, w: 1.9, h: 2.25, fontSize: 12.5, color: C.text1, margin: 0, isTextBox: true, valign: 'top', paraSpaceAfter: 2 })
  // 확인 페이지
  arrow(s, 6.62, 4.0, 6.62, 3.82, HEX.accent1, 1.25)
  s.addText('등록 시각 조회', { x: 6.72, y: 3.75, w: 1.1, h: 0.3, fontSize: 9, color: C.text2, margin: 0, isTextBox: true, valign: 'middle' })
  s.addShape(S.roundRect, { x: 5.55, y: 4.0, w: 2.15, h: 0.85, fill: { color: C.background2 }, line: { color: C.background2, width: 0 }, rectRadius: 0.1, objectName: '확인 페이지 상자' })
  s.addText([
    { text: '확인 페이지 (verify.html)', options: { bold: true, color: C.text2, breakLine: true } },
    { text: '누구나 번호로 등록 시각 확인', options: { fontSize: 10, color: C.accent5 } },
  ], { x: 5.68, y: 4.05, w: 1.9, h: 0.78, fontSize: 11, color: C.text1, margin: 0, isTextBox: true, valign: 'middle' })
  // 데이터 흐름
  s.addText('기록 하나가 남을 때', { x: 7.9, y: 1.4, w: 1.7, h: 0.3, fontSize: 10.5, bold: true, color: C.text2, margin: 0, isTextBox: true })
  const flow = ['출근 · 퇴근마다 등록', '고치면 다시 등록', '끊기면 나중에 전송']
  flow.forEach((f, i) => {
    circleNum(s, 7.9, 1.82 + i * 0.95, i + 1, { size: 0.26, fontSize: 9 })
    s.addText(f, { x: 8.22, y: 1.76 + i * 0.95, w: 1.35, h: 0.85, fontSize: 10, color: C.text1, margin: 0, isTextBox: true, valign: 'top' })
  })
  s.addNotes('이건 전체 구성도입니다. 계산과 저장은 모두 왼쪽 폰 안에서 끝납니다. 서버로 가는 건 확인 번호와 기록 번호, 무작위 기기 번호뿐이고, 근무지나 시각, 금액은 보내지 않습니다. 등록 시각은 서버가 직접 찍기 때문에 폰 시계를 바꿔도 소용이 없습니다. 실제로 2000년이라는 가짜 시각을 넣어 보내 봤는데, 서버는 그 시각을 무시하고 받은 순간의 시각으로 저장했습니다. 등록된 기록을 고치거나 지우려고 해도 서버가 막았습니다. 다만 운영자 권한으로는 고칠 수 있어서, 지금 막을 수 있는 건 사용자가 나중에 기록을 고쳐 쓰는 것까지입니다. (멈춤) 다시 말해, 근무 내용은 폰 밖으로 나가지 않고, 서버에는 번호 세 개와 서버가 찍은 등록 시각만 남습니다.')
}

// ======================================================
// ⑤ 개발 현황
// ======================================================
pres.addSection({ title: '⑤ 개발 현황·MVP 시연' })
// UI 화면
{
  const s = pres.addSlide({ masterName: 'LIGHT', sectionTitle: '⑤ 개발 현황·MVP 시연' })
  head(s, '⑤ 개발 현황 · MVP 화면   ·   예시 데이터, 2026.10.27 기준', '모두 실제로 동작하는 화면: 지금 배포 주소에서 바로 열림')
  const shots = [
    ['2-calendar.jpg', '캘린더', '예정과 다른 날만 글자로\n(연장 · 대타 · 단축)'],
    ['10-settings.jpg', '설정', '기록 등록 건수 · 백업\n무엇이 서버로 가는지'],
    ['8-evidence.jpg', '증빙 묶음 PDF', '기록 · 수정 이력 · 계산\n입금 · 사진 · 등록 확인'],
    ['9-verify.jpg', '확인 페이지', '확인 번호 → 서버 등록 시각'],
  ]
  const ph = 3.3, pw = ph * 1240 / 2673, gap = (9 - 4 * pw) / 3
  shots.forEach(([img, t, d], i) => {
    const x = 0.5 + i * (pw + gap)
    phone(s, SHOT(img), x, 1.28, ph, t)
    s.addText(t, { x: x - 0.2, y: 4.6, w: pw + 0.4, h: 0.3, fontSize: 11.5, bold: true, color: C.text2, margin: 0, isTextBox: true, align: 'center' })
    s.addText(d, { x: x - 0.25, y: 4.88, w: pw + 0.5, h: 0.4, fontSize: 9, color: C.accent5, margin: 0, isTextBox: true, align: 'center', valign: 'top' })
  })
  s.addNotes('실제 앱 화면입니다. 이 중 캘린더는 영상에 나오지 않아서 먼저 말씀드리면, 예정과 다르게 일한 날, 예를 들어 연장이나 대타를 글자로 따로 표시합니다. 나머지 설정, 증빙 묶음 PDF, 확인 페이지는 잠시 뒤 영상에서 실제로 쓰는 모습으로 보여 드리겠습니다.')
}

// 시연 순서
{
  const s = pres.addSlide({ masterName: 'LIGHT', sectionTitle: '⑤ 개발 현황·MVP 시연' })
  head(s, '⑤ MVP 시연', '시연 순서: 배포된 앱을 녹화한 영상')
  const steps = [
    ['출근 · 퇴근 → 사유를 써서 수정 → 설정에서 "3건 등록됨"', '기록하거나 고칠 때마다 서버에 확인 번호가 남음. 예시 데이터는 등록되지 않아 시연 중 남긴 3건만 보임'],
    ['첫 화면 "9월 급여 받으셨나요?" → 받은 금액 입력', '덜 받은 돈이 빨간 숫자로 바뀜'],
    ['요청 메시지 (3개월 합계) → 진정 안내 → 증빙 묶음 PDF', '날짜별 기록과 계산 근거가 들어간 정중한 문구. 진정은 1350 · 노동포털로 연결만. PDF 7번 표에 확인 번호'],
    ['확인 페이지에 확인 번호 → 서버 등록 시각', '앱 밖의 별도 페이지. 제3자도 열 수 있음'],
  ]
  steps.forEach(([t, d], i) => {
    const y = 1.45 + i * 0.86
    circleNum(s, 0.5, y + 0.06, i + 1)
    s.addText(t, { x: 0.98, y, w: 8.5, h: 0.42, fontSize: 13, bold: true, color: C.text2, margin: 0, isTextBox: true, valign: 'middle' })
    s.addText(d, { x: 0.98, y: y + 0.4, w: 8.5, h: 0.4, fontSize: 10, color: C.accent5, margin: 0, isTextBox: true, valign: 'top' })
  })
  s.addNotes('이어서 보실 영상은 배포된 앱을 직접 눌러 보면서 녹화한 것입니다. 순서는 화면의 네 단계 그대로이고, 영상 안에 단계마다 자막이 있어서 멈추지 않고 그대로 보여 드리겠습니다.')
}

// 시연 영상 (한 장 전체)
{
  const s = pres.addSlide({ masterName: 'LIGHT_PLAIN', sectionTitle: '⑤ 개발 현황·MVP 시연' })
  s.addMedia({ type: 'video', path: path.join(PROJ, 'docs/08_시연_영상.mp4'), cover: 'image/png;base64,' + fs.readFileSync(path.join(PROJ, 'docs/report_src/demo_cover.png')).toString('base64'), x: 0, y: 0, w: 10, h: 5.625, objectName: '시연 영상' })
  s.addNotes('(재생 전) 마지막 장면에 나오는 등록 시각을 잘 봐 주세요. 지금도 서버에 그대로 남아 있는 값입니다.\n(영상은 멈추지 않고 끝까지 틉니다)\n(영상이 끝나면) 이렇게 출근 기록부터 사장님께 보낼 메시지, 확인 페이지까지 앱 하나로 모두 할 수 있습니다.')
}

{
  const s = pres.addSlide({ masterName: 'LIGHT', sectionTitle: '⑤ 개발 현황·MVP 시연' })
  head(s, '⑤ 개발 현황 · 구현된 기능과 계획 대비 비율', 'MVP 기능 8개 모두 동작, 완성도 평균 약 80%')
  const feats = [
    ['근무 기록 (수정 이력 · 퇴근 누락 보호)', 90, '실제 폰 장기 사용'],
    ['캘린더 (예정 vs 실제, 연장 · 대타)', 85, '반복 스케줄 입력'],
    ['급여 계산 (주휴 · 야간 · 최저임금)', 85, '연장근로 가산'],
    ['입금액 비교 · 차액 알림', 80, '매달 넣을지 검증(16쪽 1행)'],
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
    { text: '정의서 기능 8개      ', options: {} },
    { text: '% 기준  ', options: { bold: true, color: C.text2 } },
    { text: '남은 일만큼 뺀 자체 평가', options: {} },
  ], { x: 0.5, y: 4.85, w: 9, h: 0.32, fontSize: 10.5, color: C.text1, margin: 0, isTextBox: true, valign: 'middle' })
  s.addNotes('방금 보신 기능을 포함해서, 계획한 8개 기능은 모두 동작합니다. 그래도 100%라고 쓰지는 않았습니다. 오른쪽 동그라미 세 칸은 각각 컴퓨터에서 동작, 실제 폰에서 확인, 사용자 검증인데요. 지금은 첫 번째 칸인 컴퓨터에서 동작하는 것까지만 확인했고, 나머지 두 칸은 11월에 진행할 예정입니다. 그래서 완성도를 평균 80% 정도로 잡았습니다. 지금까지 문제와 해결 방법, 그리고 실제로 동작하는 모습을 보셨습니다. 다음으로 시장과 수익 부분은 손유호 팀원이 이어서 발표하겠습니다.')
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
    ['67.8%', '2025년 체불액 중 30인 미만 사업장 (1조 4,012억 원). 카페 · 편의점 · 음식점은 대개 여기 속함. 알바생 몫은 따로 알 수 없음', C.accent3],
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
    { text: '재적학생 307만 명 → 알바 경험 67~89% → 상한 약 210~270만 명', options: { breakLine: true } },
    { text: '타이밍  ', options: { bold: true, color: C.text2 } },
    { text: '2025.9 근절 대책 · 2025.10.23 개정 근로기준법 시행', options: {} },
  ], { x: 0.5, y: 4.62, w: 9, h: 0.58, fontSize: 10.5, color: C.text1, margin: 0, isTextBox: true, valign: 'top', paraSpaceAfter: 1 })
  s.addNotes('안녕하세요, 시장과 수익 부분을 맡은 손유호입니다. 먼저 임금체불 규모를 보면, 2023년 1조 7천억 원대에서 2년 연속 2조 원을 넘었습니다. 작년 체불액만 보면 67.8%가 30인 미만 사업장에서 나왔는데요, 알바생이 많이 일하는 카페, 편의점, 음식점이 대부분 이 규모입니다. 저희 타깃 규모는 대학 재적생 307만 명 중 알바 경험이 있는 사람으로 어림해서, 많아야 210만에서 270만 명 정도로 봤습니다. 지금 알바 중인 사람이나 주 15시간 이상 일하는 사람은 공식 통계가 없어서 설문으로 확인하고 있습니다. 또 작년 9월 임금체불 근절 대책과 10월 개정 근로기준법으로 체불에 대한 제재도 더 강해졌습니다.')
}

// 경쟁 포지션
{
  const s = pres.addSlide({ masterName: 'LIGHT', sectionTitle: '⑥ 시장 분석·비즈니스 모델' })
  head(s, '⑥ 시장 분석 · 경쟁사', '혼자 쓰면서 대응까지 가는 서비스는 알바가드뿐')
  const ox = 1.0, oy = 1.42, W = 5.3, H = 3.35
  s.addShape(S.rect, { x: ox, y: oy, w: W, h: H, fill: { color: C.background2 }, line: { color: C.background2, width: 0 }, objectName: '포지션 바탕' })
  s.addShape(S.rect, { x: ox, y: oy, w: W / 2, h: H / 2, fill: { color: C.accent1, transparency: 88 }, line: { color: C.accent1, width: 0 }, objectName: '알바가드 칸' })
  s.addShape(S.line, { x: ox + W / 2, y: oy, w: 0, h: H, line: { color: HEX.accent6, width: 1 } })
  s.addShape(S.line, { x: ox, y: oy + H / 2, w: W, h: 0, line: { color: HEX.accent6, width: 1 } })
  // 축 이름은 바깥에
  s.addText('← 혼자 씀', { x: ox, y: oy + H + 0.06, w: 2.4, h: 0.28, fontSize: 10, bold: true, color: C.accent5, margin: 0, isTextBox: true })
  s.addText('사장 가입 · 증거가 먼저 →', { x: ox + W - 2.6, y: oy + H + 0.06, w: 2.6, h: 0.28, fontSize: 10, bold: true, color: C.accent5, margin: 0, isTextBox: true, align: 'right' })
  s.addText('대응까지', { x: ox - 0.95, y: oy + 0.62, w: 1.6, h: 0.3, fontSize: 10, bold: true, color: C.accent5, margin: 0, isTextBox: true, rotate: 270, align: 'center' })
  s.addText('계산까지', { x: ox - 0.95, y: oy + H - 0.92, w: 1.6, h: 0.3, fontSize: 10, bold: true, color: C.accent5, margin: 0, isTextBox: true, rotate: 270, align: 'center' })
  const chip = (x, y, t, sub, main, w = 1.9) => {
    const h = 0.64
    s.addShape(S.roundRect, { x, y, w, h, fill: { color: main ? C.accent1 : C.background1 }, line: { color: main ? C.accent1 : HEX.accent6, width: 1 }, rectRadius: 0.08, objectName: `${t} 칩` })
    s.addText([{ text: t, options: { bold: true, breakLine: true } }, { text: sub, options: { fontSize: 9, color: main ? C.background2 : C.accent5 } }],
      { x: x + 0.08, y, w: w - 0.16, h, fontSize: main ? 12 : 10.5, color: main ? C.background1 : C.text1, margin: 0, isTextBox: true, valign: 'middle', align: 'center' })
  }
  chip(ox + 0.35, oy + 0.42, '알바가드', '기록 → 비교 → 요청 → 증빙', true, 1.95)
  chip(ox + 3.05, oy + 0.42, '진정24 · 노동포털', '증거가 있어야 시작')
  chip(ox + 0.35, oy + 1.85, '하우머치', '혼자 기록, 예상 급여까지', false, 1.95)
  chip(ox + 3.05, oy + 2.2, '기그', '사장 연동 필요')
  chip(ox + 0.3, oy + 2.58, '알바천국 · 알바몬 계산기', '일회성 계산, 기록 없음', false, 2.05)
  // 하우머치 → 알바가드: 따라올 수 있는 길
  s.addShape(S.line, { x: ox + 1.32, y: oy + 1.1, w: 0, h: 0.72, flipV: true, line: { color: HEX.accent2, width: 1.5, dashType: 'dash', endArrowType: 'triangle' }, objectName: '따라올 길' })
  s.addText('비교 기능을 넣으면?', { x: ox + 1.42, y: oy + 1.28, w: 1.3, h: 0.3, fontSize: 9, bold: true, color: C.accent2, margin: 0, isTextBox: true })
  // 오른쪽: 가장 가까운 경쟁자
  const rx = 6.85
  s.addText('가장 가까운 경쟁자', { x: rx, y: 1.45, w: 2.8, h: 0.3, fontSize: 10, bold: true, color: C.accent5, margin: 0, isTextBox: true })
  s.addText('하우머치', { x: rx, y: 1.75, w: 2.8, h: 0.5, fontSize: 20, bold: true, color: C.text1, margin: 0, isTextBox: true })
  s.addShape(S.line, { x: rx, y: 2.35, w: 2.7, h: 0, line: { color: HEX.accent6, width: 1 } })
  s.addText([
    { text: '혼자 기록하고 예상 급여까지 보여 줌', options: { breakLine: true } },
    { text: '실제 받은 돈 비교 칸만 넣으면'+'\n'+'따라올 수 있음', options: { breakLine: true } },
  ], { x: rx, y: 2.45, w: 2.75, h: 1.0, fontSize: 11, color: C.text1, margin: 0, isTextBox: true, valign: 'top', paraSpaceAfter: 6 })
  s.addShape(S.rect, { x: rx, y: 3.55, w: 0.06, h: 0.8, fill: { color: C.accent1 }, line: { color: C.accent1, width: 0 } })
  s.addText([
    { text: '그래서 키우는 것', options: { bold: true, color: C.accent1, breakLine: true } },
    { text: '따라 하기 어려운 기록 등록'+'\n'+'(확인 번호 · 등록 시각)', options: {} },
  ], { x: rx + 0.18, y: 3.55, w: 2.6, h: 0.9, fontSize: 11, color: C.text1, margin: 0, isTextBox: true, valign: 'top' })
  s.addNotes('다음은 경쟁 서비스들의 위치입니다. 가로는 사장님 없이 혼자 쓸 수 있는지, 세로는 계산에서 멈추는지 대응까지 가는지입니다. 앞에서 본 서비스들을 이 위에 놓아 보면, 혼자 쓰면서 대응까지 가는 왼쪽 위 칸에는 알바가드만 있습니다. 가장 가까운 건 혼자 기록할 수 있는 하우머치인데, 하우머치가 비교 기능을 넣으면 따라올 수 있습니다. 그래서 저희는 따라 하기 어려운 기록 등록 쪽을 더 키우려고 합니다.')
}

// 비즈니스 모델
{
  const s = pres.addSlide({ masterName: 'LIGHT', sectionTitle: '⑥ 시장 분석·비즈니스 모델' })
  head(s, '⑥ 비즈니스 모델 · 유저 확보 전략', '핵심 화면은 무료, 수익은 게임 화면 광고(가설)')
  s.addText('출퇴근은 일하는 날마다, 돈 확인은 급여일에 한 번. 그 사이 열 이유로 게임 = 광고 자리', { x: 0.5, y: 1.28, w: 9, h: 0.32, fontSize: 11, color: C.text1, margin: 0, isTextBox: true, valign: 'middle' })
  rows(s, 0.5, 1.65, 9, [
    { label: '핵심 화면: 기록 · 비교 · 요청 · 증빙', value: '무료 · 광고 없음', color: C.accent2, bold: true },
    { label: '1차 (가설): 쉬는 틈 게임 화면 광고', value: '게임 화면만', color: C.text2, bold: true },
    { label: '2차 (후보): 동기화 · 자동 백업 구독', value: '구독', color: C.text2, bold: true },
    { label: '하지 않는 것: 문서 유료화 · 찾은 돈 수수료(성공 보수)', value: '법 문제로 안 함', color: C.accent3, labelColor: C.accent3, bold: true },
  ], { rowH: 0.56, labelSize: 14, valueSize: 14, valueW: 0.2 })
  s.addText('유저 확보', { x: 0.5, y: 4.15, w: 1.3, h: 0.35, fontSize: 10.5, bold: true, color: C.text2, margin: 0, isTextBox: true })
  s.addText('에브리타임 · 학과 단톡 · 알바 커뮤니티에 링크, 쇼츠 · 릴스(짧은 영상)', { x: 1.8, y: 4.15, w: 7.7, h: 0.38, fontSize: 11, color: C.text1, margin: 0, isTextBox: true, valign: 'top' })
  s.addText('지표 (앞으로)', { x: 0.5, y: 4.6, w: 1.3, h: 0.35, fontSize: 10.5, bold: true, color: C.text2, margin: 0, isTextBox: true })
  s.addText('홈 화면 추가 → 첫 기록 → 받은 금액 입력 → 차액 발견 → 요청 보냄 → 실제로 받음 (인터뷰)', { x: 1.8, y: 4.6, w: 7.7, h: 0.35, fontSize: 11, bold: true, color: C.text2, margin: 0, isTextBox: true, valign: 'top' })
  s.addNotes('다음은 비즈니스 모델입니다. 기록, 비교, 요청, 증빙 같은 핵심 화면은 무료이고, 앞으로도 광고를 넣지 않습니다. 사용자가 믿고 써야 하는 화면이기 때문입니다. 1차 수익 가설은 쉬는 틈 게임 화면의 광고입니다. 출퇴근 버튼은 일하는 날마다 누르지만, 돈을 확인하는 건 급여일 한 번뿐입니다. 그래서 그 사이에도 앱을 열 이유로, 출퇴근길 같은 쉬는 틈에 가볍게 할 수 있는 게임을 넣었습니다. 이 게임 화면을 광고 자리로 보고 있습니다. 2차 후보는 폰을 바꿔도 기록이 남는 동기화와 자동 백업 구독입니다. 반대로 정산 문구나 증빙 문서를 돈을 받고 만들어 주면 변호사법이나 공인노무사법 문제가 생길 수 있어서 유료화하지 않습니다. 찾은 돈에서 일정 비율을 수수료로 받는 방식도 검토했지만, 돈을 받고 임금을 받아 내는 일을 돕는 셈이라 같은 법 문제가 생길 수 있고, 사용자가 실제로 돈을 받았는지 앱이 알 수도 없어서 하지 않습니다. 사용자는 에브리타임, 학과 단톡방, 알바 커뮤니티, 그리고 유튜브 쇼츠나 인스타 릴스 같은 짧은 영상으로 모을 계획입니다. 주 15시간 이상 일하는 사람이 얼마나 되는지는 설문으로 확인하고 있고, 그 결과와 검증 계획은 박명진 팀원이 이어서 설명하겠습니다.')
}

// ======================================================
// ⑦ 초기 시장 검증
// ======================================================
pres.addSection({ title: '⑦ 초기 시장 검증' })
{
  const s = pres.addSlide({ masterName: 'LIGHT', sectionTitle: '⑦ 초기 시장 검증' })
  head(s, '⑦ 초기 시장 검증 성과와 계획', '검증: 설문 13명 중간 결과, 11월에 다섯 가지 확인')
  s.addText([
    { text: '가설  ', options: { bold: true, color: C.text2 } },
    { text: '알바생은 자신의 근무 기록을 근거로 한 정산 요청 문구가 있으면, 사장에게 말을 꺼낼 수 있다고 느끼고 쓸 것', options: {} },
  ], { x: 0.5, y: 1.3, w: 9, h: 0.35, fontSize: 11, color: C.text1, margin: 0, isTextBox: true, valign: 'middle' })
  const th = (t) => ({ text: t, options: { bold: true, color: HEX.accent5, fill: { color: HEX.lt2 }, fontSize: 11 } })
  const td = (t, o = {}) => ({ text: t, options: { fontSize: 12.5, color: HEX.dk1, ...o } })
  const ok = (t) => td(t, { color: HEX.accent2, bold: true })
  const wait = (t) => td(t, { color: HEX.accent5 })
  s.addTable([
    [th('11월에 확인할 것 (설문 30명 · 인터뷰 5명)'), th('중간 결과 (설문 13명)')],
    [td('매달 받은 금액을 직접 넣음', { bold: true }), ok('11명 "넣겠다"')],
    [td('요청 문구를 실제로 보낼 수 있음', { bold: true }), wait('가장 쓸모 0명\n11월 인터뷰')],
    [td('확인 번호 설명이 이해됨', { bold: true }), wait('가장 쓸모 0명\n11월 인터뷰')],
    [td('타깃 중 주 15시간 이상이 다수', { bold: true }), wait('알바 중 2명, 보류')],
    [td('게임 화면 광고를 받아들임', { bold: true }), ok('"싫다" 4명\n안 쓸 기능 1위(6명)')],
  ], { x: 0.5, y: 1.85, w: 9, colW: [5.2, 3.8], rowH: [0.42, 0.52, 0.52, 0.52, 0.52, 0.52], border: { type: 'solid', pt: 0.5, color: HEX.accent6 }, valign: 'middle', margin: [0.02, 0.08, 0.02, 0.08], objectName: '검증 계획 표' })
  s.addText('10/26 기준 · 지금 알바 중 2 · 예전에 했음 10 · 한 적 없음 1 · 지인 중심이라 정식 조사 아님 · 사람 수로만 표기', { x: 0.5, y: 4.95, w: 9, h: 0.25, fontSize: 9.5, color: C.accent5, margin: 0, isTextBox: true })
  s.addNotes('안녕하세요, 검증 부분을 맡은 박명진입니다. 저희 가설은 이렇습니다. "근무 기록을 근거로 한 요청 문구가 있으면, 알바생이 사장님께 말을 꺼낼 수 있다고 느끼고 실제로 쓸 것이다." 11월에 설문 30명과 인터뷰 5명으로, 이 가설을 표의 다섯 가지로 나눠 확인하려고 합니다. 기준도 정해 뒀습니다. 예를 들어 인터뷰 5명 중 3명이 실제로 보내겠다고 하면 통과이고, 못 미치면 문구와 단계를 다시 짭니다. 자세한 기준은 보고서에 있습니다. 오른쪽 끝 칸은 10월 26일까지 받은 설문 13명의 중간 결과입니다. 매달 받은 금액을 넣겠다는 사람이 13명 중 11명이었고, 게임 화면 광고가 싫다는 사람은 13명 중 4명이었습니다. 다만 아직 지인 위주라 정식 조사라고 보기는 어렵고, 지금 알바 중인 사람이 2명뿐이라 주 15시간 기준은 판단을 미뤘습니다. 저희한테 불리한 결과도 있었습니다. 정산 요청 메시지와 기록 등록을 가장 쓸모 있는 기능으로 고른 사람은 한 명도 없었고, 미니게임은 안 쓸 것 같은 기능 1위였습니다. (멈춤) 정리하면, 비교 기능은 원했지만 요청 기능의 가치는 아직 못 느꼈습니다. 11월 인터뷰에서는 요청 문구와 확인 번호를 직접 보여 주고, 바로 이 부분을 확인하겠습니다.')
}

// ======================================================
// ⑧ 향후 계획·팀 역량
// ======================================================
pres.addSection({ title: '⑧ 향후 계획·팀 역량' })
{
  const s = pres.addSlide({ masterName: 'LIGHT', sectionTitle: '⑧ 향후 계획·팀 역량' })
  head(s, '⑧ 향후 계획 · 간트 차트', '기말(12/8)까지 세 단계: 검증 → 반영 · 폰 확인 → 마무리')
  const weeks = ['10/27', '11/3', '11/10', '11/17', '11/24', '12/1']  // 기말 12/8은 마지막 주가 끝나는 오른쪽 끝
  const tasks = [
    ['설문 30명 수집 · 집계', '손유호', 0, 2],
    ['직접 인터뷰 5명', '손유호 3 · 박명진 2', 1, 1],
    ['피드백 반영 1차', '이지훈', 2, 3],
    ['실제 폰 검증 (아이폰 · 갤럭시)', '이지훈 · 박명진', 2, 4],
    ['기록 등록 보강', '이지훈', 3, 4],
    ['광고 실험 또는 새 게임 (11/23 결정)', '손유호 · 이지훈', 4, 4],
    ['최종 보고서 · 발표 준비', '전원', 5, 5],
  ]
  const lx = 0.5, lw = 2.95, ax = 3.5, aw = 1.2, gx = 4.75, cw = (9.5 - 4.75) / weeks.length, hy = 1.35, rh = 0.38
  // 마일스톤
  const ms = [[2, '11/9 인터뷰 · 설문 1차'], [4, '11/23 반영 배포'], [5, '11/30 폰 검증 · 동결'], [6, '12/8 기말']]
  const my = hy + 0.42
  s.addShape(S.line, { x: gx, y: my + 0.07, w: weeks.length * cw, h: 0, line: { color: HEX.accent6, width: 0.5, dashType: 'dash' } })
  ms.forEach(([col, t], i) => {
    const x = gx + col * cw
    s.addShape(S.diamond, { x: x - 0.07, y: my, w: 0.14, h: 0.14, fill: { color: C.accent3 }, line: { color: C.accent3, width: 0 }, objectName: `마일스톤 ${i + 1}` })
    const edge = col === weeks.length  // 오른쪽 끝(기말)은 글자가 판 밖으로 나가지 않게 오른쪽 맞춤
    s.addText(t, { x: edge ? x - 1.43 : x - 0.75, y: my + 0.14 + (i % 2) * 0.19, w: 1.5, h: 0.2, fontSize: 9, color: C.accent3, bold: true, margin: 0, isTextBox: true, align: edge ? 'right' : 'center', valign: 'top' })
  })
  s.addText('마일스톤', { x: lx, y: my - 0.05, w: 1.5, h: 0.25, fontSize: 9.5, bold: true, color: C.accent3, margin: 0, isTextBox: true })
  weeks.forEach((w, i) => s.addText(w, { x: gx + i * cw, y: hy, w: cw, h: 0.3, fontSize: 10, bold: true, color: C.accent5, margin: 0, isTextBox: true, align: 'center' }))
  // 끝 날짜(기말 12/8)도 맨 위 줄에. 오른쪽 끝 ◆ 위, 12/1과 겹치지 않게 조금 오른쪽 (사용자가 PowerPoint에서 잡은 자리)
  s.addText('12/8', { x: 9.2019, y: hy, w: cw, h: 0.3, fontSize: 10, bold: true, color: C.accent5, margin: 0, isTextBox: true, align: 'center' })
  s.addText('담당', { x: ax, y: hy, w: aw, h: 0.3, fontSize: 10, bold: true, color: C.accent5, margin: 0, isTextBox: true })
  line(s, lx, hy + 0.32, 9)
  tasks.forEach(([t, who, a, b], i) => {
    const y = hy + 0.95 + i * rh
    s.addText(t, { x: lx, y, w: lw, h: rh, fontSize: 11, color: C.text1, margin: 0, isTextBox: true, valign: 'middle' })
    s.addText(who, { x: ax, y, w: aw, h: rh, fontSize: 9.5, color: C.accent5, margin: 0, isTextBox: true, valign: 'middle' })
    for (let k = 0; k < weeks.length; k++) s.addShape(S.line, { x: gx + k * cw, y, w: 0, h: rh, line: { color: HEX.accent6, width: 0.5 } })
    s.addShape(S.roundRect, { x: gx + a * cw + 0.05, y: y + 0.12, w: (b - a + 1) * cw - 0.1, h: rh - 0.24, fill: { color: i === 6 ? C.accent2 : C.accent1 }, line: { color: i === 6 ? C.accent2 : C.accent1, width: 0 }, rectRadius: 0.06, objectName: `${t} 막대` })
    line(s, lx, y + rh, 9)
  })
  s.addText('중간발표 10/27 (화) → 기말 발표 12/8 (화) 예정', { x: 0.5, y: 4.98, w: 9, h: 0.24, fontSize: 9.5, color: C.accent5, margin: 0, isTextBox: true })
  s.addNotes('다음은 기말 발표인 12월 8일까지 6주 일정입니다. 빨간 마름모가 주요 마일스톤인데, 크게 세 단계로 보시면 됩니다. 11월 초에는 인터뷰와 설문으로 검증하고, 11월 말까지 그 결과를 반영해 다시 배포하면서 실제 폰에서도 확인합니다. 그동안 팀장은 앞에서 말씀드린 기록 등록 보강, 그러니까 기록 내용으로 확인 번호를 다시 맞춰 보는 기능을 만듭니다. 12월 1일부터는 기능을 더 고치지 않고 보고서와 발표 준비에 집중할 예정입니다. 인터뷰는 손유호 팀원이 3명, 제가 2명을 맡고, 갤럭시 폰 검증도 제가 맡았습니다.')
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
  s.addText('앞으로 맡을 일은 오늘 각자 발표한 부분과 같음', { x: 0.6, y: 4.3, w: 8.8, h: 0.4, fontSize: 12, color: C.background2, margin: 0, isTextBox: true })
  s.addNotes('다음은 팀원별 역할입니다. 보시는 것처럼 앞으로 맡을 일은 오늘 각자 발표한 부분과 같습니다. 이지훈 팀장은 개발, 손유호 팀원은 시장과 수익, 저는 검증과 일정을 맡습니다. 그럼 마무리는 이지훈 팀장이 하겠습니다.')
}

// 18장: 질의응답 대기 화면
{
  const s = pres.addSlide({ masterName: 'DARK', sectionTitle: '⑧ 향후 계획·팀 역량' })
  s.addText('못 받은 알바비, 기록으로 찾는 앱', { placeholder: 'title' })
  rows_dark(s)
  function rows_dark(sl) {
    const items = [['배포됨', 'jihooni217.github.io/albaguard\n시연 기록 확인 번호 289ad066f1632c51'], ['기능 8 / 8 동작', '완성도 평균 약 80% · 설문 13명 응답'], ['11월', '링크 설문 30명 + 직접 인터뷰 5명']]
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
  s.addText('설문에 답해 주시면 기말 발표에 큰 도움이 됩니다', { x: 0.6, y: 4.35, w: 8.8, h: 0.4, fontSize: 13, color: C.background2, margin: 0, isTextBox: true })
  s.addText('감사합니다', { x: 0.6, y: 4.75, w: 8.8, h: 0.4, fontSize: 14, bold: true, color: C.background1, margin: 0, isTextBox: true })
  s.addNotes([
    '팀장 마무리: (멈춤) 다시 한번 말씀드리면, 다른 앱은 얼마를 받아야 하는지에서 멈추지만, 알바가드는 덜 받았을 때 어떻게 받아내는지까지 갑니다. 처음에 보여 드린 금액처럼, 통장만 봐서는 보이지 않던 돈을 기록으로 찾아 주려고 만든 앱입니다. 화면의 QR로 설문에 답해 주시면, 기말 발표 결과에 큰 도움이 될 것 같습니다. 이상으로 4조 발표를 마치겠습니다. 들어 주셔서 감사합니다. 질문 받겠습니다.',
  ].join('\n'))
}

;(async () => {
  await pres.writeFile({ fileName: OUT })
  await applyTheme(OUT, THEME)
  console.log('written', OUT)
})().catch((e) => { console.error(e); process.exit(1) })
