// 연도별 최저임금 (시간급, 원)
//
// ▶ 매년 할 일: 다음 해 최저임금이 발표되면(매년 8월 5일까지 고시) 아래 표에 한 줄 추가하고 GitHub에 올린다.
//   - 숫자에는 쉼표를 쓰지 않는다 (10,700 ✗  →  10700 ○)
//   - 줄 끝에 쉼표(,)를 붙인다
//   - 올리면 자동 배포되어 모든 사용자의 앱에 반영된다
//   - 확인처: 고용노동부 보도자료 (moel.go.kr)
//
// 앱은 근무한 날짜의 연도로 이 표에서 금액을 찾는다.
// 표에 아직 없는 해가 오면 가장 최근 해의 금액으로 비교하고 "아직 반영되지 않았어요"라고 알린다.
export const MIN_WAGES = {
  2024: 9860,
  2025: 10030,
  2026: 10320,
  2027: 10700,
}

const YEARS = Object.keys(MIN_WAGES).map(Number).sort((a, b) => a - b)

// 그 해의 최저임금. year: 숫자, 또는 '2026-10-07' 같은 날짜 글자, 또는 Date
// 결과: { year: 그 해, wage: 금액, missing: 표에 그 해가 없어 최근 해 금액을 쓴 경우 true }
export function minWage(value = new Date()) {
  const year =
    typeof value === 'number' ? value : value instanceof Date ? value.getFullYear() : Number(String(value).slice(0, 4))
  if (MIN_WAGES[year]) return { year, wage: MIN_WAGES[year], missing: false }
  const known = YEARS.filter((y) => y <= year).at(-1) ?? YEARS[0]
  return { year, wage: MIN_WAGES[known], missing: year > YEARS.at(-1) }
}
