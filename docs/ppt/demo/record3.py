# 알바가드 시연 영상 녹화 (선명판): 배포 앱을 폰 크기(375x768)로 열어 네 단계를 실제로 누르고,
# 화면을 2배 해상도(750x1536) 그림으로 받아 둔다(CDP screencast). 자막용 단계 시각은 steps3.json에 적는다.
# 쓰는 법: python record3.py <그림 저장 폴더>
import json, time, sys, os, re, base64
from playwright.sync_api import sync_playwright

OUT = os.path.dirname(os.path.abspath(__file__))
FR = sys.argv[1] if len(sys.argv) > 1 else os.path.join(OUT, 'frames3')
os.makedirs(FR, exist_ok=True)
APP = 'https://jihooni217.github.io/albaguard/'
VERIFY = 'https://jihooni217.github.io/albaguard/verify.html'
VW, VH = 375, 768

steps, frames = [], []
def mark(name):
    steps.append({'name': name, 't': time.time()})
    print(f'{steps[-1]["t"] - steps[0]["t"]:6.1f}s  {name}', flush=True)
PG = None
# 기다릴 때도 화면 그림을 계속 받도록 time.sleep 대신 브라우저 쪽에서 기다린다
def hold(sec): PG.wait_for_timeout(int(sec * 1000))
def glide(page, dy, sec=1.0):
    # 작은 걸음으로 부드럽게 굴린다. 마우스는 왼쪽 가장자리에 두어 입력 칸 안이 먼저 굴러가지 않게 한다
    page.mouse.move(6, 420)
    n = max(1, int(sec / 0.033)); step = dy / n
    for _ in range(n):
        page.mouse.wheel(0, step); page.wait_for_timeout(33)
