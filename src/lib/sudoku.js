// 스도쿠 판 만들기와 검사. 판은 길이 81의 숫자 배열(0 = 빈칸)로 다룬다

export const MAX_HINTS = 3 // 한 판에 쓸 수 있는 힌트 수

export const LEVELS = {
  easy: { label: '쉬움', blanks: 38 },
  normal: { label: '보통', blanks: 46 },
  hard: { label: '어려움', blanks: 52 },
}

function shuffle(list) {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// 그 칸과 같은 줄·칸·3x3 상자에 있는 칸 번호들
function peers(i) {
  const r = Math.floor(i / 9)
  const c = i % 9
  const list = []
  for (let k = 0; k < 9; k++) list.push(r * 9 + k, k * 9 + c)
  const br = r - (r % 3)
  const bc = c - (c % 3)
  for (let dr = 0; dr < 3; dr++) for (let dc = 0; dc < 3; dc++) list.push((br + dr) * 9 + bc + dc)
  return list.filter((p) => p !== i)
}

export const PEERS = Array.from({ length: 81 }, (_, i) => [...new Set(peers(i))])

function candidates(grid, i) {
  const used = new Set(PEERS[i].map((p) => grid[p]))
  return [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => !used.has(n))
}

// 풀이가 몇 개인지 센다 (limit개를 넘으면 더 세지 않는다). 답이 하나뿐인 문제를 만들 때 쓴다
function countSolutions(grid, limit) {
  let target = -1
  let options = null
  for (let i = 0; i < 81; i++) {
    if (grid[i] !== 0) continue
    const found = candidates(grid, i)
    if (found.length === 0) return 0
    if (!options || found.length < options.length) {
      target = i
      options = found
      if (found.length === 1) break
    }
  }
  if (target === -1) return 1
  let count = 0
  for (const n of options) {
    grid[target] = n
    count += countSolutions(grid, limit - count)
    if (count >= limit) break
  }
  grid[target] = 0
  return count
}

// 새 문제를 만든다. 답은 항상 하나뿐이다
export function generate(level) {
  const pattern = (r, c) => (3 * (r % 3) + Math.floor(r / 3) + c) % 9
  const order = () => shuffle([0, 1, 2]).flatMap((group) => shuffle([0, 1, 2]).map((k) => group * 3 + k))
  const rows = order()
  const cols = order()
  const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])
  const solution = rows.flatMap((r) => cols.map((c) => nums[pattern(r, c)]))

  const puzzle = [...solution]
  let blanks = 0
  for (const i of shuffle([...Array(81).keys()])) {
    if (blanks >= LEVELS[level].blanks) break
    const kept = puzzle[i]
    puzzle[i] = 0
    if (countSolutions(puzzle, 2) === 1) blanks += 1
    else puzzle[i] = kept
  }
  // notes: 칸 번호 → 메모해 둔 후보 숫자들, hinted: 힌트로 채운 칸 번호들
  return { level, puzzle, solution, cells: [...puzzle], notes: {}, hinted: [], elapsed: 0, done: false }
}

// 같은 줄·칸·상자에 같은 숫자가 있어 서로 부딪히는 칸들
export function conflicts(cells) {
  const bad = new Set()
  for (let i = 0; i < 81; i++) {
    if (cells[i] === 0) continue
    if (PEERS[i].some((p) => cells[p] === cells[i])) bad.add(i)
  }
  return bad
}

export const isSolved = (game) => game.cells.every((n, i) => n === game.solution[i])

// 754 → "12:34"
export function fmtClock(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
