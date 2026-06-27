# MASTER CONTEXT — Thayyib

## Product Name

Thayyib

## Short Description

Thayyib is an AI-powered Halal Compliance Intelligence Platform for halal-certified food manufacturers, especially SMEs and factories.

## Positioning

Thayyib is not a generic document storage app and not just an AI chatbot.

It is an intelligent compliance operating system for halal manufacturing businesses.

## Primary Customer

Halal food manufacturers.

Examples:
- Frozen food factories
- Sauce manufacturers
- Snack producers
- OEM food manufacturers
- Beverage factories
- Export-oriented SMEs

## Core Problem

Halal compliance is document-heavy, audit-heavy, and supplier-dependent.

Many companies still rely on:
- Excel
- WhatsApp
- Email
- Paper files
- Manual reminders

This creates risks:
- Expired supplier certificates
- Missing audit documents
- Slow audit preparation
- Unclear ingredient risks
- Poor management visibility
- Repeated manual work

## MVP Goal

Help a food manufacturer become audit-ready faster with less manual tracking.

## MVP Core Features

1. Authentication and company workspace
2. Supplier compliance tracker
3. Document management
4. Certificate expiry monitoring
5. AI document analyzer
6. Audit readiness dashboard
7. Smart reminders
8. Compliance score

## AI Strategy

Use practical AI, not research-heavy AI.

AI pipeline:
1. Upload document
2. Extract text with OCR
3. Classify document
4. Analyze risk using LLM
5. Retrieve supporting knowledge using RAG
6. Generate structured findings
7. Save result with confidence, sources, and recommended actions

## Modern Tech Trends Included

- Agentic AI
- Retrieval-Augmented Generation
- MCP-ready architecture
- AI observability
- AI evaluation
- Context engineering
- Human-in-the-loop approvals
- Compliance guardrails

## Beginner Constraint

The project must be realistic for a Software Engineering student.

Do not overbuild.

Avoid:
- Training a custom LLM
- Full ERP system
- Blockchain in MVP
- Complex computer vision in MVP
- Too many integrations early

## Recommended Stack

Frontend:
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui

Backend:
- FastAPI
- Python
- SQLAlchemy

Database:
- PostgreSQL
- pgvector

Storage:
- Supabase Storage or S3-compatible storage

AI:
- OCR: Tesseract or Google Vision
- LLM: OpenAI, Gemini, or local model later
- RAG: LlamaIndex or LangChain
- Embeddings: OpenAI, Gemini, or sentence-transformers

Deployment:
- Vercel for frontend
- Railway/Fly.io/Render for backend
- Supabase/Neon for database

## Golden Rule

Thayyib should always reduce audit stress, improve compliance visibility, and help humans make better halal compliance decisions.
