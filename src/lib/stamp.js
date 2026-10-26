// 기록 등록(타임스탬프): 근무 기록의 "지문"(SHA-256)을 시각과 함께 서버(Supabase)에 남긴다
// 서버로 가는 것은 지문·기록 번호·폰 번호뿐이다. 근무지 이름, 출퇴근 시각, 금액은 폰 밖으로 나가지 않는다
// 서버의 등록 시각은 서버가 찍고(폰 시계와 무관), 등록된 줄은 공개 키로는 고치거나 지울 수 없다(운영자 권한으로는 가능)
// 지문이 같으면 내용이 같다는 뜻이라, "이 내용이 그 시각에 있었고 그 뒤 바뀌지 않았다"를 제3자가 확인할 수 있다

export const STAMP_URL = 'https://jejrynhqdvckspntpkxj.supabase.co'
const STAMP_KEY = 'sb_publishable_ZFLR4ZMjc85JAnWl7bdwCw_y5AHMJnn' // 공개용 키(앱에 넣어도 되는 키)
export const VERIFY_URL = 'https://jihooni217.github.io/albaguard/verify.html'

const HEADERS = {
  apikey: STAMP_KEY,
  Authorization: `Bearer ${STAMP_KEY}`,
  'Content-Type': 'application/json',
}

// 지문을 만들 때 쓰는 기록의 내용. 이 값이 하나라도 바뀌면 지문이 달라진다
export function recordPayload(record) {
  return {
    id: record.id,
    workplaceId: record.workplaceId,
    start: record.start,
    end: record.end ?? null,
    source: record.source ?? null,
    addReason: record.addReason ?? null,
    createdAt: record.createdAt ?? null,
    deleted: record.deleted ?? false,
    history: record.history ?? [],
  }
}

// 출근만 누른 상태의 지문. 퇴근 전에 "출근 시각이 이때 기록됐다"를 남긴다
export function clockInPayload(active) {
  return { id: active.id, workplaceId: active.workplaceId, start: active.start, stage: 'clockIn' }
}

// 내용을 SHA-256 지문(16진수 64자)으로
export async function fingerprint(payload) {
  const text = JSON.stringify(payload, Object.keys(payload).sort())
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

// 서버에 지문을 등록한다. 결과: { id, at } (at은 서버가 찍은 시각)
export async function registerStamp({ deviceId, recordId, hash }) {
  const res = await fetch(`${STAMP_URL}/rest/v1/stamps`, {
    method: 'POST',
    headers: { ...HEADERS, Prefer: 'return=representation' },
    body: JSON.stringify({ device: deviceId, record_id: recordId, hash }),
  })
  // 같은 지문이 이미 있으면(409) 그 줄을 찾아 돌려준다
  if (res.status === 409) {
    const found = await lookupStamp(hash)
    if (found) return found
  }
  if (!res.ok) throw new Error(`stamp ${res.status}`)
  const [row] = await res.json()
  return { id: row.id, at: row.created_at }
}

// 지문(또는 앞부분)으로 등록된 줄을 찾는다. 없으면 null
export async function lookupStamp(hashOrPrefix) {
  const q = hashOrPrefix.length >= 64 ? `hash=eq.${hashOrPrefix}` : `hash=like.${hashOrPrefix}*`
  const res = await fetch(`${STAMP_URL}/rest/v1/stamps?${q}&select=id,hash,created_at&limit=1`, { headers: HEADERS })
  if (!res.ok) throw new Error(`lookup ${res.status}`)
  const [row] = await res.json()
  return row ? { id: row.id, hash: row.hash, at: row.created_at } : null
}

// 문서에 적는 짧은 확인 번호(지문 앞 16자)
export const shortHash = (hash) => hash.slice(0, 16)
