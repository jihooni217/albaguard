// 알바가드 중간 발표 PPT 생성 (pptxgenjs)
const pptxgen = require('pptxgenjs')
const path = require('path')
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
pres.title = '알바가드 중간 발표'
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
  s.addText('팀명 후보', { x: 6.7, y: 1.55, w: 2.8, h: 0.3, fontSize: 10, bold: true, color: C.background2, margin: 0, isTextBox: true })
  s.addText('기록조 · 온타임 · 페이체크 · 알바가드팀', { x: 6.7, y: 1.85, w: 2.8, h: 0.6, fontSize: 12.5, bold: true, color: C.background1, margin: 0, isTextBox: true })
  s.addText('발표 뒤 하나로 정합니다', { x: 6.7, y: 2.45, w: 2.8, h: 0.3, fontSize: 9.5, color: C.background2, margin: 0, isTextBox: true })
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
  s.addNotes('팀장이 엽니다. "알바비를 덜 받아도 모르고, 알아도 말을 못 하는 대학생을 위해, 기록 → 비교 → 요청까지 한 앱으로 잇는 알바가드입니다." 팀명은 후보 네 개를 보여 주고 발표 뒤 정한다고 말합니다.')
}

// ② 팀 소개·역할
{
  const s = pres.addSlide({ masterName: 'LIGHT', sectionTitle: '① 표지·팀 소개' })
  head(s, '① 팀 소개', '역할 분담: 맡는 일과 발표 파트를 같게')
  body(s, '알바생 혼자 출퇴근을 기록하고, 받은 돈과 비교해 덜 받은 돈을 찾고, 사장님께 보낼 요청 문구와 증빙 자료까지 만들어 주는 모바일 웹앱', 0.5, 1.3, 9, 0.5)
  const members = [
    ['이지훈', '팀장', ['기획 · 개발 · 배포 · 문서 (지금까지)', '기록 등록 보강, 기술 검증 (앞으로)'], '① ~ ⑤ + 앱 시연'],
    ['손유호', '팀원', ['시장 · 경쟁사 조사', '비즈니스 모델, 설문 집계'], '⑥ 시장 분석 · 비즈니스 모델'],
    ['박명진', '팀원', ['사용자 인터뷰 · 검증', '일정 관리, 보고서 편집, 갤럭시 테스트'], '⑦ 초기 검증 · ⑧ 향후 계획'],
  ]
  const hy = 1.85
  ;[['이름', 0.5, 1.7], ['맡는 일', 2.2, 4.4], ['발표', 6.8, 2.7]].forEach(([t, x, w]) => s.addText(t, { x, y: hy, w, h: 0.3, fontSize: 9.5, bold: true, color: C.accent5, margin: 0, isTextBox: true }))
  line(s, 0.5, hy + 0.32, 9)
  members.forEach(([n, r, jobs, talk], i) => {
    const y = hy + 0.4 + i * 0.95
    s.addText([{ text: n, options: { bold: true, fontSize: 17, color: C.text2, breakLine: true } }, { text: r, options: { fontSize: 10, color: C.accent5 } }], { x: 0.5, y, w: 1.7, h: 0.85, margin: 0, isTextBox: true, valign: 'middle' })
    s.addText(jobs.map((j, k) => ({ text: j, options: { breakLine: k < jobs.length - 1 } })), { x: 2.2, y, w: 4.4, h: 0.85, fontSize: 11.5, color: C.text1, margin: 0, isTextBox: true, valign: 'middle', paraSpaceAfter: 3 })
    s.addText(talk, { x: 6.8, y, w: 2.7, h: 0.85, fontSize: 11.5, bold: true, color: C.text2, margin: 0, isTextBox: true, valign: 'middle' })
    line(s, 0.5, y + 0.9, 9)
  })
  s.addNotes('지금까지는 팀장이 기획·개발을 맡았고, 10/27부터 팀원이 시장·검증·일정을 맡습니다. 각자 발표하는 장이 앞으로 맡는 일과 같습니다. 솔직하게 말합니다.')
}

