# 폰 화면을 진짜 폰처럼 감싸는 그림: 상태 표시줄 · 다이내믹 아일랜드 · 홈 표시줄 · 몸체 · 옆 버튼 · 그림자
# 기준은 2배 화면(폭 750). 폭이 다른 화면(예: 3배 1125)이 오면 모든 크기를 같은 비율로 키운다.
from PIL import Image, ImageDraw, ImageFont, ImageFilter
FONTB = 'C:/Windows/Fonts/malgunbd.ttf'
SB = 94          # 상태 표시줄 높이 (2배 기준)
BEZ = 26         # 화면 둘레 검은 테두리
RAD = 120        # 화면 모서리
def lum(c): return 0.299*c[0]+0.587*c[1]+0.114*c[2]
def phone(content, clock='7:30'):
    cw, ch = content.size
    s = cw / 750
    k = lambda v: round(v * s)
    sb = k(SB); bez = k(BEZ); rad = k(RAD)
    sw, sh = cw, ch + sb
    top = content.getpixel((cw//2, 2))[:3]
    fg = (255,255,255) if lum(top) < 140 else (12,12,14)
    scr = Image.new('RGB', (sw, sh), top)
    scr.paste(content.convert('RGB'), (0, sb))
    d = ImageDraw.Draw(scr)
    # 시각
    d.text((k(96), sb//2+k(4)), clock, font=ImageFont.truetype(FONTB, k(34)), fill=fg, anchor='mm')
    # 오른쪽: 신호 막대 · 와이파이 · 배터리
    x = sw - k(210); y = sb//2 + k(4)
    for i in range(4):
        h = k(10 + i*6)
        d.rounded_rectangle([x+k(i*11), y+k(12)-h, x+k(i*11+7), y+k(12)], radius=k(2), fill=fg)
    wx = x + k(70)
    for r, w in [(22,5),(14,5)]:
        d.arc([wx-k(r), y-k(r)+k(8), wx+k(r), y+k(r)+k(8)], 225, 315, fill=fg, width=k(w))
    d.ellipse([wx-k(4), y+k(4), wx+k(4), y+k(12)], fill=fg)
    bx = sw - k(100)
    d.rounded_rectangle([bx, y-k(11), bx+k(52), y+k(13)], radius=k(7), outline=fg, width=k(3))
    d.rounded_rectangle([bx+k(5), y-k(6), bx+k(40), y+k(8)], radius=k(3), fill=fg)
    d.rounded_rectangle([bx+k(55), y-k(4), bx+k(59), y+k(6)], radius=k(2), fill=fg)
    # 다이내믹 아일랜드
    d.rounded_rectangle([sw//2-k(118), k(18), sw//2+k(118), k(18+70)], radius=k(35), fill=(0,0,0))
    # 홈 표시줄
    hb = (255,255,255) if lum(content.getpixel((cw//2, ch-12))[:3]) < 140 else (20,20,22)
    d.rounded_rectangle([sw//2-k(135), sh-k(26), sw//2+k(135), sh-k(16)], radius=k(5), fill=hb)
    # 둥근 화면
    m = Image.new('L', (sw, sh), 0); ImageDraw.Draw(m).rounded_rectangle([0,0,sw-1,sh-1], radius=rad, fill=255)
    # 몸체: 검은 테두리 + 바깥 금속 테
    o, rim = k(20), k(6)
    W, H = sw + 2*bez + 2*rim, sh + 2*bez + 2*rim
    body = Image.new('RGBA', (W+2*o, H+2*o), (0,0,0,0))
    bd = ImageDraw.Draw(body)
    for (yy, hh) in [(300, 70), (420, 130), (580, 130)]:
        bd.rounded_rectangle([o-k(6), o+k(yy), o+k(6), o+k(yy+hh)], radius=k(5), fill=(58,58,64))
    bd.rounded_rectangle([o+W-k(6), o+k(470), o+W+k(6), o+k(670)], radius=k(5), fill=(58,58,64))
    bd.rounded_rectangle([o, o, o+W-1, o+H-1], radius=rad+bez+rim, fill=(74,74,80))
    bd.rounded_rectangle([o+rim, o+rim, o+W-rim-1, o+H-rim-1], radius=rad+bez, fill=(8,8,10))
    body.paste(scr, (o+rim+bez, o+rim+bez), m)
    return body
def shadow(img, blur=40, off=24, alpha=70):
    a = img.split()[3].point(lambda v: alpha if v else 0)
    sh = Image.new('RGBA', (img.width+160, img.height+160), (0,0,0,0))
    s = Image.new('RGBA', img.size, (0,0,0,255)); s.putalpha(a)
    sh.paste(s, (80, 80+off), s)
    sh = sh.filter(ImageFilter.GaussianBlur(blur))
    sh.alpha_composite(img, (80, 80))
    return sh
