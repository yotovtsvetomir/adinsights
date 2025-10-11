import time
import httpx
from typing import List, Optional, Dict
from collections import defaultdict, Counter
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fuzzywuzzy import fuzz

from app.db.session import get_session
from app.db.models.post import Post
from app.schemas.post import PostBase, PostCreate, AnalyzePostsResponse, SummaryPanel

router = APIRouter()


async def fetch_posts(
    db: AsyncSession, url: str = "https://jsonplaceholder.typicode.com/posts"
) -> List[Post]:
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, timeout=10)
            response.raise_for_status()
        except httpx.HTTPError as e:
            raise HTTPException(
                status_code=502, detail=f"Failed to fetch posts: {str(e)}"
            )

    raw_posts = response.json()

    # Step 1: Get existing post IDs from the DB
    result = await db.execute(select(Post.id))
    existing_ids = set(result.scalars().all())

    validated_posts = []
    for p in raw_posts:
        if p["id"] not in existing_ids:  # Only add if ID not in DB
            validated_posts.append(
                PostCreate(
                    id=p["id"], user_id=p["userId"], title=p["title"], body=p["body"]
                )
            )

    post_objects = []
    for post in validated_posts:
        post_objects.append(Post(**post.model_dump()))

    if post_objects:
        db.add_all(post_objects)
        await db.commit()

    return post_objects


def categorize_posts(posts: List[Post]):
    reasons: Dict[int, str] = {}
    duplicates = defaultdict(set)
    user_titles = defaultdict(list)
    user_posts = defaultdict(list)
    user_unique_words = defaultdict(set)
    word_count = Counter()
    shorter_titles = []

    for post in posts:
        title = post.title.strip()
        uid = post.user_id

        user_titles[uid].append(title)
        user_posts[uid].append(post)

        if len(title) < 15:
            shorter_titles.append(post)

        # Check duplicates for user
        for t in user_titles[uid][:-1]:
            if t == title:
                duplicates[uid].add(title)
                reasons[post.id] = "duplicate"
                break

        # Count words
        words = set(title.lower().split())
        user_unique_words[uid].update(words)
        for word in words:
            word_count[word] += 1

    return reasons, duplicates, user_titles, user_posts, word_count, user_unique_words


def detect_bot_users(user_titles: dict):
    bot_users = []
    for uid in user_titles:
        titles = user_titles[uid]
        similar_count = 0
        for i in range(len(titles)):
            for j in range(i + 1, len(titles)):
                similarity = fuzz.ratio(titles[i], titles[j]) / 100
                if similarity >= 0.7:
                    similar_count += 1
                    if similar_count > 5:
                        bot_users.append(uid)
                        break
            if uid in bot_users:
                break
    return bot_users


def assign_bot_reasons(bot_users: List[int], user_posts: dict, reasons: dict):
    for uid in bot_users:
        for post in user_posts.get(uid, []):
            reasons[post.id] = "bot"


def get_top_users(user_unique_words: dict):
    user_word_counts = []
    for uid in user_unique_words:
        user_word_counts.append((uid, len(user_unique_words[uid])))

    # Sort descending by count
    user_word_counts.sort(key=lambda x: x[1], reverse=True)

    top_user_ids = [item[0] for item in user_word_counts]
    top_three_users = top_user_ids[:3]

    return top_user_ids, top_three_users


def paginate(items: List, page: int = 1, page_size: int = 10) -> List:
    start = (page - 1) * page_size
    end = start + page_size
    return items[start:end]


@router.get("/analyze-posts", response_model=AnalyzePostsResponse)
async def analyze_posts(
    db: AsyncSession = Depends(get_session),
    reason: Optional[str] = Query(None, description="Filter posts by reason"),
    search: Optional[str] = Query(None, description="Search posts by title"),
    user_id: Optional[int] = Query(None, description="Filter posts by user ID"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
):
    start_time = time.perf_counter()

    # Fetch external posts and sync to DB if any new
    await fetch_posts(db)

    result = await db.execute(select(Post))
    posts = result.scalars().all()

    # Analyze posts to get reasons for flags
    reasons, duplicates, user_titles, user_posts, word_count, user_unique_words = (
        categorize_posts(posts)
    )
    bot_users = detect_bot_users(user_titles)
    assign_bot_reasons(bot_users, user_posts, reasons)

    # Filter posts by reason, user_id, search
    filtered_posts = []
    for post in posts:
        if reason and reasons.get(post.id) != reason:
            continue
        if user_id and post.user_id != user_id:
            continue
        if search and search.lower() not in post.title.lower():
            continue
        filtered_posts.append(post)

    # Apply pagination
    paginated_posts = paginate(filtered_posts, page=page, page_size=page_size)

    # Prepare response posts with reason field
    response_posts = [
        PostBase(
            id=post.id,
            user_id=post.user_id,
            title=post.title,
            body=post.body,
            reason=reasons.get(post.id),
        )
        for post in paginated_posts
    ]

    top_user_ids, top_three_users = get_top_users(user_unique_words)
    most_common_words = [word for word, _ in word_count.most_common(10)]

    end_time = time.perf_counter()
    duration = end_time - start_time

    return AnalyzePostsResponse(
        posts=response_posts,
        summary=SummaryPanel(
            top_three_users=top_three_users,
            common_words=most_common_words,
        ),
        duration=duration,
    )
