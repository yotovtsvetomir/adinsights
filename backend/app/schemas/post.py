from pydantic import BaseModel
from typing import List, Optional


class PostBase(BaseModel):
    id: int
    user_id: int
    title: str
    body: str
    flag_reason: Optional[str] = None

    model_config = {"from_attributes": True}


class PostCreate(PostBase):
    pass


class PostResponse(PostBase):
    pass


class WordCount(BaseModel):
    word: str
    count: int


class SummaryPanel(BaseModel):
    top_three_users: List[int]
    common_words: List[WordCount]
    bot_count: int
    short_title_count: int
    duplicate_count: int


class FiltersPanel(BaseModel):
    all_users: List[int]
    all_flag_reasons: List[str]


class PaginatedPosts(BaseModel):
    items: List[PostBase]
    total_count: int
    current_page: int
    page_size: int
    total_pages: int


class AnalyzePostsResponse(BaseModel):
    posts: PaginatedPosts
    summary: SummaryPanel
    filters: FiltersPanel
    duration: Optional[float] = None
