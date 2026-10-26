# 시연 영상 꾸미기: 녹화한 webm 위에 시작 화면, 단계 진행 표시, 자막 패널, 끝 화면을 얹어 1920x1080 mp4로 만든다.
# 그림(배경·자막·시작/끝 화면)은 PIL로 PNG를 만들고, ffmpeg로 합친다. 글꼴은 윈도우 맑은 고딕.
# 쓰는 법: python compose2.py [출력 mp4]   (record.py가 만든 steps.json과 video/*.webm을 쓴다)
import json, os, shutil, subprocess, sys
import imageio_ffmpeg
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
PROJ = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
FF = imageio_ffmpeg.get_ffmpeg_exe()
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'demo2.mp4')
TMP = os.path.join(HERE, 'cap2')
os.makedirs(TMP, exist_ok=True)

info = json.load(open(os.path.join(HERE, 'steps.json'), encoding='utf-8'))
T = {s['name']: s['t'] for s in info['steps']}
HASH = info.get('hash', '')
src = os.path.relpath(info['video'], HERE).replace(os.sep, '/')

W, H = 1920, 1080
NAVY = (42, 49, 147)
NAVY_LIGHT = (176, 181, 226)
PAPER = (246, 245, 241)
INK = (26, 26, 26)
GRAY = (110, 110, 110)
LINE = (214, 212, 204)
RED = (196, 49, 40)
FONT = 'C:/Windows/Fonts/malgun.ttf'
FONTB = 'C:/Windows/Fonts/malgunbd.ttf'
f = lambda size, bold=False: ImageFont.truetype(FONTB if bold else FONT, size)

# 폰 화면 자리 (녹화는 375x812를 1000 높이로 키운다)
PH_H = 960
PH_W = round(375 * PH_H / 812)
PH_X, PH_Y = 190, (H - PH_H) // 2

STEPS = ['기록', '비교', '요청', '확인']
# (시작 키, 끝 키, 단계(0이면 진행 표시 없음), 제목, 설명)
CAPS = [
    ('intro', 'step1', 0, '예시 데이터가 들어 있는 상태', '석 달 치 근무 기록과, 덜 받은 두 달 급여가 미리 들어 있습니다.'),
    ('step1', 'step1_done', 1, '출근 · 퇴근 버튼', '누를 때마다 기록 내용으로 만든 확인 번호가 서버에 등록됩니다.'),
    ('step1_done', 'step2', 1, '설정 탭: "2건 등록됨"', '출근 때 한 번, 퇴근 때 한 번. 예시 데이터는 등록되지 않습니다.'),
    ('step2', 'step2_done', 2, '"9월 급여 받으셨나요?"', '통장에 들어온 금액만 넣으면 됩니다.'),
    ('step2_done', 'step3', 2, '덜 받은 돈이 빨간 숫자로 나옵니다', '받았어야 할 돈과 실제로 받은 돈의 차이가 바로 보입니다.'),
    ('step3', 'step3_msg', 3, '사장님께 보낼 메시지', '덜 받은 달이 여럿이면 합쳐서 한 번에 요청합니다.'),
    ('step3_msg', 'step3_pdf', 3, '날짜별 기록과 계산 근거가 들어간 메시지', '내 말투로 고친 뒤 복사해서 보냅니다.'),
    ('step3_pdf', 'step4', 3, '증빙 묶음 PDF · 7번 기록 등록 확인', '방금 남긴 기록의 확인 번호와 서버 등록 시각이 들어 있습니다.'),
    ('step4', 'step4_done', 4, '확인 페이지에 확인 번호 입력', '앱 밖의 별도 페이지라 누구나 열 수 있습니다.'),
    ('step4_done', 'end', 4, '서버가 찍은 등록 시각', '그 내용이 그 시각에 있었고 그 뒤 바뀌지 않았음을 보여 줍니다.'),
]


def wrap(draw, text, font, width):
    lines, cur = [], ''
    for ch in text:
        if draw.textlength(cur + ch, font=font) > width and cur:
            cut = cur.rfind(' ')
            if cut > 0:
                lines.append(cur[:cut]); cur = cur[cut + 1:] + ch
            else:
                lines.append(cur); cur = ch
        else:
            cur += ch
    if cur: lines.append(cur)
    return lines


