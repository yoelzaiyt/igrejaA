import urllib.request
import re
import os

os.makedirs('public/images/universal', exist_ok=True)

url = 'https://www.universal.org/'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
try:
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')
        matches = re.findall(r'https://www\.universal\.org/wp-content/uploads/[0-9/]+/[a-zA-Z0-9_-]+\.(?:jpg|jpeg|png)', html)
        
        # Download first 3
        count = 0
        for m in set(matches):
            if count >= 3:
                break
            print('Downloading:', m)
            img_req = urllib.request.Request(m, headers={'User-Agent': 'Mozilla/5.0'})
            try:
                with urllib.request.urlopen(img_req) as img_resp:
                    with open(f'public/images/universal/img_{count+1}.jpg', 'wb') as f:
                        f.write(img_resp.read())
                    count += 1
            except:
                pass
except Exception as e:
    print('Error:', e)
