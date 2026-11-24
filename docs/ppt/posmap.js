// 포지셔닝 맵 PPT. 중간발표와 같은 "통장 원장" 디자인
// 실행: scratchpad deck 폴더에서 NODE_PATH=./node_modules node posmap.js 출력경로
const pptxgen = require('pptxgenjs')
const { applyTheme } = require('C:/Users/user/AppData/Local/Claude-Data/claude_pzs8sxrjxfjjc/local-agent-mode-sessions/skills-plugin/ae12fec3-4bb9-4b95-b7db-f99845d7bf92/63c7127e-611b-410e-85f2-7bc1ca801d1e/skills/pptx/scripts/apply_theme.js')

const OUT = process.argv[2] || '포지셔닝 맵-4조.pptx'
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
pres.layout = 'LAYOUT_16x9'
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace }
pres.author = '4조'
pres.title = '포지셔닝 맵 - 알바가드'
const C = pres.SchemeColor
const S = pres.ShapeType
const FOOT = '알바가드 · 포지셔닝 맵 · 4조'

pres.defineSlideMaster({
  title: 'LIGHT',
  background: { color: HEX.lt1 },
  objects: [
    { text: { text: FOOT, options: { x: 0.5, y: 5.22, w: 5, h: 0.28, fontSize: 10, color: C.accent5, margin: 0 } } },
    { placeholder: { options: { name: 'eyebrow', type: 'body', x: 0.5, y: 0.3, w: 8.5, h: 0.28, fontSize: 10.5, bold: true, color: C.accent5, margin: 0 }, text: '' } },
    { placeholder: { options: { name: 'title', type: 'title', x: 0.5, y: 0.55, w: 9, h: 0.62, fontSize: 22, bold: true, color: C.text2, margin: 0, valign: 'top', align: 'left' }, text: '' } },
  ],
  slideNumber: { x: 9.0, y: 5.22, w: 0.5, h: 0.28, fontSize: 10, color: C.accent5, align: 'right' },
})
pres.defineSlideMaster({ title: 'DARK_PLAIN', background: { color: HEX.dk2 }, objects: [] })

function head(s, eyebrow, title) { s.addText(eyebrow, { placeholder: 'eyebrow' }); s.addText(title, { placeholder: 'title' }) }
function line(s, x, y, w, color = HEX.accent6, width = 0.75) { s.addShape(S.line, { x, y, w, h: 0, line: { color, width } }) }
function txt(s, text, o) { s.addText(text, { margin: 0, isTextBox: true, valign: 'top', color: C.text1, fontSize: 12, ...o }) }
// 원장 줄: 번호 | 굵은 제목 + 회색 설명 | 오른쪽 꼬리표
function ledger(s, y, items, { rowH = 0.74, x = 0.5, w = 9, idW = 0.5 } = {}) {
  line(s, x, y, w, HEX.dk2, 1.25)
  items.forEach((it, i) => {
    const yy = y + i * rowH
    txt(s, it.id, { x, y: yy + 0.1, w: idW, h: 0.3, fontSize: 12, bold: true, color: C.accent1 })
    txt(s, [
      { text: it.t, options: { bold: true, fontSize: 13, breakLine: true } },
      { text: it.d, options: { fontSize: 10.5, color: C.accent5 } },
    ], { x: x + idW + 0.05, y: yy + 0.08, w: w - idW - 0.05 - (it.tag ? 2.4 : 0), h: rowH - 0.1, paraSpaceAfter: 2 })
    if (it.tag) txt(s, it.tag, { x: x + w - 2.35, y: yy + 0.1, w: 2.35, h: rowH - 0.15, fontSize: 10, bold: true, color: it.tagColor || C.accent2, align: 'right' })
    line(s, x, yy + rowH, w)
  })
}

