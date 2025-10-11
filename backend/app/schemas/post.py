from pydantic import BaseModel
from typing import List, Optional


class PostBase(BaseModel):
    id: int
    user_id: int
    title: str
    body: str
    reason: Optional[str] = None

    model_config = {"from_attributes": True}


class PostCreate(PostBase):
    pass


class PostResponse(PostBase):
    pass


class SummaryPanel(BaseModel):
    top_three_users: List[int]
    common_words: List[str]


class AnalyzePostsResponse(BaseModel):
    posts: List[PostBase]
    summary: SummaryPanel
    duration: Optional[float] = None
