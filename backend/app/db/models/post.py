from sqlalchemy import Column, Integer, String, Text
from app.db.session import Base


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)
    flag_reason = Column(String(100), nullable=True)
