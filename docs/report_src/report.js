// 알바가드 중간평가 보고서 (.docx) 생성. 만든 뒤 한글에서 hwpx로 저장한다
const fs = require('fs')
const path = require('path')
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType,
  ImageRun, PageBreak, BorderStyle, ShadingType, LevelFormat, VerticalAlign, TableLayoutType,
} = require('docx')

const PROJ = 'C:/Users/user/Desktop/albaguard기술창업'
const SHOT = (n) => path.join(PROJ, 'docs/screenshots', n)
const FIG = (n) => path.join(PROJ, 'docs/report_src', n)
const OUT = process.argv[2] || path.join(PROJ, 'docs/07_중간평가_보고서.docx')

const FONT = { ascii: 'Malgun Gothic', hAnsi: 'Malgun Gothic', eastAsia: 'Malgun Gothic', cs: 'Malgun Gothic' }
const NAVY = '2A3193', GRAY = '5D636D', LINE = 'DCD9D0', PAPER = 'F4F3EF', RED = 'C2331C'
const CONTENT_W = 9026 // A4 - 1인치 여백 (DXA)

// ---------- 도우미 ----------
const run = (text, o = {}) => new TextRun({ text, font: FONT, ...o })
const P = (textOrRuns, o = {}) => new Paragraph({
  children: typeof textOrRuns === 'string' ? [run(textOrRuns)] : textOrRuns,
  spacing: { after: 120, line: 320 }, ...o,
})
const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [run(t, { bold: true, size: 32, color: NAVY })], spacing: { before: 360, after: 200 }, pageBreakBefore: true, keepNext: true })
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [run(t, { bold: true, size: 25, color: NAVY })], spacing: { before: 280, after: 140 }, keepNext: true })
const H3 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [run(t, { bold: true, size: 22 })], spacing: { before: 200, after: 100 }, keepNext: true })
const Bul = (t, level = 0) => new Paragraph({ children: typeof t === 'string' ? [run(t)] : t, numbering: { reference: 'bul', level }, spacing: { after: 60, line: 300 } })
let numInst = 0
const newList = () => { numInst++ }
const Num = (t) => new Paragraph({ children: typeof t === 'string' ? [run(t)] : t, numbering: { reference: 'num', level: 0, instance: numInst }, spacing: { after: 60, line: 300 } })
const Note = (t) => new Paragraph({ children: [run(t, { size: 18, color: GRAY })], spacing: { after: 160, line: 280 } })
const Caption = (t) => new Paragraph({ children: [run(t, { size: 18, color: GRAY })], alignment: AlignmentType.CENTER, spacing: { before: 60, after: 240 } })
const border = { style: BorderStyle.SINGLE, size: 4, color: LINE }
const borders = { top: border, bottom: border, left: border, right: border, insideHorizontal: border, insideVertical: border }
const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder, insideHorizontal: noBorder, insideVertical: noBorder }

function cell(content, w, { head = false, shade, bold = false, color, align } = {}) {
  const paras = (Array.isArray(content) ? content : [content]).map((c) =>
    typeof c === 'string'
      ? new Paragraph({ children: [run(c, { bold: head || bold, size: 19, color: head ? GRAY : color })], alignment: align, spacing: { after: 40, line: 280 } })
      : c)
  return new TableCell({
    children: paras, width: { size: w, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER,
    shading: head || shade ? { type: ShadingType.CLEAR, fill: shade || PAPER, color: 'auto' } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
  })
}
function Tbl(widths, headers, rows, opts = {}) {
  const sum = widths.reduce((a, b) => a + b, 0)
  const ws = widths.map((w) => Math.round((w / sum) * CONTENT_W))
  const trs = []
  if (headers) trs.push(new TableRow({ tableHeader: true, children: headers.map((h, i) => cell(h, ws[i], { head: true })) }))
  rows.forEach((r) => trs.push(new TableRow({ children: r.map((c, i) => cell(c, ws[i], { bold: i === 0 && opts.boldFirst, color: opts.colors && opts.colors[i] })) })))
  return [new Table({ rows: trs, width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: ws, borders, layout: TableLayoutType.FIXED }), new Paragraph({ spacing: { after: 120 } })]
}
function Img(file, widthPx, type) {
  const data = fs.readFileSync(file)
  const { PNG } = {}
  const size = imgSize(file)
  const h = Math.round(widthPx * size.h / size.w)
  return new Paragraph({ alignment: AlignmentType.CENTER, children: [new ImageRun({ type, data, transformation: { width: widthPx, height: h } })], spacing: { before: 120, after: 60 }, keepNext: true })
}
function imgSize(file) {
  const b = fs.readFileSync(file)
  if (b[0] === 0x89 && b[1] === 0x50) return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) }
  // jpeg
  let i = 2
  while (i < b.length) {
    if (b[i] !== 0xff) { i++; continue }
    const m = b[i + 1]
    if (m >= 0xc0 && m <= 0xc3) return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) }
    i += 2 + b.readUInt16BE(i + 2)
  }
  return { w: 750, h: 1624 }
}
// 폰 캡처 여러 장을 한 줄에 (테두리 없는 표)
function Phones(items, widthPx = 150) {
  const n = items.length, w = Math.floor(CONTENT_W / n)
  const row = new TableRow({ children: items.map(([file, cap]) => new TableCell({
    width: { size: w, type: WidthType.DXA }, borders: noBorders, margins: { top: 60, bottom: 60, left: 60, right: 60 },
    children: [
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new ImageRun({ type: 'jpg', data: fs.readFileSync(file), transformation: { width: widthPx, height: Math.round(widthPx * 1624 / 750) } })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, children: [run(cap, { size: 17, color: GRAY })], spacing: { before: 60 } }),
    ],
  })) })
  return [new Table({ rows: [row], width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: items.map(() => w), borders: noBorders, layout: TableLayoutType.FIXED }), new Paragraph({ spacing: { after: 120 } })]
}
const Gap = (after = 200) => new Paragraph({ spacing: { after } })

