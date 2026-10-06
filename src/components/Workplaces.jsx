import { useState } from 'react'
import { nextWageHistory, wageText } from '../lib/pay'
import { minWage } from '../lib/최저임금'
import { getTheme, setTheme } from '../lib/theme'
import { newId } from '../lib/id'
import { dateKey } from '../lib/time'
import { AddForm } from './Attachments.jsx'
import Backup from './Backup.jsx'
import Icon from './Icon.jsx'
import Modal from './Modal.jsx'

export default function Workplaces({ data, actions }) {
  const { workplaces, records, active } = data
  const [editing, setEditing] = useState(null) // null | {} (새로 등록) | 근무지
  const [theme, setThemeState] = useState(getTheme)
  const [proofFor, setProofFor] = useState(null) // 방금 등록한 근무지. 시급 근거 사진을 권하는 창
  const legal = minWage() // 올해 최저임금
  const [photoFor, setPhotoFor] = useState(null) // 사진 추가 창을 열 근무지

  return (
    <>
      <h2 className="rq-title set-first">내 근무지</h2>
      <div className="pay-rows">
        {workplaces.length === 0 && (
          <p className="cv-none">아직 없어요. 사장님과 연결할 필요 없이 혼자 등록해서 쓰면 돼요</p>
        )}
        {workplaces.map((w) => (
          <button className="rq-row link" key={w.id} onClick={() => setEditing(w)}>
            <span>
              <b className="set-name">{w.name}</b>
              <small>
                시급 {wageText(w)} · {w.fivePlus ? '5인 이상' : '5인 미만'}
                {w.breakMin > 0 && ` · 휴게 4시간마다 ${w.breakMin}분`}
              </small>
              {w.wage < legal.wage && (
                <small className="down">
                  {legal.year}년 최저시급({legal.wage.toLocaleString()}원)보다 낮아요
                </small>
              )}
            </span>
            <span className="set-value">수정</span>
          </button>
        ))}
        <button className="cv-add" onClick={() => setEditing({})}>
          <span>+</span>근무지 등록
        </button>
      </div>
      {legal.missing && (
        <p className="cv-none">
          {legal.year}년 최저임금이 아직 앱에 반영되지 않았어요. 지금은 {legal.wage.toLocaleString()}원(이전 해)으로 비교해요
        </p>
      )}

      <h2 className="rq-title">화면</h2>
      <div className="pay-rows">
        <div className="rq-row">
          <span>밝기</span>
          <div className="set-seg" role="radiogroup" aria-label="화면 밝기">
            {[
              ['system', '폰 설정대로'],
              ['light', '밝게'],
              ['dark', '어둡게'],
            ].map(([value, label]) => (
              <button
                key={value}
                role="radio"
                aria-checked={theme === value}
                className={theme === value ? 'active' : ''}
                onClick={() => {
                  setTheme(value)
                  setThemeState(value)
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <h2 className="rq-title">기록 백업</h2>
      <Backup data={data} actions={actions} />

      <h2 className="rq-title">시연 도구</h2>
      <div className="pay-rows">
        <button
          className="rq-row link"
          onClick={() => {
            const hasData = workplaces.length > 0
            if (!hasData || window.confirm('지금 있는 기록이 모두 지워지고 예시 데이터로 바뀌어요. 계속할까요?')) {
              actions.loadDemo()
            }
          }}
        >
          <span>
            시연용 예시 데이터 넣기
            <small>석 달치 근무 기록, 예정 스케줄, 두 달치 덜 받은 급여</small>
          </span>
          <Icon name="chevronRight" size={18} />
        </button>
        <button
          className="rq-row link set-danger"
          onClick={() => {
            if (window.confirm('모든 근무지와 기록이 지워져요. 되돌릴 수 없어요. 계속할까요?')) actions.resetAll()
          }}
        >
          <span>모든 데이터 지우기</span>
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
          onCreated={(w) => setProofFor(w)}
        />
      )}
      {proofFor && (
        <Modal title="시급 근거를 지금 남겨 두세요" onClose={() => setProofFor(null)}>
          <p className="muted">
            나중에 급여 문제가 생기면 가장 먼저 "시급이 얼마였냐"부터 부딪혀요. 시급이 적힌 구인 공고, 계약서, 사장님과 나눈
            메시지를 지금 사진으로 찍어 두면 증빙 묶음에 같이 들어가요.
          </p>
          <button
            className="btn primary block"
            onClick={() => {
              setPhotoFor(proofFor)
              setProofFor(null)
            }}
          >
            사진 찍기 / 고르기
          </button>
          <button className="btn ghost block" onClick={() => setProofFor(null)}>
            나중에 할게요
          </button>
        </Modal>
      )}
      {photoFor && (
        <AddForm
          workplace={photoFor}
          ym={dateKey(new Date()).slice(0, 7)}
          actions={actions}
          initialKind="wage"
          onClose={() => setPhotoFor(null)}
        />
      )}
    </>
  )
}

function WorkplaceForm({ workplace, canDelete, actions, onClose, onCreated }) {
  const isEdit = Boolean(workplace.id)
  const [name, setName] = useState(workplace.name ?? '')
  const legal = minWage() // 올해 최저임금
  const [wage, setWage] = useState(workplace.wage ?? legal.wage)
  const [fivePlus, setFivePlus] = useState(workplace.fivePlus ?? false)
  const [breakMin, setBreakMin] = useState(workplace.breakMin ?? 0)
  const [startDate, setStartDate] = useState(workplace.startDate ?? '')
  const [raised, setRaised] = useState(true) // 시급이 실제로 바뀐 것인지(true), 잘못 넣은 걸 고치는지(false)
  const [wageFrom, setWageFrom] = useState(dateKey(new Date()))
  const wageChanged = isEdit && Number(wage) > 0 && Number(wage) !== workplace.wage
  const [error, setError] = useState('')

  function save() {
    if (!name.trim()) return setError('매장 이름을 입력해 주세요.')
    if (!(Number(wage) > 0)) return setError('시급을 입력해 주세요.')
    if (!(Number(breakMin) >= 0 && Number(breakMin) < 240)) return setError('휴게시간은 0분 이상으로 입력해 주세요.')
    if (wageChanged && raised && !wageFrom) return setError('새 시급이 적용된 날짜를 입력해 주세요.')
    const saved = {
      id: workplace.id ?? newId(),
      name: name.trim(),
      wage: Number(wage),
      // 시급이 오른 것이면 그 날짜부터만 새 시급으로, 잘못 넣은 걸 고친 것이면 전체에 적용
      wageHistory: wageChanged
        ? nextWageHistory(workplace, Number(wage), raised ? wageFrom : null)
        : workplace.wageHistory,
      fivePlus,
      breakMin: Number(breakMin),
      startDate: startDate || undefined,
    }
    actions.saveWorkplace(saved)
    onClose()
    if (!isEdit) onCreated?.(saved)
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
      {Number(wage) > 0 && Number(wage) < legal.wage && (
        <p className="warn">
          {legal.year}년 최저시급은 {legal.wage.toLocaleString()}원이에요. 이보다 낮은 시급이에요.
        </p>
      )}
      {wageChanged && (
        <div className="notice">
          <label className="check">
            <input type="radio" name="wage-change" checked={raised} onChange={() => setRaised(true)} />
            <span>시급이 바뀌었어요 (이전 기록은 예전 시급으로 계산)</span>
          </label>
          {raised && (
            <label className="field">
              새 시급이 적용된 날짜
              <input className="input" type="date" value={wageFrom} onChange={(e) => setWageFrom(e.target.value)} />
            </label>
          )}
          <label className="check">
            <input type="radio" name="wage-change" checked={!raised} onChange={() => setRaised(false)} />
            <span>잘못 넣은 시급을 고쳐요 (기록 전체에 적용)</span>
          </label>
        </div>
      )}
      <label className="field">
        무급 휴게시간 (4시간 일할 때마다 몇 분)
        <input
          className="input"
          type="number"
          inputMode="numeric"
          min="0"
          value={breakMin}
          onChange={(e) => setBreakMin(e.target.value)}
        />
      </label>
      <p className="muted field-help">
        쉬는 시간 없이 일하거나 쉬는 시간에도 시급을 받으면 0. 법으로는 4시간에 30분이지만, 실제로 쉬지 못했다면 그
        시간도 근무 시간이에요.
      </p>
      <label className="field">
        이곳에서 일 시작한 날 (선택)
        <input className="input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      </label>
      <p className="muted field-help">
        1년 넘게 일하면 퇴직금 대상이 될 수 있어서 알려드려요. 비워 두면 첫 근무 기록 날을 시작으로 봐요.
      </p>
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
