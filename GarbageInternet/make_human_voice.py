import asyncio
import edge_tts
import re

async def make_human_voice():
    # Read the article
    with open("index.html", "r", encoding="utf-8") as f:
        html = f.read()
    
    # Target only the <article> tag content to skip headers/labels
    article_match = re.search(r'<article[^>]*>(.*?)</article>', html, re.DOTALL)
    if not article_match:
        print("Article tag not found!")
        return
    
    article_html = article_match.group(1)
    
    # Include H1 title from hero section too
    title_match = re.search(r'<h1[^>]*>(.*?)</h1>', html, re.DOTALL)
    title = re.sub(r'<[^>]+>', '', title_match.group(1)).strip() if title_match else ""

    # Extract text from p, h2, li, blockquote inside the article
    blocks = re.findall(r'<(h2|p|blockquote|li)[^>]*>(.*?)</\1>', article_html, re.DOTALL)
    
    text_to_read = title + "\n\n"
    for tag, content in blocks:
        clean = re.sub(r'<[^>]+>', '', content).strip()
        # Skip figcaptions
        if clean and "figcaption" not in clean:
            # --- Punctuation Scrub ---
            # Replace smart quotes and dashes with simple spaces/pauses to prevent literal reading
            clean = clean.replace('“', ' ').replace('”', ' ').replace('‘', "'").replace('’', "'")
            clean = clean.replace('—', ' — ').replace('–', ' - ')
            clean = clean.replace('&ldquo;', ' ').replace('&rdquo;', ' ').replace('&lsquo;', "'").replace('&rsquo;', "'")
            clean = clean.replace('&mdash;', ' — ').replace('&bull;', ' ')
            # Remove any other non-standard symbols that might be read literally
            clean = re.sub(r'[^\w\s\d\.,\?!\'\-]', '', clean)
            
            text_to_read += clean + "\n\n"

    # Use BrianNeural - Male Gemini-style
    voice = "en-US-BrianNeural"
    communicate = edge_tts.Communicate(text_to_read, voice, rate="-5%", pitch="-2Hz")
    
    print(f"Generating Male Gemini-style narration with {voice}...")
    await communicate.save("images/human_narration.mp3")
    print("File 'human_narration.mp3' created successfully.")

if __name__ == "__main__":
    asyncio.run(make_human_voice())