// ======================================================
// ② 문제 정의
// ======================================================
pres.addSection({ title: '② 문제 정의' })
{
  const s = pres.addSlide({ masterName: 'LIGHT', sectionTitle: '② 문제 정의' })
  head(s, '② 문제 정의 · 페인 포인트', '덜 받아도 모르고, 알아도 말하지 못한다')
  card(s, 0.5, 1.3, 9, 0.62, '타겟 칸')
  s.addText([
    { text: '타겟  ', options: { bold: true, color: C.text2 } },
    { text: '주 15시간 이상 일하는 만 19~26세 시급제 알바 대학생 (카페 · 편의점 · 음식점). 근로계약서가 없거나 사본이 없고, 통장 총액만 확인하고, 사장님께 말을 꺼내기 부담스러워한다', options: {} },
  ], { x: 0.7, y: 1.3, w: 8.6, h: 0.62, fontSize: 11.5, color: C.text1, margin: 0, isTextBox: true, valign: 'middle' })
  const probs = [
    { n: 1, pct: '33.2%', what: '"수당을 받는지 안내받지 못해 모르겠다"', src: '노동절 근무 알바생 749명, 알바천국 2026.4', title: '얼마를 받아야 하는지\n계산하기 어렵다', desc: '주휴 · 야간수당 조건을 모르고, 계산기는 있어도 넣을 기록이 없다' },
    { n: 2, pct: '48.0%', what: '임금 관련 문제를 겪었다 (수당 미지급 · 지연 37.3%)', src: '알바생 2,457명, 알바천국 2025.1', title: '덜 받아도\n알아채기 어렵다', desc: '통장에 들어온 총액만 보고 넘어간다. 계약서가 없어 시급도 증명하기 어렵다' },
    { n: 3, pct: '49.3%', what: '최저시급 미달인데 아무 대응도 하지 않았다', src: '알바 경험자 1,804명, 알바천국 2026.6', title: '알아도\n말을 꺼내기 어렵다', desc: '관계가 불편해질 걱정, 작은 금액, 근거 없음이 겹쳐 덮인다' },
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
  s.addNotes('세 문제를 숫자로 보여 줍니다. 모두 알바천국 설문이라 "플랫폼 설문"이라는 점을 말하고, 그래서 우리도 직접 설문을 돌리고 있다고 잇습니다.')
}

// 기존 해결책의 한계
{
  const s = pres.addSlide({ masterName: 'LIGHT', sectionTitle: '② 문제 정의' })
  head(s, '② 문제 정의 · 기존 해결책의 한계', '"얼마 받아야 하나"까지는 있다. "어떻게 받아내나"는 없다')
  const hdr = (t) => ({ text: t, options: { bold: true, color: HEX.accent5, fill: { color: HEX.lt2 }, fontSize: 10.5 } })
  const cell = (t, o = {}) => ({ text: t, options: { fontSize: 11, color: HEX.dk1, ...o } })
  const tbl = [
    [hdr('서비스'), hdr('하는 것'), hdr('못 하는 것')],
    [cell('하우머치', { bold: true }), cell('혼자 근무 기록, 예상 급여 계산, 커뮤니티 · 매장 후기'), cell('실제 입금액과 비교, 덜 받았을 때 대응', { color: HEX.accent3 })],
    [cell('기그', { bold: true }), cell('출퇴근 기록, 전자 근로계약서'), cell('사장과 연결해야 작동. 소규모 매장은 연결이 안 된다는 리뷰', { color: HEX.accent3 })],
    [cell('알바천국 · 알바몬 계산기', { bold: true }), cell('시급 · 시간으로 일회성 계산'), cell('기록이 남지 않는다', { color: HEX.accent3 })],
    [cell('진정24 · 노동포털', { bold: true }), cell('진정서 작성 지원, 진정 접수'), cell('증거를 이미 갖춘 사람만 쓸 수 있다. 재직 중엔 마지막 수단', { color: HEX.accent3 })],
  ]
  s.addTable(tbl, { x: 0.5, y: 1.35, w: 9, colW: [1.9, 3.3, 3.8], rowH: [0.38, 0.6, 0.6, 0.6, 0.6], border: { type: 'solid', pt: 0.5, color: HEX.accent6 }, valign: 'middle', margin: [0.04, 0.1, 0.04, 0.1], objectName: '경쟁 서비스 표' })
  card(s, 0.5, 4.35, 9, 0.6, '결론 칸')
  s.addText([
    { text: '빈자리  ', options: { bold: true, color: C.text2 } },
    { text: '네 서비스 모두 실제 입금액 비교와 체불 대응 기능이 없다. 알바가드는 "혼자 기록 → 차액 발견 → 요청"의 사이를 잇는다  (각 앱 공식 소개 · 리뷰, 2026.9 기준)', options: {} },
  ], { x: 0.7, y: 4.35, w: 8.6, h: 0.6, fontSize: 11.5, color: C.text1, margin: 0, isTextBox: true, valign: 'middle' })
  s.addNotes('하우머치는 혼자 쓸 수 있지만 예상 급여에서 멈추고, 기그는 사장 연동이 필요하고, 계산기는 기록이 없고, 진정24는 증거가 있어야 시작합니다. 우리는 그 사이 단계를 채웁니다.')
}

// ======================================================
// ③ 솔루션
// ======================================================
pres.addSection({ title: '③ 솔루션·핵심 가치' })
{
  const s = pres.addSlide({ masterName: 'LIGHT', sectionTitle: '③ 솔루션·핵심 가치' })
  head(s, '③ 솔루션 · 서비스 개요', '기록 → 비교 → 요청, 신고 이전 단계를 채운다')
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
  head(s, '③ 솔루션 · 차별화 포인트', '차별점 셋, 그리고 먼저 인정하는 약점 하나')
  const pts = [
    { t: '사장 연동 없이 혼자 쓴다', d: '근무지만 직접 등록. 기그처럼 사장이 가입할 필요가 없다' },
    { t: '입금액 비교 → 차액 → 요청 · 증빙, 한 흐름으로', d: '실제 받은 돈과 비교해 차액을 찾고, 요청 문구와 증빙 묶음까지 잇는다. 비교한 네 서비스 모두 없는 부분' },
    { t: '기록 등록: 확인 번호 + 등록 시각', d: '기록할 때마다 기록 내용으로 만든 확인 번호가 서버에 남아, "그때 기록한 그대로"를 제3자가 확인할 수 있다. 근무지 · 시각 · 금액은 서버로 가지 않는다' },
  ]
  pts.forEach((p, i) => {
    const y = 1.4 + i * 1.0
    circleNum(s, 0.5, y + 0.05, i + 1)
    s.addText(p.t, { x: 1.0, y, w: 4.9, h: 0.42, fontSize: 13.5, bold: true, color: C.text2, margin: 0, isTextBox: true, valign: 'middle' })
    body(s, p.d, 1.0, y + 0.42, 4.9, 0.5, { fontSize: 10.5, color: C.accent5 })
    line(s, 0.5, y + 0.95, 5.4)
  })
  // 약점 칸
  card(s, 6.4, 1.4, 3.1, 3.0, '약점 칸')
  s.addText('먼저 인정하는 약점', { x: 6.65, y: 1.55, w: 2.6, h: 0.35, fontSize: 11, bold: true, color: C.accent3, margin: 0, isTextBox: true })
  s.addText([
    { text: '비교 기능은 하우머치가 "받은 금액 입력" 칸 하나로 따라올 수 있다.', options: { breakLine: true } },
    { text: ' ', options: { breakLine: true, fontSize: 6 } },
    { text: '그래서 다음 단계는 기록의 신뢰성이다. 확인 번호는 "나중에 고치지 않았다"까지만 보여 주고 "그날 실제로 일했다"는 증명하지 못한다. 통장 내역 · 메시지와 함께 내야 힘이 생긴다고 앱에도 적어 두었다.', options: {} },
  ], { x: 6.65, y: 1.95, w: 2.6, h: 2.3, fontSize: 11, color: C.text1, margin: 0, isTextBox: true, valign: 'top' })
  s.addText('법적 효력을 보장한다고 말하지 않는다. 근로감독관 · 법원이 판단할 자료를 정리해 준다.', { x: 0.5, y: 4.55, w: 9, h: 0.4, fontSize: 10.5, italic: true, color: C.accent5, margin: 0, isTextBox: true })
  s.addNotes('세 번째가 따라 하기 어려운 차별점입니다. 약점은 먼저 말합니다. "법적 효력" 질문이 오면 보장하지 않는다고 답하고, 판단할 자료를 정리해 준다고 말합니다.')
}

// ======================================================
// ④ 기술 아키텍처
// ======================================================
pres.addSection({ title: '④ SW 기술 아키텍처' })
{
  const s = pres.addSlide({ masterName: 'LIGHT', sectionTitle: '④ SW 기술 아키텍처' })
  head(s, '④ SW 기술 아키텍처 · 기술 스택', '서버 없이 시작하고, 서버는 "확인 번호"에만 쓴다')
  const hdr = (t) => ({ text: t, options: { bold: true, color: HEX.accent5, fill: { color: HEX.lt2 }, fontSize: 10.5 } })
  const cell = (t, o = {}) => ({ text: t, options: { fontSize: 10.5, color: HEX.dk1, ...o } })
  const tbl = [
    [hdr('구분'), hdr('선택'), hdr('이유')],
    [cell('프론트엔드', { bold: true }), cell('React + Vite, PWA (홈 화면에 추가, 오프라인 실행)'), cell('스토어 없이 링크로 배포. 의견을 듣고 바로 고쳐 다시 배포')],
    [cell('백엔드', { bold: true }), cell('별도 서버 없음 + Supabase REST'), cell('근무 내용은 폰 밖으로 안 나감. 서버는 확인 번호 등록 · 설문 수집에만')],
    [cell('데이터베이스', { bold: true }), cell('폰: localStorage(기록) · IndexedDB(사진)\n서버: Supabase PostgreSQL (stamps · survey)'), cell('기록 소유권은 사용자에게. 서버 표는 넣기만 되고 수정 · 삭제는 막음(RLS), 시각은 서버가 찍음')],
    [cell('인프라', { bold: true }), cell('GitHub Pages + GitHub Actions'), cell('main에 올리면 자동 빌드 · 배포')],
    [cell('AI', { bold: true }), cell('Claude API (선택, 개발 환경에서만)'), cell('배포 앱은 API 키 없이 정해진 문구로 동작. 기록을 밖으로 안 보내려고 기본은 끔')],
    [cell('분석', { bold: true }), cell('설문 페이지 + 자동 집계 페이지, 직접 인터뷰'), cell('로그인이 없어 사용 로그 대신 설문 · 인터뷰로 측정')],
  ]
  s.addTable(tbl, { x: 0.5, y: 1.35, w: 9, colW: [1.4, 3.6, 4.0], rowH: [0.36, 0.5, 0.5, 0.72, 0.42, 0.52, 0.5], border: { type: 'solid', pt: 0.5, color: HEX.accent6 }, valign: 'middle', margin: [0.04, 0.1, 0.04, 0.1], objectName: '기술 스택 표' })
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
    s.addText(t, { x: x + 0.1, y, w: w - 0.2, h, fontSize: 10, color: C.text1, margin: 0, isTextBox: true, valign: 'middle', align: 'center' })
  }
  box(0.7, 1.9, 3.0, 0.6, [{ text: '화면 (React)', options: { bold: true, breakLine: true } }, { text: '근무 기록 · 캘린더 · 급여 비교 · 정산 요청 · 설정', options: { fontSize: 9, color: C.accent5 } }], '화면 상자')
  arrow(s, 2.2, 2.5, 2.2, 2.72, HEX.accent5, 1)
  box(0.7, 2.72, 3.0, 0.7, [{ text: '계산 모듈', options: { bold: true, breakLine: true } }, { text: '급여(주휴 · 야간) · 예정 vs 실제 · 요청 문구 · PDF · 확인 번호(SHA-256)', options: { fontSize: 9, color: C.accent5 } }], '계산 상자')
  arrow(s, 2.2, 3.42, 2.2, 3.64, HEX.accent5, 1)
  box(0.7, 3.64, 3.0, 0.6, [{ text: '저장', options: { bold: true, breakLine: true } }, { text: 'localStorage(기록 · 수정 이력) · IndexedDB(증빙 사진)', options: { fontSize: 9, color: C.accent5 } }], '저장 상자')
  s.addText('로그인 없음 · 근무 내용은 여기에만', { x: 0.7, y: 4.35, w: 3.0, h: 0.35, fontSize: 9.5, bold: true, color: C.accent2, margin: 0, isTextBox: true, align: 'center' })
  // 폰 → Supabase
  arrow(s, 3.95, 2.55, 5.55, 2.55, HEX.accent1, 1.75)
  s.addText('확인 번호 · 기록 번호' + String.fromCharCode(10) + '· 무작위 폰 번호', { x: 3.95, y: 2.0, w: 1.55, h: 0.52, fontSize: 8.5, bold: true, color: C.text2, margin: 0, isTextBox: true, align: 'center', valign: 'bottom' })
  s.addText('근무지 · 시각 · 금액은' + String.fromCharCode(10) + '가지 않음', { x: 3.95, y: 2.6, w: 1.55, h: 0.5, fontSize: 8.5, color: C.accent3, margin: 0, isTextBox: true, align: 'center', valign: 'top' })
  // Supabase
  s.addShape(S.roundRect, { x: 5.55, y: 1.4, w: 2.15, h: 2.0, fill: { color: C.background1 }, line: { color: HEX.accent1, width: 1.5 }, rectRadius: 0.1, objectName: 'Supabase 상자' })
  s.addText([
    { text: 'Supabase (무료 요금제)', options: { bold: true, color: C.text2, breakLine: true } },
    { text: 'stamps 표', options: { bold: true, breakLine: true } },
    { text: '확인 번호 · 기록 번호 · 폰 번호 · 서버 등록 시각', options: { fontSize: 9, color: C.accent5, breakLine: true } },
    { text: '넣기만 가능, 수정 · 삭제 불가 (RLS). 시각은 트리거가 서버 시각으로 강제', options: { fontSize: 9, color: C.accent5 } },
  ], { x: 5.68, y: 1.5, w: 1.9, h: 1.85, fontSize: 10.5, color: C.text1, margin: 0, isTextBox: true, valign: 'top', paraSpaceAfter: 2 })
  // 확인 페이지
  arrow(s, 6.62, 4.0, 6.62, 3.42, HEX.accent1, 1.25)
  s.addText('등록 시각 조회', { x: 6.72, y: 3.5, w: 1.0, h: 0.4, fontSize: 8.5, color: C.text2, margin: 0, isTextBox: true, valign: 'middle' })
  s.addShape(S.roundRect, { x: 5.55, y: 4.0, w: 2.15, h: 0.85, fill: { color: C.background2 }, line: { color: C.background2, width: 0 }, rectRadius: 0.1, objectName: '확인 페이지 상자' })
  s.addText([
    { text: '확인 페이지 (verify.html)', options: { bold: true, color: C.text2, breakLine: true } },
    { text: '누구나 확인 번호 → 서버 등록 시각. 앱 데이터 없이 동작', options: { fontSize: 9, color: C.accent5 } },
  ], { x: 5.68, y: 4.05, w: 1.9, h: 0.78, fontSize: 10.5, color: C.text1, margin: 0, isTextBox: true, valign: 'middle' })
  // 데이터 흐름
  s.addText('기록 하나가 남을 때', { x: 7.9, y: 1.4, w: 1.7, h: 0.3, fontSize: 10.5, bold: true, color: C.text2, margin: 0, isTextBox: true })
  const flow = ['출근 버튼: 기록 번호를 만들고 출근 시각 기록의 확인 번호 등록', '퇴근 버튼: 완성된 기록의 확인 번호 등록', '수정 · 삭제: 수정 이력이 붙은 새 내용으로 다시 등록 (줄이 늘어남)', '인터넷이 없으면 대기열에 두었다가 연결되면 전송', '증빙 묶음 PDF 7번 표에 기록별 확인 번호 · 등록 시각']
  flow.forEach((f, i) => {
    circleNum(s, 7.9, 1.78 + i * 0.62, i + 1, { size: 0.24, fontSize: 8.5 })
    s.addText(f, { x: 8.2, y: 1.72 + i * 0.62, w: 1.4, h: 0.6, fontSize: 8.5, color: C.text1, margin: 0, isTextBox: true, valign: 'top' })
  })
  caption(s, '배포: GitHub main → Actions → Pages (링크 하나로 설치)  ·  설문: survey.html → Supabase survey 표 → 결과 페이지 자동 집계', 0.5, 4.92, 9, 0.28, 9)
  s.addNotes('왼쪽 폰 안에서 모든 계산이 끝나고, 서버로 가는 건 확인 번호뿐입니다. 서버 표는 넣기만 되고 지우거나 고칠 수 없어서 등록 시각을 믿을 수 있습니다. 오른쪽은 기록 하나가 남을 때의 흐름입니다.')
}

