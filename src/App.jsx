import { useEffect, useMemo, useState } from 'react'
import { loadData, saveData } from './lib/storage'
import { makeActions } from './lib/actions'
import Evidence from './components/Evidence.jsx'
import Home from './components/Home.jsx'
import CalendarView from './components/CalendarView.jsx'
import Pay from './components/Pay.jsx'
import Request from './components/Request.jsx'
import Workplaces from './components/Workplaces.jsx'

const TABS = [
  { id: 'home', label: '근무 기록', icon: '⏱' },
  { id: 'calendar', label: '캘린더', icon: '📅' },
  { id: 'pay', label: '급여 비교', icon: '💰' },
  { id: 'request', label: '정산 요청', icon: '✉️' },
  { id: 'workplaces', label: '근무지', icon: '🏪' },
]

export default function App() {
  const [data, setData] = useState(loadData)
  const [tab, setTab] = useState('home')
  const [requestTarget, setRequestTarget] = useState(null) // 급여 비교에서 넘어올 때 고른 달
  const [evidenceTarget, setEvidenceTarget] = useState(null) // 증빙 묶음을 볼 근무지·달
  const actions = useMemo(() => makeActions(setData), [])

  useEffect(() => {
    saveData(data)
  }, [data])

  function openRequest(target) {
    setRequestTarget(target)
    setTab('request')
  }

  return (
    <>
    <div className="app">
      <header className="app-header">
        <h1>알바가드</h1>
        <p>못 받은 알바비, 기록으로 찾는 앱</p>
      </header>

      <main className="app-main">
        {tab === 'home' && <Home data={data} actions={actions} goTo={setTab} />}
        {tab === 'calendar' && <CalendarView data={data} actions={actions} goTo={setTab} />}
        {tab === 'pay' && <Pay data={data} actions={actions} goTo={setTab} openRequest={openRequest} openEvidence={setEvidenceTarget} />}
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
            <span className="tab-icon">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
    {evidenceTarget && <Evidence data={data} target={evidenceTarget} onClose={() => setEvidenceTarget(null)} />}
    </>
  )
}