# 1) 배경: 종이색 + 폰 테두리 + 아래 줄
bg = Image.new('RGB', (W, H), PAPER)
d = ImageDraw.Draw(bg)
pad = 14
d.rounded_rectangle([PH_X - pad, PH_Y - pad, PH_X + PH_W + pad, PH_Y + PH_H + pad], radius=46, fill=(20, 20, 24))
x0 = PH_X + PH_W + 150
d.line([x0, H - 120, W - 140, H - 120], fill=LINE, width=2)
d.text((x0, H - 98), '알바가드 · jihooni217.github.io/albaguard', font=f(26), fill=GRAY)
d.text((W - 140, H - 98), '실제 배포된 앱 · 예시 데이터', font=f(26), fill=GRAY, anchor='ra')
bg.save(os.path.join(TMP, 'bg.png'))

# 2) 자막 패널 (투명 PNG, 오른쪽 영역 전체)
PX, PW = x0, W - 140 - x0
for i, (_, _, step, title, sub) in enumerate(CAPS):
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.text((PX, 150), '알바가드 시연', font=f(30, True), fill=NAVY)
    # 진행 표시
    gy = 230
    gap = PW // 4
    for k, name in enumerate(STEPS):
        cx = PX + 34 + k * gap
        n = k + 1
        if k < 3:
            d.line([cx + 40, gy + 34, cx + gap - 40, gy + 34], fill=NAVY if step > n else LINE, width=4)
        if step == n:
            d.ellipse([cx - 34, gy, cx + 34, gy + 68], fill=NAVY)
            d.text((cx, gy + 34), str(n), font=f(34, True), fill='white', anchor='mm')
            d.text((cx, gy + 98), name, font=f(30, True), fill=NAVY, anchor='mm')
        elif step > n:
            d.ellipse([cx - 34, gy, cx + 34, gy + 68], fill=NAVY_LIGHT)
            d.text((cx, gy + 34), str(n), font=f(34, True), fill='white', anchor='mm')
            d.text((cx, gy + 98), name, font=f(30), fill=GRAY, anchor='mm')
        else:
            d.ellipse([cx - 34, gy, cx + 34, gy + 68], outline=LINE, width=4)
            d.text((cx, gy + 34), str(n), font=f(34, True), fill=(170, 170, 170), anchor='mm')
            d.text((cx, gy + 98), name, font=f(30), fill=(170, 170, 170), anchor='mm')
    # 제목 · 설명
    ty = 470
    for line in wrap(d, title, f(60, True), PW):
        d.text((PX, ty), line, font=f(60, True), fill=INK); ty += 84
    ty += 18
    d.rectangle([PX, ty, PX + 64, ty + 6], fill=RED if '빨간' in title else NAVY)
    ty += 34
    for line in wrap(d, sub, f(36), PW):
        d.text((PX, ty), line, font=f(36), fill=GRAY); ty += 54
    if step:
        # '진행 중' 꼬리표는 늘 보이게 자막 그림에 넣고, 둘레 고리만 따로 서서히 깜빡인다
        cx = PX + 34 + (step - 1) * gap
        d.rounded_rectangle([cx - 52, gy + 124, cx + 52, gy + 160], radius=18, fill=NAVY)
        d.text((cx, gy + 142), '진행 중', font=f(22, True), fill='white', anchor='mm')
    im.crop((PX - 20, 0, W, H)).save(os.path.join(TMP, f'cap{i}.png'))

