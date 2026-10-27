# PPT · 보고서용 화면 캡처를 3배 해상도(1125x2436 PNG)로 다시 찍는다. 예시 데이터를 넣은 배포 앱 기준.
# 쓰는 법: python shots3x.py <저장 폴더> [확인 번호]
import os, sys
from playwright.sync_api import sync_playwright

OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
HASH = sys.argv[2] if len(sys.argv) > 2 else '289ad066f1632c51'
APP = 'https://jihooni217.github.io/albaguard/'
VW, VH = 375, 812

with sync_playwright() as p:
    b = p.chromium.launch(headless=True, args=['--force-device-scale-factor=3'])
    c0 = b.new_context(viewport={'width': VW, 'height': VH}, device_scale_factor=3, locale='ko-KR', color_scheme='light')
    g = c0.new_page(); g.on('dialog', lambda d: d.accept())
    g.goto(APP + '#workplaces', wait_until='networkidle')
    g.get_by_text('시연용 예시 데이터 넣기').click(); g.wait_for_timeout(800)
    st = c0.storage_state(); c0.close()

    def fresh(url):
        c = b.new_context(viewport={'width': VW, 'height': VH}, device_scale_factor=3, locale='ko-KR', color_scheme='light', storage_state=st)
        pg = c.new_page(); pg.on('dialog', lambda d: d.accept())
        pg.goto(url, wait_until='networkidle'); pg.wait_for_timeout(1500)
        return c, pg

    for name, tab in [('1-home', 'home'), ('2-calendar', 'calendar'), ('3-pay', 'pay'), ('4-request', 'request'), ('10-settings', 'workplaces')]:
        c, pg = fresh(APP + '?shot=' + name + '#' + tab)
        if name == '2-calendar':   # 근무가 있었던 날을 골라 예정 · 실제 · 차이가 보이게
            pg.locator('.cv-num', has_text='14').first.click(); pg.wait_for_timeout(500)
        pg.screenshot(path=os.path.join(OUT, name + '.png')); c.close()

    # 증빙 묶음 PDF (급여 비교에서 열기)
    c, pg = fresh(APP + '?shot=ev#pay')
    pg.locator('.pay-evidence button.rq-row.link').click(); pg.wait_for_selector('.evidence-doc'); pg.wait_for_timeout(800)
    pg.screenshot(path=os.path.join(OUT, '8-evidence.png')); c.close()

    # 확인 페이지
    c, pg = fresh(APP + 'verify.html?h=' + HASH)
    pg.wait_for_selector('.result.ok', timeout=15000); pg.wait_for_timeout(500)
    pg.screenshot(path=os.path.join(OUT, '9-verify.png')); c.close()
    b.close()
print('ok')
