// SWOT 분석 결과 PPT (기말발표 활용). 중간발표와 같은 "통장 원장" 디자인
// 실행: scratchpad deck 폴더에서 NODE_PATH=./node_modules node swot.js 출력경로
const pptxgen = require('pptxgenjs')
const { applyTheme } = require('C:/Users/user/AppData/Local/Claude-Data/claude_pzs8sxrjxfjjc/local-agent-mode-sessions/skills-plugin/ae12fec3-4bb9-4b95-b7db-f99845d7bf92/63c7127e-611b-410e-85f2-7bc1ca801d1e/skills/pptx/scripts/apply_theme.js')

const OUT = process.argv[2] || 'SWOT 분석 결과-4조.pptx'
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
pres.title = 'SWOT 분석 결과 - 알바가드'
const C = pres.SchemeColor
const S = pres.ShapeType
const FOOT = '알바가드 · SWOT 분석 결과 · 4조'

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
function ledger(s, y, items, { rowH = 0.74, x = 0.5, w = 9 } = {}) {
  line(s, x, y, w, HEX.dk2, 1.25)
  items.forEach((it, i) => {
    const yy = y + i * rowH
    txt(s, it.id, { x, y: yy + 0.1, w: 0.5, h: 0.3, fontSize: 12, bold: true, color: C.accent1 })
    txt(s, [
      { text: it.t, options: { bold: true, fontSize: 13, breakLine: true } },
      { text: it.d, options: { fontSize: 10.5, color: C.accent5 } },
    ], { x: x + 0.55, y: yy + 0.08, w: w - 0.55 - (it.tag ? 2.4 : 0), h: rowH - 0.1, paraSpaceAfter: 2 })
    if (it.tag) txt(s, it.tag, { x: x + w - 2.35, y: yy + 0.1, w: 2.35, h: rowH - 0.15, fontSize: 10, bold: true, color: it.tagColor || C.accent2, align: 'right' })
    line(s, x, yy + rowH, w)
  })
}

// 1 표지
{
  const s = pres.addSlide({ masterName: 'DARK_PLAIN' })
  txt(s, '알바가드 · 4조', { x: 0.6, y: 0.55, w: 8, h: 0.35, fontSize: 13, bold: true, color: 'C9CCF2' })
  txt(s, 'SWOT 분석 결과', { x: 0.6, y: 1.55, w: 8.8, h: 0.9, fontSize: 40, bold: true, color: C.background1 })
  txt(s, '못 받은 알바비, 기록으로 찾는 앱', { x: 0.6, y: 2.5, w: 8.8, h: 0.45, fontSize: 18, color: C.background1 })
  s.addShape(S.line, { x: 0.6, y: 3.45, w: 8.8, h: 0, line: { color: '5A63E6', width: 1 } })
  txt(s, 'SWOT 작성 2026.11.10 · 카톡 인터뷰 3명 반영 2026.11.17\n이지훈 · 손유호 · 박명진', { x: 0.6, y: 3.65, w: 8.8, h: 0.8, fontSize: 13, color: 'C9CCF2' })
}

// 2 한눈에
{
  const s = pres.addSlide({ masterName: 'LIGHT' })
  head(s, 'SWOT 한눈에', '빈자리는 있지만, 비교 기능은 따라 하기 쉬움')
  const cells = [
    { k: 'S', n: '강점 · 내부', c: HEX.accent2, l: ['받은 돈과 비교 → 요청 → 증빙까지 한 흐름', '사유 없이 못 고치는 기록 + 확인 번호', '사장님 가입 없이 혼자 무료로'] },
    { k: 'W', n: '약점 · 내부', c: HEX.accent3, l: ['개발 1명, 법률 전문가·예산 없음', '받은 금액을 매달 직접 넣어야 함', '급여일에만 쓰는 앱, 게임은 안 쓸 기능 1위'] },
    { k: 'O', n: '기회 · 외부', c: HEX.accent2, l: ['체불의 74.9%가 30인 미만 사업장', '미달 경험자 49.3%가 아무 대응 안 함', '체불 처벌 강화(3배 손해배상 등)'] },
    { k: 'T', n: '위협 · 외부', c: HEX.accent3, l: ['하우머치가 입력 칸만 붙여도 비교는 따라옴', '진정서·문서 유료화는 법 위험이 커서 안 함', '사장님과의 관계 걱정(15명 중 6명)'] },
  ]
  cells.forEach((c, i) => {
    const x = 0.5 + (i % 2) * 4.6, y = 1.35 + Math.floor(i / 2) * 1.9
    line(s, x, y, 4.4, c.c, 2)
    txt(s, [{ text: c.k + '  ', options: { fontSize: 22, bold: true, color: c.c } }, { text: c.n, options: { fontSize: 11, bold: true, color: C.accent5 } }], { x, y: y + 0.08, w: 4.4, h: 0.45, valign: 'middle' })
    txt(s, c.l.map((t, j) => ({ text: t, options: { bullet: { indent: 12 }, breakLine: j < c.l.length - 1 } })), { x, y: y + 0.58, w: 4.4, h: 1.2, fontSize: 12, paraSpaceAfter: 4 })
  })
}

