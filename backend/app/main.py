import logging
from fastapi import FastAPI
from app.api import posts

# Configure logging globally
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

app = FastAPI()

app.include_router(posts.router, prefix="/posts", tags=["posts"])


@app.get("/")
def home():
    return {"message": "Home"}
