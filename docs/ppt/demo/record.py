# 알바가드 시연 영상 녹화: 배포 앱을 폰 크기로 열어 10장의 네 단계를 실제로 눌러 가며 webm으로 남긴다.
# 자막용으로 각 단계의 시작 시각(초)을 steps.json에 적는다.
import json, time, sys, os, re
from playwright.sync_api import sync_playwright

OUT = os.path.dirname(os.path.abspath(__file__))
APP = 'https://jihooni217.github.io/albaguard/'
VERIFY = 'https://jihooni217.github.io/albaguard/verify.html'

steps = []
t0 = None
def mark(name):
    steps.append({'name': name, 't': round(time.time() - t0, 2)})
    print(f'{steps[-1]["t"]:6.1f}s  {name}', flush=True)

def hold(sec):
    time.sleep(sec)

def wheel(page, dy, times=1, pause=0.35):
    for _ in range(times):
        page.mouse.wheel(0, dy)
        hold(pause)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    # 1) 녹화 없이 예시 데이터를 넣고 저장 상태를 뽑는다 (발표 전에 미리 넣어 두는 것과 같음)
    ctx0 = browser.new_context(viewport={'width': 375, 'height': 812}, device_scale_factor=2, locale='ko-KR', color_scheme='light')
    pg0 = ctx0.new_page()
    pg0.on('dialog', lambda d: d.accept())
    pg0.goto(APP + '#workplaces', wait_until='networkidle')
    pg0.get_by_text('시연용 예시 데이터 넣기').click()
    pg0.wait_for_timeout(800)
    state = ctx0.storage_state()
    ctx0.close()

    # 2) 녹화 시작
    ctx = browser.new_context(
        viewport={'width': 375, 'height': 812}, device_scale_factor=2, locale='ko-KR', color_scheme='light',
        storage_state=state, record_video_dir=os.path.join(OUT, 'video'), record_video_size={'width': 750, 'height': 1624},
    )
    page = ctx.new_page()
    page.on('dialog', lambda d: d.accept())
    t0 = time.time()
    page.goto(APP + '#home', wait_until='networkidle')
    page.wait_for_selector('.clock-btn.in')
    page.wait_for_timeout(1500)  # 글꼴 로딩
    mark('intro')
    hold(5)

    # ── 1단계: 출근 → 퇴근 → 설정에서 "2건 등록됨"
    mark('step1')
    page.locator('.clock-btn.in').click()
    page.wait_for_selector('.clock-btn.out')
    hold(7)
    page.locator('.clock-btn.out').click()
    page.wait_for_selector('.clock-btn.in')
    hold(4)
    page.get_by_role('button', name='설정', exact=True).click()
    page.wait_for_timeout(600)
    page.get_by_text('서버에 남긴 확인 번호').scroll_into_view_if_needed()
    hold(0.5)
    # 서버 등록이 끝나 "2건 등록됨"이 될 때까지 (최대 25초)
    page.wait_for_function("() => document.body.innerText.includes('2건 등록됨') && !document.body.innerText.includes('보내는 중')", timeout=25000)
    mark('step1_done')
    hold(7)

    # ── 2단계: 첫 화면 "N월 급여 받으셨나요?" → 받은 금액 입력 → 차액
    mark('step2')
    page.get_by_role('button', name='근무 기록', exact=True).click()
    page.wait_for_timeout(800)
    hold(3)
    page.locator('.alert-row', has_text='급여 받으셨나요?').click()
    page.wait_for_selector('.pay-ask input[type=number]')
    hold(4)
    expected_text = page.locator('.rq-owed.plain').first.inner_text()
    expected = int(re.sub(r'[^0-9]', '', expected_text))
    amount = int(round(expected * 0.82 / 1000) * 1000)  # 기본급만 들어온 정도로
    page.locator('.pay-ask input[type=number]').click()
    hold(0.5)
    page.locator('.pay-ask input[type=number]').type(str(amount), delay=120)
    hold(1)
    page.get_by_role('button', name='비교하기').click()
    page.wait_for_selector('.rq-owed:not(.plain)')
    mark('step2_done')
    hold(9)

    # ── 3단계: 메시지 만들기 (여러 달 합계) → 증빙 묶음 PDF 7번 표
    mark('step3')
    page.get_by_role('button', name='사장님께 보낼 메시지 만들기').click()
    page.wait_for_timeout(800)
    sel = page.locator('select[aria-label="요청할 달 선택"]')
    if sel.count() > 0:
        first = sel.locator('option').first.get_attribute('value')
        sel.select_option(first)
        page.wait_for_timeout(500)
    hold(4)
    page.get_by_role('button', name='메시지 만들기', exact=True).click()
    page.wait_for_selector('textarea.message')
    hold(1)
    page.locator('textarea.message').scroll_into_view_if_needed()
    hold(1)
    wheel(page, 220, 4, 0.9)
    mark('step3_msg')
    hold(6)
    # 증빙 묶음은 이번 달 것으로 연다 (방금 남긴 2건의 확인 번호가 7번 표에 나오게)
    page.get_by_role('button', name='급여 비교', exact=True).click()
    page.wait_for_timeout(800)
    page.locator('.pay-evidence button.rq-row.link').scroll_into_view_if_needed()
    hold(1.2)
    page.locator('.pay-evidence button.rq-row.link').click()
    page.wait_for_selector('.evidence-doc')
    hold(4)
    wheel(page, 700, 6, 0.9)
    h7 = page.locator('.evidence-doc h2', has_text='7. 기록 등록 확인')
    h7.scroll_into_view_if_needed()
    page.evaluate('window.scrollBy(0, -40)')
    page.wait_for_timeout(300)
    mark('step3_pdf')
    hold(9)
    short = page.locator('.evidence-doc td.mono').last.inner_text().strip()
    print('확인 번호', short)

    # ── 4단계: 확인 페이지
    mark('step4')
    page.goto(VERIFY, wait_until='networkidle')
    hold(1.5)
    page.locator('#h').click()
    page.locator('#h').type(short, delay=90)
    hold(0.8)
    page.locator('#go').click()
    page.wait_for_selector('.result.ok', timeout=15000)
    mark('step4_done')
    hold(9)
    mark('end')

    ctx.close()
    video_path = page.video.path()
    browser.close()

json.dump({'steps': steps, 'video': str(video_path), 'hash': short, 'amount': amount, 'expected': expected}, open(os.path.join(OUT, 'steps.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('video', video_path)