// 3 강점
{
  const s = pres.addSlide({ masterName: 'LIGHT' })
  head(s, 'S · 강점 (내부)', '덜 받은 돈을 찾는 데서 끝나지 않고, 요청까지 이어짐')
  ledger(s, 1.3, [
    { id: 'S1', t: '실제 받은 돈과 비교 → 정산 요청 문구 → 증빙 묶음 PDF', d: '비교한 경쟁 앱(기그·하우머치·알바천국·알바몬, 2026.9 상세 페이지 기준)에는 없는 흐름', tag: '설문 쓸모 1위: 비교 15명 중 8명' },
    { id: 'S2', t: '요청을 세 단계로: 정중한 메시지 → 내용증명 초안 → 1350·노동포털', d: '관계 부담에 맞춰 단계를 고를 수 있음' },
    { id: 'S3', t: '사유 없이 못 고치는 기록, 남기거나 고칠 때마다 확인 번호를 서버에 등록', d: '확인 페이지에서 "늦어도 그 시각에 그 기록이 있었음"을 보여 줌' },
    { id: 'S4', t: '사장님 가입·로그인 없이 혼자 무료로', d: '근무 내용은 폰 안에만 둠(대신 W5: 폰을 바꾸면 사라질 수 있음)' },
    { id: 'S5', t: '앱이 이미 배포돼 있음', d: '의견을 듣고 바로 고쳐 다시 배포할 수 있음' },
  ])
}

// 4 약점
{
  const s = pres.addSlide({ masterName: 'LIGHT' })
  head(s, 'W · 약점 (내부)', '비교·요청은 급여일에만 쓰고, 차별점은 아직 반응이 약함')
  ledger(s, 1.3, [
    { id: 'W1', t: '개발 1명, 법률 전문가·예산·인지도 없음', d: '상담·진정은 공공 창구에 맡겨야 함' },
    { id: 'W2', t: '받은 금액을 사용자가 매달 직접 넣어야 비교가 됨', d: '입금 문자·명세서 자동 인식 없음', tag: '인터뷰: 하겠다 2 · 귀찮음 1', tagColor: C.text1 },
    { id: 'W3', t: '비교·요청은 급여일에만 써서 앱을 열 이유가 약함', d: '이를 메우려던 미니게임은 "안 쓸 기능" 1위(15명 중 8명)', tag: '인터뷰: 게임 광고 2명 부정', tagColor: C.accent3 },
    { id: 'W4', t: '차별점 반응이 약함: 설문 쓸모 1위로 요청 메시지 1명, 기록 등록 0명', d: '확인 번호로는 "그날 실제로 일했다"까지 증명하지 못함', tag: '인터뷰: 등록 설명 필요 2명', tagColor: C.accent3 },
    { id: 'W5', t: '기록은 폰 안에만, 서버는 무료 플랜', d: '폰을 바꾸면 사라질 수 있어 백업 파일이 유일한 보호 수단, 서버는 7일간 활동이 없으면 멈춤' },
  ])
}

