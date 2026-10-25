# 녹화한 webm을 1920x1080 흰 바탕에 놓고, 오른쪽에 단계 자막을 넣어 mp4로 만든다.
import json, os, subprocess, sys
import imageio_ffmpeg

HERE = os.path.dirname(os.path.abspath(__file__))
FF = imageio_ffmpeg.get_ffmpeg_exe()
FONT = 'cap/malgun.ttf'
FONTB = 'cap/malgunbd.ttf'
info = json.load(open(os.path.join(HERE, 'steps.json'), encoding='utf-8'))
steps = {s['name']: s['t'] for s in info['steps']}
end = steps['end']
src = os.path.relpath(info['video'], HERE).replace(os.sep, '/')
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, '08_시연_영상.mp4')

# (시작 키, 끝 키, 번호, 제목, 설명)
CAPS = [
    ('intro', 'step1', '', '알바가드 시연', '예시 데이터가 들어 있는 상태에서 시작합니다'),
    ('step1', 'step1_done', '1', '출근 · 퇴근 버튼', '기록할 때마다 서버에 확인 번호가 남습니다'),
    ('step1_done', 'step2', '1', '설정 탭 → "2건 등록됨"', '출근 때 한 번, 퇴근 때 한 번. 예시 데이터는 등록되지 않습니다'),
    ('step2', 'step2_done', '2', '"9월 급여 받으셨나요?" → 금액 입력', '통장에 들어온 금액만 넣습니다'),
    ('step2_done', 'step3', '2', '덜 받은 돈이 빨간 숫자로', '받았어야 할 돈과 실제로 받은 돈을 나란히 봅니다'),
    ('step3', 'step3_msg', '3', '요청 메시지 생성 (3개월 합계)', '덜 받은 달이 여럿이면 합계로 한 번에 요청합니다'),
    ('step3_msg', 'step3_pdf', '3', '정중한 문구, 날짜별 기록과 계산 근거', '고치고 복사해서 사장님께 보냅니다'),
    ('step3_pdf', 'step4', '3', '증빙 묶음 PDF · 7번 기록 등록 확인', '방금 남긴 기록의 확인 번호와 서버 등록 시각'),
    ('step4', 'step4_done', '4', '확인 페이지에 확인 번호 입력', '앱 밖의 별도 페이지. 제3자도 열 수 있습니다'),
    ('step4_done', 'end', '4', '서버 등록 시각이 나옵니다', '"그때 기록한 그대로"를 제3자가 확인합니다'),
]

tmp = os.path.join(HERE, 'cap')
os.makedirs(tmp, exist_ok=True)
import shutil
for f in ('malgun.ttf', 'malgunbd.ttf'):  # 자막 글꼴: 윈도우의 맑은 고딕을 잠깐 복사해 쓴다(경로에 콜론이 있으면 ffmpeg가 못 읽음)
    shutil.copyfile('C:/Windows/Fonts/' + f, os.path.join(tmp, f))
def tf(name, text):
    p = os.path.join(tmp, name + '.txt')
    open(p, 'w', encoding='utf-8').write(text)
    return 'cap/' + name + '.txt'

NAVY = '0x2a3193'
filters = [
    '[0:v]crop=375:812:0:0,scale=-2:1000:flags=lanczos[ph]',
    f'color=c=white:s=1920x1080:d={end + 0.5}[bg]',
    '[bg][ph]overlay=x=200:y=40[v0]',
]
cur = 'v0'
n = 0
# 폰 테두리 느낌: 얇은 회색 선
filters.append(f'[{cur}]drawbox=x=199:y=39:w=464:h=1002:color=0xd0d0d0:t=2[v1]')
cur = 'v1'
for a, b, num, title, sub in CAPS:
    ta, tb = steps[a], steps[b]
    en = f"enable='between(t,{ta},{tb})'"
    x = 780
    if num:
        filters.append(f"[{cur}]drawtext=fontfile={FONTB}:textfile={tf(f'n{n}', num)}:fontsize=150:fontcolor={NAVY}:x={x}:y=300:{en}[v{n+2}]")
        cur = f'v{n+2}'; n += 1
        xt = x + 130
    else:
        xt = x
    filters.append(f"[{cur}]drawtext=fontfile={FONTB}:textfile={tf(f'n{n}', title)}:fontsize=46:fontcolor=0x1a1a1a:x={xt}:y=335:{en}[v{n+2}]")
    cur = f'v{n+2}'; n += 1
    filters.append(f"[{cur}]drawtext=fontfile={FONT}:textfile={tf(f'n{n}', sub)}:fontsize=32:fontcolor=0x555555:x={xt}:y=410:{en}[v{n+2}]")
    cur = f'v{n+2}'; n += 1

filters.append(f"[{cur}]drawtext=fontfile={FONT}:textfile={tf('foot', '알바가드 · jihooni217.github.io/albaguard · 실제 배포된 앱, 예시 데이터')}:fontsize=26:fontcolor=0x888888:x=780:y=980[vout]")
fc = ';\n'.join(filters)
open(os.path.join(HERE, 'fc.txt'), 'w', encoding='utf-8').write(fc)
cmd = [FF, '-y', '-i', src, '-filter_complex_script', 'fc.txt', '-map', '[vout]', '-t', str(end), '-r', '30',
       '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'medium', '-crf', '22', '-movflags', '+faststart', 'demo.mp4']
print(' '.join(cmd[:6]), '...')
r = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='replace', cwd=HERE)
if r.returncode == 0:
    import shutil; shutil.copyfile(os.path.join(HERE, 'demo.mp4'), out)
print(r.stderr[-1500:])
print('exit', r.returncode, out, os.path.getsize(out) if os.path.exists(out) else None)
