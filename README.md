# Backend migrations
* If models are in a new file make sure to include them in alembic/env.py before running migrations
docker exec -it adinsights-backend-1 alembic revision --autogenerate -m "latest migration"
docker exec -it adinsights-backend-1 alembic upgrade head

# Backend tests
docker compose exec -e PYTHONPATH=/app backend pytest -v

# Generate types for typescript
* If pydantic schemas are in a new file make sure to substitute the app.scheams.* file
npm install -g json-schema-to-typescript
source venv/bin/activate
PYTHONPATH=$(pwd) pydantic2ts --module app.schemas.post --output ../frontend/types/models.ts

