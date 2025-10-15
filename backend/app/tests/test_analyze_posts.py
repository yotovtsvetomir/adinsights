from app.api.posts import (
    categorize_posts,
    detect_bot_users,
    get_top_users,
    gather_duplicates_posts,
    gather_posts_for_users,
    get_words,
)
from app.db.models.post import Post


def test_get_words():
    title = "Hello World Again"
    words = get_words(title)
    assert words == {"hello", "world", "again"}


def test_categorize_posts_basic():
    posts = [
        Post(id=1, user_id=1, title="Hello world", body="Body 1"),
        Post(id=2, user_id=1, title="Hello again", body="Body 2"),
        Post(id=3, user_id=2, title="Short", body="Body 3"),
        Post(
            id=4, user_id=1, title="Hello world", body="Body 4"
        ),  # duplicate title for user 1
    ]

    (
        shorter_titles,
        duplicates,
        user_titles,
        user_posts,
        word_count,
        user_unique_words,
    ) = categorize_posts(posts)

    assert len(shorter_titles) == 4  # "Short" < 15 chars
    assert duplicates[1] == {"Hello world"}  # duplicate title detected
    assert 1 in user_titles and 2 in user_titles
    assert word_count["hello"] == 3  # Appears 3 times total
    assert "short" in user_unique_words[2]


def test_detect_bot_users():
    user_titles = {
        1: [
            "Hello world",
            "Hello world!",
            "Hello world!!",
            "Hello world!!!",
            "Hello world!!!!",
            "Hello world!!!!!",
            "Another title",
        ],
        2: ["Short", "Short post", "Another post"],
    }
    bots = detect_bot_users(user_titles)
    assert 1 in bots
    assert 2 not in bots


def test_get_top_users():
    user_unique_words = {
        1: {"hello", "world", "again"},
        2: {"short"},
        3: {"test", "case", "python", "fastapi"},
    }

    top_user_ids, top_three_users = get_top_users(user_unique_words)

    assert top_user_ids[0] == 3
    assert top_three_users == [3, 1, 2]


def test_gather_duplicates_posts():
    duplicates = {1: {"Hello world"}}
    user_posts = {
        1: [
            Post(id=1, user_id=1, title="Hello world", body="Body 1"),
            Post(id=2, user_id=1, title="Hello again", body="Body 2"),
        ]
    }

    dup_posts = gather_duplicates_posts(duplicates, user_posts)
    assert len(dup_posts) == 1
    assert dup_posts[0].title == "Hello world"


def test_gather_posts_for_users():
    user_posts = {
        1: [Post(id=1, user_id=1, title="Post 1", body="Body 1")],
        2: [Post(id=2, user_id=2, title="Post 2", body="Body 2")],
    }

    posts = gather_posts_for_users([1], user_posts)
    assert len(posts) == 1
    assert posts[0].user_id == 1

    posts_all = gather_posts_for_users([1, 2], user_posts)
    assert len(posts_all) == 2
