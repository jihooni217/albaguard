// 정산 요청 문구를 만드는 작은 서버 코드.
// API 키는 여기(컴퓨터 쪽)에서만 쓰고, 폰 화면(브라우저)으로는 절대 보내지 않는다.
import Anthropic from '@anthropic-ai/sdk'

const MODEL = 'claude-opus-5-5'
const MAX_FACTS_LENGTH = 20000

const COMMON_RULES = `
- 아래에 주어진 근무 기록과 계산 내역의 숫자만 사용한다. 새로운 숫자나 사실을 지어내지 않는다.
- 결과물 본문만 출력한다. 앞뒤 설명, 인사말, 마크다운 기호(#, *, \`)는 쓰지 않는다.
- 한국어로 쓴다.`

const SYSTEM = {
  // 1단계: 사장님께 보내는 요청 메시지
  1: `당신은 시급제 아르바이트생이 사장님께 보낼 급여 확인 요청 메시지를 대신 써 주는 도우미입니다.
카카오톡이나 문자로 그대로 보낼 수 있는 메시지 한 편을 씁니다.

톤
- 정중하고 조심스럽게, 대화로 먼저 풀어 보려는 태도. "제가 계산을 잘 몰라서 여쭤보는데요" 같은 느낌.
- 따지거나 단정하지 않는다. 내 계산이 틀렸을 수도 있다는 여지를 남기고 확인을 부탁한다.
- 신고, 노동청, 법적 조치 같은 말은 꺼내지 않는다.
- 과하게 굽신거리거나 장황하게 사과하지 않는다.

들어가야 할 내용
- 짧은 인사와 어느 달 급여에 대한 이야기인지
- 내가 기록한 총 근무 시간, 계산해 본 금액(기본급·주휴수당·야간수당 중 해당하는 항목), 실제로 받은 금액, 그 차이
- 날짜별 근무 기록 (한 줄에 하루씩 간결하게)
- 확인을 부탁하는 말과 감사 인사

형식
- 받는 사람은 "사장님"으로 부른다. 보내는 사람 이름이나 빈칸은 넣지 않는다.
- 문자 메시지답게 짧은 문단으로 나눈다.
${COMMON_RULES}`,

  // 2단계: 내용증명 초안
  2: `당신은 시급제 아르바이트생이 미지급 임금을 청구하기 위해 보낼 내용증명 초안을 써 주는 도우미입니다.
이미 메시지로 요청했지만 해결되지 않은 상황입니다.

톤
- 감정을 섞지 않은 차분하고 사무적인 문체. 비난하거나 위협하지 않는다.

구성
- 제목: 임금 지급 요청
- 수신인 / 발신인 (이름·주소는 모르므로 [수신인 성명], [사업장 주소], [발신인 성명], [발신인 주소]처럼 대괄호 빈칸으로 둔다)
- 근무 사실: 근무지, 대상 기간, 시급, 총 근무 시간, 날짜별 근무 기록
- 계산 내역과 청구 금액 (받아야 할 금액, 받은 금액, 차액)
- 지급 요청: [지급 기한]까지 [입금 계좌]로 지급해 줄 것을 요청
- 기한 내에 지급되지 않으면 고용노동부에 진정을 제기하는 등 절차를 밟을 수 있다는 한 문장
- 작성일 [작성일] 과 발신인 서명란
${COMMON_RULES}`,
}

async function generate(apiKey, stage, facts) {
  const client = new Anthropic({ apiKey })
  // 모델이 응답을 거절하는 드문 경우 다른 모델이 이어받도록 fallbacks를 켜 둔다
  const response = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'low' },
    system: SYSTEM[stage],
    messages: [{ role: 'user', content: facts }],
  })
  if (response.stop_reason === 'refusal') {
    throw Object.assign(new Error('refused'), { code: 'REFUSED' })
  }
  return response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('')
    .trim()
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
      if (body.length > MAX_FACTS_LENGTH * 4) reject(new Error('too large'))
    })
    req.on('end', () => {
      try {
        resolve(JSON.parse(body))
      } catch (error) {
        reject(error)
      }
    })
    req.on('error', reject)
  })
}

function send(res, status, payload) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(payload))
}

// Vite 개발 서버에 /api/settlement-message 주소를 붙인다
export function settlementApi(apiKey) {
  const hasKey = Boolean(apiKey) && /^[\x21-\x7e]+$/.test(apiKey)

  async function handler(req, res, next) {
    if (req.url !== '/api/settlement-message' || req.method !== 'POST') return next()
    if (!hasKey) return send(res, 503, { error: 'NO_KEY' })

    let input
    try {
      input = await readJson(req)
    } catch {
      return send(res, 400, { error: 'BAD_REQUEST' })
    }
    const { stage, facts } = input
    if (!SYSTEM[stage] || typeof facts !== 'string' || !facts.trim() || facts.length > MAX_FACTS_LENGTH) {
      return send(res, 400, { error: 'BAD_REQUEST' })
    }

    try {
      send(res, 200, { text: await generate(apiKey, stage, facts) })
    } catch (error) {
      if (error.code === 'REFUSED') return send(res, 502, { error: 'REFUSED' })
      if (error instanceof Anthropic.AuthenticationError) return send(res, 502, { error: 'BAD_KEY' })
      if (error instanceof Anthropic.RateLimitError) return send(res, 502, { error: 'RATE_LIMIT' })
      if (error instanceof Anthropic.APIError) {
        console.error(`[정산 요청] Claude API 오류 ${error.status}: ${error.message}`)
        return send(res, 502, { error: 'API_ERROR', status: error.status })
      }
      console.error('[정산 요청] 오류:', error.message)
      send(res, 500, { error: 'UNKNOWN' })
    }
  }

  return {
    name: 'albaguard-settlement-api',
    configureServer(server) {
      server.middlewares.use(handler)
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler)
    },
  }
}
