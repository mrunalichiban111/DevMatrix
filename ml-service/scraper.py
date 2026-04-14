import httpx
import asyncio

async def scrape_reddit_topic_paginated(topic: str, target_count: int = 1000):
    posts_data = []
    after_token = None
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    
    async with httpx.AsyncClient() as client:
        while len(posts_data) < target_count:
            # Build the URL. Always pull the max of 100 per chunk.
            url = f"https://www.reddit.com/search.json?q={topic}&sort=top&t=month&limit=100"
            # If we have a bookmark from the previous loop, append it
            if after_token:
                url += f"&after={after_token}"
            
            print(f"Fetching... (Current total: {len(posts_data)}/{target_count})")
            
            try:
                response = await client.get(url, headers=headers, timeout=15.0)
                
                if response.status_code == 429:
                    print("Hit a rate limit. Slowing down...")
                    await asyncio.sleep(5)
                    continue
                elif response.status_code != 200:
                    print(f"Failed to fetch. Status Code: {response.status_code}")
                    break
                    
                data = response.json()
                
                # Navigate the JSON tree to extract the posts
                children = data.get('data', {}).get('children', [])
                if not children:
                    print("No more posts found for this topic.")
                    break
                    
                for child in children:
                    post = child.get('data', {})
                    posts_data.append({
                        "title": post.get('title', ''),
                    "body" : post.get('selftext', ''),
                        "upvotes": post.get('ups', 0),
                        "comments": post.get('num_comments', 0),
                        "author": post.get('author', ''),
                        "created_utc": post.get('created_utc', 0) # Useful for calculating velocity later
                    })
                    
                    # Break out early if we hit exactly 1000 in the middle of a chunk
                    if len(posts_data) >= target_count:
                        break
                
                # Grab the 'after' token for the next page
                after_token = data.get('data', {}).get('after')
                
                if not after_token:
                    print("Reached the end of Reddit's search history.")
                    break
                    
                # CRITICAL: Pause for 1.5 seconds so we don't get IP banned
                await asyncio.sleep(1.5)
                
            except Exception as e:
                print(f"Scraping Error: {e}")
                break
                
    return posts_data

# Quick test block
if __name__ == "__main__":
    print("Initializing bulk scrape...")
    results = asyncio.run(scrape_reddit_topic_paginated("solana", 1000))
    print(f"\nSuccessfully scraped {len(results)} posts.")