from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import numpy as np, cv2
ROOT=Path('web/assets')
SHOP=ROOT/'buildings/ruko-01/colors/ground-kopdes.webp'
TRUCKS=[ROOT/'props'/f for f in ('mobil-sppg.webp','mobil-sppg-damaged.webp','mobil-sppg-wreck.webp')]
NAVY=(18,47,102,255); MAROON=(122,30,51,255)
def font(size,italic=False):
    names=['/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed-BoldOblique.ttf','/usr/share/fonts/truetype/dejavu/DejaVuSans-BoldOblique.ttf'] if italic else ['/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed-Bold.ttf','/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf']
    for name in names:
        if Path(name).exists(): return ImageFont.truetype(name,size)
    return ImageFont.load_default()
def text_center(d,s,cx,y,w,sz,color,italic=False):
    f=font(sz,italic)
    while sz>10 and d.textbbox((0,0),s,font=f)[2]>w:
        sz-=1; f=font(sz,italic)
    b=d.textbbox((0,0),s,font=f)
    d.text((int(cx-(b[2]-b[0])/2),int(y-b[1])),s,font=f,fill=color)
def inpaint_ink(image,box,kind):
    x0,y0,x1,y1=box
    a=np.array(image.convert('RGBA')); c=a[y0:y1,x0:x1,:3].astype(np.int16)
    r,g,b=c[:,:,0],c[:,:,1],c[:,:,2]
    if kind=='maroon': ink=(r>38)&(r<190)&(g<115)&(b<127)&(r>g*1.25)&(r>b*1.07)
    elif kind=='dark': ink=(r<165)&(g<165)&(b<165)
    elif kind=='navy': ink=(b>65)&(b>r*1.28)&(b>g*1.10)&(r<135)&(g<165)
    elif kind=='badge': ink=((b>65)&(b>r*1.22)&(b>g*1.03)&(r<135))|((r>100)&(r>g*1.22)&(g>55)&(b<160))
    else: ink=np.ones(c.shape[:2],dtype=bool)
    mask=np.zeros(a.shape[:2],np.uint8)
    mask[y0:y1,x0:x1]=(ink*255).astype(np.uint8)
    mask=cv2.dilate(mask,np.ones((5,5),np.uint8),iterations=1)
    clean=cv2.inpaint(cv2.cvtColor(a[:,:,:3],cv2.COLOR_RGB2BGR),mask,4,cv2.INPAINT_TELEA)
    a[:,:,:3]=cv2.cvtColor(clean,cv2.COLOR_BGR2RGB)
    return Image.fromarray(a,'RGBA')
def bowl(d,box,color=NAVY,steam=True):
    x0,y0,x1,y1=box; w=x1-x0; h=y1-y0
    if steam:
        for off in (.27,.49,.71):
            sx=x0+w*off
            d.arc((sx-4,y0+h*.03,sx+5,y0+h*.42),150,310,fill=color,width=max(2,int(w*.025)))
    d.arc((x0+w*.13,y0+h*.32,x0+w*.80,y0+h*.79),175,355,fill=color,width=max(2,int(w*.028)))
    d.polygon([(x0+w*.14,y0+h*.59),(x0+w*.77,y0+h*.59),(x0+w*.66,y0+h*.91),(x0+w*.26,y0+h*.91)],fill=color)
    d.ellipse((x0+w*.79,y0+h*.43,x0+w*.89,y0+h*.61),fill=color)
    d.line((x0+w*.84,y0+h*.55,x0+w*.74,y0+h*.88),fill=color,width=max(2,int(w*.035)))
def shop():
    im=Image.open(SHOP).convert('RGBA'); assert im.size==(984,457)
    im=inpaint_ink(im,(336,18,562,94),'maroon')
    im=inpaint_ink(im,(377,92,531,122),'dark')
    im=inpaint_ink(im,(701,159,757,303),'all')
    d=ImageDraw.Draw(im)
    text_center(d,'KOPWAR',447,20,235,64,MAROON,True)
    text_center(d,'MERAH BATA',453,94,154,20,(43,37,39,255),True)
    m=MAROON
    d.rounded_rectangle((719,189,743,242),radius=7,fill=m)
    d.polygon([(724,189),(738,189),(735,181),(726,181)],fill=m)
    d.line((725,183,736,183),fill=m,width=4)
    d.line([(704,235),(710,221),(721,234),(728,251)],fill=m,width=6,joint='curve')
    d.line([(755,235),(750,221),(740,234),(733,251)],fill=m,width=6,joint='curve')
    d.arc((708,241,748,271),0,180,fill=m,width=5)
    im.save(SHOP,'WEBP',quality=95,method=6)
REGIONS=[
 {'orn':(84,69,256,231),'words':(174,191,547,288),'door':(603,276,780,349),'icon':(96,87,234,229),'title':(388,195,274,37),'sub':(386,282,300,17),'dooricon':(638,286,691,336)},
 {'orn':(84,70,260,231),'words':(178,188,553,286),'door':(601,277,775,353),'icon':(97,91,232,224),'title':(389,195,281,38),'sub':(386,276,309,17),'dooricon':(635,288,688,338)},
 {'orn':(63,228,252,378),'words':(165,302,521,403),'door':(607,382,765,459),'icon':(72,255,202,374),'title':(364,303,322,38),'sub':(359,385,307,16),'dooricon':(630,395,680,438)}
]
def truck(path,region):
    im=Image.open(path).convert('RGBA'); assert im.size==(960,500)
    im=inpaint_ink(im,region['orn'],'badge')
    im=inpaint_ink(im,region['words'],'navy')
    im=inpaint_ink(im,region['door'],'badge')
    d=ImageDraw.Draw(im)
    bowl(d,region['icon'])
    cx,y,w,sz=region['title']
    text_center(d,'DAPUR',cx,y,w,sz,NAVY)
    text_center(d,'KENYANG',cx,y+sz*.90,w,sz,NAVY)
    cx,y,w,sz=region['sub']
    text_center(d,'Antar Makan Siang Warga',cx,y,w,sz,NAVY)
    bowl(d,region['dooricon'],steam=False)
    im.save(path,'WEBP',quality=95,method=6)
if __name__=='__main__':
    shop()
    for path,region in zip(TRUCKS,REGIONS): truck(path,region)
    print('Changed branding in 4 WebP assets, preserved original canvas/alpha.')