// ---------- 본문 ----------
const children = []

// 표지
children.push(
  Gap(2400),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [run('[SW기술창업] 중간평가 보고서', { size: 28, color: GRAY })], spacing: { after: 400 } }),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [run('알바가드', { bold: true, size: 72, color: NAVY })], spacing: { after: 160 } }),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [run('못 받은 알바비, 기록으로 찾는 앱', { size: 32 })], spacing: { after: 2000 } }),
)
{
  const w = [2200, 6826]
  const rows = [
    ['프로젝트명', '알바가드 (못 받은 알바비, 기록으로 찾는 앱)'],
    ['팀명', '미정 (후보: 기록조 · 온타임 · 페이체크 · 알바가드팀. 발표 뒤 확정)'],
    ['팀원', '팀장 이지훈, 팀원 손유호 · 박명진'],
    ['제출일', '2026년 10월 27일'],
    ['조', '4조'],
    ['배포 주소', 'https://jihooni217.github.io/albaguard/'],
  ]
  children.push(...Tbl(w, null, rows, { boldFirst: true }))
}

// 목차
children.push(
  new Paragraph({ children: [run('목차', { bold: true, size: 32, color: NAVY })], spacing: { before: 200, after: 240 }, pageBreakBefore: true }),
  ...[
    '1. 프로젝트 개요',
    '   1.1 프로젝트명  1.2 팀명 및 팀원  1.3 아이템 한 줄 정의',
    '2. 창업 아이템 정의 및 필요성',
    '   2.1 배경 및 문제점  2.2 해결 방안(SW 솔루션)  2.3 핵심 타겟 고객',
    '3. SW 기술 요소 및 개발 현황',
    '   3.1 시스템 아키텍처  3.2 주요 구현 기능  3.3 MVP 현황(화면 캡처와 설명)',
    '4. 비즈니스 모델 및 시장성',
    '   4.1 시장 규모와 타이밍  4.2 수익 창출 구조  4.3 경쟁사 분석 및 차별점  4.4 유저 확보 전략',
    '5. 남은 과제 및 기말 마일스톤',
    '   5.1 기말 전 추가 개발 계획  5.2 시장 검증·피드백 수집 계획  5.3 개발 일정 간트 차트',
    '부록. 자료 출처, 설문 문항',
  ].map((t) => new Paragraph({ children: [run(t, { size: t.startsWith('   ') ? 19 : 22, color: t.startsWith('   ') ? GRAY : undefined, bold: !t.startsWith('   ') })], spacing: { after: 80 } })),
)

// 1. 프로젝트 개요
children.push(H1('1. 프로젝트 개요'))
children.push(H2('1.1 프로젝트명'))
children.push(P('알바가드 (못 받은 알바비, 기록으로 찾는 앱)'))
children.push(H2('1.2 팀명 및 팀원'))
children.push(P('팀명은 아직 정하지 못했다. 후보는 기록조, 온타임, 페이체크, 알바가드팀 네 가지이고 발표 뒤 하나로 정한다.'))
children.push(Bul('팀장 이지훈 (컴퓨터소프트웨어 22학번): 기획, 개발, 배포, 문서 작성. 앞으로 기록 등록 보강과 기술 검증'))
children.push(Bul('팀원 손유호 (컴퓨터소프트웨어 __학번): 시장·경쟁사 조사, 비즈니스 모델, 설문 집계 (10월 27일부터)'))
children.push(Bul('팀원 박명진 (컴퓨터소프트웨어 __학번): 사용자 인터뷰·검증, 일정 관리, 보고서 편집, 기기 테스트 (10월 27일부터)'))
children.push(Note('지금까지의 기획·개발·배포는 팀장이 맡았고, 중간 발표 이후의 역할을 위와 같이 나누었다. 발표 분담도 같다(팀장 ①~⑤와 시연, 손유호 ⑥, 박명진 ⑦⑧).'))
children.push(H2('1.3 아이템 한 줄 정의'))
children.push(P('시급제 아르바이트 대학생이 사장 연동 없이 혼자 출퇴근을 기록하고, 그 기록으로 계산한 급여와 실제 입금액을 비교해 덜 받은 돈을 찾고, 사장님께 보낼 정산 요청 문구와 증빙 자료까지 만들어 주는 모바일 웹앱.'))

