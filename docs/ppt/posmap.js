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
pres.company = '4조'
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
  txt(s, '포지셔닝 맵', { x: 0.6, y: 1.55, w: 5.4, h: 0.9, fontSize: 40, bold: true, color: C.background1 })
  txt(s, '못 받은 알바비, 기록으로 찾는 앱', { x: 0.6, y: 2.5, w: 5.4, h: 0.45, fontSize: 18, color: C.background1 })
  // 작은 맵: 4칸 x 2줄, 알바가드 칸만 흰색
  const mx = 6.55, my = 1.5, cw = 0.7, ch = 0.66
  s.addShape(S.rect, { x: mx + cw, y: my, w: cw * 2, h: ch, fill: { color: 'FFFFFF' }, line: { color: 'FFFFFF', width: 0 } })
  for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) {
    if (r === 0 && (c === 1 || c === 2)) continue
    s.addShape(S.rect, { x: mx + cw * c, y: my + ch * r, w: cw, h: ch, fill: { color: HEX.dk2 }, line: { color: '5A63E6', width: 0.75 } })
  }
  const cd = (x, y, color, d = 0.13) => s.addShape(S.ellipse, { x: x - d / 2, y: y - d / 2, w: d, h: d, fill: { color }, line: { color, width: 0 } })
  cd(mx + 0.22, my + 0.18, 'C9CCF2'); cd(mx + 0.22, my + 0.36, 'C9CCF2'); cd(mx + 0.22, my + 0.54, 'C9CCF2')
  cd(mx + 0.22, my + ch + 0.25, 'C9CCF2'); cd(mx + cw * 3 + 0.22, my + ch + 0.25, 'C9CCF2')
  cd(mx + cw + 0.3, my + ch / 2, HEX.dk2, 0.2)
  txt(s, '알바가드', { x: mx + cw + 0.47, y: my + ch / 2 - 0.13, w: 1.0, h: 0.26, fontSize: 11, bold: true, color: C.accent1 })
  s.addShape(S.line, { x: 0.6, y: 3.45, w: 8.8, h: 0, line: { color: '5A63E6', width: 1 } })
  txt(s, '2026.11.24\n이지훈 · 손유호', { x: 0.6, y: 3.65, w: 8.8, h: 0.8, fontSize: 13, color: 'C9CCF2' })
}

// 2 축을 고른 기준
{
  const s = pres.addSlide({ masterName: 'LIGHT' })
  head(s, '축을 고른 기준', '급여를 어디까지 다루는지, 혼자 시작할 수 있는지로 나눔')
  ledger(s, 1.3, [
    { id: '가로', t: '급여를 어디까지 다루나: 기록·계산 → 받은 돈과 비교 → 요청 → 신고', d: 'STP 세그먼트(A 총액만 봄 → D 신고까지 감)와 같은 순서. 설문 쓸모 1위가 받은 돈과 비교(15명 중 8명)' },
    { id: '세로', t: '혼자 바로 시작할 수 있나, 시작 전에 조건(사장님 가입, 근거 모으기)이 있나?', d: '타깃은 근로계약서가 없거나 사장님 협조를 구하기 어려운 대학생 알바' },
    { id: '대상', t: '메모장·카톡, 알바천국·알바몬 계산기, 하우머치, 기그, 진정24·노동포털', d: 'STP와 SWOT에서 비교한 서비스 그대로' },
    { id: '근거', t: '각 앱 상세 페이지와 리뷰(2026.9, 11.24 다시 확인), 진정24 사이트(2026.10.27 확인)', d: '위치는 숫자로 잰 것이 아니라 기능이 있는지 없는지로 놓은 우리 판단' },
  ], { rowH: 0.82, idW: 1.15 })
}

