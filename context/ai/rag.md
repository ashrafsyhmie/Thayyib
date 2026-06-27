# RAG Design

## Purpose

RAG helps the AI answer using trusted knowledge instead of relying only on model memory.

## Knowledge Sources

- Ingredient risk database
- E-number references
- Internal SOPs
- Supplier certificates
- Audit checklist
- Halal compliance notes
- Uploaded documents

## MVP RAG Flow

1. Chunk knowledge documents
2. Generate embeddings
3. Store in pgvector
4. Retrieve relevant chunks during analysis
5. Ask LLM to answer using retrieved context

## Guardrail

If no supporting context is found, AI should say it is uncertain.
