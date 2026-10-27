// 팀장(이지훈) 발표 대본만 한글 문서로. 10_발표_대본.md에서 이지훈 쪽만 뽑아 docx로 만든 뒤 한글 COM으로 hwpx로 저장한다.
// 쓰는 법: scratchpad deck 폴더에서 NODE_PATH=./node_modules node my_script.js <대본.md> <출력.docx>
const fs = require('fs')
const { Document, Packer, Paragraph, TextRun, BorderStyle } = require('docx')

const SRC = process.argv[2]
const OUT = process.argv[3] || 'my_script.docx'
const FONT = '맑은 고딕'
const NAVY = '2A3193'
const GRAY = '6E6E6E'

// "## 3쪽 · 이지훈" 단위로 나눠 이지훈 것만
const md = fs.readFileSync(SRC, 'utf8').replace(/\r/g, '')
const parts = md.split(/^## /m).slice(1)
  .map((p) => { const [h, ...body] = p.split('\n'); return { h: h.trim(), lines: body.map((l) => l.trim()).filter(Boolean) } })
  .filter((p) => p.h.includes('이지훈'))

// **굵게**와 (멈춤)·(재생 전) 같은 괄호 지시를 글자 모양으로
const runs = (line) => {
  const out = []
  for (const piece of line.split(/(\*\*[^*]+\*\*|\([^)]*(?:멈춤|재생 전|영상)[^)]*\))/)) {
    if (!piece) continue
    if (piece.startsWith('**')) out.push(new TextRun({ text: piece.slice(2, -2), font: FONT, size: 26, bold: true, color: NAVY }))
    else if (piece.startsWith('(')) out.push(new TextRun({ text: piece, font: FONT, size: 22, color: GRAY }))
    else out.push(new TextRun({ text: piece, font: FONT, size: 26 }))
  }
  return out
}

const children = [
  new Paragraph({ children: [new TextRun({ text: '알바가드 중간발표 대본 · 이지훈', font: FONT, size: 34, bold: true, color: NAVY })], spacing: { after: 120 } }),
  new Paragraph({ children: [new TextRun({ text: '1~12쪽, 19쪽(마무리) · 약 10분 30초 · 13~18쪽은 손유호, 박명진', font: FONT, size: 20, color: GRAY })], spacing: { after: 80 } }),
  new Paragraph({ children: [new TextRun({ text: '(멈춤)은 핵심 문장 앞에서 한 박자 쉬는 자리, 굵은 글자는 연습할 때 보는 핵심 단어', font: FONT, size: 20, color: GRAY })], spacing: { after: 240 } }),
]
for (const p of parts) {
  children.push(new Paragraph({ children: [new TextRun({ text: p.h.replace(' · 이지훈', ''), font: FONT, size: 28, bold: true, color: NAVY })],
    spacing: { before: 320, after: 140 }, keepNext: true,
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'D6D4CC', space: 4 } } }))
  p.lines.forEach((l) => children.push(new Paragraph({ children: runs(l), spacing: { after: 100, line: 400 } })))
}

const doc = new Document({
  styles: { default: { document: { run: { font: FONT, size: 26 } } } },
  sections: [{ properties: { page: { margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } } }, children }],
})
Packer.toBuffer(doc).then((b) => { fs.writeFileSync(OUT, b); console.log('written', OUT, parts.map((p) => p.h).join(', ')) })
