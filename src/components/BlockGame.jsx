import { useEffect, useState } from 'react'
import { KIND_LABEL, SHAPES, SIZE, anyFits, newGame, placeAndClear, placementFor, refill, shapeSize } from '../lib/block'

// 쉬는 틈에 여는 블록 채우기. 하던 판과 최고 점수는 저장되어 나중에 이어 할 수 있다
// 아래 블록을 누르고 판의 칸을 누르면 그 칸이 블록 안에 들어가게 놓인다. 더 놓을 곳이 없으면 끝
export default function BlockGame({ game, best, actions, onClose }) {
  const [picked, setPicked] = useState(null) // 손에 든 블록 중 고른 자리(0~2)
  const [flash, setFlash] = useState([]) // 방금 지워진 칸들(초록으로 잠깐)
  const [gain, setGain] = useState(null) // "+100 · 한 줄!" 같은 글
  const [shake, setShake] = useState(false) // 놓을 수 없는 곳을 눌렀을 때

  useEffect(() => {
    if (flash.length === 0) return
    const t = setTimeout(() => setFlash([]), 450)
    return () => clearTimeout(t)
  }, [flash])

  useEffect(() => {
    if (!shake) return
    const t = setTimeout(() => setShake(false), 300)
    return () => clearTimeout(t)
  }, [shake])

  function start() {
    setPicked(null)
    setFlash([])
    setGain(null)
    actions.setBlock(newGame())
  }

  function tapCell(i) {
    if (!game || game.over || picked === null || game.pieces[picked] === null) return
    const shape = SHAPES[game.pieces[picked]]
    const spot = placementFor(game.board, shape, Math.floor(i / SIZE), i % SIZE)
    if (!spot) {
      setShake(true)
      return
    }
    const { board, cleared, gained, lines } = placeAndClear(game.board, shape, spot.r, spot.c)
    const score = game.score + gained
    const pieces = refill(game.pieces.map((p, k) => (k === picked ? null : p)), score)
    const over = !anyFits(board, pieces)
    setFlash(cleared)
    setGain(lines > 0 ? `+${gained} · ${lines === 1 ? '한 줄!' : `${lines}줄 한 번에!`}` : null)
    setPicked(null)
    actions.setBlock({ ...game, board, pieces, score, over })
  }

  // 손에 든 블록 중 아직 쓰지 않은 것을 고른다. 고른 걸 다시 누르면 놓는다
  function tapPiece(k) {
    if (!game || game.over || game.pieces[k] === null) return
    setPicked(picked === k ? null : k)
  }

  if (!game) {
    return (
      <div className="game-screen">
        <div className="game-bar">
          <button className="btn small" onClick={onClose}>
            닫기
          </button>
          <span className="game-title">블록 채우기</span>
          <span className="game-time" />
        </div>
        <div className="game-body">
          <p className="game-lead">쉬는 틈에 한 판 어때요?</p>
          <p className="muted">
            블록을 놓아 가로나 세로 한 줄을 채우면 사라져요. 시간 제한은 없고, 하다가 닫아도 그대로 남아요.
          </p>
          <p className="muted blk-best">{best > 0 ? `내 최고 ${best.toLocaleString()}점` : '기록 없음'}</p>
          <button className="btn primary block" onClick={start}>
            시작하기
          </button>
        </div>
      </div>
    )
  }

  const isBest = game.score > 0 && game.score >= best

  return (
    <div className="game-screen">
      <div className="game-bar">
        <button className="btn small" onClick={onClose}>
          닫기
        </button>
        <span className="game-title">블록 채우기</span>
        <span className="game-time" />
      </div>

      <div className="game-body">
        <div className="blk-stats">
          <span>
            점수 <b>{game.score.toLocaleString()}</b>
          </span>
          {gain && !game.over ? (
            <span className="blk-gain">{gain}</span>
          ) : (
            <span>
              최고 <b className={isBest ? 'up' : ''}>{Math.max(best, game.score).toLocaleString()}</b>
            </span>
          )}
        </div>

        <div className={`blk-board${shake ? ' shake' : ''}${game.over ? ' over' : ''}`} role="grid" aria-label="블록 판">
          {game.board.map((v, i) => (
            <button
              key={i}
              className={`blk-cell${v ? ` k${v}` : ''}${flash.includes(i) ? ' flash' : ''}`}
              onClick={() => tapCell(i)}
              aria-label={`${Math.floor(i / SIZE) + 1}행 ${(i % SIZE) + 1}열`}
            />
          ))}
        </div>

        {game.over ? (
          <div className="game-done">
            <p className="game-lead">더 놓을 곳이 없어요</p>
            <p className="muted">
              {game.score.toLocaleString()}점{isBest ? ' · ' : ' · 최고 기록 '}
              {isBest ? <b className="up">최고 기록이에요</b> : best.toLocaleString() + '점'}
            </p>
            <div className="game-actions">
              <button className="btn primary" onClick={start}>
                새 판
              </button>
              <button className="btn" onClick={onClose}>
                닫기
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="blk-tray">
              {game.pieces.map((p, k) => (
                <button
                  key={k}
                  className={`blk-piece${picked === k ? ' picked' : ''}${p === null ? ' used' : ''}`}
                  onClick={() => tapPiece(k)}
                  disabled={p === null}
                  aria-label={p === null ? '쓴 블록' : `${KIND_LABEL[SHAPES[p].kind]} 블록`}
                >
                  {p !== null && <Piece shape={SHAPES[p]} />}
                </button>
              ))}
            </div>
            <p className="muted game-hint">
              {picked === null
                ? '아래 블록을 누르고, 판에서 놓을 자리를 누르세요.'
                : '놓을 자리를 누르세요. 누른 칸이 블록 안에 들어가게 놓여요. 놓을 수 없으면 판이 흔들려요.'}
            </p>
            <div className="game-actions">
              <button
                className="btn"
                onClick={() => {
                  if (window.confirm('지금 판을 버리고 새로 시작할까요?')) start()
                }}
              >
                새 판
              </button>
              <button className="btn" onClick={onClose}>
                닫기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function Piece({ shape }) {
  const { rows, cols } = shapeSize(shape)
  const on = new Set(shape.cells.map(([r, c]) => r * cols + c))
  return (
    <span className="blk-shape" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {Array.from({ length: rows * cols }, (_, i) => (
        <i key={i} className={on.has(i) ? `k${shape.kind}` : ''} />
      ))}
    </span>
  )
}
