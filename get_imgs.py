import urllib.request
import re

urls = {
  'ibmalphaville': 'https://www.ibmalphaville.org.br/',
  'atitude': 'https://igrejaatitude.com.br/',
  'universal': 'https://www.universal.org/',
  'lagoinha': 'https://www.lagoinhaalphaville.com.br/',
  'beityaacov': 'https://www.morasha.com.br/hoje-no-brasil/50-anos-da-sinagoga-beit-yaacov.html'
}

req_headers = {'User-Agent': 'Mozilla/5.0'}

for name, url in urls.items():
    print(f'--- {name} ---')
    try:
        req = urllib.request.Request(url, headers=req_headers)
        html = urllib.request.urlopen(req, timeout=10).read().decode('utf-8', errors='ignore')
        imgs = re.findall(r'<img[^>]+src=["\']([^"\']+(?:jpg|jpeg|png|webp))["\']', html, re.I)
        bgimgs = re.findall(r'background-image:\s*url\(([\'\"]?)([^\)\'\"]+(?:jpg|jpeg|png|webp))\1\)', html, re.I)
        
        all_imgs = set(imgs + [b[1] for b in bgimgs])
        for img in list(all_imgs):
            if img.startswith('/'):
                if img.startswith('//'):
                    img = 'https:' + img
                else:
                    from urllib.parse import urlparse
                    parsed_url = urlparse(url)
                    base_url = f"{parsed_url.scheme}://{parsed_url.netloc}"
                    img = base_url + img
            print(img)
    except Exception as e:
        print('Error:', e)