// 5 기회
{
  const s = pres.addSlide({ masterName: 'LIGHT' })
  head(s, 'O · 기회 (외부)', '체불은 작은 가게에 몰리고, 미달 경험자도 기관엔 10명 중 1명')
  const big = [
    { v: '74.9%', l: '2026년 1~9월 체불액 중\n30인 미만 사업장', src: '노동포털 · O1' },
    { v: '49.3%', l: '최저시급 미달 경험자 중\n아무 대응도 안 함', src: '알바천국 2026.6 · O3' },
    { v: '9.9%', l: '같은 사람 중\n노동부 신고 등 공식 절차', src: '알바천국 2026.6 · O3' },
    { v: '3배', l: '고의 또는 3개월 이상 체불 시\n최대 손해배상', src: '2025.10.23 시행 · O2' },
  ]
  big.forEach((b, i) => {
    const x = 0.5 + i * 2.3
    line(s, x, 1.35, 2.1, HEX.dk2, 1.25)
    txt(s, b.v, { x, y: 1.45, w: 2.1, h: 0.75, fontSize: 32, bold: true, color: C.accent1 })
    txt(s, b.l, { x, y: 2.22, w: 2.1, h: 0.6, fontSize: 11 })
    txt(s, b.src, { x, y: 2.85, w: 2.1, h: 0.25, fontSize: 10, color: C.accent5 })
  })
  line(s, 0.5, 3.35, 9)
  txt(s, [
    { text: 'O3  ', options: { bold: true, color: C.accent1 } }, { text: '신고 전 단계(확인 → 비교 → 요청)가 비어 있음: 미달을 겪어도 절반은 대응하지 않음', options: { breakLine: true } },
    { text: 'O4  ', options: { bold: true, color: C.accent1 } }, { text: '최저임금이 오를수록 빠뜨린 수당도 커짐: 주 15시간 주휴수당 한 주 2026년 30,960원 → 2027년 32,100원', options: { breakLine: true } },
    { text: 'O5  ', options: { bold: true, color: C.accent1 } }, { text: '무료 공공 창구(1350·노동포털·서울시 노동권리보호관)로 증빙을 들고 상담받을 수 있음' },
  ], { x: 0.5, y: 3.45, w: 9, h: 1.12, fontSize: 12, paraSpaceAfter: 5 })
  txt(s, '74.9%는 2026년부터 바뀐 집계 기준(중복 제외). 체불 법정형 5년 이하 징역·5천만 원 이하 벌금(2026.10.8 시행)', { x: 0.5, y: 4.68, w: 9, h: 0.3, fontSize: 10, color: C.accent5 })
}

// 6 위협
{
  const s = pres.addSlide({ masterName: 'LIGHT' })
  head(s, 'T · 위협 (외부)', '비교는 따라오기 쉽고, 법 위험 때문에 안 할 일이 정해져 있음')
  ledger(s, 1.3, [
    { id: 'T1', t: '하우머치는 "받은 금액" 칸만, 알바천국·알바몬은 기록과 그 칸만 붙여도 비교를 따라옴', d: 'AI 문서 서비스(진정24 등)가 늘면 요청 문구로는 차이가 작아짐' },
    { id: 'T2', t: '진정서 작성·문서 유료화·찾은 돈 수수료는 법 위험이 커서 하지 않음', d: '공인노무사법·변호사법(웹 조사 판단, 전문가 검토 전), 개인정보 관리 부담' },
    { id: 'T3', t: '사장님과의 관계 걱정으로 차액을 알아도 요청하지 않을 수 있음', d: '설문 15명 중 6명이 관계를 걱정', tag: '인터뷰: 1명 "보낼 수는 없을 것"', tagColor: C.accent3 },
    { id: 'T4', t: '쪼개기 고용 증가와 광고 시장 변동', d: '주 15시간 미만이면 찾을 주휴수당이 줄고, 광고 수익은 광고주 예산에 따라 흔들림' },
    { id: 'T5', t: '국내 정부나 큰 알바 앱이 같은 기록 기능을 내면 겹침', d: '해외는 정부가 근무 기록 앱을 운영(미국·호주)' },
  ])
}

