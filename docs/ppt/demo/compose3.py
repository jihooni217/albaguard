# 시연 영상 만들기 (시안 A): record3.py가 받은 2배 화면 그림을 진짜 폰 모양(phone.py)으로 감싸
# 흰 바탕 왼쪽에 크게 두고, 오른쪽에 진행 표시와 큰 자막을 얹어 1920x1080 30fps mp4로 만든다.
# 자막은 이전 것이 0.25초 동안 사라진 뒤 새 것이 0.35초 동안 나타난다(겹치지 않게). 앞뒤에 남색 시작 · 끝 화면.
# 쓰는 법: python compose3.py <그림 폴더> [출력 mp4]
import json, os, sys, subprocess, time
from datetime import datetime
import imageio_ffmpeg
from PIL import Image, ImageDraw, ImageFont
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from phone import phone, shadow

HERE = os.path.dirname(os.path.abspath(__file__))
PROJ = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
FR = sys.argv[1]
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, 'demo3.mp4')
FF = imageio_ffmpeg.get_ffmpeg_exe()
info = json.load(open(os.path.join(HERE, 'steps3.json'), encoding='utf-8'))
T = {s['name']: s['t'] for s in info['steps']}
FRAMES = info['frames']; HASH = info['hash']; CLOCK0 = info['clock0']

W, H, FPS, FADE = 1920, 1080, 30, 0.5
NAVY = (42, 49, 147); INK = (20, 20, 22); GRAY = (120, 120, 126); MUTE = (190, 190, 196); LINE = (226, 226, 230)
FONT = 'C:/Windows/Fonts/malgun.ttf'; FONTB = 'C:/Windows/Fonts/malgunbd.ttf'
f = lambda s, b=False: ImageFont.truetype(FONTB if b else FONT, s)
X0 = 880          # 자막 왼쪽
STEPS = ['기록', '비교', '요청', '확인']
NL = chr(10)
CAPS = [  # (시작 키, 단계, 제목, 설명)  제목의 | 는 줄바꿈
    ('intro', 0, '예시 데이터가|들어 있는 상태', '석 달 치 근무 기록과|덜 받은 두 달 급여가 미리 들어 있어요'),
    ('step1', 1, '출근 · 퇴근|버튼', '누를 때마다 기록 내용으로 만든|확인 번호가 서버에 남아요'),
    ('step1_edit', 1, '기록을 고치려면|사유를 써야 저장', '고치기 전·후 시각과 사유가 이력으로 남고|고친 내용도 서버에 다시 등록돼요'),
    ('step1_done', 1, '설정 탭|"3건 등록됨"', '출근, 퇴근, 수정 때마다 한 번씩|예시 데이터는 등록하지 않아요'),
    ('step2', 2, '"9월 급여|받으셨나요?"', '통장에 들어온 금액만 넣으면 돼요'),
    ('step2_done', 2, '덜 받은 돈이|빨간 숫자로', '받았어야 할 돈과 실제로 받은 돈의 차이가 바로 보여요'),
    ('step3', 3, '사장님께|보낼 메시지', '덜 받은 달이 여럿이면 한 번에 합쳐서 요청해요'),
    ('step3_msg', 3, '날짜별 기록과|계산 근거를 담은 문구', '내 말투로 고친 뒤 복사해서 보내면 돼요'),
    ('step3_legal', 3, '그래도 안 되면|진정 절차 안내', '진정은 직접 하지 않고|1350 상담과 노동포털로 연결해요'),
    ('step3_pdf', 3, '증빙 묶음 PDF|7번 기록 등록 확인', '방금 남긴 기록의 확인 번호와 서버 등록 시각이 들어가요'),
    ('step4', 4, '확인 페이지에|확인 번호 입력', '앱 밖의 별도 페이지라 누구나 열 수 있어요'),
    ('step4_done', 4, '서버가 찍은|등록 시각', '늦어도 이 시각에는|이 확인 번호가 서버에 있었다는 뜻이에요|기록 내용과 맞춰 보는 기능은 기말까지 만들어요'),
]
END = T['end']

def wrap(d, text, font, width):
    out = []
    for part in text.split('|'):
        cur = ''
        for ch in part:
            if d.textlength(cur + ch, font=font) > width and cur:
                cut = cur.rfind(' ')
                if cut > 0: out.append(cur[:cut]); cur = cur[cut + 1:] + ch
                else: out.append(cur); cur = ch
            else: cur += ch
        if cur: out.append(cur)
    return out

PW = W - X0 - 90
def caption(i):
    _, _, title, sub = CAPS[i]
    im = Image.new('RGBA', (W - X0 + 20, H), (255, 255, 255, 0)); d = ImageDraw.Draw(im)
    y = 380
    for line in wrap(d, title, f(72, True), PW):
        d.text((20, y), line, font=f(72, True), fill=INK); y += 96
    y += 26
    d.rectangle([20, y, 84, y + 6], fill=(196, 49, 40) if '빨간' in title else NAVY); y += 34
    for line in wrap(d, sub, f(36), PW):
        d.text((20, y), line, font=f(36), fill=GRAY); y += 54
    return im
def progress(step):
    im = Image.new('RGBA', (W - X0 + 20, 120), (255, 255, 255, 0)); d = ImageDraw.Draw(im); x = 20
    for k, n in enumerate(STEPS):
        on = (k + 1 == step)
        txt = f'{k + 1} {n}'; ft = f(32, on)
        d.text((x, 40), txt, font=ft, fill=NAVY if on else (INK if k + 1 < step else MUTE))
        if on: d.rectangle([x, 92, x + d.textlength(txt, font=ft), 97], fill=NAVY)
        x += d.textlength(txt, font=ft) + 52
    return im

