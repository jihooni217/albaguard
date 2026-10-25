import { useEffect, useMemo, useRef, useState } from 'react'
import { loadData, saveData } from './lib/storage'
import { makeActions } from './lib/actions'
import Evidence from './components/Evidence.jsx'
import { syncBarColor } from './lib/theme'
import { fmtDate } from './lib/time'
import { fingerprint, registerStamp } from './lib/stamp'
import Home from './components/Home.jsx'
import CalendarView from './components/CalendarView.jsx'
import Pay from './components/Pay.jsx'
import Request from './components/Request.jsx'
import BlockGame from './components/BlockGame.jsx'
import SpotGame from './components/SpotGame.jsx'
import Sudoku from './components/Sudoku.jsx'
import Workplaces from './components/Workplaces.jsx'

const TABS = [
  { id: 'home', label: '근무 기록', icon: 'clock' },
  { id: 'calendar', label: '캘린더', icon: 'calendar' },
  { id: 'pay', label: '급여 비교', icon: 'won' },
  { id: 'request', label: '정산 요청', icon: 'send' },
  { id: 'workplaces', label: '설정', icon: 'settings' },
]

export default function App() {
  const [data, setData] = useState(loadData)
  // 주소 끝의 #탭이름으로 처음 열 탭을 정하고, 탭을 바꾸면 주소에도 남긴다 (새로고침해도 같은 탭)
  const [tab, setTabState] = useState(() => {
    const fromHash = location.hash.slice(1)
    return TABS.some((t) => t.id === fromHash) ? fromHash : 'home'
  })
  const [payTarget, setPayTarget] = useState(null) // 첫 화면 알림에서 급여 비교로 넘어올 때 고른 달
  function setTab(id) {
    setPayTarget(null)
    setTabState(id)
    history.replaceState(null, '', `#${id}`)
    window.scrollTo(0, 0)
  }
  const [requestTarget, setRequestTarget] = useState(null) // 급여 비교에서 넘어올 때 고른 달
  const [gameOpen, setGameOpen] = useState(null) // 근무 중에만 열리는 게임: null | 'sudoku' | 'spot' | 'block'
  const [evidenceTarget, setEvidenceTarget] = useState(null) // 증빙 묶음을 볼 근무지·달
  const actions = useMemo(() => makeActions(setData), [])

  useEffect(() => {
    saveData(data)
  }, [data])

  // 기록 등록 대기열을 서버로 보낸다. 실패하면(오프라인 등) 그대로 두었다가 30초 뒤·다시 연결될 때 또 보낸다
  const pending = data.pendingStamps ?? []
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const on = () => setTick((t) => t + 1)
    window.addEventListener('online', on)
    return () => window.removeEventListener('online', on)
  }, [])
  const sending = useRef(false)
  useEffect(() => {
    if (sending.current || !navigator.onLine || pending.length === 0 || data.stampOff) return
    const item = pending[0]
    sending.current = true
    ;(async () => {
      try {
        const hash = await fingerprint(item.payload)
        const result = await registerStamp({ deviceId: data.deviceId, recordId: item.recordId, hash })
        actions.stampDone(item, { ...result, hash })
      } catch {
        setTimeout(() => setTick((t) => t + 1), 30000)
      } finally {
        sending.current = false
      }
    })()
  }, [pending, tick, data.stampOff, data.deviceId, actions])

  useEffect(() => {
    syncBarColor(tab === 'home' && data.workplaces.length > 0)
  }, [tab, data.workplaces.length, data.active])

  function openPay(target) {
    setTab('pay')
    setPayTarget({ workplaceId: target.workplaceId, ym: target.ym })
  }

  function openRequest(target) {
    setRequestTarget(target)
    setTab('request')
  }

  return (
    <>
    <div className="app">
      {tab !== 'home' && (
        <header className="app-header">
          <p className="brand">
            <span>알바가드</span>
            <span className="brand-date">{fmtDate(new Date())}</span>
          </p>
          <h1>{TABS.find((t) => t.id === tab).label}</h1>
        </header>
      )}

      <main className="app-main" key={tab}>
        {tab === 'home' && (
          <Home data={data} actions={actions} goTo={setTab} openPay={openPay} openGame={setGameOpen} />
        )}
        {tab === 'calendar' && <CalendarView data={data} actions={actions} goTo={setTab} />}
        {tab === 'pay' && <Pay data={data} actions={actions} goTo={setTab} openRequest={openRequest} openEvidence={setEvidenceTarget} target={payTarget} />}
        {tab === 'request' && (
          <Request
            data={data}
            actions={actions}
            target={requestTarget}
            goTo={setTab}
            openEvidence={setEvidenceTarget}
          />
        )}
        {tab === 'workplaces' && <Workplaces data={data} actions={actions} />}
      </main>

      <nav className="tabbar">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? 'tab active' : 'tab'} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
    {gameOpen === 'sudoku' && (
      <Sudoku game={data.sudoku} best={data.sudokuBest ?? {}} actions={actions} onClose={() => setGameOpen(null)} />
    )}
    {gameOpen === 'spot' && (
      <SpotGame
        best={data.spotBest ?? {}}
        seen={data.spotSeen ?? {}}
        cleared={data.spotCleared ?? {}}
        actions={actions}
        onClose={() => setGameOpen(null)}
      />
    )}
    {gameOpen === 'block' && (
      <BlockGame game={data.block ?? null} best={data.blockBest ?? 0} actions={actions} onClose={() => setGameOpen(null)} />
    )}
    {evidenceTarget && <Evidence data={data} target={evidenceTarget} onClose={() => setEvidenceTarget(null)} />}
    </>
  )
}
