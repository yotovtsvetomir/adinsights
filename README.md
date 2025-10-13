# Project Overview

This project fetches posts data from third-party stores into the database and provides advanced filtering, sorting, pagination, and search functionalities. It also analyzes the posts, flags them based on various criteria, and provides summarized insights through a summary section.

---

## Live Demo
Check out the live website here: [https://teamyotov.com](https://teamyotov.com)

## Features

- Fetches posts from external API and stores in DB without duplicates
- Flags posts with reasons like "Bot", "Duplicate", "Short title"
- Complex pagination, search, filters, and sorting working together
- Analysis including bot user detection and word frequency counts
- Summary panel showing top users, common words, and flagged post counts

## SSR & Single Request Design

The frontend leverages Server-Side Rendering (SSR) to deliver initial data quickly and SEO-friendly. To optimize performance and simplify state management, filtering, sorting, searching, and pagination are all handled via a **single API request** that dynamically updates based on user interactions. This design reduces unnecessary calls, ensures consistent data, and keeps the UI highly responsive.

## Performance & Tech Insights

This project demonstrates efficient handling of complex filters, sorting, search, and pagination within a single optimized API request. Running on a minimal server setup (1 CPU, 1GB RAM), it achieves impressively low load times (~0.06 seconds) for data fetching and rendering.

Key optimizations include:

- Debounced search input to minimize redundant API calls
- Smart use of React state and refs to avoid unnecessary fetches
- Dynamic filters and sorting integrated seamlessly with pagination
- Lightweight frontend leveraging Next.js with dynamic imports and SSR-friendly architecture

These design choices ensure fast, scalable, and user-friendly performance even with limited resources, making it a strong showcase of modern full-stack development skills.

---

# Running the project
```bash
docker compose up
```

# Prerequisites
## Docker & Docker Compose
- Docker (version 20.10 or higher recommended)
- Docker Compose (version 1.29 or higher recommended)

## Node.js and npm (for frontend and type generation)

Ubuntu example:
```bash
sudo apt update
sudo apt install nodejs npm
```

## Python 3 and related packages (for backend)
```bash
sudo apt update
sudo apt install python3 python3-venv python3-pip
```

# Information
- The Next.js frontend will be available at: http://localhost:3000
- The Storybook UI component explorer will be available at: http://localhost:6006
- The Backend API will be running at: http://localhost:8000
- The Backend documentation can be found at: http://localhost:8000/docs

# Installing new package (Backend)
- Create the virtual environment (this is done only once - the first time)
```bash
cd backend/
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```
- Install and rebuild
```bash
cd backend/
source venv/bin/activate
pip install package-name
pip freeze > requirements.txt
cd ..
docker compose build backend --no-cache
```

# Installing new package (Frontend)
```bash
cd frontend/
npm install package-name
cd ..
docker compose build frontend --no-cache
```

# Backend Migrations

- When adding new models, include them in `alembic/env.py` before running migrations.

```bash
docker exec -it adinsights-backend-1 alembic revision --autogenerate -m "latest migration"
docker exec -it adinsights-backend-1 alembic upgrade head
```

# Generate TypeScript types from Pydantic schemas
- Install json-schema-to-typescript if not installed:
```bash
npm install -g json-schema-to-typescript
```

- Activate your Python virtual environment
```bash
source venv/bin/activate
```

- To generate the actual types
```bash
PYTHONPATH=$(pwd) pydantic2ts --module app.schemas.post --output ../frontend/src/types/models.ts
```

# Run backend tests
```bash
docker compose exec -e PYTHONPATH=/app backend pytest -v
```