// 2. 창업 아이템 정의 및 필요성
children.push(H1('2. 창업 아이템 정의 및 필요성'))
children.push(H2('2.1 배경 및 문제점'))
children.push(H3('문제 1. 얼마를 받아야 하는지 계산하기 어렵다'))
children.push(Bul('주휴수당(주 15시간 이상 일하고 개근한 주)과 야간수당(22시~06시, 5인 이상 사업장)은 조건이 있어 알바생이 스스로 판단하기 어렵다.'))
children.push(Bul('노동절에 근무한 알바생 중 수당을 받는다는 응답은 38.5%였고, "안내받지 못해 모르겠다"가 33.2%였다 (알바천국, 749명, 2026.4).'))
children.push(Bul('급여 계산기는 여러 곳에 있지만, 넣을 근무 기록이 남아 있지 않아 실제로는 쓰이지 못한다.'))
children.push(H3('문제 2. 덜 받아도 알아채기 어렵고, 증명할 수단이 없다'))
children.push(Bul('급여가 들어오면 통장 총액만 보고 넘어간다.'))
children.push(Bul('알바생 2,457명 중 48.0%가 임금 관련 문제를 겪었고, 가장 많은 유형이 주휴수당 등 수당의 미지급·지연 37.3%, 전체 임금 지연·미지급 32.8%, 약속보다 적게 지급 23.9%였다 (알바천국, 2025.1).'))
children.push(Bul('최저시급 미달을 겪은 응답자의 49%가 근로계약서를 아예 쓰지 않았다 (알바천국, 1,804명, 2026.6). 시급이 얼마로 약속됐는지 증명할 문서가 없다.'))
children.push(H3('문제 3. 알아도 말을 꺼내기 어렵다'))
children.push(Bul('최저시급 미달 경험자 중 49.3%가 아무 대응도 하지 않았고, 사장과 직접 협의한 경우는 27.1%, 신고 등 공식 절차를 쓴 경우는 9.9%였다 (알바천국, 2026.6).'))
children.push(Bul('관계가 불편해질 걱정, 금액이 작다는 생각, 근거가 없다는 점이 겹친다. 신고 창구가 없어서가 아니라, 말을 꺼낼 근거와 시점이 마땅치 않아 문제가 덮인다.'))

children.push(H2('2.2 해결 방안 (SW 솔루션)'))
children.push(P('기록, 비교, 요청의 세 단계를 앱 하나로 잇는다. 신고 창구를 새로 만드는 것이 아니라 신고 이전 단계를 채운다.'))
newList()
children.push(Num([run('수정 이력이 남는 근무 기록. ', { bold: true }), run('출근·퇴근 버튼 하나로 기록한다. 기록을 고치면 수정 전후 시각, 수정 시점, 사유가 함께 남고, 삭제도 "삭제됨"으로 표시만 한다. 캘린더에서 예정 스케줄과 실제 근무를 비교해 연장, 대타, 단축을 표시한다.')]))
children.push(Num([run('입금액 비교와 차액 표시. ', { bold: true }), run('기본급, 주휴수당, 야간수당을 더해 "받았어야 할 돈"을 계산하고, 사용자가 넣은 "실제 받은 돈"과 비교해 차액을 보여 준다. 연도별 최저임금 표로 시급이 최저임금에 못 미치면 경고한다. 받은 금액을 아직 넣지 않은 달이 있으면 첫 화면에서 물어본다.')]))
children.push(Num([run('단계별 정산 요청. ', { bold: true }), run('1단계는 사장님께 보낼 정중한 메시지(날짜별 기록과 계산 근거 포함), 2단계는 내용증명 초안, 3단계는 진정 절차 안내(고용노동부 1350 전화, 노동포털 연결)이다. 바로 신고로 가지 않고 대화로 먼저 풀도록 설계했다.')]))
children.push(Num([run('증빙 묶음 PDF. ', { bold: true }), run('근무 기록, 수정 이력, 계산 근거, 입금 내역, 첨부 사진(근무표·시급 근거·입금 내역), 정산 요청 이력, 기록 등록 확인의 7개 항목을 한 문서로 정리한다.')]))
children.push(Num([run('기록 등록(서버 타임스탬프). ', { bold: true }), run('기록을 남기거나 고칠 때마다 기록 내용으로 만든 확인 번호와 서버 등록 시각이 남는다. 근무지, 시각, 금액은 서버로 가지 않는다. 누구나 확인 페이지에서 "그 내용이 그 시각에 있었고 그 뒤 바뀌지 않았다"를 확인할 수 있다.')]))
children.push(H3('설계 원칙'))
children.push(Bul('사장 연동 없음, 로그인 없음. 근무 내용은 폰 안에만 둔다.'))
children.push(Bul('법적 효력을 보장한다고 말하지 않는다. 근로감독관과 법원이 판단할 자료를 정리해 준다(앱 안의 문서에도 적음).'))
children.push(Bul('진정서는 만들지 않는다. 신고 창구로 연결까지만.'))

