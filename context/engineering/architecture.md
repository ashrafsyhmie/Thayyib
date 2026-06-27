# Engineering Architecture

## Recommended MVP Architecture

Monorepo:

```text
thayyib/
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   ├── ui/
│   ├── types/
│   └── config/
└── context/
```

## Frontend

Next.js app for:
- Dashboard
- Supplier management
- Document upload
- AI analyzer
- Audit readiness

## Backend

FastAPI service for:
- Authentication
- CRUD APIs
- File processing
- OCR jobs
- AI analysis
- Dashboard aggregation

## Database

PostgreSQL for structured data.

pgvector for embeddings.

## Storage

Object storage for uploaded files.

## AI Engine

MVP can be part of FastAPI service.

Later it can become separate worker service.
