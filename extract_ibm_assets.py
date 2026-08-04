import urllib.request
import re
from collections import Counter

url = 'https://www.ibmalphaville.org.br/'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')

og_img = re.search(r'property="og:image"\s+content="([^"]+)"', html)
if og_img: print('og:image:', og_img.group(1))

icons = re.findall(r'rel="(?:shortcut )?icon" href="([^"]+)"', html)
if icons: print('Icons:', icons)

apple = re.findall(r'rel="apple-touch-icon" href="([^"]+)"', html)
if apple: print('Apple Icons:', apple)

colors = re.findall(r'color:\s*(#[0-9a-fA-F]{3,6})', html)
print('Colors:', Counter(colors).most_common(10))

bg_colors = re.findall(r'background-color:\s*(#[0-9a-fA-F]{3,6})', html)
print('Bg Colors:', Counter(bg_colors).most_common(10))

# Try to find logo in img tags
imgs = re.findall(r'<img[^>]+src="([^"]+)"', html)
for img in imgs:
    if 'logo' in img.lower() or 'marca' in img.lower():
        print('Logo img:', img)
