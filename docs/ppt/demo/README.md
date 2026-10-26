# 시연 영상 다시 찍기

`docs/08_시연_영상.mp4`는 배포된 앱을 폰 크기로 열어 실제로 눌러 가며 찍은 것이다(출근·퇴근·수정은 진짜로 서버에 등록된다).
화면의 시각은 찍은 시각이 그대로 나온다. 녹화 2분, 영상 만들기 3분쯤 걸린다.

```bash
pip install playwright imageio-ffmpeg pillow
python -m playwright install chromium
cd docs/ppt/demo
python record3.py <그림 폴더>                       # 2배 해상도 화면 그림과 steps3.json 이 생긴다
python compose3.py <그림 폴더> ../../08_시연_영상.mp4   # 진짜 폰 모양(phone.py) + 진행 표시 + 자막 + 시작·끝 화면, 1920x1080
python compose3.py <그림 폴더> x "10,40"               # 미리보기: 그 시각(초)의 그림만 preview_*.png로 저장
```

- 장면: 출근 → 퇴근 → 출근 시각을 사유를 써서 수정(이력 보기) → 설정 "3건 등록됨" → "9월 급여 받으셨나요?" → 받은 금액 → 메시지(3개월 합계) → 3단계 진정 안내 → 증빙 묶음 PDF 7번 → 확인 페이지
- 자막 문구는 `compose3.py`의 `CAPS`(설명은 해요체, `|`가 줄바꿈). 장면 길이는 `record3.py`의 `hold()`
- 화면 그림은 기다리는 동안에도 받아야 해서 `time.sleep` 대신 `wait_for_timeout`을 쓴다. 스크롤은 `glide()`로 작게 나눠 굴리고, 마우스를 왼쪽 가장자리에 두어 입력 칸 안이 먼저 굴러가지 않게 한다
- 다시 찍으면 확인 번호가 바뀌니 `build.js`(19쪽)와 `docs/09_팀원_발표_요약.md`의 번호(지금 289ad066f1632c51)도 바꾼다
- 예전 방식(낮은 해상도 webm 녹화)은 `record.py`·`compose2.py`
