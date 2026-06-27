# AI Architecture

## AI Goal

Assist compliance officers by identifying possible halal compliance risks in uploaded documents.

## Pipeline

1. File upload
2. OCR extraction
3. Document classification
4. RAG retrieval
5. LLM analysis
6. Risk scoring
7. Human-readable explanation
8. Store result for audit trail

## MVP AI Output

```json
{
  "risk_level": "medium",
  "confidence": 0.82,
  "summary": "Potential issue found in ingredient source.",
  "findings": [
    {
      "item": "Gelatin",
      "risk": "Source unspecified",
      "recommendation": "Request supplier clarification."
    }
  ],
  "sources": ["ingredient-risk-db", "uploaded-document"]
}
```

## AI Principle

Never make final halal rulings.

Only flag potential risks and recommend verification.
