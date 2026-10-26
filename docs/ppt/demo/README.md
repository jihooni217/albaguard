# 시연 영상 다시 찍기

`docs/08_시연_영상.mp4`는 배포된 앱을 폰 크기로 열어 실제로 눌러 가며 찍은 것이다(출근·퇴근은 진짜로 서버에 등록된다).
화면의 시각은 찍은 시각이 그대로 나오므로, 낮에 다시 찍고 싶으면 아래 순서대로 한다. 2분쯤 걸린다.

```bash
pip install playwright imageio-ffmpeg
python -m playwright install chromium
cd docs/ppt/demo
python record.py      # video/*.webm 과 steps.json 이 생긴다
python compose2.py ../../08_시연_영상.mp4   # 시작 화면 + 단계 진행 표시 + 자막 + 끝 화면을 얹은 1920x1080 mp4
```

그다음 `docs/ppt`에서 PPT를 다시 만들면(`build.js`) 11장에 새 영상이 들어간다. 자막 문구는 `compose2.py`의 `CAPS`에 있다(예전 단순판은 `compose.py`). 다시 찍으면 확인 번호가 바뀌니 `build.js`의 번호(지금 da3e2a7ad7e298db)도 바꾼다.
