// 기록마다 붙이는 고유 번호.
// crypto.randomUUID 는 https(또는 localhost)에서만 되므로, 안 될 때 쓸 예비 방법을 둔다
export function newId() {
  if (crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
