import { useRef, useState } from 'react'
import { exportBackup, readBackup } from '../lib/backup'
import { fmtDateTime } from '../lib/time'
import Icon from './Icon.jsx'

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
      const photoCount = Object.keys(backup.photos ?? {}).length
      const summary = `근무지 ${backup.data.workplaces.length}곳, 근무 기록 ${backup.data.records.length}건, 사진 ${photoCount}장 (${fmtDateTime(backup.exportedAt)} 백업)`
      if (!window.confirm(`${summary}\n\n지금 있는 기록은 지워지고 이 백업으로 바뀌어요. 계속할까요?`)) return
      await actions.restore(backup.data, backup.photos ?? {})
      setMessage('백업에서 기록을 불러왔어요.')
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <>
      <div className="pay-rows">
        <div className="rq-row">
          <span>마지막 백업</span>
          <span className="set-value">{data.lastBackupAt ? fmtDateTime(data.lastBackupAt) : '아직 없어요'}</span>
        </div>
        {/* 기록을 지키는 유일한 방법이라 이 줄만 남색으로 눈에 띄게 한다 */}
        <button className="rq-row link set-main" onClick={save}>
          <span>백업 파일 만들기</span>
          <Icon name="chevronRight" size={18} />
        </button>
        <button className="rq-row link" onClick={() => fileInput.current.click()}>
          <span>백업 파일에서 불러오기</span>
          <Icon name="chevronRight" size={18} />
        </button>
      </div>
      <input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={load} />
      {message && <p className="notice stage-notice">{message}</p>}
      {error && <p className="error stage-notice">{error}</p>}
      <p className="muted pay-note">
        기록은 이 폰 안에만 저장돼요. 폰을 바꾸거나 브라우저 데이터를 지우면 사라지니 가끔 백업해 두세요.
      </p>
    </>
  )
}
