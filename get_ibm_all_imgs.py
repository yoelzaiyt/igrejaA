import urllib.request
import re

url = 'https://www.ibmalphaville.org.br/'
headers = {'User-Agent': 'Mozilla/5.0'}
try:
    req = urllib.request.Request(url, headers=headers)
    html = urllib.request.urlopen(req, timeout=10).read().decode('utf-8', errors='ignore')
    
    # Just grab all URLs ending in .png, .jpg, .svg, .webp inside wixstatic
    wix_imgs = re.findall(r'https://static\.wixstatic\.com/media/[a-zA-Z0-9_~\.]+(?:png|jpg|jpeg|webp|svg)', html)
    unique_wix = list(set(wix_imgs))
    for i in unique_wix:
        print(i)
except Exception as e:
    print('Error:', e)
