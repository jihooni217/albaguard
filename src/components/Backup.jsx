import { useRef, useState } from 'react'
import { exportBackup, readBackup } from '../lib/backup'
import { fmtDateTime } from '../lib/time'

// 기록 백업: 파일로 내보내기 / 파일에서 불러오기
export default function Backup({ data, actions }) {
  const fileInput = useRef(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function save() {
    setError('')
    setMessage('')
    if (await exportBackup(data)) {
      actions.markBackup()
      setMessage('백업 파일을 만들었어요. 메일이나 클라우드처럼 폰 밖에도 보관해 두면 안전해요.')
    }
  }

  async function load(event) {
    const file = event.target.files[0]
    event.target.value = ''
    if (!file) return
    setError('')
    setMessage('')
    try {
      const backup = await readBackup(file)
      const summary = `근무지 ${backup.data.workplaces.length}곳, 근무 기록 ${backup.data.records.length}건 (${fmtDateTime(backup.exportedAt)} 백업)`
      if (!window.confirm(`${summary}\n\n지금 있는 기록은 지워지고 이 백업으로 바뀌어요. 계속할까요?`)) return
      actions.restore(backup.data)
      setMessage('백업에서 기록을 불러왔어요.')
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="card">
      <p className="muted">
        기록은 이 폰 안에만 저장돼요. 폰을 바꾸거나 브라우저 데이터를 지우면 사라지니, 가끔 파일로 백업해 두세요.
      </p>
      <p className="backup-last">
        마지막 백업: {data.lastBackupAt ? fmtDateTime(data.lastBackupAt) : '아직 없어요'}
      </p>
      <button className="btn primary block" onClick={save}>
        백업 파일 만들기
      </button>
      <button className="btn block" onClick={() => fileInput.current.click()}>
        백업 파일에서 불러오기
      </button>
      <input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={load} />
      {message && <p className="notice stage-notice">{message}</p>}
      {error && <p className="error stage-notice">{error}</p>}
    </div>
  )
}
