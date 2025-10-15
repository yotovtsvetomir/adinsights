from sqlalchemy import select, func, text, desc, asc, or_, and_, bindparam
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Type


async def paginate_composite(
    model,
    db: AsyncSession,
    page: int = 1,
    page_size: int = 10,
    search: str | None = None,
    search_columns: list = None,
    base_filters: list = None,
    ordering: str = "id:asc",
    schema: Type[BaseModel] | None = None,
    options: list = None,
    trigram_threshold: float = 0.7,
):
    base_filters = base_filters or []
    search_columns = search_columns or []
    filters = list(base_filters)

    # Set trigram threshold
    if search and len(search) >= 4:
        await db.execute(
            text(f"SET pg_trgm.similarity_threshold = {trigram_threshold}")
        )

    # Apply search filter
    if search and search_columns:
        words = search.strip().split()
        search_filters = []

        for idx, word in enumerate(words):
            word_filters = []
            for col in search_columns:
                if len(word) < 4:
                    word_filters.append(col.ilike(f"%{word}%"))
                else:
                    # fuzzy search only for longer strings
                    word_filters.append(
                        text(f"{col.key} % :word{idx}").bindparams(
                            bindparam(f"word{idx}", word)
                        )
                    )
                    word_filters.append(col.ilike(f"%{word}%"))
            search_filters.append(or_(*word_filters))

        filters.append(and_(*search_filters))

    # Parse ordering string
    try:
        if ":" in ordering:
            col_name, direction = ordering.split(":")
        else:
            col_name = ordering.lstrip("-")
            direction = "desc" if ordering.startswith("-") else "asc"

        order_col = getattr(model, col_name)
        order_clause = desc(order_col) if direction == "desc" else asc(order_col)
    except AttributeError:
        raise ValueError(f"Invalid ordering column: {ordering}")

    # Count total
    total_query = select(func.count()).select_from(model)
    if filters:
        total_query = total_query.where(*filters)

    total_result = await db.execute(total_query)
    total_count = total_result.scalar_one()

    # Build main query
    offset = (page - 1) * page_size
    query = select(model)

    if options:
        for opt in options:
            query = query.options(opt)

    if filters:
        query = query.where(*filters)

    query = query.order_by(order_clause).offset(offset).limit(page_size)
    result = await db.execute(query)
    items = result.scalars().all()

    if schema:
        items = [schema.from_orm(item) for item in items]

    total_pages = (total_count + page_size - 1) // page_size

    return {
        "total_count": total_count,
        "current_page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "items": items,
    }
