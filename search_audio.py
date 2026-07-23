import urllib.request
import re
import json

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

dest_file = r'c:\Users\Hp\Desktop\Netfliex intro\netflix-ta-dum.mp3'

# Search DuckDuckGo HTML for sound pages
search_url = "https://html.duckduckgo.com/html/?q=netflix+ta+dum+sound+effect+mp3+download"

try:
    req = urllib.request.Request(search_url, headers=headers)
    html = urllib.request.urlopen(req, timeout=10).read().decode('utf-8', errors='ignore')
    
    # Extract URLs from DDG search results
    raw_urls = re.findall(r'uddg=(https%3A%2F%2F[^&"\']+)', html)
    urls = [urllib.parse.unquote(u) for u in raw_urls]
    print(f"Extracted {len(urls)} target search URLs.")

    success = False
    for u in urls[:8]:
        print(f"\nScanning page: {u}")
        try:
            preq = urllib.request.Request(u, headers=headers)
            phtml = urllib.request.urlopen(preq, timeout=8).read().decode('utf-8', errors='ignore')
            
            # Find audio links (mp3, wav, ogg)
            audio_links = re.findall(r'https?://[^\s"\'<>]+\.(?:mp3|wav|ogg)', phtml)
            print(f"Found {len(audio_links)} audio links.")
            
            for alink in audio_links:
                if 'netflix' in alink.lower() or 'tudum' in alink.lower() or 'ta-dum' in alink.lower() or 'intro' in alink.lower() or 'sound' in alink.lower():
                    print(f"Trying download: {alink}")
                    try:
                        areq = urllib.request.Request(alink, headers=headers)
                        adata = urllib.request.urlopen(areq, timeout=8).read()
                        if len(adata) > 2000:
                            with open(dest_file, 'wb') as f:
                                f.write(adata)
                            print(f"\n==========================================")
                            print(f"SUCCESSFULLY DOWNLOADED REAL MP3! ({len(adata)} bytes)")
                            print(f"Source: {alink}")
                            print(f"Saved to: {dest_file}")
                            print(f"==========================================\n")
                            success = True
                            break
                    except Exception as ex:
                        print(f"Audio fetch failed for {alink}: {ex}")
            if success:
                break
        except Exception as ex:
            print(f"Page scan failed for {u}: {ex}")

except Exception as e:
    print("Search error:", e)