def glide_to(page, loc, top=120, sec=1.2):
    box = loc.bounding_box()
    if box: glide(page, box['y'] - top, sec)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=['--force-device-scale-factor=2'])
    ctx0 = browser.new_context(viewport={'width': VW, 'height': VH}, device_scale_factor=2, locale='ko-KR', color_scheme='light')
    pg0 = ctx0.new_page(); pg0.on('dialog', lambda d: d.accept())
    pg0.goto(APP + '#workplaces', wait_until='networkidle')
    pg0.get_by_text('시연용 예시 데이터 넣기').click(); pg0.wait_for_timeout(800)
    state = ctx0.storage_state(); ctx0.close()

    ctx = browser.new_context(viewport={'width': VW, 'height': VH}, device_scale_factor=2, locale='ko-KR', color_scheme='light', storage_state=state)
    page = ctx.new_page(); page.on('dialog', lambda d: d.accept()); PG = page
    cdp = ctx.new_cdp_session(page)
    def on_frame(ev):
        n = len(frames)
        path = os.path.join(FR, f'f{n:05d}.jpg')
        open(path, 'wb').write(base64.b64decode(ev['data']))
        frames.append({'file': os.path.basename(path), 't': ev['metadata']['timestamp']})
        cdp.send('Page.screencastFrameAck', {'sessionId': ev['sessionId']})
    cdp.on('Page.screencastFrame', on_frame)
    page.goto(APP + '#home', wait_until='networkidle')
    page.wait_for_selector('.clock-btn.in'); page.wait_for_timeout(1500)
    cdp.send('Page.startScreencast', {'format': 'jpeg', 'quality': 95, 'maxWidth': VW * 2, 'maxHeight': VH * 2, 'everyNthFrame': 1})
    page.wait_for_timeout(300)
    mark('intro'); hold(6)

    # 1단계: 출근 → 퇴근 → 설정에서 "2건 등록됨"
    mark('step1')
    page.locator('.clock-btn.in').click(); page.wait_for_selector('.clock-btn.out'); hold(3.5)
    page.locator('.clock-btn.out').click(); page.wait_for_selector('.clock-btn.in'); hold(3)
    # 기록 수정: 출근 시각을 2시간 앞으로, 사유를 써야 저장된다
    mark('step1_edit')
    edit_btn = page.locator('.record-edit').first
    glide_to(page, edit_btn, top=330, sec=1.4); hold(1)
    edit_btn.click(); page.wait_for_selector('input[type=datetime-local]'); hold(2)
    st = page.locator('input[type=datetime-local]').first
    v = st.input_value()
    from datetime import datetime as _dt, timedelta as _td
    st.fill((_dt.strptime(v, '%Y-%m-%dT%H:%M') - _td(hours=2)).strftime('%Y-%m-%dT%H:%M')); hold(1.2)
    page.get_by_label('수정 사유').click()
    page.get_by_label('수정 사유').type('출근 버튼을 늦게 눌렀어요', delay=120); hold(1.2)
    page.get_by_role('button', name='수정 저장').click(); page.wait_for_selector('input[type=datetime-local]', state='detached'); hold(1.5)
    page.get_by_text('이력 보기').first.click(); hold(0.6)
    glide(page, 140, 0.8); hold(5)
    mark('step1_done')
    page.get_by_role('button', name='설정', exact=True).click(); page.wait_for_timeout(500)
    page.mouse.move(187, 400); glide_to(page, page.get_by_text('서버에 남긴 확인 번호'), top=260, sec=1.0)
    page.wait_for_function("() => document.body.innerText.includes('3건 등록됨') && !document.body.innerText.includes('보내는 중')", timeout=25000)
    hold(6)

    # 2단계: "N월 급여 받으셨나요?" → 받은 금액 → 차액
    mark('step2')
    page.get_by_role('button', name='근무 기록', exact=True).click(); page.wait_for_timeout(600); hold(2.5)
    page.locator('.alert-row', has_text='급여 받으셨나요?').click()
    page.wait_for_selector('.pay-ask input[type=number]'); hold(3)
    expected = int(re.sub(r'[^0-9]', '', page.locator('.rq-owed.plain').first.inner_text()))
    amount = int(round(expected * 0.82 / 1000) * 1000)
    page.locator('.pay-ask input[type=number]').click()
    page.locator('.pay-ask input[type=number]').type(str(amount), delay=150); hold(1)
    page.get_by_role('button', name='비교하기').click(); page.wait_for_selector('.rq-owed:not(.plain)')
    mark('step2_done'); hold(7)

    # 3단계: 메시지 (여러 달 합계) → 증빙 묶음 PDF 7번
    mark('step3')
    page.get_by_role('button', name='사장님께 보낼 메시지 만들기').click(); page.wait_for_timeout(600)
    sel = page.locator('select[aria-label="요청할 달 선택"]')
    if sel.count() > 0:
        sel.select_option(sel.locator('option').first.get_attribute('value')); page.wait_for_timeout(400)
    hold(4)
    page.get_by_role('button', name='메시지 만들기', exact=True).click(); page.wait_for_selector('textarea.message')
    hold(1)
    glide_to(page, page.locator('textarea.message'), top=110, sec=1.2); hold(0.5)
    mark('step3_msg'); hold(2)
    glide(page, 300, 2.0); hold(4)
    # 3단계 진정 절차 안내: 펼쳐서 1350 · 노동포털 연결만 보여 준다
    mark('step3_legal')
    legal = page.locator('details.rq-step summary', has_text='진정 절차 안내').first
    glide_to(page, legal, top=200, sec=1.2); hold(0.6)
    legal.click(); hold(1)
    glide_to(page, page.get_by_text('1350 전화 상담').first, top=330, sec=1.2); hold(6)
    mark('step3_pdf')
    page.get_by_role('button', name='급여 비교', exact=True).click(); page.wait_for_timeout(600)
    glide_to(page, page.locator('.pay-evidence button.rq-row.link'), top=420, sec=1.0); hold(1)
    page.locator('.pay-evidence button.rq-row.link').click(); page.wait_for_selector('.evidence-doc'); hold(3)
    page.mouse.move(187, 400)
    h7 = page.locator('.evidence-doc h2', has_text='7. 기록 등록 확인')
    glide_to(page, h7, top=110, sec=3.0); hold(0.3); glide_to(page, h7, top=110, sec=0.3); hold(7)
    short = page.locator('.evidence-doc td.mono').last.inner_text().strip()
    print('확인 번호', short)

    # 4단계: 확인 페이지
    mark('step4')
    page.goto(VERIFY, wait_until='networkidle'); hold(2)
    page.locator('#h').click(); page.locator('#h').type(short, delay=110); hold(1)
    page.locator('#go').click(); page.wait_for_selector('.result.ok', timeout=15000)
    mark('step4_done'); hold(9)
    mark('end')
    cdp.send('Page.stopScreencast')
    browser.close()

t0 = steps[0]['t']
json.dump({'steps': [{'name': s['name'], 't': round(s['t'] - t0, 3)} for s in steps],
           'frames': [{'file': f['file'], 't': round(f['t'] - t0, 3)} for f in frames],
           'clock0': t0, 'hash': short, 'amount': amount, 'expected': expected},
          open(os.path.join(OUT, 'steps3.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('frames', len(frames), 'end', round(steps[-1]['t'] - t0, 1))