// 1 표지
{
  const s = pres.addSlide({ masterName: 'DARK_PLAIN' })
  txt(s, '알바가드 · 4조', { x: 0.6, y: 0.55, w: 8, h: 0.35, fontSize: 13, bold: true, color: 'C9CCF2' })
  txt(s, '포지셔닝 맵', { x: 0.6, y: 1.55, w: 8.8, h: 0.9, fontSize: 40, bold: true, color: C.background1 })
  txt(s, '못 받은 알바비, 기록으로 찾는 앱', { x: 0.6, y: 2.5, w: 8.8, h: 0.45, fontSize: 18, color: C.background1 })
  s.addShape(S.line, { x: 0.6, y: 3.45, w: 8.8, h: 0, line: { color: '5A63E6', width: 1 } })
  txt(s, '2026.11.24\n이지훈 · 손유호', { x: 0.6, y: 3.65, w: 8.8, h: 0.8, fontSize: 13, color: 'C9CCF2' })
}

// 2 축을 고른 기준
{
  const s = pres.addSlide({ masterName: 'LIGHT' })
  head(s, '축을 고른 기준', '급여를 어디까지 다루는지, 혼자 시작할 수 있는지로 나눔')
  ledger(s, 1.3, [
    { id: '가로', t: '급여를 어디까지 다루나: 기록·계산 → 받은 돈과 비교 → 요청 → 신고', d: 'STP에서 나눈 세그먼트(총액만 봄 → 기록·계산만 해 봄 → 알지만 말 못 함 → 신고까지 감)와 같은 순서' },
    { id: '세로', t: '혼자 바로 시작할 수 있나, 사장님 가입이나 증거가 먼저 필요한가', d: '타깃은 근로계약서가 없거나 사장님 협조를 구하기 어려운 대학생 알바' },
    { id: '대상', t: '메모장·카톡, 알바천국·알바몬 계산기, 하우머치, 기그, 진정24·노동포털', d: 'STP와 SWOT에서 비교한 서비스 그대로' },
    { id: '근거', t: '각 앱 상세 페이지와 리뷰(2026.9), 진정24 사이트(2026.10.27 확인)', d: '위치는 숫자로 잰 것이 아니라 기능이 있는지 없는지로 놓은 우리 판단' },
  ], { rowH: 0.82, idW: 1.15 })
}