// 7 전략
{
  const s = pres.addSlide({ masterName: 'LIGHT' })
  head(s, 'SWOT 전략', '비교를 앞세우고, 기록 구조를 키우고, 법 위험이 있는 일은 안 함')
  const q = [
    { k: 'SO · 공격', l: ['S1+O3  통장 총액만 보던 사람에게 "덜 받은 돈 찾기"로, 짧은 영상·에브리타임으로 홍보', 'S1+O2  "3개월 이상 체불"에 맞춰 여러 달 합계 묶음 강화', 'S1+O5  증빙 PDF를 1350·노동권리보호관 상담 자료로 안내'] },
    { k: 'ST · 우회', l: ['S3+T1  비교는 따라와도 "못 고치는 기록 + 다시 등록"은 따라 하기 어려움', 'S2+T3  "제가 계산을 잘 몰라서 여쭤보는데요"처럼 묻는 말로 시작, 고쳐 보내기 쉽게', 'S4+T5  정부·큰 앱과 겹쳐도 사장님 가입 없이 혼자 쓰는 쪽을 지킴'] },
    { k: 'WO · 보완', l: ['W3+O3  앱을 열 이유는 게임보다 "급여 받으셨나요?" 알림', 'W1+O5  상담·진정은 공공 창구에 맡기고, 개발 1명은 앱에만', 'W4+O2  여러 달 합계 묶음과 함께 확인 번호를 쉬운 말로 설명'] },
    { k: 'WT · 최소화', l: ['W1+T2  유료 문서·수수료·진정서 없음, 효력 장담 표현 안 씀', 'W3+T4  광고 수익이 흔들려도 핵심 화면은 광고 없이 무료로', 'W5+T1  백업 안내를 눈에 띄게, 쌓인 기록을 지킴'] },
  ]
  txt(s, 'O · 기회와 짝', { x: 0.9, y: 1.22, w: 4.2, h: 0.25, fontSize: 10, bold: true, color: C.accent5 })
  txt(s, 'T · 위협과 짝', { x: 5.3, y: 1.22, w: 4.2, h: 0.25, fontSize: 10, bold: true, color: C.accent5 })
  txt(s, 'S\n강점', { x: 0.45, y: 1.62, w: 0.4, h: 0.6, fontSize: 10, bold: true, color: C.accent5 })
  txt(s, 'W\n약점', { x: 0.45, y: 3.5, w: 0.4, h: 0.6, fontSize: 10, bold: true, color: C.accent5 })
  q.forEach((c, i) => {
    const x = 0.9 + (i % 2) * 4.4, y = 1.52 + Math.floor(i / 2) * 1.88
    line(s, x, y, 4.2, HEX.dk2, 1.25)
    txt(s, c.k, { x, y: y + 0.06, w: 4.2, h: 0.28, fontSize: 12, bold: true, color: C.accent1 })
    txt(s, c.l.map((t, j) => ({ text: t, options: { breakLine: j < c.l.length - 1, ...(j === 0 ? { bold: true, color: C.accent1 } : {}) } })), { x, y: y + 0.38, w: 4.2, h: 1.42, fontSize: 10.5, paraSpaceAfter: 4 })
  })
}

// 8 인터뷰 원문 표
{
  const s = pres.addSlide({ masterName: 'LIGHT' })
  head(s, '11월 검증 · 카톡 인터뷰 3명 (2026.11.17)', 'SWOT 가정을 지인 3명에게 직접 물어봄')
  txt(s, 'A 예전에 알바함 · B 예전 4개월(4시간씩) · C 지금 알바 중', { x: 0.5, y: 1.2, w: 9, h: 0.25, fontSize: 10.5, color: C.accent5 })
  const H = { bold: true, color: C.background1, fill: { color: HEX.dk2 }, fontSize: 10.5 }
  const r = (q, a, b, c, k) => [{ text: q, options: { bold: true } }, { text: a }, { text: b }, { text: c }, { text: k, options: { bold: true, color: C.accent1 } }]
  const rowsT = [
    [{ text: '물어본 것', options: H }, { text: 'A', options: H }, { text: 'B', options: H }, { text: 'C', options: H }, { text: '관련', options: H }],
    r('월급 확인', '"통장에 꽂히는 것만"', '"알람으로"', '"잘 안 함"', 'O3'),
    r('가장 쓸모 있는 기능', '사장님에게 보내기', '자동 계산', '급여 비교', 'S1 · W4'),
    r('요청 메시지를 보낼지', '"조금 수정해서"', '"보낼 수는 없을 것"', '"보낼 수 있을 것"', 'S2 · T3'),
    r('받은 금액을 매달 넣을지', '"조금 귀찮을 것"', '"귀찮아도 손해 안 보려면 이득"', '"하는 게 더 좋아 보임"', 'W2'),
    r('게임 화면에만 광고', '"안 좋을 것"', '"유저들이 싫어할 것"', '"괜찮을 것"', 'W3'),
    r('기록 등록 설명이 필요한지', '"필요할 것"', '"필요해 보임"', '"괜찮을 것"', 'S3 · W4'),
  ]
  s.addTable(rowsT, { x: 0.5, y: 1.5, w: 9, colW: [2.0, 1.95, 2.25, 1.95, 0.85], fontSize: 10.5, fontFace: 'Malgun Gothic', color: HEX.dk1, border: { type: 'solid', pt: 0.75, color: HEX.accent6 }, rowH: 0.4, valign: 'middle', margin: 0.06 })
  txt(s, ['팀원 지인 3명, 카톡 짧은 답이라 사람 수로만 봄. 앱을 직접 써 보게 하지는 않음', '요청 메시지·매달 입력·설명 질문은 답이 한쪽으로 기울 수 있어 다음 인터뷰에서는 이유를 함께 물음'].map((t, j) => ({ text: t, options: { breakLine: j < 1 } })), { x: 0.5, y: 4.48, w: 9, h: 0.5, fontSize: 10, color: C.accent5, paraSpaceAfter: 2 })
}

