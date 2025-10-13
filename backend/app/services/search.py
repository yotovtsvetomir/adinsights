from sqlalchemy import or_, and_, text, desc, asc, bindparam
from sqlalchemy.ext.asyncio import AsyncSession


async def apply_filters_search_ordering(
    model,
    db: AsyncSession,
    search: str | None = None,
    search_columns: list = None,
    filters: list | None = None,
    ordering: str = "-id",
    trigram_threshold: float = 0.7,
):
    filters = filters or []
    search_columns = search_columns or []

    # Set trigram threshold for fuzzy search
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

    # Build search filter if search query is provided
    filt = await build_filters(search)
    if filt is not None:
        filters.append(filt)  # Always apply the filter, even if it matches 0 results

    # Apply ordering
    try:
        if ":" in ordering:
            column_name, direction = ordering.split(":")
            order_column = getattr(model, column_name)
            if direction.lower() == "desc":
                order_by = [desc(order_column)]
            else:
                order_by = [asc(order_column)]
        else:
            # fallback: if ordering is like "-id" or "id"
            if ordering.startswith("-"):
                order_column = getattr(model, ordering[1:])
                order_by = [desc(order_column)]
            else:
                order_column = getattr(model, ordering)
                order_by = [asc(order_column)]
    except AttributeError:
        raise ValueError(
            f"Ordering column '{ordering}' not found on model {model.__name__}"
        )

    return filters, order_by