// ======================================================
// ⑤ 개발 현황
// ======================================================
pres.addSection({ title: '⑤ 개발 현황·MVP 시연' })
{
  const s = pres.addSlide({ masterName: 'LIGHT', sectionTitle: '⑤ 개발 현황·MVP 시연' })
  head(s, '⑤ 개발 현황 · 구현된 기능과 계획 대비 비율', 'MVP 기능 8개 모두 동작, 완성도 평균 약 80%')
  const feats = [
    ['근무 기록 (수정 이력 · 직접 추가 · 퇴근 누락 보호)', 90, '실제 폰에서 장기 사용 확인'],
    ['캘린더 (예정 vs 실제, 연장 · 대타 · 합의 휴무)', 85, '반복 스케줄 입력 편의'],
    ['급여 계산 (주휴 · 야간 · 휴게 · 시급 이력 · 연도별 최저임금)', 85, '연장근로 가산 미반영'],
    ['입금액 비교 · 차액 알림 (여러 달 합계, 3.3% 세금)', 80, '입금 문자 · 명세서 사진 자동 인식은 보류'],
    ['단계별 정산 요청 (메시지 · 내용증명 · 진정 안내, 보낸 날짜)', 75, '문구 톤 사용자 검증, AI 문구는 선택'],
    ['증빙 묶음 PDF (7개 항목, 첨부 사진)', 80, '실제 폰에서 PDF 저장 확인'],
    ['기록 등록 (확인 번호 · 등록 시각, 확인 페이지)', 70, '제3자가 내용으로 번호를 다시 계산하는 방법'],
    ['기록 백업 · 불러오기', 80, '실제 폰에서 파일 저장 확인'],
  ]
  const y0 = 1.38, rh = 0.42, bx = 4.6, bw = 1.9
  s.addText('남은 일', { x: 6.85, y: y0 - 0.28, w: 2.65, h: 0.25, fontSize: 9, bold: true, color: C.accent5, margin: 0, isTextBox: true })
  feats.forEach(([name, pct, left], i) => {
    const y = y0 + i * rh
    s.addText(name, { x: 0.5, y, w: 4.0, h: rh, fontSize: 10.5, color: C.text1, margin: 0, isTextBox: true, valign: 'middle' })
    s.addShape(S.roundRect, { x: bx, y: y + 0.14, w: bw, h: 0.14, fill: { color: C.background2 }, line: { color: C.background2, width: 0 }, rectRadius: 0.07, objectName: `${name} 바탕` })
    s.addShape(S.roundRect, { x: bx, y: y + 0.14, w: bw * pct / 100, h: 0.14, fill: { color: C.accent1 }, line: { color: C.accent1, width: 0 }, rectRadius: 0.07, objectName: `${name} 진행` })
    s.addText(`${pct}%`, { x: bx + bw + 0.08, y, w: 0.5, h: rh, fontSize: 10.5, bold: true, color: C.text2, margin: 0, isTextBox: true, valign: 'middle' })
    s.addText(left, { x: 7.1, y, w: 2.4, h: rh, fontSize: 9, color: C.accent5, margin: 0, isTextBox: true, valign: 'middle' })
    line(s, 0.5, y + rh, 9)
  })
  s.addText([
    { text: '계획 대비 구현 비율  ', options: { bold: true, color: C.text2 } },
    { text: '기능 수 8 / 8, 완성도 평균 약 80%.  실제 사용자 검증은 시작 단계.  배포 주소 jihooni217.github.io/albaguard', options: {} },
  ], { x: 0.5, y: 4.82, w: 9, h: 0.35, fontSize: 10.5, color: C.text1, margin: 0, isTextBox: true, valign: 'middle' })
  s.addNotes('100%는 쓰지 않았습니다. 기능마다 남은 일을 같이 적었습니다. 교수님이 "아직 구현 안 했을 것"이라 하셨지만 우리는 배포까지 했고, 대신 사용자 검증이 아직입니다.')
}

