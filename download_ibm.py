import urllib.request
import os

os.makedirs('public/images/ibm', exist_ok=True)

urls = [
    'https://static.wixstatic.com/media/33ca7d_73acf8bda97549d3b73911b622ba5a73~mv2.jpg',
    'https://static.wixstatic.com/media/33ca7d_0b8948f386b24059bbc9b6eec6bb0b33~mv2.jpeg',
    'https://static.wixstatic.com/media/3ddd77_b51219b4171d439eb65a3044b1c1f64c~mv2_d_2000_2000_s_2.png'
]

for i, url in enumerate(urls):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        with urllib.request.urlopen(req) as response:
            with open(f'public/images/ibm/img_{i+1}.jpg', 'wb') as f:
                f.write(response.read())
            print(f'Downloaded img_{i+1}.jpg')
    except Exception as e:
        print('Error downloading', url, e)
#testes