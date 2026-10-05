// 다른 곳 찾기: 장면을 이루는 물체(바퀴·건물·자동차·자전거)를 코드로 만들고, 몇 개만 서로 다르게 한다.
// 그림 파일 없이 SpotGame.jsx가 이 값들로 그린다
//  - 쉬움: 자동차 휠 8개 중 다른 것 찾기
//  - 보통: 도심 거리(건물, 자동차, 자전거)에서 색·모양 차이 찾기
//  - 어려움: 건물이 더 많고 기울어 있다. 차이가 작다(기울기 3도, 창문 한 칸, 건물 높이, 헬멧 색처럼)

export const SPOT_LEVELS = {
  easy: { label: '쉬움', hint: '자동차 휠', diffs: 3 },
  normal: { label: '보통', hint: '도심 거리', diffs: 5 },
  hard: { label: '어려움', hint: '작은 차이', diffs: 6 },
}

export const WRONG_PENALTY = 5 // 틀린 곳을 누르면 더해지는 시간(초)
// 하늘을 넉넉히 둬서 구름이 건물에 가리지 않게 한다. road는 자동차·자전거를 내려 그리는 만큼
export const SCENE = { w: 360, h: 240, ground: 180, road: 30 }

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
const TILTS = [-6, -3, 0, 3, 6]
const TILT_STEP = 3 // 어려움에서 건물 기울기가 달라지는 정도(도)

const rand = (min, max) => min + Math.floor(Math.random() * (max - min + 1))
const pick = (list) => list[Math.floor(Math.random() * list.length)]
const pickOther = (list, current) => pick(list.filter((x) => x !== current))
const shuffle = (list) => [...list].sort(() => Math.random() - 0.5)

// 목록에서 바로 옆 값으로 바꾼다. 비슷한 것끼리 붙어 있어서 차이가 작다
function neighbor(list, current) {
  const i = list.indexOf(current)
  if (i === 0) return list[1]
  if (i === list.length - 1) return list[i - 1]
  return list[i + pick([-1, 1])]
}

// 어려움용: 물체 한 개를 조금만 바꾼다. tilt면 건물 기울기를 바꾼다
function changeSubtle(o, tilt) {
  if (o.type === 'car') {
    const kind = pick(['glass', 'glassShape', 'wheel', 'lamp'])
    if (kind === 'glass') return { ...o, glass: neighbor(GLASS, o.glass) }
    if (kind === 'glassShape') return { ...o, glassShape: pickOther(GLASS_SHAPES, o.glassShape) }
    if (kind === 'wheel') return { ...o, wheel: neighbor(WHEELS, o.wheel) }
    return { ...o, lamp: !o.lamp }
  }
  if (o.type === 'bike') {
    const kind = pick(['helmet', 'frame'])
    if (kind === 'helmet') return { ...o, helmet: pickOther(SHIRTS, o.helmet) }
    return { ...o, frame: pickOther(FRAMES, o.frame) }
  }
  if (o.type === 'cloud') return { ...o, x: o.x + pick([-9, 9]) }
  if (tilt) return { ...o, tilt: o.tilt + (o.tilt > 0 ? -TILT_STEP : o.tilt < 0 ? TILT_STEP : pick([-TILT_STEP, TILT_STEP])) }
  const kind = pick(['dark', 'dark', 'height'])
  if (kind === 'dark') return { ...o, dark: rand(0, o.rows * o.cols - 1) }
  return { ...o, h: o.h + pick([-7, 7]) }
}

