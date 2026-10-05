// 다른 곳 찾기: 장면을 이루는 물체(바퀴·건물·자동차·자전거·구름)를 코드로 만들고, 몇 개만 서로 다르게 한다.
// 그림 파일 없이 SpotGame.jsx가 이 값들로 그린다
//  - 쉬움: 자동차 휠 8개 중 다른 것 찾기
//  - 보통: 도심 거리(건물, 자동차, 자전거)에서 색·모양 차이 찾기
//  - 어려움: 건물을 비스듬히 본 입체 모양으로 그린다. 차이가 작다(건물이 돌아선 각도, 창문 한 칸, 건물 높이, 헬멧 색처럼)
// 그림마다 번호가 있고, 같은 난이도·같은 번호면 항상 같은 그림이 나온다.
// 해 본 번호를 세어 두고 다음 번호를 내기 때문에 안 해 본 그림만 나온다

export const SPOT_LEVELS = {
  easy: { label: '쉬움', hint: '자동차 휠', diffs: 3 },
  normal: { label: '보통', hint: '도심 거리', diffs: 5 },
  hard: { label: '어려움', hint: '작은 차이', diffs: 6 },
}

export const CHANCES = 3 // 틀린 곳을 누를 수 있는 횟수. 다 쓰면 그 그림은 실패로 넘어간다(막 눌러서 찾지 못하게)
export const HINT_PENALTY = [10, 20] // 1차, 2차 힌트를 볼 때 더해지는 시간(초)
// 하늘을 넉넉히 둬서 구름이 건물에 가리지 않게 한다. road는 자동차·자전거를 내려 그리는 만큼
export const SCENE = { w: 360, h: 240, ground: 180, road: 30 }

// 그림 분위기. 번호에 따라 낮·노을·밤이 섞여 나온다
export const SKIES = {
  day: { sky: '#dcecf3', sun: '#fbe6a2', cloud: '#ffffff' },
  sunset: { sky: '#f6d2b8', sun: '#f08a5d', cloud: '#fbeee4' },
  night: { sky: '#2f3a5f', sun: '#f3f0d8', cloud: '#56618a' },
}

const WHEELS = ['spoke3', 'spoke4', 'spoke5', 'spoke6', 'spoke8', 'disc', 'ring']
const RIMS = ['#d7dbe0', '#f2c14e', '#b9c4cf', '#e8e2d0']
const HUBS = ['#3b3f46', '#d64545', '#2f6fde', '#f2c14e']
const CAR_COLORS = ['#d64545', '#2f6fde', '#f2b632', '#2a9d8f', '#f1ede4', '#4a4f57', '#8e5bd6']
const GLASS = ['#cfeaf7', '#6aa7cf', '#394b5e']
const GLASS_SHAPES = ['round', 'box']
const SHIRTS = ['#e4572e', '#2a9d8f', '#f2b632', '#9b5de5', '#ef7b9d', '#2f6fde', '#f1ede4']
const FRAMES = ['#3b3f46', '#d64545', '#2f6fde', '#2a9d8f']
const WALLS = ['#c9b79c', '#a8b5c4', '#d9a58b', '#b7c9a8', '#9aa0b5', '#e0c98f', '#c7a9c9']
const ROOFS = ['flat', 'peak', 'step']
// 어려움에서 건물이 돌아선 각도(도). 0이면 정면, 클수록 옆면이 많이 보인다. +는 오른쪽 옆면, -는 왼쪽 옆면
const ANGLES = [-44, -30, -16, 16, 30, 44]
const ANGLE_STEP = 14 // 위아래 그림에서 각도가 달라지는 정도

const KINDS = { wheel: '휠', car: '자동차', bike: '자전거', cloud: '구름', building: '건물' }