// UI 화면
{
  const s = pres.addSlide({ masterName: 'LIGHT', sectionTitle: '⑤ 개발 현황·MVP 시연' })
  head(s, '⑤ 개발 현황 · MVP 화면', '통장처럼 쌓이는 기록, 질문처럼 묻는 비교')
  const shots = [
    ['2-calendar.jpg', '캘린더', '예정과 실제를 비교해 연장 · 대타만 글자로'],
    ['3-pay.jpg', '급여 비교', '"실제로 얼마 받았나요?"를 먼저 묻는다'],
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
  s.addNotes('디자인은 타겟 사용자(하우머치를 쓰는 친구)가 시안 12장 중 고른 통장 구성입니다. 잉크 남색은 "기록을 잉크로 남긴다"는 뜻입니다. 증빙 묶음은 인쇄 창에서 PDF로 저장합니다.')
}

// 시연 순서
{
  const s = pres.addSlide({ masterName: 'LIGHT', sectionTitle: '⑤ 개발 현황·MVP 시연' })
  head(s, '⑤ MVP 시연', '시연 순서 (약 3분, 실제 배포된 앱으로)')
  const steps = [
    ['설정 → 시연용 예시 데이터 넣기', '석 달치 기록과 두 달치 덜 받은 급여가 들어간다'],
    ['출근 · 퇴근 버튼 → 설정에서 "2건 등록됨"', '기록할 때마다 서버에 확인 번호가 남는다'],
    ['캘린더에서 연장 · 대타 확인', '예정 스케줄과 실제 근무의 차이'],
    ['첫 화면 "9월 급여 받으셨나요?" → 받은 금액 입력', '덜 받은 돈이 빨간 숫자로'],
    ['요청 메시지 생성 (3개월 합계) → 복사', '날짜별 기록과 계산 근거가 들어간 정중한 문구'],
    ['증빙 묶음 PDF → 7번 "기록 등록 확인"', '확인 번호를 확인 페이지에 넣어 등록 시각 확인'],
    ['3단계 진정 안내', '1350 전화 · 노동포털 연결. 진정서는 만들지 않는다'],
  ]
  steps.forEach(([t, d], i) => {
    const col = i < 4 ? 0 : 1, row = i < 4 ? i : i - 4
    const x = 0.5 + col * 4.65, y = 1.4 + row * 0.82
    circleNum(s, x, y + 0.06, i + 1)
    s.addText(t, { x: x + 0.48, y, w: 3.9, h: 0.4, fontSize: 12, bold: true, color: C.text2, margin: 0, isTextBox: true, valign: 'middle' })
    s.addText(d, { x: x + 0.48, y: y + 0.38, w: 3.9, h: 0.35, fontSize: 10, color: C.accent5, margin: 0, isTextBox: true, valign: 'top' })
  })
  card(s, 5.15, 4.0, 4.35, 0.95, '대비 칸')
  s.addText([
    { text: '대비  ', options: { bold: true, color: C.text2 } },
    { text: '인터넷이 안 되면 캡처 · 짧은 녹화로 대신한다. 발표 전날 앱에서 기록 하나를 남겨 서버(무료 요금제)를 깨워 둔다.', options: {} },
  ], { x: 5.35, y: 4.0, w: 4.0, h: 0.95, fontSize: 10.5, color: C.text1, margin: 0, isTextBox: true, valign: 'middle' })
  s.addNotes('시연은 이 순서대로 합니다. 예시 데이터로 시작해 출근 · 퇴근을 실제로 누르고, 설정 탭에서 등록 건수를 보여 준 뒤, 확인 페이지까지 갑니다.')
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
    ['67.8%', '2025년 체불액 중 30인 미만 사업장 (1조 4,012억 원). 카페 · 편의점 · 음식점이 여기에', C.accent3],
    ['48.0%', '알바생 중 임금 관련 문제 경험 (알바천국, 2,457명, 2025.1)', C.accent3],
  ]
  stats.forEach(([n, d, col], i) => {
    const y = 1.35 + i * 1.08
    s.addText(n, { x: 5.1, y, w: 4.4, h: 0.5, fontSize: 20, bold: true, color: col, margin: 0, isTextBox: true, valign: 'bottom' })
    s.addText(d, { x: 5.1, y: y + 0.5, w: 4.4, h: 0.45, fontSize: 10, color: C.accent5, margin: 0, isTextBox: true, valign: 'top' })
    line(s, 5.1, y + 1.0, 4.4)
  })
  s.addText([
    { text: '타겟 규모(어림)  ', options: { bold: true, color: C.text2 } },
    { text: '고등교육기관 재적학생 307만 명(2026 교육기본통계) × 알바 경험률 약 70~80%(학교 단위 조사, 대표값 아님) → 약 200만 명 안팎. 주 15시간 이상 비율은 설문으로 파악', options: { breakLine: true } },
    { text: '타이밍  ', options: { bold: true, color: C.text2 } },
    { text: '2025.9 임금체불 근절 대책(대지급금 확대), 2025.10.23 개정 근로기준법 시행(상습 체불 제재). 증거만 있으면 돌려받는 길이 넓어졌다', options: {} },
  ], { x: 0.5, y: 4.62, w: 9, h: 0.58, fontSize: 9.5, color: C.text1, margin: 0, isTextBox: true, valign: 'top', paraSpaceAfter: 1 })
  s.addNotes('손유호. 임금체불은 2년 연속 2조 원이고 30인 미만 사업장에 몰려 있습니다. 타겟 규모는 어림이라 "약"을 붙여 말합니다. 출처: 고용노동부 노동포털 임금체불 통계현황, 알바천국 설문, 교육부 교육기본통계.')
}