# 지금 단계 둘레 고리가 1.2초마다 부드럽게 밝아졌다 흐려지는 그림 묶음 (단계마다 36장)
import math
PULSE_N = 36
for step in range(1, 5):
    cx = PX + 34 + (step - 1) * (PW // 4)
    gy = 230
    for k in range(PULSE_N):
        a = 0.5 - 0.5 * math.cos(2 * math.pi * k / PULSE_N)
        im = Image.new('RGBA', (130, 130), (0, 0, 0, 0))
        dd = ImageDraw.Draw(im)
        r = 44 + 8 * a
        dd.ellipse([65 - r, 65 - r, 65 + r, 65 + r], outline=NAVY_LIGHT + (int(40 + 215 * a),), width=7)
        im.save(os.path.join(TMP, f'pulse{step}_{k:02d}.png'))
PULSE_POS = {st: (PX + 34 + (st - 1) * (PW // 4) - 65, 230 + 34 - 65) for st in range(1, 5)}

# 3) 시작 · 끝 화면
icon = Image.open(os.path.join(PROJ, 'public', 'icon-512.png')).convert('RGBA').resize((200, 200), Image.LANCZOS)
mask = Image.new('L', (200, 200), 0); ImageDraw.Draw(mask).rounded_rectangle([0, 0, 199, 199], radius=46, fill=255)

def card(path, lines):
    im = Image.new('RGB', (W, H), NAVY)
    im.paste(icon, (160, 250), mask)
    d = ImageDraw.Draw(im)
    y = 500
    for text, size, bold, color, gap in lines:
        d.text((160, y), text, font=f(size, bold), fill=color); y += gap
    im.save(path)

WHITE, SOFT = (255, 255, 255), (200, 204, 240)
card(os.path.join(TMP, 'intro.png'), [
    ('알바가드', 120, True, WHITE, 160),
    ('못 받은 알바비, 기록으로 찾는 앱', 48, False, WHITE, 110),
    ('시연 · 배포된 앱을 실제로 눌러 녹화', 32, False, SOFT, 0),
])
card(os.path.join(TMP, 'outro.png'), [
    ('직접 확인해 보세요', 84, True, WHITE, 130),
    ('jihooni217.github.io/albaguard/verify.html', 44, False, WHITE, 70),
    (f'확인 번호  {HASH}', 44, True, WHITE, 120),
    ('앱 jihooni217.github.io/albaguard · 홈 화면에 추가해 설치', 32, False, SOFT, 0),
])

# 4) ffmpeg로 합치기 (자막은 한 줄 트랙으로 묶어 입력 하나로)
INTRO, OUTRO = 3.0, 4.0
end = T['end']
starts = [0.0] + [T[c[0]] for c in CAPS[1:]]
with open(os.path.join(TMP, 'caps.txt'), 'w', encoding='utf-8') as fo:
    fo.write('ffconcat version 1.0\n')
    for i, (a, b, *_r) in enumerate(CAPS):
        dur = (T[b] if i < len(CAPS) - 1 else end + 1) - starts[i]
        fo.write(f"file 'cap{i}.png'\nduration {dur:.3f}\n")
    fo.write(f"file 'cap{len(CAPS)-1}.png'\n")
cmd = [FF, '-y', '-loop', '1', '-t', str(INTRO), '-i', 'cap2/intro.png',
       '-i', src, '-loop', '1', '-t', str(end), '-i', 'cap2/bg.png',
       '-f', 'concat', '-safe', '0', '-i', 'cap2/caps.txt']
for st in range(1, 5):
    cmd += ['-stream_loop', '-1', '-framerate', '30', '-i', f'cap2/pulse{st}_%02d.png']
cmd += ['-loop', '1', '-t', str(OUTRO), '-i', 'cap2/outro.png']
pulse0, outro_idx = 4, 8
fl = [f'[1:v]crop=375:812:0:0,scale={PH_W}:{PH_H}:flags=lanczos,setsar=1[ph]',
      f'[2:v][ph]overlay={PH_X}:{PH_Y}:shortest=1[m0]',
      '[3:v]fps=30,format=rgba[caps]',
      f'[m0][caps]overlay={PX - 20}:0:eof_action=repeat[m1]']
cur = 'm1'
WIN = {1: ('step1', 'step2'), 2: ('step2', 'step3'), 3: ('step3', 'step4'), 4: ('step4', 'end')}
for st in range(1, 5):
    a, b = WIN[st]
    x, y = PULSE_POS[st]
    fl.append(f"[{cur}][{pulse0+st-1}:v]overlay={x}:{y}:enable='between(t,{T[a]},{T[b]})'[p{st}]")
    cur = f'p{st}'
fl.append(f'[{cur}]trim=0:{end},setpts=PTS-STARTPTS,fps=30,format=yuv420p[main]')
fl.append(f'[0:v]fps=30,format=yuv420p,fade=t=out:st={INTRO-0.5}:d=0.5[in]')
fl.append(f'[{outro_idx}:v]fps=30,format=yuv420p,fade=t=in:st=0:d=0.5[out]')
fl.append('[main]fade=t=in:st=0:d=0.4[mainf]')
fl.append('[in][mainf][out]concat=n=3:v=1:a=0[v]')
open(os.path.join(HERE, 'fc2.txt'), 'w', encoding='utf-8').write(';\n'.join(fl))
cmd += ['-filter_complex_script', 'fc2.txt', '-map', '[v]', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20',
        '-pix_fmt', 'yuv420p', '-movflags', '+faststart', 'demo2.mp4']
r = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='replace', cwd=HERE)
print(r.stderr[-1200:])
if r.returncode == 0 and os.path.abspath(OUT) != os.path.join(HERE, 'demo2.mp4'):
    shutil.copyfile(os.path.join(HERE, 'demo2.mp4'), OUT)
print('exit', r.returncode, OUT)
