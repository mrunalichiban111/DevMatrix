# ML Service Deployment Guide

## Local Development with Docker

### Prerequisites
- Docker and Docker Compose installed
- Reddit API credentials (see setup below)

### Setup Reddit API Credentials

1. Go to [https://www.reddit.com/prefs/apps](https://www.reddit.com/prefs/apps)
2. Click "Create another app..."
3. Fill in the form:
   - **Name**: TrendFi ML Service
   - **Type**: Select "script"
   - Click "Create app"
4. Copy the credentials:
   - `REDDIT_CLIENT_ID`: The ID under the app name
   - `REDDIT_CLIENT_SECRET`: The secret value
   - `REDDIT_USER_AGENT`: Format as `TrendiFi-MLService/1.0 (by your_reddit_username)`

### Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp ml-service/.env.example ml-service/.env
   ```

2. Edit `ml-service/.env` and add your Reddit credentials:
   ```env
   REDDIT_CLIENT_ID=your_actual_client_id
   REDDIT_CLIENT_SECRET=your_actual_secret
   REDDIT_USER_AGENT=TrendiFi-MLService/1.0 (by your_username)
   ```

### Running Locally with Docker Compose

```bash
# From project root directory
docker-compose up ml-service

# Or rebuild if you made changes:
docker-compose up --build ml-service
```

The service will be available at: **http://localhost:8000**

Test the endpoint:
```bash
curl -X POST http://localhost:8000/api/virality \
  -H "Content-Type: application/json" \
  -d '{"title": "Bitcoin", "description": "Latest Bitcoin trends"}'
```

## Production Deployment

### Docker Hub Deployment

1. Build and tag the image:
   ```bash
   docker build -t yourusername/trendfi-ml:latest ml-service/
   ```

2. Push to Docker Hub (requires account):
   ```bash
   docker login
   docker push yourusername/trendfi-ml:latest
   ```

### Railway Deployment

1. Install Railway CLI: https://docs.railway.app/guides/cli
2. Create a new project:
   ```bash
   railway login
   railway init
   ```
3. Configure environment variables in Railway dashboard:
   - `REDDIT_CLIENT_ID`
   - `REDDIT_CLIENT_SECRET`
   - `REDDIT_USER_AGENT`
4. Deploy:
   ```bash
   railway up
   ```

Railway will provide a public URL. Update `NEXT_PUBLIC_ML_SERVICE_URL` in frontend `.env.local`.

### Heroku Deployment

1. Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli
2. Create app:
   ```bash
   heroku create trendfi-ml-service
   ```
3. Set environment variables:
   ```bash
   heroku config:set REDDIT_CLIENT_ID=your_id
   heroku config:set REDDIT_CLIENT_SECRET=your_secret
   heroku config:set REDDIT_USER_AGENT="TrendiFi-MLService/1.0 (by username)"
   ```
4. Add Procfile to `ml-service/Procfile`:
   ```
   web: uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
5. Deploy:
   ```bash
   git push heroku main
   ```

### AWS Lambda / Serverless Deployment

For serverless options, consider:
- **AWS Lambda** with API Gateway: Use `serverless` framework
- **Google Cloud Run**: Similar to Railway, very simple
- **Azure Container Instances**: Microsoft's container platform

For most cases, **Railway** is recommended: Free tier, simple setup, auto-deploys from Git.

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `REDDIT_CLIENT_ID` | ✅ Yes | Reddit API client ID |
| `REDDIT_CLIENT_SECRET` | ✅ Yes | Reddit API secret |
| `REDDIT_USER_AGENT` | ✅ Yes | Custom user agent string |
| `ML_SERVICE_PORT` | ❌ No | Port to run on (default: 8000) |
| `ENVIRONMENT` | ❌ No | Set to "production" for optimizations |

## Monitoring & Logs

### Local Docker Logs
```bash
docker-compose logs ml-service -f
```

### Accessing Health Check
```bash
curl http://localhost:8000/
# Should return: {"status": "TrendiFi ML Engine is Live"}
```

### Performance Tips
1. **Model Caching**: First request takes ~30s (downloads all-distilroberta-v1). Subsequent requests are fast.
2. **Rate Limiting**: Reddit API allows ~60 requests/minute per IP. No issues with single user, but monitor in production.
3. **Worker Processes**: Docker image uses 2 workers. Increase in production if needed:
   ```dockerfile
   CMD ["uvicorn", "main:app", "--workers", "4", ...]
   ```

## Troubleshooting

### Reddit API Errors
**Problem**: "Invalid credentials" or authentication fails
- Solution: Verify REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET are correct
- Ensure the Reddit app is of type "script", not "web app"

### Port Already in Use
**Problem**: Port 8000 is already in use
- Solution: Change port in `docker-compose.yml`:
  ```yaml
  ports:
    - "8001:8000"  # Maps container's 8000 to localhost:8001
  ```

### CORS Errors from Frontend
**Problem**: Frontend gets CORS errors when calling ML service
- Solution: Verify ML service is running and CORS middleware is enabled in `main.py`
- Frontend should call: `http://localhost:8000/api/virality` (dev) or your cloud URL (prod)

### Model Download Issues
**Problem**: First run hangs or fails downloading the NLP model
- Solution: The model (~500MB) is downloaded on first start. This is normal.
- If it fails, manually download:
  ```bash
  docker-compose exec ml-service python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-distilroberta-v1')"
  ```

## Security Checklist

- [ ] Reddit API credentials are in `.env` (not `.env.example`)
- [ ] `.env` is added to `.gitignore`
- [ ] CORS origin is restricted to your frontend domain in production
- [ ] Health check endpoint is accessible for monitoring
- [ ] Rate limiting is monitored (Reddit API limits ~60 req/min)
- [ ] Docker image runs as non-root user (done in Dockerfile)

## Next Steps

1. **Frontend Integration**: Update `NEXT_PUBLIC_ML_SERVICE_URL` in frontend to point to this service
2. **Caching Layer** (Optional): Add Redis for score caching if rate limits become an issue
3. **Score Updates**: Implement polling in frontend to refresh scores as markets evolve