// 경쟁 포지션
{
  const s = pres.addSlide({ masterName: 'LIGHT', sectionTitle: '⑥ 시장 분석·비즈니스 모델' })
  head(s, '⑥ 시장 분석 · 경쟁사', '경쟁 서비스 사이의 빈자리')
  const ox = 0.9, oy = 1.45, W = 5.2, H = 3.3
  s.addShape(S.rect, { x: ox, y: oy, w: W, h: H, fill: { color: C.background2 }, line: { color: C.background2, width: 0 }, objectName: '포지션 바탕' })
  s.addShape(S.line, { x: ox + W / 2, y: oy, w: 0, h: H, line: { color: HEX.accent6, width: 1 } })
  s.addShape(S.line, { x: ox, y: oy + H / 2, w: W, h: 0, line: { color: HEX.accent6, width: 1 } })
  s.addText('혼자 쓴다', { x: ox + 0.1, y: oy + H / 2 - 0.3, w: 1.2, h: 0.3, fontSize: 9, bold: true, color: C.accent5, margin: 0, isTextBox: true })
  s.addText('사장과 함께', { x: ox + W - 1.3, y: oy + H / 2 - 0.3, w: 1.2, h: 0.3, fontSize: 9, bold: true, color: C.accent5, margin: 0, isTextBox: true, align: 'right' })
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
  s.addText('왼쪽 위가 비어 있다', { x: 6.5, y: 1.5, w: 3, h: 0.35, fontSize: 13, bold: true, color: C.text2, margin: 0, isTextBox: true })
  s.addText([
    { text: '혼자 쓰면서 대응까지 가는 서비스가 없다. 하우머치 · 계산기는 계산에서 멈추고, 기그는 사장이 있어야 하고, 진정24는 증거가 있어야 한다.', options: { breakLine: true } },
    { text: ' ', options: { breakLine: true, fontSize: 6 } },
    { text: '쌓인 기록이 곧 전환 비용이다. 몇 달 쓴 사람은 옮기기 어렵다.', options: { breakLine: true } },
    { text: ' ', options: { breakLine: true, fontSize: 6 } },
    { text: '하우머치가 비교 칸을 넣으면 따라올 수 있다. 그래서 기록 등록(확인 번호)처럼 따라 하기 어려운 쪽을 키운다.', options: {} },
  ], { x: 6.5, y: 1.9, w: 3, h: 2.8, fontSize: 10.5, color: C.text1, margin: 0, isTextBox: true, valign: 'top' })
  s.addNotes('손유호. 2×2에서 알바가드는 "혼자 쓴다 × 대응까지"에 있습니다. 경쟁 서비스 정보는 2026년 9월 각 앱의 공식 소개와 리뷰 기준입니다.')
}

