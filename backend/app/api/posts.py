import time
import httpx
from typing import List, Optional, Dict
from collections import defaultdict, Counter
from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fuzzywuzzy import fuzz

from app.services.pagination import paginate_composite
from app.db.session import get_session
from app.db.models.post import Post
from app.schemas.post import (
    PostBase,
    PostCreate,
    AnalyzePostsResponse,
    SummaryPanel,
    FiltersPanel,
)

router = APIRouter()


# ------------------------
# Fetch Posts from API
# ------------------------


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

    result = await db.execute(select(Post.id))
    existing_ids = set(result.scalars().all())

    new_posts_data = [
        PostCreate(id=p["id"], user_id=p["userId"], title=p["title"], body=p["body"])
        for p in raw_posts
        if p["id"] not in existing_ids
    ]

    post_objects = [Post(**post.model_dump()) for post in new_posts_data]

    if post_objects:
        db.add_all(post_objects)
        await db.commit()

    return post_objects


# -----------------------------
# Categorize & Analyze Posts
# -----------------------------


def categorize_posts(posts: List[Post]):
    reasons: Dict[int, str] = {}
    user_titles = defaultdict(list)
    user_titles_set = defaultdict(set)
    user_posts = defaultdict(list)
    user_unique_words = defaultdict(set)
    word_count = Counter()

    for post in posts:
        title = post.title
        uid = post.user_id

        if len(title) < 15:
            reasons[post.id] = "Short title"

        if title in user_titles_set[uid]:
            reasons[post.id] = "Duplicate"
        else:
            user_titles_set[uid].add(title)
            user_titles[uid].append(title)

        user_posts[uid].append(post)

        # Count words
        words = set(title.lower().split())
        user_unique_words[uid].update(words)
        word_count.update(words)

    return reasons, user_titles, user_posts, word_count, user_unique_words


def detect_bot_users(user_titles: Dict[int, List[str]]) -> List[int]:
    bot_users = []

    for uid, titles in user_titles.items():
        similar_count = 0
        n = len(titles)
        for i in range(n):
            for j in range(i + 1, n):
                similarity = fuzz.ratio(titles[i], titles[j])
                if similarity >= 70:
                    similar_count += 1
                    if similar_count > 5:
                        bot_users.append(uid)
                        break
            if uid in bot_users:
                break

    return bot_users


def assign_flag_reasons(posts: List[Post]):
    reasons, user_titles, user_posts, word_count, user_unique_words = categorize_posts(
        posts
    )
    bot_users = detect_bot_users(user_titles)

    # Mark all bots
    for uid in bot_users:
        for post in user_posts[uid]:
            reasons[post.id] = "Bot"

    # Reset and assign in a single loop
    for post in posts:
        post.flag_reason = reasons.get(post.id, None)

    return reasons, user_titles, user_posts, word_count, user_unique_words


def get_top_users(user_unique_words: Dict[int, set]) -> List[int]:
    user_word_counts = [(uid, len(words)) for uid, words in user_unique_words.items()]
    user_word_counts.sort(key=lambda x: x[1], reverse=True)
    return [uid for uid, _ in user_word_counts[:3]]


@router.get("/single/{post_id}", response_model=PostBase)
async def get_post(
    post_id: int = Path(..., description="ID of the post to fetch"),
    db: AsyncSession = Depends(get_session),
):
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalars().first()

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    return post


@router.get("/analyze-posts", response_model=AnalyzePostsResponse)
async def analyze_posts(
    db: AsyncSession = Depends(get_session),
    reason: Optional[str] = Query(None, description="Filter posts by reason"),
    search: Optional[str] = Query(None, description="Search posts by title"),
    user_id: Optional[int] = Query(None, description="Filter posts by user ID"),
    order_by: Optional[str] = Query(
        None, description="Order by column (e.g., 'title:asc' or 'title:desc')"
    ),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
):
    start_time = time.perf_counter()
    await fetch_posts(db)

    # Fetch all posts from DB
    result = await db.execute(select(Post))
    all_posts = result.scalars().all()

    if all_posts:
        reasons, user_titles, user_posts, word_count, user_unique_words = (
            assign_flag_reasons(all_posts)
        )
        db.add_all(all_posts)
        await db.commit()

        # Count flag reasons
        flag_counts = Counter(
            post.flag_reason for post in all_posts if post.flag_reason
        )
    else:
        word_count = Counter()
        user_unique_words = defaultdict(set)
        flag_counts = Counter()

    # Build dynamic filters
    filters = []
    if reason:
        filters.append(Post.flag_reason == reason)
    if user_id:
        filters.append(Post.user_id == user_id)

    # Paginated result
    paginated = await paginate_composite(
        model=Post,
        db=db,
        page=page,
        page_size=page_size,
        search=search,
        search_columns=[Post.title],
        base_filters=filters,
        ordering=order_by or "id:asc",
        schema=PostBase,
    )

    # Summary panel data
    top_users = get_top_users(user_unique_words) if user_unique_words else []
    common_words = (
        [{"word": word, "count": count} for word, count in word_count.most_common(10)]
        if word_count
        else []
    )

    distinct_users = list({post.user_id for post in all_posts})
    required_reasons = {"Bot", "Short title", "Duplicate"}
    distinct_reasons = list(
        {post.flag_reason for post in all_posts if post.flag_reason} | required_reasons
    )

    end_time = time.perf_counter()

    return AnalyzePostsResponse(
        posts=paginated,
        summary=SummaryPanel(
            top_three_users=top_users,
            common_words=common_words,
            bot_count=flag_counts.get("Bot", 0),
            short_title_count=flag_counts.get("Short title", 0),
            duplicate_count=flag_counts.get("Duplicate", 0),
        ),
        filters=FiltersPanel(
            all_users=distinct_users,
            all_flag_reasons=distinct_reasons,
        ),
        duration=end_time - start_time,
    )