children.push(H2('2.3 핵심 타겟 고객'))
children.push(Bul('주 15시간 이상 일하는 만 19~26세 시급제 알바 대학생 (카페·편의점·음식점, 주 3~5일 근무).'))
children.push(Bul('근로계약서가 없거나 사본이 없고, 입금 총액만 확인하며, 사장에게 정산 문제를 꺼내기 부담스러워한다.'))
children.push(Bul('얼리 어답터: 주휴수당 대상인데 못 받고 있거나 주휴·야간 지급 여부를 모르는 대학생, 곧 그만두거나 최근 그만둔 학생.'))

// 3. SW 기술 요소 및 개발 현황
children.push(H1('3. SW 기술 요소 및 개발 현황'))
children.push(H2('3.1 시스템 아키텍처'))
children.push(H3('기술 스택'))
children.push(...Tbl([1500, 3500, 4026], ['구분', '기술', '선택 이유'], [
  ['프론트엔드', 'React 19 + Vite, PWA (서비스 워커로 오프라인 실행, 홈 화면에 추가)', '스토어 심사 없이 링크로 배포한다. 사용자 의견을 듣고 바로 고쳐 다시 배포할 수 있다.'],
  ['백엔드', '별도 서버 없음. Supabase REST API', '근무 내용이 폰 밖으로 나가지 않게 한다. 서버는 확인 번호 등록과 설문 수집에만 쓴다.'],
  ['데이터베이스', '폰: localStorage(기록), IndexedDB(사진)\n서버: Supabase PostgreSQL (stamps, survey 표)'.split('\n'), '기록 소유권은 사용자에게 둔다. 서버 표는 넣기만 되고 수정·삭제는 막았다(RLS). 등록 시각은 트리거가 서버 시각으로 강제한다.'],
  ['인프라', 'GitHub Pages + GitHub Actions', 'main 브랜치에 올리면 자동으로 빌드·배포된다.'],
  ['AI', 'Claude API (선택, 개발 환경에서만)', '배포된 앱은 API 키 없이 정해진 문구로 동작한다. 기록 내용을 밖으로 보내지 않으려고 기본은 끈다.'],
  ['데이터 분석', '설문 페이지 + 자동 집계 페이지(Supabase), 직접 인터뷰', '로그인이 없어 사용 로그 대신 설문과 인터뷰로 측정한다.'],
], { boldFirst: true }))
children.push(H3('시스템 구성도'))
children.push(Img(FIG('fig_architecture.png'), 600, 'png'))
children.push(Caption('그림 1. 시스템 구성도와 데이터 흐름. 근무 내용은 폰 안에, 서버에는 확인 번호와 등록 시각만 간다'))
children.push(H3('데이터 흐름 (기록 하나가 남을 때)'))
newList()
children.push(Num('출근 버튼: 기록 번호를 만들고, 출근 시각 기록의 확인 번호를 서버에 등록한다.'))
children.push(Num('퇴근 버튼: 완성된 기록의 확인 번호를 서버에 등록한다.'))
children.push(Num('수정·삭제: 수정 이력이 붙은 새 내용의 확인 번호를 다시 등록한다. 같은 기록에 줄이 여러 개면 그만큼 고쳐진 것이다.'))
children.push(Num('인터넷이 없으면 대기열에 두었다가 연결되면 보낸다.'))
children.push(Num('증빙 묶음 PDF 7번 표에 기록별 확인 번호와 등록 시각이 들어간다.'))
children.push(H3('보안과 개인정보'))
children.push(Bul('서버에는 이름, 근무지, 시각, 금액이 가지 않는다. 확인 번호만으로는 내용을 되돌릴 수 없다.'))
children.push(Bul('공개용 키만 코드에 두고, 쓰기 권한이 있는 키는 쓰지 않는다. 서버 표는 넣기만 허용한다.'))
children.push(Bul('기록 등록은 설정에서 끌 수 있고, 무엇이 서버로 가는지 설정 탭에 적어 두었다.'))