// 물체 한 개를 눈에 띄게 다르게 바꾼다
function change(o) {
  if (o.type === 'cloud') return { ...o, s: o.s > 1 ? 0.7 : 1.5 }
  if (o.type === 'wheel') {
    const kind = pick(['style', 'style', 'rim', 'hub'])
    if (kind === 'style') return { ...o, style: pickOther(WHEELS, o.style) }
    if (kind === 'rim') return { ...o, rim: pickOther(RIMS, o.rim) }
    return { ...o, hub: pickOther(HUBS, o.hub) }
  }
  if (o.type === 'car') {
    const kind = pick(['color', 'glass', 'glassShape', 'wheel'])
    if (kind === 'color') return { ...o, color: pickOther(CAR_COLORS, o.color) }
    if (kind === 'glass') return { ...o, glass: pickOther(GLASS, o.glass) }
    if (kind === 'glassShape') return { ...o, glassShape: pickOther(GLASS_SHAPES, o.glassShape) }
    return { ...o, wheel: pickOther(WHEELS, o.wheel) }
  }
  if (o.type === 'bike') {
    const kind = pick(['shirt', 'shirt', 'helmet', 'frame'])
    if (kind === 'shirt') return { ...o, shirt: pickOther(SHIRTS, o.shirt) }
    if (kind === 'helmet') return { ...o, helmet: pickOther(SHIRTS, o.helmet) }
    return { ...o, frame: pickOther(FRAMES, o.frame) }
  }
  // 건물
  const kind = pick(['color', 'roof', 'rows', 'cols'])
  if (kind === 'color') return { ...o, color: pickOther(WALLS, o.color) }
  if (kind === 'roof') return { ...o, roof: pickOther(ROOFS, o.roof) }
  if (kind === 'rows') return { ...o, rows: o.rows > 2 ? o.rows - 1 : o.rows + 1 }
  return { ...o, cols: o.cols > 2 ? o.cols - 1 : o.cols + 1 }
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

function street(buildingCount, tilted) {
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
      roof: pick(ROOFS),
      cols: rand(2, 3),
      rows: rand(3, 5),
      tilt: tilted ? pick(TILTS) : 0,
      dark: -1, // 불 꺼진 창문 번호. -1이면 없음
    })
  }
  ;[rand(30, 80), rand(170, 240)].forEach((x, i) =>
    list.push({ id: `s${i}`, type: 'cloud', x, y: rand(14, 24), s: pick([0.9, 1, 1.1]) }),
  )
  // 자전거(뒤쪽 차로)와 자동차(앞쪽 차로)는 서로 가리지 않게 번갈아 놓는다
  ;[122, 300].forEach((x, i) =>
    list.push({ id: `k${i}`, type: 'bike', x, shirt: pick(SHIRTS), helmet: pick(SHIRTS), frame: pick(FRAMES) }),
  )
  ;[16, 198].forEach((x, i) =>
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

export function generateSpot(level) {
  const top = level === 'easy' ? wheels() : street(level === 'hard' ? 6 : 5, level === 'hard')
  let answers = shuffle(top.map((o) => o.id)).slice(0, SPOT_LEVELS[level].diffs)

  // 어려움: 건물 기울기 차이가 세 곳은 들어가게 한다
  let tiltIds = []
  if (level === 'hard') {
    const buildings = shuffle(top.filter((o) => o.type === 'building').map((o) => o.id))
    tiltIds = buildings.slice(0, 3)
    const rest = shuffle(top.map((o) => o.id).filter((id) => !tiltIds.includes(id)))
    answers = [...tiltIds, ...rest.slice(0, SPOT_LEVELS.hard.diffs - tiltIds.length)]
  }

  const bottom = top.map((o) => {
    if (!answers.includes(o.id)) return o
    return level === 'hard' ? changeSubtle(o, tiltIds.includes(o.id)) : change(o)
  })
  return { level, top, bottom, answers }
}

// 물체가 차지하는 네모 영역. 누르는 범위와 찾았다는 표시에 쓴다
export function boxOf(o) {
  if (o.type === 'wheel') return { x: o.cx - o.r - 4, y: o.cy - o.r - 4, w: o.r * 2 + 8, h: o.r * 2 + 8 }
  if (o.type === 'car') return { x: o.x - 3, y: 150 + SCENE.road, w: 98, h: 56 }
  if (o.type === 'bike') return { x: o.x - 3, y: 116 + SCENE.road, w: 62, h: 66 }
  if (o.type === 'cloud') return { x: o.x - 32, y: o.y - 22, w: 64, h: 46 }
  // 건물은 구름 아래까지만. 높이가 달라져도 위아래 그림에서 누르는 범위가 같게 넉넉히 잡는다
  return { x: o.x - 4, y: SCENE.ground - o.h - 22, w: o.w + 8, h: o.h + 24 }
}
