import urllib.request
import re

url = 'https://igrejaatitude.com.br/'
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
}

try:
    req = urllib.request.Request(url, headers=headers)
    html = urllib.request.urlopen(req, timeout=10).read().decode('utf-8', errors='ignore')
    imgs = re.findall(r'https?://[^\s"\'\)]+\.(?:jpg|jpeg|png)', html, re.I)
    
    unique_imgs = list(set(imgs))
    for img in unique_imgs:
        print(img)
except Exception as e:
    print('Error:', e)