// 비즈니스 모델
{
  const s = pres.addSlide({ masterName: 'LIGHT', sectionTitle: '⑥ 시장 분석·비즈니스 모델' })
  head(s, '⑥ 비즈니스 모델 · 유저 확보 전략', '핵심 화면은 무료, 수익은 게임 화면에서')
  rows(s, 0.5, 1.4, 9, [
    { label: '핵심 화면: 기록 · 비교 · 요청 · 증빙', sub: '신뢰가 핵심인 화면에는 광고를 섞지 않는다', value: '무료 · 광고 없음', color: C.accent2, bold: true },
    { label: '1차 (가설): 쉬는 틈 게임 화면 광고', sub: '스도쿠 · 틀린 그림 찾기 · 블록 채우기 화면에만. 웹에서도 Google H5 Games Ads로 보상형 광고 가능 (승인 필요, 미신청)', value: '게임 화면만', color: C.text2, bold: true },
    { label: '2차 (후보): 편의 기능 구독', sub: '여러 폰 동기화, 자동 백업처럼 문서 · 법률과 무관한 기능만', value: '구독', color: C.text2, bold: true },
    { label: '하지 않는 것: 정산 문구 · 내용증명 · 증빙 묶음 유료화', sub: '돈을 받고 문서를 만들어 주면 변호사법 · 공인노무사법 문제에 가까워진다 (웹 조사 기준)', value: '유료화 안 함', color: C.accent3, labelColor: C.accent3, bold: true },
  ], { rowH: 0.66, labelSize: 12, valueSize: 12, valueW: 0.22, subSize: 9.5 })
  s.addText('유저 확보', { x: 0.5, y: 4.25, w: 1.3, h: 0.35, fontSize: 10.5, bold: true, color: C.text2, margin: 0, isTextBox: true })
  s.addText('링크 하나로 설치되니 에브리타임 · 학과 · 동아리 단톡 · 알바 커뮤니티에 링크로 전파. "주휴수당 계산법" 같은 짧은 영상으로 유입', { x: 1.8, y: 4.25, w: 7.7, h: 0.4, fontSize: 10.5, color: C.text1, margin: 0, isTextBox: true, valign: 'top' })
  s.addText('지표 (앞으로)', { x: 0.5, y: 4.72, w: 1.3, h: 0.35, fontSize: 10.5, bold: true, color: C.text2, margin: 0, isTextBox: true })
  s.addText('홈 화면 추가 → 첫 기록 → 받은 금액 입력 → 차액 발견 → 요청 보냄 → 실제로 받음 (인터뷰)', { x: 1.8, y: 4.72, w: 7.7, h: 0.35, fontSize: 10.5, bold: true, color: C.text2, margin: 0, isTextBox: true, valign: 'top' })
  s.addNotes('손유호. 광고는 게임 화면에만 붙이는 가설이고, 문서를 돈 받고 만들어 주는 건 법적 이유로 하지 않습니다. 지표는 서버가 없어 지금은 못 재고, 설문 · 인터뷰로 대신합니다.')
}

