import { useEffect, useRef, useState } from 'react'
import { LEVELS, MAX_HINTS, PEERS, conflicts, fmtClock, generate, isSolved } from '../lib/sudoku'

// 근무 중에만 열리는 스도쿠. 하던 판과 걸린 시간은 저장되어 나중에 이어 할 수 있다
export default function Sudoku({ game, best, actions, onClose }) {
  const [selected, setSelected] = useState(null)
  const [memo, setMemo] = useState(false) // 켜면 숫자가 답 대신 작은 메모로 들어간다
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

  // 예전에 저장된 판에는 메모·힌트 항목이 없을 수 있다
  const notes = game?.notes ?? {}
  const hinted = game?.hinted ?? []
  const locked = (i) => game.puzzle[i] !== 0 || hinted.includes(i)

  // i번 칸에 n을 넣은 판을 만든다. 그 칸의 메모는 지우고, 같은 줄·칸·상자의 메모에서 n을 뺀다
  function filled(i, n) {
    const cells = [...game.cells]
    cells[i] = n
    const nextNotes = { ...notes }
    delete nextNotes[i]
    if (n !== 0) {
      for (const p of PEERS[i]) {
        if (nextNotes[p]?.includes(n)) nextNotes[p] = nextNotes[p].filter((x) => x !== n)
      }
    }
    return { ...game, cells, notes: nextNotes, elapsed }
  }

  function save(next) {
    if (isSolved(next)) actions.finishSudoku({ ...next, done: true })
    else actions.setSudoku(next)
  }

  function put(n) {
    if (selected === null || game.done || locked(selected)) return
    // 메모: 빈칸에 후보 숫자를 적었다 지웠다 한다
    if (memo && n !== 0) {
      if (game.cells[selected] !== 0) return
      const now = notes[selected] ?? []
      const list = now.includes(n) ? now.filter((x) => x !== n) : [...now, n].sort()
      actions.setSudoku({ ...game, notes: { ...notes, [selected]: list }, elapsed })
      return
    }
    save(filled(selected, n))
  }

  // 힌트: 고른 칸(비었거나 틀렸을 때), 아니면 아무 빈칸 하나를 정답으로 채운다
  function hint() {
    if (game.done || hinted.length >= MAX_HINTS) return
    const open = (i) => !locked(i) && game.cells[i] !== game.solution[i]
    let target = selected !== null && open(selected) ? selected : null
    if (target === null) {
      const all = game.cells.map((_, i) => i).filter(open)
      target = all[Math.floor(Math.random() * all.length)]
    }
    setSelected(target)
    save({ ...filled(target, game.solution[target]), hinted: [...hinted, target] })
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
              hinted.includes(i) && 'hinted',
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
                {n !== 0 && n}
                {n === 0 && notes[i]?.length > 0 && (
                  <span className="sudoku-notes">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((k) => (
                      <i key={k}>{notes[i].includes(k) ? k : ''}</i>
                    ))}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {game.done ? (
          <div className="game-done">
            <p className="game-lead">다 풀었어요</p>
            <p className="muted">
              {fmtClock(game.elapsed)} 걸렸어요
              {hinted.length > 0
                ? ' · 힌트를 쓴 판은 최고 기록에 남지 않아요'
                : best[game.level] === game.elapsed
                  ? ' · 내 최고 기록'
                  : ` · 최고 기록 ${fmtClock(best[game.level] ?? game.elapsed)}`}
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
            <div className="game-actions four">
              <button className={memo ? 'btn on' : 'btn'} onClick={() => setMemo(!memo)} aria-pressed={memo}>
                메모 {memo ? '켜짐' : '꺼짐'}
              </button>
              <button className="btn" onClick={hint} disabled={hinted.length >= MAX_HINTS}>
                힌트 {MAX_HINTS - hinted.length}
              </button>
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
            <p className="muted game-hint">
              {memo
                ? '메모가 켜져 있어요. 숫자를 누르면 그 칸에 작게 적혀요.'
                : `같은 줄이나 상자에 같은 숫자가 있으면 빨갛게 표시돼요. 힌트는 한 판에 ${MAX_HINTS}번, 쓰면 최고 기록에 남지 않아요.`}
            </p>
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
