import urllib.request
import re
from collections import Counter

url = 'https://www.icconselheira.com/'
headers = {'User-Agent': 'Mozilla/5.0'}
try:
    req = urllib.request.Request(url, headers=headers)
    html = urllib.request.urlopen(req, timeout=10).read().decode('utf-8', errors='ignore')
    
    print('--- TITLE ---')
    title = re.search(r'<title>(.*?)</title>', html, re.I)
    if title: print(title.group(1).strip())
    
    print('\n--- ALL IMAGES (jpg, png, webp) ---')
    # look for standard img src or css backgrounds
    imgs = re.findall(r'https?://[^\s\"\'\)]+\.(?:jpg|jpeg|png|webp)', html, re.I)
    for i in list(set(imgs)):
        print(i)
        
    print('\n--- COLORS ---')
    colors = re.findall(r'color:\s*(#[0-9a-fA-F]{3,6})', html)
    print('Colors:', Counter(colors).most_common(10))
    bg_colors = re.findall(r'background-color:\s*(#[0-9a-fA-F]{3,6})', html)
    print('Bg Colors:', Counter(bg_colors).most_common(10))

except Exception as e:
    print('Error:', e)
