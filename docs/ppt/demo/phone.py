# 폰 화면(2배, 750 폭)을 진짜 폰처럼 감싸는 그림: 상태 표시줄 · 다이내믹 아일랜드 · 홈 표시줄 · 몸체 · 옆 버튼 · 그림자
from PIL import Image, ImageDraw, ImageFont, ImageFilter
FONTB = 'C:/Windows/Fonts/malgunbd.ttf'
SB = 94          # 상태 표시줄 높이 (2배)
BEZ = 26         # 화면 둘레 검은 테두리
RAD = 120        # 화면 모서리
def lum(c): return 0.299*c[0]+0.587*c[1]+0.114*c[2]
def phone(content, clock='7:30'):
    cw, ch = content.size
    sw, sh = cw, ch + SB
    top = content.getpixel((cw//2, 2))[:3]
    fg = (255,255,255) if lum(top) < 140 else (12,12,14)
    scr = Image.new('RGB', (sw, sh), top)
    scr.paste(content.convert('RGB'), (0, SB))
    d = ImageDraw.Draw(scr)
    # 시각
    d.text((96, SB//2+4), clock, font=ImageFont.truetype(FONTB, 34), fill=fg, anchor='mm')
    # 오른쪽: 신호 막대 · 와이파이 · 배터리
    x = sw - 210; y = SB//2 + 4
    for i in range(4):
        h = 10 + i*6
        d.rounded_rectangle([x+i*11, y+12-h, x+i*11+7, y+12], radius=2, fill=fg)
    wx = x + 70
    for r, w in [(22,5),(14,5)]:
        d.arc([wx-r, y-r+8, wx+r, y+r+8], 225, 315, fill=fg, width=w)
    d.ellipse([wx-4, y+4, wx+4, y+12], fill=fg)
    bx = sw - 100
    d.rounded_rectangle([bx, y-11, bx+52, y+13], radius=7, outline=fg, width=3)
    d.rounded_rectangle([bx+5, y-6, bx+40, y+8], radius=3, fill=fg)
    d.rounded_rectangle([bx+55, y-4, bx+59, y+6], radius=2, fill=fg)
    # 다이내믹 아일랜드
    d.rounded_rectangle([sw//2-118, 18, sw//2+118, 18+70], radius=35, fill=(0,0,0))
    # 홈 표시줄
    hb = (255,255,255) if lum(content.getpixel((cw//2, ch-12))[:3]) < 140 else (20,20,22)
    d.rounded_rectangle([sw//2-135, sh-26, sw//2+135, sh-16], radius=5, fill=hb)
    # 둥근 화면
    m = Image.new('L', (sw, sh), 0); ImageDraw.Draw(m).rounded_rectangle([0,0,sw-1,sh-1], radius=RAD, fill=255)
    # 몸체: 검은 테두리 + 바깥 금속 테
    W, H = sw + 2*BEZ + 12, sh + 2*BEZ + 12
    body = Image.new('RGBA', (W+40, H+40), (0,0,0,0))
    bd = ImageDraw.Draw(body)
    # 옆 버튼
    for (yy, hh) in [(300, 70), (420, 130), (580, 130)]:
        bd.rounded_rectangle([14, 20+yy, 26, 20+yy+hh], radius=5, fill=(58,58,64))
    bd.rounded_rectangle([W+14, 20+470, W+26, 20+470+200], radius=5, fill=(58,58,64))
    bd.rounded_rectangle([20, 20, 20+W-1, 20+H-1], radius=RAD+BEZ+6, fill=(74,74,80))
    bd.rounded_rectangle([26, 26, 26+W-13, 26+H-13], radius=RAD+BEZ, fill=(8,8,10))
    body.paste(scr, (20+6+BEZ, 20+6+BEZ), m)
    return body
def shadow(img, blur=40, off=24, alpha=70):
    a = img.split()[3].point(lambda v: alpha if v else 0)
    sh = Image.new('RGBA', (img.width+160, img.height+160), (0,0,0,0))
    s = Image.new('RGBA', img.size, (0,0,0,255)); s.putalpha(a)
    sh.paste(s, (80, 80+off), s)
    sh = sh.filter(ImageFilter.GaussianBlur(blur))
    sh.alpha_composite(img, (80, 80))
    return sh