children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [run('3.2 주요 구현 기능', { bold: true, size: 25, color: NAVY })], spacing: { before: 0, after: 140 }, pageBreakBefore: true, keepNext: true }))
children.push(P('기능마다 [완료] / [진행 중 N%] / [설계]로 적었다. 100%는 쓰지 않고 남은 일을 같이 적었다.'))
children.push(...Tbl([3300, 1300, 4426], ['기능', '상태', '설명과 남은 일'], [
  ['근무 기록 (출퇴근, 수정 이력, 직접 추가, 퇴근 누락 보호)', '진행 중 90%', '동작한다. 실제 폰에서 몇 주 이상 써 본 검증이 남았다.'],
  ['캘린더 (예정 vs 실제, 연장·대타·단축·합의 휴무)', '진행 중 85%', '동작한다. 반복 스케줄 입력 편의 기능이 없다.'],
  ['급여 계산 (기본급·주휴·야간, 휴게시간, 시급 변경 이력, 연도별 최저임금)', '진행 중 85%', '동작한다. 연장근로 가산은 반영하지 않았다(화면에 표시).'],
  ['입금액 비교·차액 알림 (받은 금액 입력, 3.3% 세금, 여러 달 합계)', '진행 중 80%', '동작한다. 입금 문자·명세서 사진 자동 인식은 보류했다.'],
  ['단계별 정산 요청 (메시지·내용증명·진정 안내, 보낸 날짜 기록, 14일 뒤 알림)', '진행 중 75%', '동작한다. 문구 톤을 사용자에게 검증하지 못했다. AI 문구는 선택 사항이다.'],
  ['증빙 묶음 PDF (7개 항목, 첨부 사진)', '진행 중 80%', '동작한다. 실제 폰에서 PDF 저장 확인이 필요하다.'],
  ['기록 등록 (확인 번호·등록 시각, 확인 페이지)', '진행 중 70%', '컴퓨터에서 출근·퇴근·수정 모두 등록되는 것을 확인했다. 실제 폰 확인과, 제3자가 내용으로 번호를 다시 계산해 볼 방법이 남았다.'],
  ['기록 백업·불러오기', '진행 중 80%', '동작한다. 실제 폰에서 파일 저장 확인이 필요하다.'],
  ['퇴직금 알림, 시급 근거 사진 권하기, 쉬는 틈 게임 3종', '완료', '보조 기능. 게임 기록은 증빙·요청 문서에 섞이지 않는다.'],
  ['입금 문자·급여명세서 사진 금액 자동 인식', '설계', 'API 키 없이 폰 안에서 하기 어려워 보류했다. 향후 계획.'],
  ['푸시 알림', '설계 제외', '서버가 입금을 알 수 없어 "앱을 열면 알려 준다"로 대체했다.'],
]))
children.push(P([run('계획 대비 구현 비율: ', { bold: true }), run('MVP 기능 정의서의 포함 기능 8개가 모두 동작하는 수준으로 배포되었다. 세부 완성도 평균 약 80%. 실제 사용자 검증은 시작 단계이다.')]))
children.push(Img(FIG('fig_progress.png'), 600, 'png'))
children.push(Caption('그림 2. 기능별 완성도'))

children.push(H2('3.3 MVP 현황: 화면 캡처와 설명'))
children.push(P('배포 주소 https://jihooni217.github.io/albaguard/ (저장소 github.com/jihooni217/albaguard). 폰 브라우저에서 "홈 화면에 추가"로 설치해 앱처럼 쓴다.'))
children.push(...Phones([[SHOT('1-home.jpg'), '첫 화면(근무 기록)'], [SHOT('2-calendar.jpg'), '캘린더'], [SHOT('3-pay.jpg'), '급여 비교']], 165))
children.push(Bul([run('첫 화면: ', { bold: true }), run('이번 달 받을 돈과 일한 시간, 출근 버튼, 알림(받은 금액 확인, 덜 받은 급여, 주휴수당 대상), 내역이 통장처럼 쌓인다.')]))
children.push(Bul([run('캘린더: ', { bold: true }), run('예정 스케줄과 실제 근무를 비교해 연장·대타만 글자로 표시한다. 고른 날은 예정, 실제, 차이 세 줄로 보여 준다.')]))
children.push(Bul([run('급여 비교: ', { bold: true }), run('"받았어야 할 돈" 아래에 "실제로 얼마 받았나요?"를 먼저 묻는다. 넣으면 덜 받은 돈이 빨간 숫자로 바뀌고 계산 내역이 아래에 온다.')]))
children.push(...Phones([[SHOT('4-request.jpg'), '정산 요청'], [SHOT('8-evidence.jpg'), '증빙 묶음 PDF'], [SHOT('9-verify.jpg'), '확인 페이지']], 165))
children.push(Bul([run('정산 요청: ', { bold: true }), run('덜 받은 돈과 근거, 1~3단계. 메시지를 복사하고 보낸 날짜를 남길 수 있다. 14일이 지나도 덜 받은 상태면 다음 단계를 권한다.')]))
children.push(Bul([run('증빙 묶음 PDF: ', { bold: true }), run('근무 기록, 수정 이력, 계산 근거, 입금 내역, 첨부 사진, 정산 요청 이력, 기록 등록 확인. 맨 아래에 법적 효력을 보장하지 않는다는 안내가 인쇄된다.')]))
children.push(Bul([run('확인 페이지: ', { bold: true }), run('확인 번호를 넣으면 서버 등록 시각이 나온다. 앱 데이터 없이 동작하는 별도 페이지라 제3자도 열 수 있다.')]))
children.push(Note('디자인은 타겟 사용자(급여 계산 앱을 쓰는 친구)가 시안 12장 중 고른 통장 구성을 적용했다. 잉크 남색은 "기록을 잉크로 남긴다"는 뜻이다. 화면 캡처는 예시 데이터이다.'))