# 바탕 (흰색 + 아래 작은 글)
BG = Image.new('RGBA', (W, H), (255, 255, 255, 255)); d = ImageDraw.Draw(BG)
d.line([X0, H - 110, W - 90, H - 110], fill=LINE, width=2)
d.text((X0, H - 88), '알바가드 · jihooni217.github.io/albaguard', font=f(26), fill=GRAY)
d.text((W - 90, H - 88), '실제 배포된 앱 · 예시 데이터', font=f(26), fill=GRAY, anchor='ra')

# 오른쪽 영역은 흰 바탕 위에 미리 합쳐 두고 섞는다 (투명끼리 섞으면 글자 가장자리가 지저분해짐)
RX = X0 - 20
def right_panel(cap_i, step):
    base = BG.crop((RX, 0, W, H)).copy()
    base.alpha_composite(CAPS_IMG[cap_i], (0, 0))
    base.alpha_composite(PROG[step], (0, 130))
    return base
CAPS_IMG = [caption(i) for i in range(len(CAPS))]
PROG = {s: progress(s) for s in range(0, 5)}
PANEL = [right_panel(i, CAPS[i][1]) for i in range(len(CAPS))]
OUT_S, IN_S = 0.25, 0.35
def blank_panel(i):
    base = BG.crop((RX, 0, W, H)).copy()
    if i > 0 and CAPS[i - 1][1] == CAPS[i][1]:   # 같은 단계면 진행 표시는 그대로 둔다
        base.alpha_composite(PROG[CAPS[i][1]], (0, 130))
    return base
BLANK = [blank_panel(i) for i in range(len(CAPS))]

cache = {}
def phone_img(k):
    if k not in cache:
        fr = FRAMES[k]
        clk = datetime.fromtimestamp(CLOCK0 + fr['t']); clock = f'{clk.hour}:{clk.minute:02d}'
        ph = shadow(phone(Image.open(os.path.join(FR, fr['file'])).convert('RGB'), clock), blur=30, off=18, alpha=45)
        s = (H + 120) / ph.height
        cache.clear()
        cache[k] = ph.resize((round(ph.width * s), round(ph.height * s)), Image.LANCZOS)
    return cache[k]

def cap_at(t):
    idx = 0
    for i, c in enumerate(CAPS):
        if t >= T[c[0]]: idx = i
    return idx

def main_frame(t):
    k = 0
    while k + 1 < len(FRAMES) and FRAMES[k + 1]['t'] <= t: k += 1
    im = BG.copy()
    ph = phone_img(k)
    im.alpha_composite(ph, (170, (H - ph.height) // 2 + 6))
    i = cap_at(t)
    dt = t - T[CAPS[i][0]]
    if i == 0 or dt >= OUT_S + IN_S:
        panel = PANEL[i]
    elif dt < OUT_S:   # 이전 자막이 먼저 사라지고
        panel = Image.blend(PANEL[i - 1], BLANK[i], dt / OUT_S)
    else:              # 빈 뒤에 새 자막이 나타난다 (글자가 겹치지 않게)
        panel = Image.blend(BLANK[i], PANEL[i], (dt - OUT_S) / IN_S)
    im.paste(panel, (RX, 0))
    return im.convert('RGB')

def card(lines):
    icon = Image.open(os.path.join(PROJ, 'public', 'icon-512.png')).convert('RGBA').resize((200, 200), Image.LANCZOS)
    mask = Image.new('L', (200, 200), 0); ImageDraw.Draw(mask).rounded_rectangle([0, 0, 199, 199], radius=46, fill=255)
    im = Image.new('RGB', (W, H), NAVY); im.paste(icon, (160, 250), mask); d = ImageDraw.Draw(im); y = 500
    for text, size, bold, color, gap in lines:
        d.text((160, y), text, font=f(size, bold), fill=color); y += gap
    return im
WHITE, SOFT = (255, 255, 255), (200, 204, 240)
INTRO = card([('알바가드', 120, True, WHITE, 160), ('못 받은 알바비, 기록으로 찾는 앱', 48, False, WHITE, 110), ('시연 · 배포된 앱을 실제로 눌러 녹화', 32, False, SOFT, 0)])
OUTRO = card([('직접 확인해 보세요', 84, True, WHITE, 130), ('jihooni217.github.io/albaguard/verify.html', 44, False, WHITE, 70),
              (f'확인 번호  {HASH}', 44, True, WHITE, 120), ('앱 jihooni217.github.io/albaguard · 홈 화면에 추가해 설치', 32, False, SOFT, 0)])

if __name__ == '__main__':
    if len(sys.argv) > 3:  # 미리보기: 지정한 시각들의 그림만 저장
        for ts in sys.argv[3].split(','):
            main_frame(float(ts)).save(os.path.join(HERE, f'preview_{ts}.png'))
        sys.exit()
    ffp = subprocess.Popen([FF, '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                            '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', OUT], stdin=subprocess.PIPE)
    put = lambda im: ffp.stdin.write(im.tobytes())
    t_start = time.time()
    INTRO_S, OUTRO_S = 3.0, 4.0
    first = main_frame(0.0); last = main_frame(END - 0.01)
    n_x = int(FADE * FPS)
    for j in range(int(INTRO_S * FPS)): put(INTRO)
    for j in range(n_x): put(Image.blend(INTRO, first, (j + 1) / n_x))
    for j in range(int(END * FPS)): put(main_frame(j / FPS))
    for j in range(n_x): put(Image.blend(last, OUTRO, (j + 1) / n_x))
    for j in range(int(OUTRO_S * FPS)): put(OUTRO)
    ffp.stdin.close(); ffp.wait()
    print('done', OUT, 'build', round(time.time() - t_start), 's')