// 번호(seed)가 같으면 같은 순서로 수가 나오는 난수
let random = Math.random
function seeded(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = (min, max) => min + Math.floor(random() * (max - min + 1))
const pick = (list) => list[Math.floor(random() * list.length)]
const pickOther = (list, current) => pick(list.filter((x) => x !== current))
function shuffle(list) {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

// 목록에서 바로 옆 값으로 바꾼다. 비슷한 것끼리 붙어 있어서 차이가 작다
function neighbor(list, current) {
  const i = list.indexOf(current)
  if (i === 0) return list[1]
  if (i === list.length - 1) return list[i - 1]
  return list[i + pick([-1, 1])]
}

// 아래 두 함수는 [바뀐 물체, 무엇이 바뀌었는지]를 돌려준다. 뒤의 말은 힌트에 쓴다

// 어려움용: 물체 한 개를 조금만 바꾼다. turn이면 건물이 돌아선 각도를 바꾼다
function changeSubtle(o, turn) {
  if (o.type === 'car') {
    const kind = pick(['glass', 'glassShape', 'wheel', 'lamp'])
    if (kind === 'glass') return [{ ...o, glass: neighbor(GLASS, o.glass) }, '유리 색']
    if (kind === 'glassShape') return [{ ...o, glassShape: pickOther(GLASS_SHAPES, o.glassShape) }, '유리 모양']
    if (kind === 'wheel') return [{ ...o, wheel: neighbor(WHEELS, o.wheel) }, '휠 모양']
    return [{ ...o, lamp: !o.lamp }, '전조등 색']
  }
  if (o.type === 'bike') {
    const kind = pick(['helmet', 'frame'])
    if (kind === 'helmet') return [{ ...o, helmet: pickOther(SHIRTS, o.helmet) }, '헬멧 색']
    return [{ ...o, frame: pickOther(FRAMES, o.frame) }, '자전거 색']
  }
  if (o.type === 'cloud') return [{ ...o, x: o.x + pick([-9, 9]) }, '위치']
  if (turn) {
    const size = Math.abs(o.angle)
    const step = size <= 16 ? ANGLE_STEP : size >= 44 ? -ANGLE_STEP : pick([-ANGLE_STEP, ANGLE_STEP])
    return [{ ...o, angle: Math.sign(o.angle) * (size + step) }, '돌아선 각도']
  }
  const kind = pick(['dark', 'dark', 'height'])
  if (kind === 'dark') return [{ ...o, dark: rand(0, o.rows * o.cols - 1) }, '창문 한 칸']
  return [{ ...o, h: o.h + pick([-7, 7]) }, '높이']
}

// 물체 한 개를 눈에 띄게 다르게 바꾼다
function change(o) {
  if (o.type === 'cloud') return [{ ...o, s: o.s > 1 ? 0.7 : 1.5 }, '크기']
  if (o.type === 'wheel') {
    const kind = pick(['style', 'style', 'rim', 'hub'])
    if (kind === 'style') return [{ ...o, style: pickOther(WHEELS, o.style) }, '살 모양']
    if (kind === 'rim') return [{ ...o, rim: pickOther(RIMS, o.rim) }, '안쪽 색']
    return [{ ...o, hub: pickOther(HUBS, o.hub) }, '가운데 색']
  }
  if (o.type === 'car') {
    const kind = pick(['color', 'glass', 'glassShape', 'wheel'])
    if (kind === 'color') return [{ ...o, color: pickOther(CAR_COLORS, o.color) }, '차 색']
    if (kind === 'glass') return [{ ...o, glass: pickOther(GLASS, o.glass) }, '유리 색']
    if (kind === 'glassShape') return [{ ...o, glassShape: pickOther(GLASS_SHAPES, o.glassShape) }, '유리 모양']
    return [{ ...o, wheel: pickOther(WHEELS, o.wheel) }, '휠 모양']
  }
  if (o.type === 'bike') {
    const kind = pick(['shirt', 'shirt', 'helmet', 'frame'])
    if (kind === 'shirt') return [{ ...o, shirt: pickOther(SHIRTS, o.shirt) }, '옷 색']
    if (kind === 'helmet') return [{ ...o, helmet: pickOther(SHIRTS, o.helmet) }, '헬멧 색']
    return [{ ...o, frame: pickOther(FRAMES, o.frame) }, '자전거 색']
  }
  // 건물
  const kind = pick(['color', 'roof', 'rows', 'cols'])
  if (kind === 'color') return [{ ...o, color: pickOther(WALLS, o.color) }, '벽 색']
  if (kind === 'roof') return [{ ...o, roof: pickOther(ROOFS, o.roof) }, '지붕']
  if (kind === 'rows') return [{ ...o, rows: o.rows > 2 ? o.rows - 1 : o.rows + 1 }, '창문 수']
  return [{ ...o, cols: o.cols > 2 ? o.cols - 1 : o.cols + 1 }, '창문 수']
}

function wheels() {
  const list = []
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 4; col++) {
      list.push({
        id: `w${row}${col}`,
        type: 'wheel',
        cx: 45 + col * 90,
        cy: 66 + row * 108,
        r: 38,
        style: pick(WHEELS),
        rim: pick(RIMS),
        hub: pick(HUBS),
      })
    }
  }
  return list
}