// 3 포지셔닝 맵
{
  const s = pres.addSlide({ masterName: 'LIGHT' })
  head(s, '포지셔닝 맵', '혼자 쓰면서 받은 돈과 비교하고 요청까지 가는 자리가 비어 있음')
  const L = 1.35, R = 9.4, T = 1.38, B = 4.6, W = R - L, MID = (T + B) / 2, CW = W / 4
  // 세로축 이름
  txt(s, '혼자\n바로 시작', { x: 0.4, y: T + 0.45, w: 0.9, h: 0.5, fontSize: 10, bold: true, color: C.accent5 })
  txt(s, '사장님 가입 ·\n증거가 먼저', { x: 0.4, y: MID + 0.45, w: 0.95, h: 0.5, fontSize: 10, bold: true, color: C.accent5 })
  // 틀과 칸
  s.addShape(S.rect, { x: L, y: T, w: W, h: B - T, fill: { color: HEX.lt1 }, line: { color: HEX.accent6, width: 0.75 } })
  s.addShape(S.rect, { x: L + CW, y: T, w: CW * 2, h: MID - T, fill: { color: HEX.lt2 }, line: { color: HEX.accent6, width: 0.75 } })
  line(s, L, MID, W, HEX.dk2, 1.25)
  for (let i = 1; i < 4; i++) s.addShape(S.line, { x: L + CW * i, y: T, w: 0, h: B - T, line: { color: HEX.accent6, width: 0.75, dashType: 'dash' } })
  // 가로축 단계 이름
  ;['기록 · 계산', '받은 돈과 비교', '요청', '신고'].forEach((t, i) => {
    txt(s, t, { x: L + CW * i, y: B + 0.07, w: CW, h: 0.25, fontSize: 10.5, bold: true, color: i === 1 || i === 2 ? C.accent1 : C.accent5, align: 'center' })
  })
  txt(s, '급여를 어디까지 다루나 →', { x: L, y: B + 0.33, w: W, h: 0.22, fontSize: 10, color: C.accent5, align: 'center' })
  // 점과 이름
  const dot = (x, y, name, desc, w = 1.7) => {
    s.addShape(S.ellipse, { x: x - 0.07, y: y - 0.07, w: 0.14, h: 0.14, fill: { color: HEX.accent5 }, line: { color: HEX.accent5, width: 0 } })
    txt(s, [{ text: name, options: { bold: true, fontSize: 10.5, breakLine: true } }, { text: desc, options: { fontSize: 10, color: C.accent5 } }], { x: x + 0.13, y: y - 0.13, w, h: 0.45 })
  }
  dot(L + 0.2, T + 0.3, '하우머치', '기록 + 예상 급여')
  dot(L + 0.2, T + 0.82, '알바천국 · 알바몬', '일회성 계산기')
  dot(L + 0.2, T + 1.32, '메모장 · 카톡', '시간만 적음')
  dot(L + 0.2, MID + 0.45, '기그', '사장님 가입 뒤 기록')
  dot(L + CW * 3 + 0.2, MID + 0.45, '진정24 · 노동포털', '증거가 있어야 시작')
  // 알바가드
  s.addShape(S.roundRect, { x: L + CW + 0.15, y: T + 0.42, w: CW * 2 - 0.3, h: 0.72, rectRadius: 0.08, fill: { color: HEX.dk2 }, line: { color: HEX.dk2, width: 0 } })
  txt(s, [{ text: '알바가드', options: { bold: true, fontSize: 15, color: C.background1, breakLine: true } }, { text: '받은 돈과 비교 → 요청 메시지 · 증빙 PDF', options: { fontSize: 10.5, color: C.background1 } }], { x: L + CW + 0.3, y: T + 0.5, w: CW * 2 - 0.6, h: 0.6 })
  txt(s, '이 칸에 있는 서비스는 확인한 것 중 알바가드뿐', { x: L + CW + 0.15, y: T + 1.22, w: CW * 2 - 0.3, h: 0.25, fontSize: 10, color: C.accent1, bold: true })
  txt(s, '신고는 하지 않고\n증빙 PDF로 연결만', { x: L + CW * 3 + 0.2, y: T + 0.55, w: CW - 0.3, h: 0.45, fontSize: 10, color: C.accent5 })
}

// 4 읽는 법
{
  const s = pres.addSlide({ masterName: 'LIGHT' })
  head(s, '맵에서 읽은 것', '빈자리에 서되, 따라오기 쉬운 부분은 기록으로 지킴')
  ledger(s, 1.3, [
    { id: '빈자리', t: '혼자 쓰면서 받은 돈과 비교하고 요청까지 가는 칸', d: '혼자 쓰는 앱은 기록·계산에서 멈추고, 그 뒤 단계의 서비스는 사장님 가입이나 증거가 먼저 필요함' },
    { id: '우리 자리', t: '고친 흔적까지 남는 근무 기록으로 실제 받은 돈과 비교해 덜 받은 금액을 찾아 줌', d: 'STP 포지셔닝 문장의 차별점. 설문에서 가장 쓸모 있는 기능 1위가 받은 돈과 비교(15명 중 8명)' },
    { id: '약한 곳', t: '비교 칸은 하우머치가 "받은 금액" 입력 칸만 붙여도 넘어올 수 있음', d: '그래서 사유 없이 못 고치는 기록과 확인 번호, 기록 내용과 맞춰 보기를 키움' },
    { id: '안 가는 곳', t: '신고 칸으로는 가지 않음', d: '진정서는 만들지 않고 1350·노동포털로 연결만. 증빙 묶음 PDF를 첨부 자료로 쓰게 함' },
  ], { rowH: 0.82, idW: 1.15 })
}

;(async () => {
  await pres.writeFile({ fileName: OUT })
  await applyTheme(OUT, THEME)
  console.log('wrote', OUT)
})()
