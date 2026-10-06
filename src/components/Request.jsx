import { useState } from 'react'
import { FOLLOW_UP_DAYS, buildFacts, copyText, daysSince, makeMessage, shortfalls, targetKey } from '../lib/request'
import { dateKey, fmtDateTime, nowMinute } from '../lib/time'
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
  // 합계를 골랐으면 증빙 묶음도 그 달들을 모두 담는다
  const evidenceTarget = { workplaceId: current.workplace.id, yms: current.yms ?? [current.ym] }

  // 고르는 칸에 들어갈 짧은 이름. 합계는 "7월~8월 합계"처럼 줄여 쓴다
  const shortLabel = (c) => (c.combined ? `${c.months[0].month}월~${c.months.at(-1).month}월 합계` : c.label)
  const paid = current.combined ? current.paid : current.payment.amount
  // 앞 단계를 보낸 지 오래됐으면 접힌 다음 단계에 "이제 볼 때"라고 적는다
  const waited = (stage) => (saved[stage]?.sentAt ? daysSince(saved[stage].sentAt) : null)
  const nudge = (stage, base) =>
    waited(stage) >= FOLLOW_UP_DAYS ? `${stage === 1 ? '메시지' : '내용증명'}를 보낸 지 ${waited(stage)}일 · 이제 볼 때예요` : base

  return (
    <>
      <section className="rq-top">
        {candidates.length > 1 ? (
          <label className="rq-pick">
            <select value={current.key} onChange={(e) => setSelectedKey(e.target.value)} aria-label="요청할 달 선택">
              {candidates.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.workplace.name} · {shortLabel(c)}
                </option>
              ))}
            </select>
            <Icon name="chevronDown" size={16} />
          </label>
        ) : (
          <p className="rq-pick">
            {current.workplace.name} · {shortLabel(current)}
          </p>
        )}
        <p className="rq-label">덜 받은 돈</p>
        <p className="rq-owed">
          {Math.round(current.diff).toLocaleString()}
          <small>원</small>
        </p>

        <div className="rq-rows">
          <div className="rq-row">
            <span>받았어야 할 돈</span>
            <b>{won(current.target)}</b>
          </div>
          <div className="rq-row">
            <span>실제로 받은 돈</span>
            <b>{won(paid)}</b>
          </div>
          <details className="rq-facts">
            <summary className="rq-row link">
              <span>근거 보기 · 근무 기록과 계산 내역</span>
              <Icon name="chevronRight" size={18} />
            </summary>
            <pre>{facts}</pre>
          </details>
          <button className="rq-row link" onClick={() => openEvidence(evidenceTarget)}>
            <span>증빙 묶음 PDF 만들기</span>
            <Icon name="chevronRight" size={18} />
          </button>
        </div>
      </section>

      <h2 className="rq-title">이렇게 요청해요</h2>
      <div className="rq-steps">
      <Stage
        key={`${current.key}-1`}
        step={1}
        title="사장님께 메시지 보내기"
        desc="먼저 대화로 확인을 부탁하는 정중한 메시지예요. 보내기 전에 숫자를 한 번 확인하고, 내 말투에 맞게 고쳐도 돼요."
        button="메시지 만들기"
        defaultOpen
        saved={saved[1]}
        onSave={(value) => actions.saveRequest(current.key, 1, value)}
        generate={() => makeMessage(1, current)}
      />

      <Stage
        key={`${current.key}-2`}
        step={2}
        title="내용증명 초안"
        when={nudge(1, '대화로 풀리지 않을 때')}
        desc="메시지를 보냈는데도 해결되지 않을 때 쓰는 문서 초안이에요. [대괄호] 부분은 직접 채워야 하고, 우체국에서 내용증명으로 보낼 수 있어요. 법률 자문은 아니에요."
        button="초안 만들기"
        saved={saved[2]}
        onSave={(value) => actions.saveRequest(current.key, 2, value)}
        generate={() => makeMessage(2, current)}
      />

      <Fold step={3} title="진정 절차 안내" when={nudge(2, '그래도 받지 못했을 때 · 1350 상담, 노동포털')}>
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
            여기서 만든 <b>증빙 묶음 PDF</b>는 진정을 낼 때 첨부 자료로 쓸 수 있고, 진정24처럼 진정서 작성을 도와주는 서비스에
            증거 파일로 올릴 수도 있어요. 통장 거래 내역과 함께 준비해 두세요.
          </p>
          <button className="btn block with-icon" onClick={() => openEvidence(evidenceTarget)}>
            <Icon name="file" size={20} /> 증빙 묶음 PDF 만들기
          </button>
        </div>
        <p className="muted">임금은 받을 수 있게 된 날부터 3년이 지나면 청구하기 어려워져요.</p>
      </Fold>
      </div>

      <p className="muted note">
        알바가드는 내 기록을 정리하고 문구 초안을 만들어 주는 도구예요. 법률 자문이나 신고 대행이 아니고, 만든 문서의 법적
        효력을 보장하지 않아요. 정확한 판단은 고용노동부 상담(☎ 1350)이나 노무사에게 확인해 주세요.
      </p>
    </>
  )
}

// 제목을 누르면 펼쳐지는 단계 한 줄. 번호는 세로 선으로 이어진다. when: 접혀 있을 때 보이는, 언제 쓰는 단계인지
function Fold({ step, title, when, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <details className="rq-step" open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary>
        <span className="rq-num">{step}</span>
        <span className="rq-step-title">
          {title}
          {when && !open && <small>{when}</small>}
        </span>
        <Icon name="chevronRight" size={18} />
      </summary>
      <div className="rq-body">{children}</div>
    </details>
  )
}

// 문구를 만들고, 고치고, 복사하는 한 단계
function Stage({ step, title, when, desc, button, saved, onSave, generate, defaultOpen }) {
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
    // 다시 만들어도 보낸 날짜는 남겨 둔다
    onSave({ ...saved, text: result.text, source: result.source })
  }

  async function copy() {
    setCopied(await copyText(saved.text))
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Fold step={step} title={title} when={when} defaultOpen={defaultOpen || Boolean(saved)}>
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
          {saved.sentAt ? (
            <p className="rq-sent">
              <b>{fmtDateTime(saved.sentAt)}에 보냈어요</b> · {daysSince(saved.sentAt)}일 지남
              {daysSince(saved.sentAt) >= FOLLOW_UP_DAYS && ' · 답이 없다면 다음 단계를 볼 때예요'}
              <button className="rq-sent-undo" onClick={() => onSave({ ...saved, sentAt: undefined })}>
                보낸 기록 지우기
              </button>
            </p>
          ) : (
            <button className="rq-sent-btn" onClick={() => onSave({ ...saved, sentAt: nowMinute() })}>
              보냈어요 · 보낸 날짜 남기기
            </button>
          )}
        </>
      )}

      {error && <p className="error stage-notice">{error}</p>}

      <button className={saved ? 'btn block' : 'btn primary block'} onClick={run} disabled={loading}>
        {loading ? '만드는 중…' : saved ? '다시 만들기' : button}
      </button>
    </Fold>
  )
}
