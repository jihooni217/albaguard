import { useRef, useState } from 'react'
import { newId } from '../lib/id'
import { KINDS, attachmentsFor, fileToDataUrl, putPhoto, usePhoto } from '../lib/photos'
import { dateKey, fmtDate, fmtDateTime } from '../lib/time'
import Icon from './Icon.jsx'
import Modal from './Modal.jsx'

// 증빙 사진: 근무표, 시급 근거, 입금 내역을 사진으로 붙여 둔다
export default function Attachments({ data, actions, workplace, ym }) {
  const items = attachmentsFor(data, workplace.id, [ym])
  const [adding, setAdding] = useState(false)
  const [viewing, setViewing] = useState(null)

  return (
    <section>
      <h2 className="rq-title">증빙 사진</h2>
      {items.length === 0 ? (
        <p className="muted pay-note">
          근무표, 시급이 적힌 계약서·공고·메시지, 통장 입금 내역을 붙여 두면 증빙 묶음에 함께 들어가요.
        </p>
      ) : (
        <div className="photo-grid">
          {items.map((a) => (
            <button key={a.id} className="photo-card" onClick={() => setViewing(a)}>
              <Photo id={a.id} alt={KINDS[a.kind]} />
              <span className="photo-kind">{KINDS[a.kind].split(' (')[0]}</span>
              <span className="photo-date">{fmtDate(a.date)}</span>
            </button>
          ))}
        </div>
      )}
      <button className="cv-add pay-add" onClick={() => setAdding(true)}>
        <span>+</span>사진 추가
      </button>

      {adding && <AddForm workplace={workplace} ym={ym} actions={actions} onClose={() => setAdding(false)} />}
      {viewing && (
        <Modal title={KINDS[viewing.kind]} onClose={() => setViewing(null)}>
          <Photo id={viewing.id} alt={KINDS[viewing.kind]} className="photo-full" />
          <p className="muted">
            {fmtDate(viewing.date)} 자료 · {fmtDateTime(viewing.addedAt)} 첨부
          </p>
          {viewing.note && <p>{viewing.note}</p>}
          <button
            className="btn danger-text block"
            onClick={() => {
              if (!window.confirm('이 사진을 지울까요?')) return
              actions.deleteAttachment(viewing.id)
              setViewing(null)
            }}
          >
            사진 삭제
          </button>
        </Modal>
      )}
    </section>
  )
}

export function Photo({ id, alt, className }) {
  const url = usePhoto(id)
  return url ? <img src={url} alt={alt} className={className} /> : <span className="photo-empty" />
}

function AddForm({ workplace, ym, actions, onClose }) {
  const fileInput = useRef(null)
  const today = dateKey(new Date())
  const [preview, setPreview] = useState(null)
  const [kind, setKind] = useState('schedule')
  const [date, setDate] = useState(today.startsWith(ym) ? today : `${ym}-01`)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  async function pick(event) {
    const file = event.target.files[0]
    if (!file) return
    try {
      setPreview(await fileToDataUrl(file))
      setError('')
    } catch {
      setError('이 파일은 사진으로 읽을 수 없어요.')
    }
  }

  async function save() {
    if (!preview) return setError('사진을 골라 주세요.')
    if (!date) return setError('날짜를 입력해 주세요.')
    const id = newId()
    try {
      await putPhoto(id, preview)
    } catch {
      return setError('사진을 저장하지 못했어요. 저장 공간을 확인해 주세요.')
    }
    actions.addAttachment({ id, workplaceId: workplace.id, kind, date, note: note.trim() })
    onClose()
  }

  return (
    <Modal title="증빙 사진 추가" onClose={onClose}>
      <button className="photo-pick" onClick={() => fileInput.current.click()}>
        {preview ? (
          <img src={preview} alt="고른 사진" />
        ) : (
          <>
            <Icon name="camera" size={28} />
            사진 찍기 또는 고르기
          </>
        )}
      </button>
      <input ref={fileInput} type="file" accept="image/*" hidden onChange={pick} />

      <label className="field">
        어떤 자료인가요?
        <select className="input" value={kind} onChange={(e) => setKind(e.target.value)}>
          {Object.entries(KINDS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        자료의 날짜
        <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </label>
      <label className="field">
        메모 (선택)
        <input
          className="input"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="예: 9월 둘째 주 근무표"
        />
      </label>

      {error && <p className="error">{error}</p>}

      <button className="btn primary block" onClick={save}>
        저장
      </button>
    </Modal>
  )
}
