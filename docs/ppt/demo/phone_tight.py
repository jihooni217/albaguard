# 3배 화면 캡처로 폰 모양 그림을 만든다. 그림자를 작게 하고 여백 없이 잘라, 같은 칸에 넣어도 폰이 더 크게 보이게.
# 쓰는 법: python phone_tight.py <3배 캡처 폴더> <PPT용 PNG 폴더> <보고서용 JPG 폴더>
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from phone import phone, shadow
from PIL import Image

src, ppt, rep = sys.argv[1:4]
os.makedirs(ppt, exist_ok=True); os.makedirs(rep, exist_ok=True)
for f in sorted(os.listdir(src)):
    if not f.endswith('.png'): continue
    ph = phone(Image.open(os.path.join(src, f)).convert('RGB'), '9:41')
    sh = shadow(ph, blur=22, off=12, alpha=45)
    box = sh.split()[3].point(lambda v: 255 if v > 6 else 0).getbbox()
    sh = sh.crop(box)
    sh.save(os.path.join(ppt, f), optimize=True)            # PPT: 투명 바탕
    bg = Image.new('RGB', sh.size, 'white'); bg.paste(sh, (0, 0), sh)
    bg.save(os.path.join(rep, f.replace('.png', '.jpg')), quality=95)   # 보고서: 흰 바탕
    print(f, sh.size, round(sh.width / sh.height, 4))
