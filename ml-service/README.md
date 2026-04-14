# TrendiFi ML Service

AI-powered virality scoring engine for TrendiFi trends using RoBERTa NLP and Reddit data analysis.

## Features

- **Real-time Virality Scoring**: Analyzes trends against Reddit discussions
- **RoBERTa NLP**: Uses sentence transformers for semantic similarity matching
- **Engagement Metrics**: Calculates virality based on post engagement and recency
- **Async Reddit Scraping**: Efficiently scrapes Reddit data with rate limiting

## Setup

### 1. Create Virtual Environment

```bash
cd ml-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Environment Variables (Optional)

Create a `.env` file if needed:

```env
ML_SERVICE_PORT=8000
```

### 4. Run the Service

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The service will be available at: **http://localhost:8000**

## API Endpoints

### Health Check
```
GET /
```

Response:
```json
{
  "status": "TrendiFi ML Engine is Live"
}
```

### Calculate Virality Score
```
POST /api/virality
Content-Type: application/json

{
  "title": "Solana bullrun",
  "description": "Post about recent Solana network growth"
}
```

Response:
```json
{
  "search_title": "Solana bullrun",
  "metrics": {
    "relevant_posts": 45,
    "raw_virality_power": 2500.50,
    "final_virality_score_100": 75.43
  }
}
```

## How It Works

1. **Input**: Receives trend title and description from frontend
2. **Scraping**: Fetches ~100 Reddit posts matching the trend title
3. **NLP Analysis**: Uses RoBERTa to compare description against post content
4. **Filtering**: Filters out low-relevance posts (< 10% similarity)
5. **Scoring**: Calculates final virality score based on:
   - Engagement (upvotes + comments)
   - Time decay (newer posts weighted higher)
   - Semantic relevance (AI similarity score)
6. **Normalization**: Scales raw score to 0-100 range

## Configuration

Key parameters in `main.py`:

- **target_count**: Number of Reddit posts to analyze (default: 100)
- **match_threshold**: Minimum relevance score % (default: 10.0)
- **time_decay_factor**: Penalty for old posts (default: 1.2)
- **normalization_k**: Scaling factor for 0-100 conversion (default: 0.005)

Tune these values based on your test results.

## Frontend Integration

The frontend calls this service at:

```typescript
POST ${NEXT_PUBLIC_ML_SERVICE_URL}/api/virality
```

Environment variable: `NEXT_PUBLIC_ML_SERVICE_URL` (default: http://localhost:8000)

## Troubleshooting

### Model Loading Issues
- First run takes time to download RoBERTa model (~500MB)
- Model cached in: `~/.cache/huggingface/`

### Rate Limiting
- Reddit API limits requests; service waits 1.5s between requests
- If getting 429 errors, increase wait time in `scraper.py`

### CORS Issues
Add CORS middleware if frontend is on different domain:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Performance

- Virality calculation: ~5-10 seconds depending on Reddit response time
- Scaling: Can handle ~10-50 concurrent requests on standard hardware

## License

Part of TrendiFi Project