// 9 인터뷰 뒤 바뀐 것
{
  const s = pres.addSlide({ masterName: 'LIGHT' })
  head(s, '인터뷰 뒤', 'SWOT에서 그대로인 것, 약점이 커진 것, 다시 볼 것')
  const rows = [
    { k: '그대로 · O3', v: '급여를 따져 보지 않는 사람이 많음', d: '설문 알바 경험자 13명 중 8명이 통장 총액만 봄, 인터뷰 3명 모두 입금만 보거나 잘 안 봄', c: C.accent2 },
    { k: '대체로 그대로 · W2', v: '매달 입력은 "손해 안 보려면" 하겠다는 답이 3명 중 2명', d: '1명은 귀찮다. 설문 "귀찮지만 할 것" 15명 중 9명 → 알림에서 바로 넣는 화면 유지', c: C.text1 },
    { k: '약점 커짐 · W3 · T4', v: '게임 화면 광고에 부정적', d: '2명 부정, 설문 광고 "싫다" 15명 중 5명 · 안 쓸 기능 1위 게임 8명 → 11/23 광고 실험 뒤 게임 유지 결정', c: C.accent3 },
    { k: '다시 볼 것 · W4 · T3', v: '요청 메시지와 기록 등록', d: '2명 보내겠다(1명은 고쳐서), 1명 "보낼 수는 없을 것". 등록은 설명 필요 2명 → 앱 안 설명을 쉽게', c: C.accent1 },
  ]
  line(s, 0.5, 1.3, 9, HEX.dk2, 1.25)
  rows.forEach((it, i) => {
    const y = 1.3 + i * 0.85
    txt(s, it.k, { x: 0.5, y: y + 0.14, w: 1.9, h: 0.3, fontSize: 11, bold: true, color: it.c })
    txt(s, [{ text: it.v, options: { bold: true, fontSize: 13, breakLine: true } }, { text: it.d, options: { fontSize: 10.5, color: C.accent5 } }], { x: 2.4, y: y + 0.1, w: 7.1, h: 0.72, paraSpaceAfter: 2 })
    line(s, 0.5, y + 0.85, 9)
  })
}

// 9 그래서
{
  const s = pres.addSlide({ masterName: 'LIGHT' })
  head(s, '정리', '기말까지 이렇게 감')
  const items = [
    { k: '앞세울 것', v: '받은 돈과 비교해 덜 받은 금액 찾기', d: '설문 쓸모 1위(15명 중 8명), 인터뷰 3명 모두 입금만 보거나 잘 안 봄' },
    { k: '키울 것', v: '사유 없이 못 고치는 기록 + 확인 번호', d: '경쟁 앱이 따라 하려면 기록 구조부터 바꿔야 함. 설문 쓸모 1위 0명, 인터뷰 설명 필요 2명이라 설명부터 쉽게' },
    { k: '하지 않을 것', v: '진정서 작성 · 문서 유료화 · 찾은 돈 수수료', d: '공인노무사법·변호사법. 공공 창구(1350·노동포털)로 연결만' },
    { k: '정할 것', v: '게임 유지 여부, 요청 문구를 고쳐 보내기 쉽게', d: '광고 실험(11/23)과 인터뷰 결과로 결정, 11/30 기능 동결' },
  ]
  line(s, 0.5, 1.3, 9, HEX.dk2, 1.25)
  items.forEach((it, i) => {
    const y = 1.3 + i * 0.85
    txt(s, it.k, { x: 0.5, y: y + 0.14, w: 1.6, h: 0.3, fontSize: 12, bold: true, color: C.accent5 })
    txt(s, [{ text: it.v, options: { bold: true, fontSize: 14, color: C.accent1, breakLine: true } }, { text: it.d, options: { fontSize: 10.5, color: C.accent5 } }], { x: 2.1, y: y + 0.1, w: 7.4, h: 0.72, paraSpaceAfter: 2 })
    line(s, 0.5, y + 0.85, 9)
  })
}

;(async () => {
  await pres.writeFile({ fileName: OUT })
  await applyTheme(OUT, THEME)
  console.log('wrote', OUT)
})()