// 4. 비즈니스 모델 및 시장성
children.push(H1('4. 비즈니스 모델 및 시장성'))
children.push(H2('4.1 시장 규모와 타이밍'))
children.push(...Tbl([2400, 2700, 3926], ['항목', '수치', '출처·설명'], [
  ['임금체불액', '2023년 1조 7,845억 원\n2024년 2조 448억 원\n2025년 2조 679억 원'.split('\n'), '고용노동부 노동포털 임금체불 통계현황. 2년 연속 2조 원대'],
  ['2025년 체불 피해 노동자', '26만 2,304명', '같은 출처'],
  ['30인 미만 사업장 비중', '67.8% (1조 4,012억 원)', '5인 미만 6,130억, 5~29인 7,882억. 카페·편의점·음식점 같은 영세 사업장이 여기에 있다'],
  ['알바생 임금 문제 경험', '48.0%', '알바천국, 2,457명, 2025.1'],
  ['최저시급 미달 경험', '31.9%', '알바천국, 1,804명, 2026.6'],
  ['고등교육기관 재적학생', '3,072,261명', '2026년 교육기본통계(교육부, 2026.8.26 발표). 대학원 포함'],
], { boldFirst: true }))
children.push(P([run('타겟 규모(어림): ', { bold: true }), run('재적학생 약 307만 명 × 알바 경험률 약 70~80% → 약 200만 명 안팎이 알바를 경험한다. 알바 경험률은 학교 단위 조사(동의대 316명 중 88%, 동국대 200명 중 67.5%)에서 나온 값이라 전국 대표값은 아니다. 그중 주 15시간 이상(주휴수당 대상) 비율은 우리 설문에서 파악한다.')]))
children.push(P([run('타이밍: ', { bold: true }), run('2025년 9월 관계부처 합동 임금체불 근절 대책(대지급금 확대), 2025년 10월 23일 개정 근로기준법 시행(상습 체불 사업주 신용 제재 등)으로 증거만 갖추면 돌려받을 수 있는 길이 넓어졌다. 2026년 최저임금은 10,320원, 2027년은 10,700원으로 고시되어 주휴·야간을 포함한 계산은 더 복잡해진다.')]))

children.push(H2('4.2 수익 창출 구조'))
children.push(Bul([run('핵심 화면은 무료, 광고 없음. ', { bold: true }), run('기록, 비교, 요청, 증빙처럼 신뢰가 핵심인 화면에는 광고를 섞지 않는다.')]))
children.push(Bul([run('1차(가설): 쉬는 틈 게임 화면 광고. ', { bold: true }), run('스도쿠, 틀린 그림 찾기, 블록 채우기 화면에만 붙인다. 웹앱에서도 Google H5 Games Ads 같은 웹 게임용 광고로 배너, 전면, 보상형이 가능하다(승인 심사 필요, 아직 신청하지 않음).')]))
children.push(Bul([run('2차(후보): 편의 기능 구독. ', { bold: true }), run('여러 폰 동기화, 자동 백업처럼 문서·법률과 무관한 편의 기능만 대상으로 한다.')]))
children.push(Bul([run('하지 않는 것: ', { bold: true }), run('정산 요청 문구, 내용증명 초안, 증빙 묶음의 유료화. 돈을 받고 문서를 만들어 주면 변호사법·공인노무사법 문제에 가까워진다(웹 조사 기준, 전문가 검토 아님).')]))
children.push(Bul([run('비용: ', { bold: true }), run('서버는 Supabase 무료 요금제로 시작하고 사용자가 늘면 유료로 바꾼다. 인건비는 팀 3명.')]))

