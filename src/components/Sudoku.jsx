import { useEffect, useRef, useState } from 'react'
import { LEVELS, conflicts, fmtClock, generate, isSolved } from '../lib/sudoku'

// 근무 중에만 열리는 스도쿠. 하던 판과 걸린 시간은 저장되어 나중에 이어 할 수 있다
export default function Sudoku({ game, best, actions, onClose }) {
  const [selected, setSelected] = useState(null)
  const [elapsed, setElapsed] = useState(game?.elapsed ?? 0)
  const latest = useRef({ game, elapsed })
  latest.current = { game, elapsed }

  // 화면이 켜져 있는 동안만 시간이 흐른다
  useEffect(() => {
    if (!game || game.done) return
    const timer = setInterval(() => {
      if (!document.hidden) setElapsed((s) => s + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [game?.puzzle, game?.done])

  // 닫을 때 걸린 시간을 저장한다
  useEffect(
    () => () => {
      const { game: g, elapsed: s } = latest.current
      if (g && !g.done) actions.setSudoku({ ...g, elapsed: s })
    },
    [actions],
  )

  function start(level) {
    setSelected(null)
    setElapsed(0)
    actions.setSudoku(generate(level))
  }

  function put(n) {
    if (selected === null || game.done || game.puzzle[selected] !== 0) return
    const cells = [...game.cells]
    cells[selected] = n
    const next = { ...game, cells, elapsed }
    if (isSolved(next)) {
      actions.finishSudoku({ ...next, done: true })
    } else {
      actions.setSudoku(next)
    }
  }

  if (!game) {
    return (
      <div className="game-screen">
        <div className="game-bar">
          <button className="btn small" onClick={onClose}>
            닫기
          </button>
          <span className="game-title">스도쿠</span>
          <span className="game-time" />
        </div>
        <div className="game-body">
          <p className="game-lead">손님 없는 틈에 한 판 어때요?</p>
          <p className="muted">하다가 닫아도 그대로 남아 있어서 나중에 이어 할 수 있어요.</p>
          <LevelButtons best={best} onPick={start} />
        </div>
      </div>
    )
  }

  const bad = conflicts(game.cells)
  const picked = selected !== null ? game.cells[selected] : 0
  const row = selected !== null ? Math.floor(selected / 9) : -1
  const col = selected !== null ? selected % 9 : -1

  return (
    <div className="game-screen">
      <div className="game-bar">
        <button className="btn small" onClick={onClose}>
          닫기
        </button>
        <span className="game-title">스도쿠 · {LEVELS[game.level].label}</span>
        <span className="game-time">{fmtClock(elapsed)}</span>
      </div>

      <div className="game-body">
        <div className="sudoku" role="grid" aria-label="스도쿠 판">
          {game.cells.map((n, i) => {
            const r = Math.floor(i / 9)
            const c = i % 9
            const cls = [
              'sudoku-cell',
              game.puzzle[i] !== 0 && 'given',
              i === selected && 'selected',
              i !== selected && (r === row || c === col) && 'lined',
              i !== selected && picked !== 0 && n === picked && 'same',
              bad.has(i) && 'bad',
              c % 3 === 2 && c !== 8 && 'edge-right',
              r % 3 === 2 && r !== 8 && 'edge-bottom',
            ].filter(Boolean)
            return (
              <button
                key={i}
                className={cls.join(' ')}
                onClick={() => setSelected(i)}
                aria-label={`${r + 1}행 ${c + 1}열 ${n || '빈칸'}`}
              >
                {n || ''}
              </button>
            )
          })}
        </div>

        {game.done ? (
          <div className="game-done">
            <p className="game-lead">다 풀었어요</p>
            <p className="muted">
              {fmtClock(game.elapsed)} 걸렸어요
              {best[game.level] === game.elapsed ? ' · 내 최고 기록' : ` · 최고 기록 ${fmtClock(best[game.level])}`}
            </p>
            <LevelButtons best={best} onPick={start} />
          </div>
        ) : (
          <>
            <div className="sudoku-pad">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <button key={n} onClick={() => put(n)} disabled={game.cells.filter((x) => x === n).length >= 9}>
                  {n}
                </button>
              ))}
            </div>
            <div className="game-actions">
              <button className="btn" onClick={() => put(0)}>
                지우기
              </button>
              <button
                className="btn"
                onClick={() => {
                  if (window.confirm('지금 판을 버리고 새로 시작할까요?')) actions.setSudoku(null)
                }}
              >
                새 판
              </button>
            </div>
            <p className="muted game-hint">같은 줄이나 상자에 같은 숫자가 있으면 빨갛게 표시돼요.</p>
          </>
        )}
      </div>
    </div>
  )
}

function LevelButtons({ best, onPick }) {
  return (
    <div className="game-levels">
      {Object.entries(LEVELS).map(([level, { label }]) => (
        <button key={level} className="btn" onClick={() => onPick(level)}>
          <b>{label}</b>
          <span>{best[level] ? `최고 ${fmtClock(best[level])}` : '기록 없음'}</span>
        </button>
      ))}
    </div>
  )
}
