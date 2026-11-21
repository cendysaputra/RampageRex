"""One-time non-destructive edge cleanup for RampageRex source sprites.

Keep native WebP size and the original foreground. Remove isolated fragments
outside the main object only. This is intentionally conservative; do not
erase painted details, scratches or valid detached debris.
"""
from pathlib import Path
from PIL import Image
import numpy as np
import cv2

ROOT=Path("web/assets")
FILES=[
 ROOT/"buildings/ruko-01/colors/ground-kopdes.webp",
 ROOT/"props/mobil-sppg.webp",
 ROOT/"props/mobil-sppg-damaged.webp",
 ROOT/"props/mobil-sppg-wreck.webp",
]
EXPECTED=[(984,457),(960,500),(960,500),(960,500)]

def clean(path,expected):
    im=Image.open(path).convert("RGBA")
    if im.size!=expected: raise ValueError(f"{path}: unexpected size {im.size}")
    px=np.array(im)
    alpha=px[:,:,3].copy()
    foreground=(alpha>=24).astype(np.uint8)
    n, labels, stats, _=cv2.connectedComponentsWithStats(foreground,8)
    if n<=1: raise ValueError(f"{path}: no foreground")
    candidates=sorted(range(1,n),key=lambda i:int(stats[i,cv2.CC_STAT_AREA]),reverse=True)
    keep=candidates[0]
    largest=stats[keep]
    if largest[cv2.CC_STAT_AREA]<10000:
        raise ValueError(f"{path}: primary object not recognized")
    # Preserve all pixels on the principal object. Remove only disconnected
    # fragments, including colored horizontal bars left by image generation.
    # Preserve detached pieces if they are reasonably big and below the
    # vehicle's ground line (wreckage/debris).
    remove=np.zeros(alpha.shape,dtype=bool)
    discarded=0
    for i in candidates[1:]:
        x,y,w,h,area=map(int,stats[i])
        if area>150 and y+h>410 and w<200 and h<90:
            continue
        component=(labels==i)
        # Preserve very small disconnected alpha speckles close to the
        # primary object; clear the obviously stray large off-object bars.
        if area<12 and x>10 and x+w<expected[0]-10:
            continue
        remove|=component
        discarded+=area
    # Do not touch the original RGBA values on the main silhouette.
    px[remove]=0
    # A few stray colored pixels are semi-transparent (<24 alpha).
    # Clear those only if no strong foreground within a 5px radius.
    base=(px[:,:,3]>=24).astype(np.uint8)
    neighbor=cv2.dilate(base,np.ones((11,11),np.uint8),iterations=1)
    fringe=(neighbor==0)&(px[:,:,3]>0)
    px[fringe]=0
    after=Image.fromarray(px,"RGBA")
    if np.count_nonzero(px[:,:,3])<10000:
        raise ValueError(f"{path}: resulting asset missing")
    after.save(path,"WEBP",lossless=True,method=6)
    check=Image.open(path)
    assert check.size==expected and 'A' in check.getbands()
    print(f"{path}: {discarded} disconnected opaque pixels cleaned; preserved {int(largest[cv2.CC_STAT_AREA])} primary pixels")

if __name__=="__main__":
    for path,size in zip(FILES,EXPECTED): clean(path,size)
