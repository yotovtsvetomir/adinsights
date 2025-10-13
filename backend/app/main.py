from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import posts

app = FastAPI()

app.include_router(posts.router, prefix="/posts", tags=["posts"])
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "Home"}
