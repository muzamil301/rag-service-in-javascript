# Spike: Evaluating pgvector for E-commerce Search
**Result:** Success

## Findings
- `all-minilm` is sufficient for semantic search across 5,000 product SKUs.
- **Threshold Recommendation:** Use `0.4` similarity for broad queries and `0.7` for technical documentation matches.
- **Scaling:** HNSW indexes are required for performance once the `document_sections` table exceeds 10k rows.