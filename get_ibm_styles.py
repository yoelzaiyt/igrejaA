import urllib.request
import re
from collections import Counter

url = 'https://www.ibmalphaville.org.br/'
headers = {'User-Agent': 'Mozilla/5.0'}

try:
    req = urllib.request.Request(url, headers=headers)
    html = urllib.request.urlopen(req, timeout=10).read().decode('utf-8', errors='ignore')
    
    # Logos
    logos = re.findall(r'https?://[^\s"\'\)]+(?:logo|marca)[^\s"\'\)]*\.(?:png|jpg|svg)', html, re.I)
    print('Logos found:', list(set(logos)))
    
    # Images with .png to find logos
    pngs = re.findall(r'https?://[^\s"\'\)]+\.png', html, re.I)
    print('PNGs found:', list(set(pngs))[:5])
    
    # Fonts
    fonts = re.findall(r'font-family:\s*([^;]+);', html)
    print('Fonts:', Counter(fonts).most_common(5))
    
    # Title / meta
    title = re.findall(r'<title>(.*?)</title>', html, re.I)
    print('Title:', title)
    
except Exception as e:
    print('Error:', e)