children.push(H2('4.3 경쟁사 분석 및 차별점'))
children.push(...Tbl([2000, 3300, 3726], ['경쟁사', '하는 것', '한계'], [
  ['1. 하우머치', '혼자 근무 기록, 예상 급여 계산, 커뮤니티·매장 후기·돈 관리', '예상 급여를 보여 주는 데서 멈춘다. 실제 입금액 비교와 체불 대응이 없다.'],
  ['2. 기그', '출퇴근 기록(GPS), 전자 근로계약서, 급여 계산', '사장과 연결해야 핵심 기능이 작동한다. 소규모 매장은 연결이 안 된다는 리뷰가 있다.'],
  ['3. 알바천국·알바몬 계산기', '시급·시간으로 일회성 계산', '기록이 남지 않는다.'],
  ['4. 진정24·고용노동부 노동포털', '진정서 작성 지원, 진정 접수', '증거를 이미 갖춘 사람만 쓸 수 있다. 재직 중인 학생에게는 마지막 수단이다.'],
], { boldFirst: true }))
children.push(Note('각 앱 공식 소개와 사용자 리뷰(2026년 9월 기준)를 참고했다.'))
children.push(Img(FIG('fig_position.png'), 420, 'png'))
children.push(Caption('그림 3. 경쟁 서비스 포지션. 혼자 쓰면서 대응까지 가는 자리가 비어 있다'))
children.push(H3('알바가드의 차별점'))
newList()
children.push(Num('사장 연동 없이 혼자 쓴다.'))
children.push(Num('실제 입금액과 비교해 차액을 찾고, 요청 문구와 증빙 묶음까지 한 흐름으로 잇는다 (네 서비스 모두 없음).'))
children.push(Num('수정 이력과 기록 등록(확인 번호·등록 시각)으로 "그때 기록한 그대로"를 제3자가 확인할 수 있다 (네 서비스 모두 없음).'))
children.push(Num('바로 신고가 아니라 대화로 먼저 풀도록 단계를 나눴다.'))
children.push(H3('먼저 인정하는 약점'))
children.push(Bul('비교 기능은 경쟁 앱이 "받은 금액 입력" 칸 하나로 따라올 수 있다. 그래서 기록의 신뢰성을 키우는 쪽으로 간다.'))
children.push(Bul('핵심 기능을 한 달에 한 번 써서 매일 열 이유가 약하다. 쉬는 틈 게임은 이를 보완하려는 시도이고, 광고 자리 후보이다.'))
children.push(Bul('확인 번호는 "나중에 고치지 않았다"까지만 보여 주고 "그날 실제로 일했다"는 증명하지 못한다. 통장 내역·메시지와 함께 내야 한다고 앱에도 적어 두었다.'))

children.push(H2('4.4 유저 확보 전략'))
children.push(Bul('링크 하나로 설치되므로 대학 커뮤니티(에브리타임), 학과·동아리 단톡, 알바 커뮤니티에 링크로 전파한다.'))
children.push(Bul('"주휴수당 계산법" 같은 짧은 영상으로 유입을 만든다.'))
children.push(Bul('지표(앞으로 측정): 홈 화면 추가 → 첫 기록 → 한 달 뒤 받은 금액 입력 → 차액 발견 → 요청 보냄 → 실제로 받은 비율(인터뷰). 서버가 사용 로그를 모으지 않아 설문과 인터뷰로 잰다.'))

// 5. 남은 과제 및 기말 마일스톤
children.push(H1('5. 남은 과제 및 기말 마일스톤'))
children.push(H2('5.1 기말 전 추가 개발 계획'))
newList()
children.push(Num('실제 폰 검증: 아이폰과 갤럭시에서 기록 등록, PDF 저장, 백업 파일 저장, 사진 첨부, 오프라인 실행을 확인한다.'))
children.push(Num('사용자 피드백 반영: 정산 요청 문구의 톤, 화면 문구, 입력 흐름을 고친다.'))
children.push(Num('기록 등록 보강: 제3자가 기록 내용으로 확인 번호를 다시 계산해 볼 수 있는 확인 방법을 만든다.'))
children.push(Num('선택: 쉬는 틈 게임 화면 광고 실험(승인되면), 또는 새 게임 "동전 합치기"(퇴근하면 오늘 번 돈이 동전이 되어 쌓이는 방식).'))
children.push(Num('보류 유지: 입금 문자·명세서 사진 자동 인식, 푸시 알림, 로그인.'))
children.push(H2('5.2 시장 검증·피드백 수집 계획'))
children.push(Bul([run('링크 설문 (https://jihooni217.github.io/albaguard/survey.html): ', { bold: true }), run('지금 알바 중, 예전에 함, 한 적 없음으로 갈라 20문항 안팎을 묻는다. 11월 중 30명 목표. 결과는 자동 집계 페이지에서 "N명 중 M명"으로 본다. 이름과 연락처는 받지 않는다.')]))
children.push(Bul([run('직접 인터뷰 5명: ', { bold: true }), run('앱을 써 보게 하고 정산 요청 문구를 실제로 보낼 수 있을지, 확인 번호 설명이 이해되는지, 매달 받은 금액을 넣을 만한지 묻는다.')]))
children.push(Bul([run('지금까지: ', { bold: true }), run('타겟 사용자 1명이 디자인 시안 12장 중 통장 구성을 골랐고("알바비는 직관적인 게 중요"), 친구 1명의 스케치로 아이콘을 정했고, 팀원 피드백으로 게임의 "근무 중에만" 조건을 풀었다(10월 25일). 링크 설문은 10월 23일에 공개했다. [발표 당일 응답 수를 적는다]')]))
children.push(Bul('정식 조사가 아니라 주변 의견이다. 사람 수로 적고 %는 응답이 30명을 넘을 때만 쓴다.'))
children.push(H2('5.3 개발 일정 간트 차트'))
children.push(Img(FIG('fig_gantt.png'), 600, 'png'))
children.push(Caption('그림 4. 10월 27일부터 12월 15일까지 주 단위 일정'))
children.push(...Tbl([3600, 2600, 2826], ['작업', '기간', '담당'], [
  ['1. 설문 수집·인터뷰', '10/27 ~ 11/9', '박명진(인터뷰), 손유호(설문 집계)'],
  ['2. 피드백 반영 1차 (문구·화면)', '11/10 ~ 11/23', '이지훈'],
  ['3. 실제 폰 검증 (아이폰·갤럭시)', '11/10 ~ 11/30', '이지훈, 박명진(갤럭시)'],
  ['4. 기록 등록 보강 (제3자 확인 방법)', '11/17 ~ 12/7', '이지훈'],
  ['5. 게임 화면 광고 실험 또는 새 게임 (선택)', '11/24 ~ 12/7', '이지훈, 손유호'],
  ['6. 최종 보고서·발표 준비', '12/1 ~ 12/15', '전원 (편집 박명진, 시장·수익 손유호)'],
]))

