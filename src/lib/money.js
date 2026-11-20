// 금액 입력 칸: 숫자만 남기고, 화면에는 1,000처럼 쉼표를 넣어 보여 준다
export const onlyDigits = (value) => String(value ?? '').replace(/[^0-9]/g, '')
export const withCommas = (value) => {
  const digits = onlyDigits(value)
  return digits === '' ? '' : Number(digits).toLocaleString('ko-KR')
}
