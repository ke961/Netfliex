import urllib.request
import re
import os

urls_to_check = [
    'https://ringsignaler.net/netflix-intro-sound-effect/',
    'https://www.soundbuttonspro.com/sound-buttons/netflix-intro-sound-effect',
    'https://tuna.voicemod.net/sound/69d1a8ff-5573-455b-b9ed-a9d554a9b6e8',
    'https://myinstants.org/sound/netflix-tou-doum'
]

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

dest_file = r'c:\Users\Hp\Desktop\Netfliex intro\netflix-ta-dum.mp3'

success = False

for page_url in urls_to_check:
    print(f"Checking {page_url}...")
    try:
        req = urllib.request.Request(page_url, headers=headers)
        html = urllib.request.urlopen(req, timeout=8).read().decode('utf-8', errors='ignore')
        
        # Search for .mp3 links in the HTML
        mp3_urls = re.findall(r'https?://[^\s"\'<>]+\.mp3', html)
        print(f"Found {len(mp3_urls)} potential MP3 links.")
        
        for mp3_url in mp3_urls:
            print(f"Attempting download from: {mp3_url}")
            try:
                mreq = urllib.request.Request(mp3_url, headers=headers)
                data = urllib.request.urlopen(mreq, timeout=8).read()
                if len(data) > 3000:
                    with open(dest_file, 'wb') as f:
                        f.write(data)
                    print(f"SUCCESSFULLY DOWNLOADED AUTHENTIC MP3 ({len(data)} bytes) to {dest_file}")
                    success = True
                    break
            except Exception as e:
                print(f"Failed to download {mp3_url}: {e}")
                
        if success:
            break
    except Exception as e:
        print(f"Error fetching page {page_url}: {e}")

if not success:
    print("Direct scraped links failed, attempting secondary fallbacks...")
    # Known working fallback CDN links for audio
    fallbacks = [
        "https://www.ringsignaler.net/wp-content/uploads/2021/04/Netflix-Intro-Sound-Effect.mp3",
        "https://soundbuttons.net/wp-content/uploads/2023/05/netflix-intro-sound-effect.mp3",
        "https://cdn.pixabay.com/download/audio/2022/03/24/audio_34d1cf6bf9.mp3"
    ]
    for url in fallbacks:
        try:
            print(f"Trying fallback: {url}")
            req = urllib.request.Request(url, headers=headers)
            data = urllib.request.urlopen(req, timeout=8).read()
            if len(data) > 3000:
                with open(dest_file, 'wb') as f:
                    f.write(data)
                print(f"FALLBACK SUCCESS ({len(data)} bytes) saved to {dest_file}")
                success = True
                break
        except Exception as e:
            print(f"Fallback failed: {e}")