// 부록
children.push(H1('부록'))
children.push(H2('A. 자료 출처'))
children.push(Bul('고용노동부 노동포털, 「임금체불 통계현황」 (labor.moel.go.kr)'))
children.push(Bul('관계부처 합동, 「임금체불 근절 대책」, 2025.9.2'))
children.push(Bul('알바천국 설문조사: 2025.1 (알바생 2,457명), 2026.4 (노동절 근무 알바생 749명), 2026.6 (아르바이트 경험자 1,804명)'))
children.push(Bul('교육부, 「2026년 교육기본통계 조사 결과」, 2026.8.26'))
children.push(Bul('각 앱(하우머치, 기그, 알바천국·알바몬, 진정24, 노동포털) 공식 소개와 사용자 리뷰, 2026.9 기준'))
children.push(H2('B. 설문 문항 (요약)'))
children.push(P('첫 질문(지금 알바 중 / 예전에 했음 / 한 적 없음)으로 갈라서 해당 문항만 한 번에 하나씩 나온다. 알바 경험자 20문항, 미경험자 12문항.'))
children.push(Bul('기본: 알바 종류, 주당 시간, 시급과 주휴수당 지급 여부, 근로계약서, 급여 확인 방법, 출퇴근 기록 방법'))
children.push(Bul('겪은 일: 적게 받은 것 같았던 적, 직접 계산해 본 적, 그때 어떻게 했는지, 말 못 한 이유'))
children.push(Bul('생각(모두): 주변에서 들은 이야기, 급여날 생각보다 적은 돈이 들어온다면, 가장 걱정될 것, 주휴·야간수당 계산 자신'))
children.push(Bul('앱을 본 뒤: 가장 쓸모 있어 보이는 기능, 안 쓸 것 같은 기능, 매달 받은 금액 직접 넣기, 게임 화면 광고, 디자인, 실제로 있다면 쓸지, 자유 의견'))
children.push(Note('문항 전체는 저장소의 docs/05_인터뷰_설문지.md와 public/survey.html에 있다.'))
children.push(H2('C. 안내 문구'))
children.push(Note('이 보고서와 앱의 증빙 자료는 본인이 적은 기록을 정리한 참고 자료이며, 법적 효력이나 증거 인정이 보장되지 않는다(판단은 근로감독관과 법원). 앱은 법률 자문이나 신고 대행을 하지 않고, 진정은 1350과 노동포털로 연결만 한다.'))

const doc = new Document({
  creator: '4조',
  title: '알바가드 중간평가 보고서',
  styles: {
    default: { document: { run: { font: FONT, size: 21 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 32, bold: true, color: NAVY }, paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 25, bold: true, color: NAVY }, paragraph: { spacing: { before: 280, after: 140 }, outlineLevel: 1 } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 22, bold: true }, paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 } },
    ],
  },
  numbering: {
    config: [
      { reference: 'bul', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 440, hanging: 260 } } } }] },
      { reference: 'num', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 440, hanging: 300 } } } }] },
    ],
  },
  sections: [{
    properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
    children,
  }],
})

Packer.toBuffer(doc).then((buf) => { fs.writeFileSync(OUT, buf); console.log('written', OUT) })
