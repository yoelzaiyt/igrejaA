import urllib.request
import re

url = 'https://www.ibmalphaville.org.br/'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
try:
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')
        matches = re.findall(r'https://static\.wixstatic\.com/media/[a-zA-Z0-9_~]+\.(?:jpg|jpeg|png|webp)', html)
        for m in set(matches):
            print(m)
except Exception as e:
    print('Error:', e)
