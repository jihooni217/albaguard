import { useState } from 'react'
import { MIN_WAGE_2026 } from '../lib/pay'
import Backup from './Backup.jsx'
import Modal from './Modal.jsx'

export default function Workplaces({ data, actions }) {
  const { workplaces, records, active } = data
  const [editing, setEditing] = useState(null) // null | {} (새로 등록) | 근무지

  return (
    <>
      <div className="section-head">
        <h2>내 근무지</h2>
        <button className="btn small" onClick={() => setEditing({})}>
          + 등록
        </button>
      </div>

      {workplaces.length === 0 && (
        <div className="card empty">
          <p className="empty-title">등록된 근무지가 없어요</p>
          <p className="muted">사장님과 연결할 필요 없이 혼자 등록해서 쓰면 돼요.</p>
          <button className="btn primary" onClick={() => setEditing({})}>
            근무지 등록하기
          </button>
        </div>
      )}

      {workplaces.map((w) => (
        <div className="card workplace" key={w.id}>
          <div>
            <p className="workplace-name">{w.name}</p>
            <p className="muted">
              시급 {w.wage.toLocaleString()}원 · {w.fivePlus ? '5인 이상' : '5인 미만'}
            </p>
            {w.wage < MIN_WAGE_2026 && (
              <p className="warn">2026년 최저시급({MIN_WAGE_2026.toLocaleString()}원)보다 낮아요</p>
            )}
          </div>
          <button className="btn small" onClick={() => setEditing(w)}>
            수정
          </button>
        </div>
      ))}

      <div className="section-head">
        <h2>기록 백업</h2>
      </div>
      <Backup data={data} actions={actions} />

      <div className="section-head">
        <h2>시연 도구</h2>
      </div>
      <div className="card">
        <p className="muted">두 달 전부터 어제까지의 근무 기록, 예정 스케줄, 두 달치 덜 받은 급여가 들어 있는 예시를 넣어요.</p>
        <button
          className="btn block"
          onClick={() => {
            const hasData = workplaces.length > 0
            if (!hasData || window.confirm('지금 있는 기록이 모두 지워지고 예시 데이터로 바뀌어요. 계속할까요?')) {
              actions.loadDemo()
            }
          }}
        >
          시연용 예시 데이터 넣기
        </button>
        <button
          className="btn danger-text block"
          onClick={() => {
            if (window.confirm('모든 근무지와 기록이 지워져요. 되돌릴 수 없어요. 계속할까요?')) actions.resetAll()
          }}
        >
          모든 데이터 지우기
        </button>
      </div>

      {editing && (
        <WorkplaceForm
          workplace={editing}
          canDelete={
            editing.id && !records.some((r) => r.workplaceId === editing.id) && active?.workplaceId !== editing.id
          }
          actions={actions}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  )
}

function WorkplaceForm({ workplace, canDelete, actions, onClose }) {
  const isEdit = Boolean(workplace.id)
  const [name, setName] = useState(workplace.name ?? '')
  const [wage, setWage] = useState(workplace.wage ?? MIN_WAGE_2026)
  const [fivePlus, setFivePlus] = useState(workplace.fivePlus ?? false)
  const [error, setError] = useState('')

  function save() {
    if (!name.trim()) return setError('매장 이름을 입력해 주세요.')
    if (!(Number(wage) > 0)) return setError('시급을 입력해 주세요.')
    actions.saveWorkplace({ id: workplace.id, name: name.trim(), wage: Number(wage), fivePlus })
    onClose()
  }

  return (
    <Modal title={isEdit ? '근무지 수정' : '근무지 등록'} onClose={onClose}>
      <label className="field">
        매장 이름
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="예: OO카페 신촌점" />
      </label>
      <label className="field">
        시급 (원)
        <input
          className="input"
          type="number"
          inputMode="numeric"
          value={wage}
          onChange={(e) => setWage(e.target.value)}
        />
      </label>
      {Number(wage) > 0 && Number(wage) < MIN_WAGE_2026 && (
        <p className="warn">2026년 최저시급은 {MIN_WAGE_2026.toLocaleString()}원이에요. 이보다 낮은 시급이에요.</p>
      )}
      <label className="check">
        <input type="checkbox" checked={fivePlus} onChange={(e) => setFivePlus(e.target.checked)} />
        <span>
          직원이 5명 이상인 사업장
          <small className="muted"> (야간수당 계산에 쓰여요. 모르면 비워 두세요)</small>
        </span>
      </label>

      {error && <p className="error">{error}</p>}

      <button className="btn primary block" onClick={save}>
        저장
      </button>
      {isEdit &&
        (canDelete ? (
          <button
            className="btn danger-text block"
            onClick={() => {
              actions.deleteWorkplace(workplace.id)
              onClose()
            }}
          >
            근무지 삭제
          </button>
        ) : (
          <p className="muted center">근무 기록이 있는 근무지는 삭제할 수 없어요.</p>
        ))}
    </Modal>
  )
}
