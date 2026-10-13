// 블록 채우기: 8×8 판에 블록을 놓아 가로·세로 한 줄을 채우면 사라진다. 시간 제한 없음
// 판은 64칸 배열. 0이면 빈칸, 아니면 그 칸을 채운 블록의 종류 번호(색을 정한다)

export const SIZE = 8
export const LINE_SCORE = 100 // 한 줄에 100, 두 줄 한 번에 300, 세 줄 600 (100 × 1+2+…+n)

// 블록 모양. kind가 색을 정한다: 1 한 칸·두 칸, 2 막대, 3 네모, 4 ㄱ자, 5 그 밖
const S = (kind, cells) => ({ kind, cells })
export const SHAPES = [
  S(1, [[0, 0]]),
  S(1, [[0, 0], [0, 1]]),
  S(1, [[0, 0], [1, 0]]),
  S(2, [[0, 0], [0, 1], [0, 2]]),
  S(2, [[0, 0], [1, 0], [2, 0]]),
  S(2, [[0, 0], [0, 1], [0, 2], [0, 3]]),
  S(2, [[0, 0], [1, 0], [2, 0], [3, 0]]),
  S(3, [[0, 0], [0, 1], [1, 0], [1, 1]]),
  S(3, [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]]),
  S(4, [[0, 0], [1, 0], [1, 1]]),
  S(4, [[0, 0], [0, 1], [1, 0]]),
  S(4, [[0, 0], [0, 1], [1, 1]]),
  S(4, [[0, 1], [1, 0], [1, 1]]),
  S(5, [[0, 0], [1, 0], [2, 0], [2, 1]]),
  S(5, [[0, 0], [0, 1], [1, 0], [2, 0]]),
  S(5, [[0, 0], [0, 1], [1, 1], [2, 1]]),
  S(5, [[0, 1], [1, 1], [2, 1], [2, 0]]),
  S(5, [[0, 0], [0, 1], [0, 2], [1, 1]]),
  S(5, [[0, 1], [1, 0], [1, 1], [1, 2]]),
]

export const KIND_LABEL = { 1: '한 칸·두 칸', 2: '막대', 3: '네모', 4: 'ㄱ자', 5: '그 밖' }

// 블록은 무작위로 나오되, 점수가 오를수록 큰 블록(4칸 이상)이 자주 나온다
// 0~500점: 큰 블록 30%, 500~2,000점: 50%, 2,000점 이상: 70%
export const BIG_MIN = 4
const BIG_RATE = [
  [500, 0.3],
  [2000, 0.5],
  [Infinity, 0.7],
]
const SMALL = SHAPES.map((sh, i) => (sh.cells.length < BIG_MIN ? i : -1)).filter((i) => i >= 0)
const BIG = SHAPES.map((sh, i) => (sh.cells.length >= BIG_MIN ? i : -1)).filter((i) => i >= 0)

export function bigRate(score) {
  return BIG_RATE.find(([upTo]) => score < upTo)[1]
}

function randomShape(score) {
  const pool = Math.random() < bigRate(score) ? BIG : SMALL
  return pool[Math.floor(Math.random() * pool.length)]
}

const threePieces = (score) => [randomShape(score), randomShape(score), randomShape(score)]

// 새 판. pieces는 손에 든 블록 3개(모양 번호). 쓴 자리는 null
export function newGame() {
  return { board: Array(SIZE * SIZE).fill(0), pieces: threePieces(0), score: 0, over: false }
}

// 모양의 너비·높이 (손에 든 블록을 그릴 때)
export function shapeSize(shape) {
  const rows = Math.max(...shape.cells.map(([r]) => r)) + 1
  const cols = Math.max(...shape.cells.map(([, c]) => c)) + 1
  return { rows, cols }
}

// (r, c)를 왼쪽 위로 해서 놓을 수 있는지
export function canPlace(board, shape, r, c) {
  return shape.cells.every(([dr, dc]) => {
    const rr = r + dr
    const cc = c + dc
    return rr < SIZE && cc < SIZE && board[rr * SIZE + cc] === 0
  })
}

// 판의 (r, c)를 눌렀을 때 블록을 놓을 왼쪽 위 자리. 누른 칸이 블록 안에 들어가는 자리 중
// 블록 가운데가 누른 칸에 가장 가까운 곳을 고른다. 그래서 판 끝을 눌러도 블록이 안쪽으로 맞춰 들어간다
export function placementFor(board, shape, r, c) {
  const { rows, cols } = shapeSize(shape)
  const mid = [(rows - 1) / 2, (cols - 1) / 2]
  const options = shape.cells
    .map(([dr, dc]) => ({ r: r - dr, c: c - dc, far: Math.abs(dr - mid[0]) + Math.abs(dc - mid[1]) }))
    .filter((o) => o.r >= 0 && o.c >= 0 && canPlace(board, shape, o.r, o.c))
    .sort((a, b) => a.far - b.far)
  return options[0] ?? null
}

// 판 어딘가에 놓을 수 있는지
export function fitsAnywhere(board, shape) {
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (canPlace(board, shape, r, c)) return true
  return false
}

// 블록을 놓고 꽉 찬 줄을 지운다. 결과: { board, cleared(지운 칸 번호들), gained(이번에 오른 점수), lines }
export function placeAndClear(board, shape, r, c) {
  const next = [...board]
  for (const [dr, dc] of shape.cells) next[(r + dr) * SIZE + (c + dc)] = shape.kind

  const cleared = new Set()
  let lines = 0
  for (let i = 0; i < SIZE; i++) {
    const row = Array.from({ length: SIZE }, (_, k) => i * SIZE + k)
    const col = Array.from({ length: SIZE }, (_, k) => k * SIZE + i)
    if (row.every((x) => next[x] !== 0)) {
      lines++
      row.forEach((x) => cleared.add(x))
    }
    if (col.every((x) => next[x] !== 0)) {
      lines++
      col.forEach((x) => cleared.add(x))
    }
  }
  const after = next.map((v, i) => (cleared.has(i) ? 0 : v))
  const gained = shape.cells.length + (LINE_SCORE * lines * (lines + 1)) / 2
  return { board: after, cleared: [...cleared], gained, lines }
}

// 손에 든 블록 중 하나라도 놓을 수 있는지. 없으면 판이 끝난다
export function anyFits(board, pieces) {
  return pieces.some((p) => p !== null && fitsAnywhere(board, SHAPES[p]))
}

// 3개를 다 썼으면 새 3개. 그때의 점수로 큰 블록 비율을 정한다
export function refill(pieces, score) {
  return pieces.every((p) => p === null) ? threePieces(score) : pieces
}
