from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from scraper import scrape_reddit_topic_paginated
from nlp_engine import calculate_match_scores
import time
import math
import logging
import os
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="TrendiFi ML Service", version="1.0.0")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger.info("TrendiFi ML Service initializing...")

# Define the exact JSON structure your Next.js frontend will send
class ViralityRequest(BaseModel):
    title: str
    description: str

@app.get("/")
def read_root():
    """Health check endpoint"""
    logger.info("Health check requested")
    return {
        "status": "TrendiFi ML Engine is Live",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }

@app.get("/health")
def health_check():
    """Detailed health check for monitoring"""
    return {"status": "healthy", "service": "trendifi-ml-service"}

@app.post("/api/virality")
async def calculate_virality(request: ViralityRequest):
    """
    Calculate virality score for a trend based on Reddit discussions.
    
    Request body:
    - title: The trend/topic to analyze
    - description: Detailed description for semantic matching
    
    Returns:
    - search_title: The searched title
    - metrics: Object containing relevant_posts count, raw_virality_power, and final_virality_score_100
    """
    request_id = f"{datetime.utcnow().timestamp()}"
    logger.info(f"[{request_id}] Virality request for: {request.title}")
    
    try:
        # 1. Scrape Reddit
        logger.info(f"[{request_id}] Scraping Reddit for '{request.title}'...")
        raw_posts = await scrape_reddit_topic_paginated(request.title, target_count=1000)
        
        if not raw_posts:
            logger.warning(f"[{request_id}] No Reddit data found for: {request.title}")
            return {
                "search_title": request.title,
                "metrics": {
                    "relevant_posts": 0,
                    "raw_virality_power": 0,
                    "final_virality_score_100": 0
                },
                "warning": "No data found for this topic"
            }

        logger.info(f"[{request_id}] Found {len(raw_posts)} raw posts. Running NLP analysis...")
        
        # 2. Pass the data to RoBERTa
        scored_posts = calculate_match_scores(request.description, raw_posts)
        
        # 3. Calculate Final Metrics based only on RELEVANT posts
        # Filter out bot spam that scored less than 10% similarity
        relevant_posts = [p for p in scored_posts if p['match_score'] > 10.0]
        
        logger.info(f"[{request_id}] {len(relevant_posts)} posts met relevance threshold (>10%)")
        
        current_time = time.time()
        raw_virality = 0
        
        # 1. Calculate the Raw Score with Time Decay
        for post in relevant_posts:
            # Calculate age in hours. We add +1 to prevent division by zero for brand new posts.
            age_hours = ((current_time - post['created_utc']) / 3600) + 1
            
            engagement = post['upvotes'] + post['comments']
            ai_weight = post['match_score'] / 100
            
            # Formula: (Volume(1) * Engagement) / Time 
            # Using a decay factor of 1.2 to aggressively penalize old news
            post_power = ((engagement + 1) / (age_hours ** 1.2)) * ai_weight
            raw_virality += post_power

        # 2. Normalize to a 0-100 scale
        k = 0.005 
        final_score_100 = 100 * (1 - math.exp(-k * raw_virality))
        
        logger.info(f"[{request_id}] Virality calculation complete. Score: {final_score_100:.2f}/100")

        return {
            "search_title": request.title,
            "metrics": {
                "relevant_posts": len(relevant_posts),
                "raw_virality_power": round(raw_virality, 2),
                "final_virality_score_100": round(final_score_100, 2)
            },
        }
        
    except Exception as e:
        logger.error(f"[{request_id}] Error calculating virality: {str(e)}", exc_info=True)
        return {
            "search_title": request.title,
            "error": f"Failed to calculate virality: {str(e)}",
            "metrics": {
                "relevant_posts": 0,
                "raw_virality_power": 0,
                "final_virality_score_100": 0
            }
        }