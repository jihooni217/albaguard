import { useState } from 'react'
import { buildFacts, copyText, makeMessage, shortfalls, targetKey } from '../lib/request'
import { dateKey } from '../lib/time'
import Icon from './Icon.jsx'

const won = (n) => `${Math.round(n).toLocaleString()}원`

export default function Request({ data, actions, target, goTo, openEvidence }) {
  const candidates = shortfalls(data, dateKey(new Date()))
  const [selectedKey, setSelectedKey] = useState(targetKey(target))
  const current = candidates.find((c) => c.key === selectedKey) ?? candidates[0]

  if (!current) {
    return (
      <div className="card empty">
        <p className="empty-title">아직 요청할 차액이 없어요</p>
        <p className="muted">급여 비교에서 실제 받은 금액을 입력하면, 덜 받은 달에 대해 요청 메시지를 만들 수 있어요.</p>
        <button className="btn primary" onClick={() => goTo('pay')}>
          급여 비교로 가기
        </button>
      </div>
    )
  }

  const facts = buildFacts(current)
  const saved = data.requests[current.key] ?? {}

  return (
    <>
      <section className="card">
        {candidates.length > 1 && (
          <select
            className="input select-top"
            value={current.key}
            onChange={(e) => setSelectedKey(e.target.value)}
            aria-label="요청할 달 선택"
          >
            {candidates.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label} · {c.workplace.name}
              </option>
            ))}
          </select>
        )}
        <p className="muted">
          {current.workplace.name} · {current.label}
        </p>
        <p className="request-diff">{won(current.diff)} 덜 받았어요</p>
        <details className="facts">
          <summary>근거 보기 (근무 기록·계산 내역)</summary>
          <pre>{facts}</pre>
        </details>
        <button
          className="btn block with-icon"
          onClick={() => openEvidence({ workplaceId: current.workplace.id, ym: current.ym })}
        >
          <Icon name="file" size={20} /> 증빙 묶음 PDF 만들기
        </button>
      </section>

      <Stage
        key={`${current.key}-1`}
        step="1단계"
        title="사장님께 보낼 메시지"
        desc="먼저 대화로 확인을 부탁하는 정중한 메시지예요. 보내기 전에 숫자를 한 번 확인하고, 내 말투에 맞게 고쳐도 돼요."
        button="메시지 만들기"
        saved={saved[1]}
        onSave={(value) => actions.saveRequest(current.key, 1, value)}
        generate={() => makeMessage(1, current)}
      />

      <Stage
        key={`${current.key}-2`}
        step="2단계"
        title="내용증명 초안"
        desc="메시지를 보냈는데도 해결되지 않을 때 쓰는 문서 초안이에요. [대괄호] 부분은 직접 채워야 하고, 우체국에서 내용증명으로 보낼 수 있어요. 법률 자문은 아니에요."
        button="초안 만들기"
        saved={saved[2]}
        onSave={(value) => actions.saveRequest(current.key, 2, value)}
        generate={() => makeMessage(2, current)}
      />

      <section className="card">
        <p className="stage-step">3단계</p>
        <h2 className="stage-title">진정 절차 안내</h2>
        <p className="muted">그래도 받지 못했다면 고용노동부에 임금체불 진정을 낼 수 있어요.</p>
        <ol className="guide">
          <li>
            <b>상담</b> — 고용노동부 고객상담센터 ☎ 1350 에서 먼저 물어볼 수 있어요.
          </li>
          <li>
            <b>진정 접수</b> — 고용노동부 노동포털에서 온라인으로 내거나, 사업장 관할 지방고용노동관서를 방문해요.
          </li>
          <li>
            <b>준비할 것</b> — 근무 기록과 수정 이력, 계산 내역, 입금 내역, 사장님과 주고받은 메시지.
          </li>
          <li>
            <b>이후</b> — 근로감독관이 양쪽 이야기를 듣고 사실을 확인해요.
          </li>
        </ol>

        <div className="link-row">
          <a className="btn with-icon" href="tel:1350">
            <Icon name="phone" size={20} /> 1350 전화 상담
          </a>
          <a className="btn with-icon" href="https://labor.moel.go.kr/" target="_blank" rel="noreferrer">
            <Icon name="external" size={20} /> 노동포털 열기
          </a>
        </div>

        <div className="notice link-note">
          <p>
            여기서 만든 <b>증빙 묶음 PDF</b>는 진정을 낼 때 첨부 자료로 쓸 수 있고, 진정서 작성을 도와주는 서비스에 증거
            파일로 올릴 수도 있어요. 통장 거래 내역과 함께 준비해 두세요.
          </p>
          <button
            className="btn block with-icon"
            onClick={() => openEvidence({ workplaceId: current.workplace.id, ym: current.ym })}
          >
            <Icon name="file" size={20} /> 증빙 묶음 PDF 만들기
          </button>
        </div>
        <p className="muted">임금은 받을 수 있게 된 날부터 3년이 지나면 청구하기 어려워져요.</p>
      </section>

      <p className="muted note">
        알바가드는 내 기록을 정리하고 문구 초안을 만들어 주는 도구예요. 법률 자문이나 신고 대행이 아니고, 만든 문서의 법적
        효력을 보장하지 않아요. 정확한 판단은 고용노동부 상담(☎ 1350)이나 노무사에게 확인해 주세요.
      </p>
    </>
  )
}

// 문구를 만들고, 고치고, 복사하는 한 단계
function Stage({ step, title, desc, button, saved, onSave, generate }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [copied, setCopied] = useState(false)

  async function run() {
    setLoading(true)
    setError('')
    setNotice('')
    const result = await generate()
    setLoading(false)
    if (result.error) return setError(result.error)
    setNotice(result.notice ?? '')
    onSave({ text: result.text, source: result.source })
  }

  async function copy() {
    setCopied(await copyText(saved.text))
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="card">
      <p className="stage-step">{step}</p>
      <h2 className="stage-title">{title}</h2>
      <p className="muted">{desc}</p>

      {saved && (
        <>
          {notice && <p className="notice stage-notice">{notice} 대신 기본 문구로 만들었어요.</p>}
          <textarea
            className="input message"
            value={saved.text}
            onChange={(e) => onSave({ ...saved, text: e.target.value })}
            rows={Math.min(18, saved.text.split('\n').length + 3)}
          />
          <button className="btn primary block" onClick={copy}>
            {copied ? '복사했어요 ✓' : '복사하기'}
          </button>
        </>
      )}

      {error && <p className="error stage-notice">{error}</p>}

      <button className={saved ? 'btn block' : 'btn primary block'} onClick={run} disabled={loading}>
        {loading ? '만드는 중…' : saved ? '다시 만들기' : button}
      </button>
    </section>
  )
}
