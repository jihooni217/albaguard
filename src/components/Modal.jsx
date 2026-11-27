import { useId, useRef } from 'react'
import Icon from './Icon.jsx'

const typing = () => document.activeElement?.matches?.('input, textarea, select')

// 화면 아래에서 올라오는 입력 창
export default function Modal({ title, onClose, children }) {
  const titleId = useId()
  // 바깥(어두운 부분)을 누르면 닫는다. 다만 입력 중이면 첫 번째 누름은 키보드만 내린다(적던 내용이 날아가지 않게).
  // 누르기 시작할 때 입력 중이었는지 기억한다(누르는 순간 입력 칸에서 포커스가 먼저 빠지는 브라우저가 있음)
  const wasTyping = useRef(false)
  function backdrop(e) {
    if (e.target !== e.currentTarget) return
    if (wasTyping.current || typing()) {
      document.activeElement?.blur()
      wasTyping.current = false
      return
    }
    onClose()
  }
  return (
    <div className="modal-backdrop" onPointerDown={() => (wasTyping.current = typing())} onClick={backdrop}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={(e) => e.stopPropagation()}>
        <div className="modal-grip" />
        <div className="modal-head">
          <h2 id={titleId}>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="닫기">
            <Icon name="close" size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