// ======================================================
// ⑦ 초기 시장 검증
// ======================================================
pres.addSection({ title: '⑦ 초기 시장 검증' })
{
  const s = pres.addSlide({ masterName: 'LIGHT', sectionTitle: '⑦ 초기 시장 검증' })
  head(s, '⑦ 초기 시장 검증 성과와 계획', '지금까지 들은 것, 11월에 물어볼 것')
  s.addText('들은 것 (정식 조사 아님, 주변 의견)', { x: 0.5, y: 1.35, w: 4.4, h: 0.3, fontSize: 11, bold: true, color: C.text2, margin: 0, isTextBox: true })
  rows(s, 0.5, 1.7, 4.4, [
    { label: '타겟 사용자 1명이 디자인 시안 12장 중 통장 구성을 골랐다', sub: '"알바비는 직관적인 게 중요" → 그대로 적용' },
    { label: '친구 스케치로 앱 아이콘을 정했다', sub: '고리(쌓이는 시간) + 방패 + ₩' },
    { label: '팀원 피드백: "근무 중에만 열리는 게임은 보기에 안 좋다"', sub: '→ 10/25 "쉬는 틈에"로 바꾸고 설정에서 숨길 수 있게' },
    { label: '링크 설문 공개 (10/23)', sub: '응답 수는 발표 전 갱신 · 자동 집계 페이지' },
  ], { rowH: 0.72, labelSize: 10.5, subSize: 9 })
  s.addText('계획 (11월)', { x: 5.4, y: 1.35, w: 4.1, h: 0.3, fontSize: 11, bold: true, color: C.text2, margin: 0, isTextBox: true })
  rows(s, 5.4, 1.7, 4.1, [
    { label: '링크 설문 30명', sub: '지금 알바 중 · 예전에 함 · 한 적 없음으로 갈라 20문항 안팎' },
    { label: '직접 인터뷰 5명', sub: '앱을 써 보게 하고: 문구를 실제로 보낼 수 있을지, 확인 번호 설명이 이해되는지, 매달 금액을 넣을 만한지' },
    { label: '결과는 사람 수로 말한다', sub: '"N명 중 M명". %는 30명을 넘을 때만' },
  ], { rowH: 0.72, labelSize: 10.5, subSize: 9 })
  card(s, 5.4, 3.95, 4.1, 0.95, '설문 주소 칸')
  s.addText([
    { text: '설문 주소', options: { bold: true, color: C.text2, breakLine: true } },
    { text: 'jihooni217.github.io/albaguard/survey.html', options: { fontSize: 10.5, breakLine: true } },
    { text: '이름 · 연락처 없음 · 3분', options: { fontSize: 9, color: C.accent5 } },
  ], { x: 5.6, y: 4.0, w: 3.8, h: 0.85, fontSize: 10, color: C.text1, margin: 0, isTextBox: true, valign: 'middle' })
  s.addNotes('박명진. 지금까지는 친구 두 명과 팀원 의견이고 정식 조사가 아닙니다. 11월에 설문 30명과 인터뷰 5명을 합니다. 설문 응답 수는 발표 당일 아침에 결과 페이지에서 확인해 말합니다.')
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
    ['설문 수집 · 인터뷰', '박명진 · 손유호', 0, 1],
    ['피드백 반영 1차 (문구 · 화면)', '이지훈', 2, 3],
    ['실제 폰 검증 (아이폰 · 갤럭시)', '이지훈 · 박명진', 2, 4],
    ['기록 등록 보강 (제3자 확인 방법)', '이지훈', 3, 5],
    ['게임 화면 광고 실험 또는 새 게임 (선택)', '이지훈 · 손유호', 4, 5],
    ['최종 보고서 · 발표 준비', '전원', 5, 6],
  ]
  const lx = 0.5, lw = 2.9, ax = 3.5, aw = 1.1, gx = 4.65, cw = (9.5 - 4.65) / 7, hy = 1.4, rh = 0.5
  weeks.forEach((w, i) => s.addText(w, { x: gx + i * cw, y: hy, w: cw, h: 0.3, fontSize: 9, bold: true, color: C.accent5, margin: 0, isTextBox: true, align: 'center' }))
  s.addText('담당', { x: ax, y: hy, w: aw, h: 0.3, fontSize: 9, bold: true, color: C.accent5, margin: 0, isTextBox: true })
  line(s, lx, hy + 0.32, 9)
  tasks.forEach(([t, who, a, b], i) => {
    const y = hy + 0.4 + i * rh
    s.addText(t, { x: lx, y, w: lw, h: rh, fontSize: 10.5, color: C.text1, margin: 0, isTextBox: true, valign: 'middle' })
    s.addText(who, { x: ax, y, w: aw, h: rh, fontSize: 9, color: C.accent5, margin: 0, isTextBox: true, valign: 'middle' })
    for (let k = 0; k < 7; k++) s.addShape(S.line, { x: gx + k * cw, y, w: 0, h: rh, line: { color: HEX.accent6, width: 0.5 } })
    s.addShape(S.roundRect, { x: gx + a * cw + 0.05, y: y + 0.13, w: (b - a + 1) * cw - 0.1, h: rh - 0.26, fill: { color: i === 5 ? C.accent2 : C.accent1 }, line: { color: i === 5 ? C.accent2 : C.accent1, width: 0 }, rectRadius: 0.06, objectName: `${t} 막대` })
    line(s, lx, y + rh, 9)
  })
  s.addText('중간 발표 10/27 (화) → 기말 발표 12/15 (월) 예정', { x: 0.5, y: 4.85, w: 9, h: 0.3, fontSize: 10, color: C.accent5, margin: 0, isTextBox: true })
  s.addNotes('박명진. 7주 일정입니다. 앞 2주는 설문 · 인터뷰, 그다음 피드백 반영과 실제 폰 검증, 기록 등록 보강, 마지막 2주는 최종 보고서와 발표 준비입니다. 광고 실험과 새 게임은 선택입니다.')
}

