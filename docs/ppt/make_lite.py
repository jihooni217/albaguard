# build.js에서 화면 글을 줄인 간결판 스크립트(build_lite.js)를 만든다.
# 노트(대본)·다른 쪽은 build.js와 같다. build.js를 고친 뒤 다시 돌리면 된다.
import os
H = os.path.dirname(os.path.abspath(__file__))
s = open(os.path.join(H, 'build.js'), encoding='utf-8').read()
def sub(old, new):
    global s
    assert s.count(old) == 1, old[:40]
    s = s.replace(old, new)

# 2쪽: 역할 줄과 "오늘 순서" 묶음을 뺀다 (역할은 18쪽에 있음)
sub("    { label: '역할: 개발 이지훈 · 시장 손유호 · 검증 박명진', sub: '발표도 같은 순서로 나눠서 함', value: '3명', color: C.accent5, bold: true },\n", "")
sub("], { rowH: 0.72, labelSize: 13, valueSize: 13, valueW: 0.2 })", "], { rowH: 0.95, labelSize: 15, valueSize: 15, valueW: 0.2 })")
for line in ["  s.addText('오늘 순서', ", "  s.addText('문제 → 솔루션 → 기술 → 시연 3분", "  s.addText('질문은 발표 뒤 한 번에', "]:
    i = s.index(line); j = s.index('\n', i) + 1; s = s[:i] + s[j:]

# 7쪽: "이유" 열을 뺀다 (제목이 이유를 대신함)
for old in ["hdr('이유')", "cell('스토어 없이 링크로 바로 배포')", "cell('근무 내용은 폰 안에만')", "cell('공개키로는 넣기 · 읽기만" + chr(92) + "n시각은 서버가 찍음')",
            "cell('올리면 자동 배포')", "cell('기록을 밖으로 안 보내려고 기본은 끔')", "cell('로그인이 없어 설문 · 인터뷰로 측정')"]:
    sub(", " + old, "")
sub("colW: [1.75, 4.05, 3.2], rowH: [0.4, 0.52, 0.52, 0.8, 0.52, 0.52, 0.52]", "colW: [2.2, 6.8], rowH: [0.4, 0.5, 0.5, 0.72, 0.5, 0.5, 0.5]")
sub("const cell = (t, o = {}) => ({ text: t, options: { fontSize: 11.5,", "const cell = (t, o = {}) => ({ text: t, options: { fontSize: 12.5,")

# 16쪽: "확인할 것 / 중간 결과" 두 열만 (기준 · 못 미치면은 보고서 5.2에)
for old in ["th('어떻게 · 기준 (팀이 정함)'), th('못 미치면'), ",
            "td('인터뷰 + 설문 · 5명 중 3명'), td('입금 문자 자동 인식 앞당김'), ",
            "td('인터뷰 · 5명 중 3명'), td('문구 톤 · 단계를 다시 짬'), ",
            "td('인터뷰 · 5명 중 4명'), td('설정 · 증빙 문구 수정'), ",
            "td('설문 30명 이상 · 알바 중 반 이상'), td('주휴수당 중심 메시지 변경'), ",
            "td('설문 + 인터뷰 · \"싫다\"가 반 미만'), td('11/23 새 게임으로 전환'), "]:
    sub(old, "")
sub("colW: [2.45, 2.75, 2.1, 1.7], rowH: [0.42, 0.52, 0.52, 0.52, 0.52, 0.52]", "colW: [5.2, 3.8], rowH: [0.42, 0.52, 0.52, 0.52, 0.52, 0.52]")
sub("const td = (t, o = {}) => ({ text: t, options: { fontSize: 11,", "const td = (t, o = {}) => ({ text: t, options: { fontSize: 12.5,")
sub("th('확인할 것')", "th('11월에 확인할 것 (설문 30명 · 인터뷰 5명)')")

open(os.path.join(H, 'build_lite.js'), 'w', encoding='utf-8').write(s)
print('build_lite.js ok')
