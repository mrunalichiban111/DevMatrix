import asyncio
from playwright.async_api import async_playwright
from playwright_stealth import Stealth

async def scrape_twitter_topic(topic: str, limit: int = 15):
    tweets_data = []
    
    # We use Stealth to hide the fact that this is an automated bot
    async with Stealth().use_async(async_playwright()) as p:
        # Launch browser. Set headless=False if you want to watch it work!
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        )
        
        page = await context.new_page()
        
        # Go to X's search page, sorted by 'Latest' (f=live)
        url = f"https://x.com/search?q={topic}&src=typed_query&f=live"
        print(f"Scraping X: {url}")
        
        try:
            # Go to the page and wait for the network to idle
            await page.goto(url, wait_until="networkidle", timeout=15000)
            
            # Wait for tweet elements (<article>) to appear
            await page.wait_for_selector('article', timeout=10000)
            
            # Grab the tweet containers
            articles = await page.query_selector_all('article')
            
            for article in articles[:limit]:
                # Extract the raw text from the tweet
                text = await article.inner_text()
                if text:
                    # Clean up the text (remove newlines for cleaner JSON)
                    clean_text = " ".join(text.split("\n"))
                    tweets_data.append({"platform": "x", "text": clean_text})
                    
        except Exception as e:
            print(f"X Scraping Error (Might be blocked by login wall): {e}")
            
        finally:
            await browser.close()
            
    return tweets_data

# Quick test block
if __name__ == "__main__":
    results = asyncio.run(scrape_twitter_topic("solana", 5))
    for r in results:
        print(r)