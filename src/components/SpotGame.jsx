import { useEffect, useState } from 'react'
import { SCENE, SPOT_LEVELS, WRONG_PENALTY, boxOf, generateSpot } from '../lib/spot'
import { fmtClock } from '../lib/sudoku'

// 근무 중에만 열리는 다른 곳 찾기. 위아래 두 그림에서 서로 다른 곳을 찾는다
export default function SpotGame({ best, actions, onClose }) {
  const [game, setGame] = useState(null)
  const [found, setFound] = useState([])
  const [wrong, setWrong] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const done = game !== null && found.length === game.answers.length

  // 화면이 켜져 있는 동안만 시간이 흐른다
  useEffect(() => {
    if (!game || done) return
    const timer = setInterval(() => {
      if (!document.hidden) setElapsed((s) => s + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [game, done])

  function start(level) {
    setGame(generateSpot(level))
    setFound([])
    setWrong(false)
    setElapsed(0)
  }

  // id가 없으면 빈 곳을 누른 것
  function tap(id) {
    if (done || found.includes(id)) return
    if (id && game.answers.includes(id)) {
      const next = [...found, id]
      setFound(next)
      if (next.length === game.answers.length) actions.finishSpot(game.level, elapsed)
      return
    }
    // 아무 데나 눌러서 찾지 못하게 시간을 더한다
    setElapsed((s) => s + WRONG_PENALTY)
    setWrong(true)
    setTimeout(() => setWrong(false), 450)
  }

  return (
    <div className="game-screen">
      <div className="game-bar">
        <button className="btn small" onClick={onClose}>
          닫기
        </button>
        <span className="game-title">다른 곳 찾기{game && ` · ${SPOT_LEVELS[game.level].label}`}</span>
        <span className="game-time">{game && fmtClock(elapsed)}</span>
      </div>

      <div className="game-body">
        {!game ? (
          <>
            <p className="game-lead">위아래 그림에서 다른 곳을 찾아보세요</p>
            <p className="muted">
              쉬움은 자동차 휠, 보통은 도심 거리의 자동차·자전거·건물. 어려움은 건물이 돌아선 각도나 창문 한 칸처럼 작은 차이예요. 틀린 곳을 누르면{' '}
              {WRONG_PENALTY}초가 더해져요.
            </p>
            <Levels best={best} onPick={start} />
          </>
        ) : (
          <>
            <p className="spot-count">
              찾은 곳 {found.length} / {game.answers.length}
            </p>
            <Scene objects={game.top} found={found} wrong={wrong} onTap={tap} name="위쪽 그림" plain={game.level === 'easy'} />
            <div className="spot-gap" />
            <Scene
              objects={game.bottom}
              found={found}
              wrong={wrong}
              onTap={tap}
              name="아래쪽 그림"
              plain={game.level === 'easy'}
            />

            {done ? (
              <div className="game-done">
                <p className="game-lead">다 찾았어요</p>
                <p className="muted">
                  {fmtClock(elapsed)} 걸렸어요
                  {best[game.level] === elapsed ? ' · 내 최고 기록' : ` · 최고 기록 ${fmtClock(best[game.level] ?? elapsed)}`}
                </p>
                <Levels best={best} onPick={start} />
              </div>
            ) : (
              <div className="game-actions">
                <button className="btn" onClick={() => start(game.level)}>
                  다른 그림
                </button>
                <button className="btn" onClick={() => setGame(null)}>
                  난이도 바꾸기
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function Levels({ best, onPick }) {
  return (
    <div className="game-levels">
      {Object.entries(SPOT_LEVELS).map(([level, { label, hint }]) => (
        <button key={level} className="btn" onClick={() => onPick(level)}>
          <b>{label}</b>
          <span>{best[level] != null ? `최고 ${fmtClock(best[level])}` : hint}</span>
        </button>
      ))}
    </div>
  )
}

// 그림 한 장. plain이면 배경 없이(휠만), 아니면 하늘·인도·도로를 깐다
function Scene({ objects, found, wrong, onTap, name, plain }) {
  const { w, h, ground, road } = SCENE
  const order = { cloud: 0, building: 1, bike: 2, car: 3, wheel: 4 }
  const sorted = [...objects].sort((a, b) => order[a.type] - order[b.type])
  return (
    <svg
      className={wrong ? 'spot-scene wrong' : 'spot-scene'}
      viewBox={`0 0 ${w} ${h}`}
      role="img"
      aria-label={name}
      onClick={() => onTap(null)}
    >
      {plain ? (
        <rect width={w} height={h} fill="#e9e6df" />
      ) : (
        <>
          <rect width={w} height={h} fill="#dcecf3" />
          <circle cx="318" cy="30" r="13" fill="#fbe6a2" />
          <rect y={ground} width={w} height="10" fill="#cfccc4" />
          <rect y={ground + 10} width={w} height={h - ground - 10} fill="#5b6068" />
          <path d={`M0 ${ground + 34}H${w}`} stroke="#e9e6df" strokeWidth="2" strokeDasharray="14 12" />
        </>
      )}

      {sorted.map((o) => (
        <g key={o.id}>
          {o.type === 'wheel' && <Wheel cx={o.cx} cy={o.cy} r={o.r} style={o.style} rim={o.rim} hub={o.hub} />}
          {o.type === 'cloud' && <Cloud s={o} />}
          {o.type === 'building' && <Building b={o} />}
          {o.type === 'bike' && (
            <g transform={`translate(0 ${road})`}>
              <Bike k={o} />
            </g>
          )}
          {o.type === 'car' && (
            <g transform={`translate(0 ${road})`}>
              <Car c={o} />
            </g>
          )}
        </g>
      ))}

      {/* 누르는 범위와 찾았다는 표시. 그림 위에 따로 얹는다 */}
      {sorted.map((o) => {
        const box = boxOf(o)
        const isFound = found.includes(o.id)
        return (
          <rect
            key={`hit-${o.id}`}
            x={box.x}
            y={box.y}
            width={box.w}
            height={box.h}
            rx="8"
            className={isFound ? 'spot-hit found' : 'spot-hit'}
            onClick={(e) => {
              e.stopPropagation()
              onTap(o.id)
            }}
          />
        )
      })}
    </svg>
  )
}

function Wheel({ cx, cy, r, style, rim = '#d7dbe0', hub = '#3b3f46' }) {
  const spokes = style.startsWith('spoke') ? Number(style.slice(5)) : 0
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#22262b" />
      <circle cx={cx} cy={cy} r={r * 0.74} fill={rim} />
      {Array.from({ length: spokes }, (_, i) => {
        const angle = (Math.PI * 2 * i) / spokes - Math.PI / 2
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={cx + Math.cos(angle) * r * 0.7}
            y2={cy + Math.sin(angle) * r * 0.7}
            stroke="#5c6470"
            strokeWidth={r * 0.14}
            strokeLinecap="round"
          />
        )
      })}
      {style === 'disc' && <circle cx={cx} cy={cy} r={r * 0.5} fill="#8e98a3" />}
      {style === 'ring' && <circle cx={cx} cy={cy} r={r * 0.44} fill="none" stroke="#5c6470" strokeWidth={r * 0.14} />}
      <circle cx={cx} cy={cy} r={r * 0.19} fill={hub} />
    </g>
  )
}

function Cloud({ s }) {
  return (
    <g transform={`translate(${s.x} ${s.y}) scale(${s.s})`} fill="#ffffff">
      <ellipse cx="-10" cy="3" rx="11" ry="7" />
      <ellipse cx="2" cy="-2" rx="12" ry="9" />
      <ellipse cx="13" cy="4" rx="9" ry="6" />
    </g>
  )
}

// angle이 0이면 정면만, 아니면 앞면과 옆면을 함께 그린다(돌아선 만큼 앞면이 좁아지고 옆면이 넓어진다)
function Building({ b }) {
  const { ground } = SCENE
  const top = ground - b.h
  const rad = (Math.abs(b.angle) * Math.PI) / 180
  const frontW = b.w * Math.cos(rad)
  const sideW = b.w * 0.7 * Math.sin(rad)
  const right = b.angle >= 0 // 옆면이 오른쪽에 보이는지
  const left = b.x + b.w / 2 - (frontW + sideW) / 2
  const fx = right ? left : left + sideW // 앞면이 시작하는 곳
  const gap = 5
  const cellW = (frontW - gap * (b.cols + 1)) / b.cols
  const cellH = Math.min(14, (b.h - 16 - gap * (b.rows + 1)) / b.rows)

  // 옆면 위의 점: t는 앞면 모서리에서 떨어진 정도(0~1). 멀어질수록 위쪽 선이 조금 내려간다
  const sx = (t) => (right ? fx + frontW + sideW * t : fx - sideW * t)
  const sy = (t, y) => y + ((sideW * t * 0.4 * (ground - y)) / b.h)
  const quad = (t1, t2, y1, y2) =>
    `M${sx(t1)} ${sy(t1, y1)}L${sx(t2)} ${sy(t2, y1)}L${sx(t2)} ${sy(t2, y2)}L${sx(t1)} ${sy(t1, y2)}Z`

  return (
    <g>
      {b.angle !== 0 && (
        <>
          <path d={quad(0, 1, top, ground)} fill={b.color} />
          <path d={quad(0, 1, top, ground)} fill="rgba(0,0,0,0.25)" />
          {Array.from({ length: b.rows }, (_, row) => {
            const y = top + 12 + row * (cellH + gap)
            return <path key={row} d={quad(0.25, 0.75, y, y + cellH)} fill="#cfc9b4" />
          })}
        </>
      )}
      {b.roof === 'peak' && <path d={`M${fx - 3} ${top}L${fx + frontW / 2} ${top - 15}L${fx + frontW + 3} ${top}Z`} fill="#6d5a4f" />}
      {b.roof === 'step' && <rect x={fx + frontW * 0.25} y={top - 11} width={frontW * 0.5} height="11" fill="#6f7782" />}
      <rect x={fx} y={top} width={frontW} height={b.h} fill={b.color} />
      <rect x={fx} y={top} width={frontW} height="5" fill="rgba(0,0,0,0.22)" />
      {Array.from({ length: b.rows * b.cols }, (_, i) => {
        const row = Math.floor(i / b.cols)
        const col = i % b.cols
        return (
          <rect
            key={i}
            x={fx + gap + col * (cellW + gap)}
            y={top + 12 + row * (cellH + gap)}
            width={cellW}
            height={cellH}
            fill={i === b.dark ? '#77808f' : '#f6f1df'}
          />
        )
      })}
    </g>
  )
}

function Car({ c }) {
  const x = c.x
  const round = c.glassShape === 'round'
  return (
    <g>
      {round ? (
        <path d={`M${x + 16} 174Q${x + 21} 154 ${x + 38} 154H${x + 60}Q${x + 73} 154 ${x + 80} 174Z`} fill={c.color} />
      ) : (
        <path d={`M${x + 18} 174L${x + 23} 155H${x + 70}L${x + 77} 174Z`} fill={c.color} />
      )}
      {round ? (
        <>
          <path d={`M${x + 22} 172Q${x + 26} 158 ${x + 39} 158H${x + 46}V172Z`} fill={c.glass} />
          <path d={`M${x + 50} 158H${x + 59}Q${x + 69} 158 ${x + 74} 172H${x + 50}Z`} fill={c.glass} />
        </>
      ) : (
        <>
          <path d={`M${x + 23} 172L${x + 27} 159H${x + 46}V172Z`} fill={c.glass} />
          <path d={`M${x + 50} 159H${x + 67}L${x + 72} 172H${x + 50}Z`} fill={c.glass} />
        </>
      )}
      <rect x={x} y="172" width="92" height="20" rx="7" fill={c.color} />
      <rect x={x} y="186" width="92" height="6" rx="3" fill="rgba(0,0,0,0.2)" />
      <rect x={x + 85} y="176" width="6" height="5" rx="2" fill={c.lamp === false ? '#e9953a' : '#fff3c4'} />
      <rect x={x + 1} y="176" width="5" height="5" rx="2" fill="#e05757" />
      <Wheel cx={x + 22} cy={192} r={10} style={c.wheel} />
      <Wheel cx={x + 72} cy={192} r={10} style={c.wheel} />
    </g>
  )
}

function Bike({ k }) {
  const x = k.x
  const spoke = (cx) =>
    [0, 60, 120].map((deg) => {
      const a = (deg * Math.PI) / 180
      return (
        <line
          key={deg}
          x1={cx - Math.cos(a) * 10}
          y1={168 - Math.sin(a) * 10}
          x2={cx + Math.cos(a) * 10}
          y2={168 + Math.sin(a) * 10}
          stroke="#8a929c"
          strokeWidth="1"
        />
      )
    })
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {spoke(x + 11)}
      {spoke(x + 45)}
      <circle cx={x + 11} cy="168" r="11" stroke="#22262b" strokeWidth="2.6" />
      <circle cx={x + 45} cy="168" r="11" stroke="#22262b" strokeWidth="2.6" />
      <path d={`M${x + 11} 168L${x + 21} 150L${x + 28} 168ZM${x + 21} 150L${x + 40} 150L${x + 28} 168M${x + 40} 150L${x + 45} 168M${x + 40} 150L${x + 42} 144`} stroke={k.frame} strokeWidth="2.6" />
      <path d={`M${x + 17} 149H${x + 25}`} stroke="#22262b" strokeWidth="3" />
      <path d={`M${x + 22} 147L${x + 29} 158L${x + 28} 167`} stroke="#3b3f46" strokeWidth="5" />
      <path d={`M${x + 22} 146L${x + 34} 132`} stroke={k.shirt} strokeWidth="9" />
      <path d={`M${x + 33} 134L${x + 42} 144`} stroke={k.shirt} strokeWidth="4.5" />
      <circle cx={x + 38} cy="124" r="5.5" fill="#f1c9a5" />
      <path d={`M${x + 32} 123A6.3 6.3 0 0 1 ${x + 44.4} 122.4Z`} fill={k.helmet} />
    </g>
  )
}
