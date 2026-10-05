import { useState } from 'react'
import { fromInputValue, toInputValue } from '../lib/time'
import Modal from './Modal.jsx'

// record가 있으면 수정, 없으면 직접 추가
export default function RecordForm({ record, workplaces, defaultWorkplaceId, defaultDate, actions, onClose }) {
  const isEdit = Boolean(record)
  const baseDate = defaultDate ?? toInputValue(new Date()).slice(0, 10)
  const [workplaceId, setWorkplaceId] = useState(record?.workplaceId ?? defaultWorkplaceId ?? workplaces[0]?.id)
  const [start, setStart] = useState(isEdit ? toInputValue(record.start) : `${baseDate}T09:00`)
  const [end, setEnd] = useState(isEdit ? toInputValue(record.end) : `${baseDate}T13:00`)
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  function validate() {
    if (!start || !end) return '출근·퇴근 시각을 모두 입력해 주세요.'
    if (new Date(end) <= new Date(start)) return '퇴근 시각은 출근 시각보다 늦어야 해요.'
    if (new Date(end) > new Date()) return '아직 지나지 않은 시각은 기록할 수 없어요.'
    if (!reason.trim()) return isEdit ? '수정 사유를 적어 주세요.' : '직접 입력하는 사유를 적어 주세요.'
    return ''
  }

  function save() {
    const message = validate()
    if (message) return setError(message)
    const next = { start: fromInputValue(start), end: fromInputValue(end), reason: reason.trim() }
    if (isEdit) {
      if (next.start === record.start && next.end === record.end) return setError('바뀐 시각이 없어요.')
      actions.editRecord(record.id, next)
    } else {
      actions.addManualRecord({ ...next, workplaceId })
    }
    onClose()
  }

  function remove() {
    if (!reason.trim()) return setError('삭제 사유를 적어 주세요.')
    actions.deleteRecord(record.id, reason.trim())
    onClose()
  }

  return (
    <Modal title={isEdit ? '근무 기록 수정' : '근무 기록 직접 추가'} onClose={onClose}>
      <p className="notice">
        {isEdit
          ? '수정 전·후 시각과 수정한 시점, 사유가 이력에 그대로 남아요.'
          : '직접 넣은 기록은 "나중에 입력"으로 표시되고, 입력한 시점과 사유가 남아요.'}
      </p>

      {!isEdit && (
        <label className="field">
          근무지
          <select className="input" value={workplaceId} onChange={(e) => setWorkplaceId(e.target.value)}>
            {workplaces.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <label className="field">
        출근 시각
        <input className="input" type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
      </label>
      <label className="field">
        퇴근 시각
        <input className="input" type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
      </label>
      <label className="field">
        {isEdit ? '수정 사유' : '직접 입력 사유'}
        <input
          className="input"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={isEdit ? '예: 퇴근 버튼을 늦게 눌렀어요' : '예: 출근 버튼을 깜빡했어요'}
        />
      </label>

      {error && <p className="error">{error}</p>}

      <button className="btn primary block" onClick={save}>
        {isEdit ? '수정 저장' : '기록 추가'}
      </button>
      {isEdit && (
        <button className="btn danger-text block" onClick={remove}>
          이 기록 삭제 (사유 필요)
        </button>
      )}
    </Modal>
  )
}
