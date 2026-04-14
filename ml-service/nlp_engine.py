from sentence_transformers import SentenceTransformer, util
import torch

# Load a highly-optimized RoBERTa model specifically trained for comparing sentence similarity
print("Loading RoBERTa Model... (This takes a moment on the first run)")
model = SentenceTransformer('all-distilroberta-v1')
print("Model loaded successfully!")

def calculate_match_scores(target_description: str, posts: list):
    if not posts:
        return []

    # 1. Convert the user's description into an AI vector (embedding)
    target_embedding = model.encode(target_description, convert_to_tensor=True)

    # 2. Combine the Reddit title and body text to give the AI maximum context
    post_texts = [f"{post['title']} {post['body']}" for post in posts]

    # 3. Convert all Reddit posts into vectors simultaneously (batch processing is fast)
    post_embeddings = model.encode(post_texts, convert_to_tensor=True)

    # 4. Calculate the Cosine Similarity between the description and the posts
    # This returns a math score from -1.0 (opposite) to 1.0 (exact match)
    cosine_scores = util.cos_sim(target_embedding, post_embeddings)[0]

    scored_posts = []
    for i, post in enumerate(posts):
        raw_score = cosine_scores[i].item()
        
        # Convert the raw math score into a clean 0% to 100% percentage
        # We cap negative scores at 0 (meaning it's completely unrelated)
        match_percentage = max(0.0, raw_score) * 100
        
        scored_post = post.copy()
        scored_post['match_score'] = round(match_percentage, 2)
        scored_posts.append(scored_post)

    return scored_posts