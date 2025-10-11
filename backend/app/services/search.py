from sqlalchemy import or_, and_, text, desc, asc, select, bindparam
from sqlalchemy.ext.asyncio import AsyncSession


async def apply_filters_search_ordering(
    model,
    db: AsyncSession,
    search: str | None = None,
    search_columns: list = None,
    filters: list | None = None,
    ordering: str = "-created_at",
    trigram_threshold: float = 0.7,
):
    filters = filters or []
    search_columns = search_columns or []

    await db.execute(text(f"SET pg_trgm.similarity_threshold = {trigram_threshold}"))

    async def build_filters(query: str):
        if not query:
            return None
        words = query.strip().split()
        if not words:
            return None
        search_filters = []

        for idx, word in enumerate(words):
            word_column_filters = []
            for col in search_columns:
                if len(word) < 4:
                    word_column_filters.append(col.ilike(f"%{word}%"))
                else:
                    word_column_filters.append(
                        text(f"{col.key} % :word{idx}").bindparams(
                            bindparam(f"word{idx}", word)
                        )
                    )
                    word_column_filters.append(col.ilike(f"%{word}%"))
            search_filters.append(or_(*word_column_filters))
        return and_(*search_filters)

    # Build and apply search filter
    filt = await build_filters(search)
    temp_filters = filters.copy()

    if filt is not None:
        temp_filters.append(filt)

        # Check if any rows match, then apply
        stmt = select(model).where(*temp_filters).limit(1)
        result = await db.execute(stmt)

        if result.scalars().first():
            filters.append(filt)

    # Apply ordering
    if ordering.startswith("-"):
        order_column = getattr(model, ordering[1:], getattr(model, "created_at"))
        order_by = [desc(order_column)]
    else:
        order_column = getattr(model, ordering, getattr(model, "created_at"))
        order_by = [asc(order_column)]

    return filters, order_by