function street(buildingCount, solid) {
  const list = []
  // 건물: 화면 너비를 나눠 세운다
  const slot = SCENE.w / buildingCount
  for (let i = 0; i < buildingCount; i++) {
    const w = rand(Math.round(slot * 0.62), Math.round(slot * 0.8))
    list.push({
      id: `b${i}`,
      type: 'building',
      x: Math.round(i * slot + (slot - w) / 2),
      w,
      h: rand(70, 112),
      color: pick(WALLS),
      roof: solid ? pick(['flat', 'step']) : pick(ROOFS),
      cols: rand(2, 3),
      rows: rand(3, 5),
      angle: solid ? pick(ANGLES) : 0,
      dark: -1, // 불 꺼진 창문 번호. -1이면 없음
    })
  }
  ;[rand(30, 80), rand(170, 240)].forEach((x, i) =>
    list.push({ id: `s${i}`, type: 'cloud', x, y: rand(14, 24), s: pick([0.9, 1, 1.1]) }),
  )
  // 자전거(뒤쪽 차로)와 자동차(앞쪽 차로)는 서로 가리지 않게 번갈아 놓는다. 그림마다 순서가 바뀐다
  const flip = random() < 0.5
  ;(flip ? [18, 196] : [122, 300]).forEach((x, i) =>
    list.push({ id: `k${i}`, type: 'bike', x, shirt: pick(SHIRTS), helmet: pick(SHIRTS), frame: pick(FRAMES) }),
  )
  ;(flip ? [84, 262] : [16, 198]).forEach((x, i) =>
    list.push({
      id: `c${i}`,
      type: 'car',
      x,
      color: pick(CAR_COLORS),
      glass: pick(GLASS),
      glassShape: pick(GLASS_SHAPES),
      wheel: pick(WHEELS),
      lamp: true,
    }),
  )
  return list
}

// number: 그 난이도의 몇 번째 그림인지(1부터)
export function generateSpot(level, number) {
  random = seeded(number * 7919 + Object.keys(SPOT_LEVELS).indexOf(level) * 104729 + 1)

  const sky = level === 'easy' ? 'day' : pick(['day', 'day', 'sunset', 'night'])
  const top = level === 'easy' ? wheels() : street(level === 'hard' ? 6 : 5, level === 'hard')
  let answers = shuffle(top.map((o) => o.id)).slice(0, SPOT_LEVELS[level].diffs)

  // 어려움: 건물 각도 차이가 세 곳은 들어가게 한다
  let turnIds = []
  if (level === 'hard') {
    const buildings = shuffle(top.filter((o) => o.type === 'building').map((o) => o.id))
    turnIds = buildings.slice(0, 3)
    const rest = shuffle(top.map((o) => o.id).filter((id) => !turnIds.includes(id)))
    answers = [...turnIds, ...rest.slice(0, SPOT_LEVELS.hard.diffs - turnIds.length)]
  }

  const clues = {} // 답마다 { kind: 어떤 물체인지, what: 무엇이 다른지 }
  const bottom = top.map((o) => {
    if (!answers.includes(o.id)) return o
    const [changed, what] = level === 'hard' ? changeSubtle(o, turnIds.includes(o.id)) : change(o)
    clues[o.id] = { kind: KINDS[o.type], what }
    return changed
  })
  random = Math.random
  return { level, number, sky, top, bottom, answers, clues }
}

// 1차 힌트: 못 찾은 것 하나가 어떤 물체인지
export function firstHint(game, id) {
  return `${game.clues[id].kind} 하나가 달라요`
}

// 2차 힌트: 못 찾은 것 전부가 무엇이 다른지
export function secondHint(game, found) {
  const counts = {}
  for (const id of game.answers) {
    if (found.includes(id)) continue
    const { kind, what } = game.clues[id]
    const key = `${kind}의 ${what}`
    counts[key] = (counts[key] ?? 0) + 1
  }
  return Object.entries(counts)
    .map(([key, n]) => `${key} ${n}곳`)
    .join(' · ')
}

// 물체가 차지하는 네모 영역. 누르는 범위와 찾았다는 표시에 쓴다
export function boxOf(o) {
  if (o.type === 'wheel') return { x: o.cx - o.r - 4, y: o.cy - o.r - 4, w: o.r * 2 + 8, h: o.r * 2 + 8 }
  if (o.type === 'car') return { x: o.x - 3, y: 150 + SCENE.road, w: 98, h: 56 }
  if (o.type === 'bike') return { x: o.x - 3, y: 116 + SCENE.road, w: 62, h: 66 }
  if (o.type === 'cloud') return { x: o.x - 32, y: o.y - 22, w: 64, h: 46 }
  // 건물은 구름 아래까지만. 높이가 달라져도 위아래 그림에서 누르는 범위가 같게 넉넉히 잡는다
  return { x: o.x - 6, y: SCENE.ground - o.h - 22, w: o.w + 12, h: o.h + 24 }
}