// R&R + 마무리
{
  const s = pres.addSlide({ masterName: 'DARK', sectionTitle: '⑧ 향후 계획·팀 역량' })
  s.addText('⑧ 팀원별 R&R', { placeholder: 'title' })
  const rr = [
    ['이지훈', '팀장 · 개발', ['개발 · 배포, 기록 등록 보강', '실제 폰 검증', '기술 · 차별점 · 법적 효력 질의응답']],
    ['손유호', '기획 · 시장', ['시장 · 경쟁사 조사', '비즈니스 모델, 광고 실험', '설문 집계']],
    ['박명진', '검증 · 운영', ['사용자 인터뷰 · 검증', '일정 관리, 보고서 편집', '갤럭시 설치 · 테스트']],
  ]
  rr.forEach(([n, r, jobs], i) => {
    const x = 0.6 + i * 3.0
    if (i > 0) s.addShape(S.line, { x: x - 0.2, y: 1.55, w: 0, h: 1.9, line: { color: 'FFFFFF', width: 0.75, transparency: 60 } })
    s.addText([{ text: n, options: { bold: true, fontSize: 18 } }, { text: `  ${r}`, options: { fontSize: 10, color: C.background2 } }], { x, y: 1.5, w: 2.6, h: 0.45, color: C.background1, margin: 0, isTextBox: true, valign: 'middle' })
    s.addText(jobs.map((j, k) => ({ text: j, options: { bullet: { indent: 12 }, breakLine: k < jobs.length - 1 } })), { x, y: 2.05, w: 2.6, h: 1.7, fontSize: 11.5, color: C.background1, margin: 0, isTextBox: true, valign: 'top', paraSpaceAfter: 4 })
  })
  s.addText('법적 효력을 보장한다고 말하지 않습니다. 근로감독관 · 법원이 판단할 자료를 정리합니다.', { x: 0.6, y: 4.2, w: 8.8, h: 0.4, fontSize: 12, italic: true, color: C.background2, margin: 0, isTextBox: true })
  s.addText('감사합니다 · jihooni217.github.io/albaguard', { x: 0.6, y: 4.65, w: 8.8, h: 0.4, fontSize: 14, bold: true, color: C.background1, margin: 0, isTextBox: true })
  s.addNotes([
    '박명진이 R&R을 말하고 팀장이 마무리합니다.',
    '',
    '예상 질문',
    '· 법적 효력 있나? → 보장하지 않는다. 판단은 감독관 · 법원. 우리는 판단할 자료를 정리하고, 수정 이력과 확인 번호로 "나중에 고친 게 아니다"까지 보여 준다. 통장 내역 · 카톡과 함께 내야 한다고 앱에도 적어 뒀다.',
    '· 본인이 쓴 기록을 믿을 수 있나? → 거짓 기록은 막을 수 없다고 인정. 막는 건 "나중에 고쳐 쓰기". 영세 사업장은 기록이 없는 경우가 많아 알바생 기록이 거의 유일한 자료가 되기 쉽다. 사장에게는 임금대장 · 계약 서류 보존 의무가 있다(근로기준법 48 · 42조).',
    '· 하우머치가 따라 하면? → 비교 기능은 따라올 수 있다. 그래서 확인 번호(기록 신뢰성)와 요청 · 증빙까지 잇는 흐름이 차별점.',
    '· 법률 서비스 아닌가? → 무료, 본인 기록을 정해진 양식에 채울 뿐, 개별 사안 검토 · 대행 없음, 진정은 1350 · 노동포털로 연결만.',
    '· 수익은? → 게임 화면 광고(가설). 문서 유료화는 안 한다.',
    '· 팀원은 뭘 했나? → 지금까지는 이지훈이 개발. 앞으로 시장 · 설문(손유호), 인터뷰 · 검증 · 일정(박명진).',
  ].join('\n'))
}

;(async () => {
  await pres.writeFile({ fileName: OUT })
  await applyTheme(OUT, THEME)
  console.log('written', OUT)
})().catch((e) => { console.error(e); process.exit(1) })