// 3 포지셔닝 맵
{
  const s = pres.addSlide({ masterName: 'LIGHT' })
  head(s, '포지셔닝 맵', '혼자 쓰면서 받은 돈과 비교하고 요청까지 가는 자리가 비어 있음')
  const L = 1.35, R = 9.4, T = 1.38, B = 4.6, W = R - L, MID = (T + B) / 2, CW = W / 4
  // 세로축 이름
  txt(s, '조건 없이\n바로 시작', { x: 0.4, y: T + 0.45, w: 0.9, h: 0.5, fontSize: 10, bold: true, color: C.accent5 })
  txt(s, '시작 전\n조건 있음', { x: 0.4, y: MID + 0.45, w: 0.95, h: 0.5, fontSize: 10, bold: true, color: C.accent5 })
  // 틀과 칸
  s.addShape(S.rect, { x: L, y: T, w: W, h: B - T, fill: { color: HEX.lt1 }, line: { color: HEX.accent6, width: 0.75 } })
  s.addShape(S.rect, { x: L + CW, y: T, w: CW * 2, h: MID - T, fill: { color: 'EAEBF7' }, line: { color: HEX.accent6, width: 0.75 } })
  line(s, L, MID, W, HEX.dk2, 1.25)
  for (let i = 1; i < 4; i++) s.addShape(S.line, { x: L + CW * i, y: i === 2 ? MID : T, w: 0, h: i === 2 ? B - MID : B - T, line: { color: HEX.accent6, width: 0.75, dashType: 'dash' } })
  // 가로축 단계 이름
  ;['기록 · 계산', '받은 돈과 비교', '요청', '신고'].forEach((t, i) => {
    txt(s, t, { x: L + CW * i, y: B + 0.07, w: CW, h: 0.25, fontSize: 10.5, bold: true, color: i === 1 || i === 2 ? C.accent1 : C.accent5, align: 'center' })
  })
  ;[0, 1, 2, 3].forEach(i => {
    const on = i === 1 || i === 2, cx = L + CW * i + CW / 2
    s.addShape(S.ellipse, { x: cx - 0.13, y: T - 0.13, w: 0.26, h: 0.26, fill: { color: on ? HEX.dk2 : HEX.lt1 }, line: { color: on ? HEX.dk2 : HEX.accent5, width: 0.75 } })
    txt(s, String(i + 1), { x: cx - 0.13, y: T - 0.13, w: 0.26, h: 0.26, fontSize: 10, bold: true, align: 'center', valign: 'middle', color: on ? C.background1 : C.accent5 })
  })
  txt(s, '확인한 서비스 없음', { x: L + CW, y: MID + (B - MID) / 2 - 0.12, w: CW * 2, h: 0.25, fontSize: 10, color: C.accent5, align: 'center' })
  txt(s, '급여를 어디까지 다루나 →', { x: L, y: B + 0.33, w: W, h: 0.22, fontSize: 10, color: C.accent5, align: 'center' })
  // 점과 이름
  const dot = (x, y, name, desc, w = 1.7) => {
    s.addShape(S.ellipse, { x: x - 0.07, y: y - 0.07, w: 0.14, h: 0.14, fill: { color: HEX.accent5 }, line: { color: HEX.accent5, width: 0 } })
    txt(s, [{ text: name, options: { bold: true, fontSize: 10.5, breakLine: true } }, { text: desc, options: { fontSize: 10, color: C.accent5 } }], { x: x + 0.13, y: y - 0.13, w, h: 0.45 })
  }
  dot(L + 0.2, T + 0.3, '하우머치', '기록 + 예상 급여')
  dot(L + 0.2, T + 0.82, '알바천국 · 알바몬', '일회성 계산기')
  dot(L + 0.2, T + 1.32, '메모장 · 카톡', '시간만 적음')
  dot(L + 0.2, MID + 0.45, '기그', '사장님이 가입해야 기록')
  dot(L + CW * 3 + 0.2, MID + 0.45, '진정24 · 노동포털', '근거를 모아야 신고')
  // 알바가드
  line(s, L + CW + 0.15, T + 0.42, CW * 2 - 0.3, HEX.dk2, 2)
  line(s, L + CW + 0.15, T + 1.14, CW * 2 - 0.3, HEX.dk2, 2)
  s.addShape(S.ellipse, { x: L + CW + 0.27, y: T + 0.56, w: 0.2, h: 0.2, fill: { color: HEX.dk2 }, line: { color: HEX.dk2, width: 0 } })
  txt(s, [{ text: '알바가드', options: { bold: true, fontSize: 15, color: C.accent1, breakLine: true } }, { text: '받은 돈과 비교 → 요청 메시지 · 증빙 PDF', options: { fontSize: 10.5, color: C.text1 } }], { x: L + CW + 0.55, y: T + 0.48, w: CW * 2 - 0.8, h: 0.6 })
  txt(s, '이 칸에 있는 서비스는 확인한 것 중 알바가드뿐', { x: L + CW + 0.15, y: T + 1.22, w: CW * 2 - 0.3, h: 0.25, fontSize: 10, color: C.accent1, bold: true })
  txt(s, '신고는 하지 않고\n증빙 PDF로 연결만', { x: L + CW * 3 + 0.2, y: T + 0.55, w: CW - 0.3, h: 0.45, fontSize: 10, color: C.accent5 })
}

// 4 위치마다 근거
{
  const s = pres.addSlide({ masterName: 'LIGHT' })
  head(s, '위치마다 근거', '고객 인식 조사가 아니라 공개된 기능 설명으로 놓은 위치')
  ledger(s, 1.3, [
    { id: '하우머치', t: '조건 없이 · 기록·계산', d: '앱스토어 설명: 주휴·야간·연장수당 자동 계산, 가불·상여 입력. 실제 입금액과 맞춰 보는 기능은 없음 (11.24)' },
    { id: '알바천국 · 알바몬', t: '조건 없이 · 기록·계산', d: '알바생 쪽은 급여 계산기. 알바몬의 근무·급여 관리는 사장님용 보스몬(기업회원만) (11.24)' },
    { id: '메모장 · 카톡', t: '조건 없이 · 기록·계산', d: '근무 시간을 적을 뿐 계산·비교 기능 없음' },
    { id: '기그', t: '시작 전 조건 있음 · 기록', d: '앱스토어 설명: 근태 기록이 사장님과 자동 공유, 출퇴근은 사장님이 정한 사업장 기준 (11.24)' },
    { id: '진정24 · 노동포털', t: '시작 전 조건 있음 · 신고', d: '진정서 작성(진정24, 베타 무료)과 진정 접수(노동포털) 단계의 서비스 (10.27)' },
    { id: '알바가드', t: '조건 없이 · 비교·요청', d: '배포된 앱: 받은 금액 입력 → 덜 받은 금액 → 요청 메시지 · 증빙 PDF. 로그인·사장님 가입 없음' },
  ], { rowH: 0.6, idW: 1.6 })
}

// 5 읽는 법
{
  const s = pres.addSlide({ masterName: 'LIGHT' })
  head(s, '맵에서 읽은 것', '빈자리에 서되, 따라오기 쉬운 부분은 기록으로 지킴')
  ledger(s, 1.3, [
    { id: '빈자리', t: '혼자 쓰면서 받은 돈과 비교하고 요청까지 가는 칸', d: '혼자 쓰는 앱은 기록·계산에서 멈추고, 그 뒤 단계의 서비스는 사장님 가입이 필요하거나 근거를 모은 뒤에 감' },
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
