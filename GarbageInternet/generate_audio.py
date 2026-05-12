import asyncio
import edge_tts
import os
import re

# Configuration
TEXT_FILE = "index.html"
OUTPUT_FILE = "images/narration.mp3"
# Recommended Gemini-like voices: 
# Male: en-US-GuyNeural, en-US-ChristopherNeural
# Female: en-US-AriaNeural, en-US-JennyNeural
VOICE = "en-US-GuyNeural" 

async def generate_narration():
    print(f"Reading {TEXT_FILE}...")
    with open(TEXT_FILE, "r", encoding="utf-8") as f:
        html = f.read()

    # Extract clean text from article tags
    # We want: Headlines, Subtitles, Paragraphs, Blockquotes, List Items
    # Skipping: figcaptions, UI elements
    
    # Simple regex to get content from key tags
    content_blocks = re.findall(r'<(h1|h2|p|blockquote|li)[^>]*>(.*?)</\1>', html, re.DOTALL)
    
    clean_text = []
    for tag, text in content_blocks:
        # Strip internal tags like <strong> or <span>
        text = re.sub(r'<[^>]+>', '', text)
        text = text.strip()
        if text and "figcaption" not in text:
            # Add slightly longer pauses between blocks
            clean_text.append(text + " ... ")

    full_article_text = "\n\n".join(clean_text)
    
    print(f"Generating AI Narration ({len(full_article_text)} chars)...")
    
    communicate = edge_tts.Communicate(full_article_text, VOICE, rate="-5%")
    await communicate.save(OUTPUT_FILE)
    
    print(f"Done! Created: {OUTPUT_FILE}")

if __name__ == "__main__":
    if not os.path.exists("images"):
        os.makedirs("images")
    asyncio.run(generate_narration())
