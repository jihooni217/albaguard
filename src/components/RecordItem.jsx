import { useState } from 'react'
import { fmtDate, fmtDateTime, fmtDuration, fmtRange, minutesBetween } from '../lib/time'

// 근무 기록 한 줄. 수정 이력을 펼쳐 볼 수 있다
export default function RecordItem({ record, workplaces, onEdit }) {
  const [open, setOpen] = useState(false)
  const workplace = workplaces.find((w) => w.id === record.workplaceId)
  const edits = record.history.filter((h) => h.type === 'edit').length
  const hasTrail = record.history.length > 0 || record.source === 'manual'

  return (
    <div className={record.deleted ? 'card record deleted' : 'card record'}>
      <div className="record-top">
        <div>
          <p className="record-date">{fmtDate(record.start)}</p>
          <p className="record-range">{fmtRange(record.start, record.end)}</p>
          <p className="muted">{workplace?.name ?? '삭제된 근무지'}</p>
        </div>
        <p className="record-duration">{fmtDuration(minutesBetween(record.start, record.end))}</p>
      </div>

      <div className="record-bottom">
        <div className="badges">
          {record.deleted && <span className="badge red">삭제됨</span>}
          {record.source === 'manual' && <span className="badge gray">나중에 입력</span>}
          {edits > 0 && <span className="badge orange">수정 {edits}회</span>}
        </div>
        <div className="record-actions">
          {hasTrail && (
            <button className="btn small ghost" onClick={() => setOpen(!open)}>
              {open ? '이력 닫기' : '이력 보기'}
            </button>
          )}
          {!record.deleted && (
            <button className="btn small" onClick={onEdit}>
              수정
            </button>
          )}
        </div>
      </div>

      {open && (
        <ul className="history">
          {record.source === 'manual' ? (
            <li>
              <p className="history-when">{fmtDateTime(record.createdAt)} 직접 입력</p>
              <p className="muted">사유: {record.addReason}</p>
            </li>
          ) : (
            <li>
              <p className="history-when">{fmtDateTime(record.createdAt)} 출퇴근 버튼으로 기록</p>
            </li>
          )}
          {record.history.map((h, i) => (
            <li key={i}>
              <p className="history-when">
                {fmtDateTime(h.at)} {h.type === 'delete' ? '삭제' : '수정'}
              </p>
              {h.type === 'edit' ? (
                <p>
                  <span className="before">
                    {fmtDateTime(h.before.start)} ~ {fmtDateTime(h.before.end)}
                  </span>
                  {' → '}
                  <span className="after">
                    {fmtDateTime(h.after.start)} ~ {fmtDateTime(h.after.end)}
                  </span>
                </p>
              ) : (
                <p>
                  삭제 전: {fmtDateTime(h.before.start)} ~ {fmtDateTime(h.before.end)}
                </p>
              )}
              <p className="muted">사유: {h.reason}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
