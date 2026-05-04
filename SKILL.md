---
name: memory-lancedb-pro
description: LanceDB-backed persistent memory plugin for OpenClaw/Hermes with hybrid vector + BM25 retrieval and cross-encoder reranking
tags: [memory, lancedb, vector-search, hermes-plugin, typescript, openclaw]
---

# memory-lancedb-pro Skill

## Description

`memory-lancedb-pro` is a **LanceDB-backed memory plugin for OpenClaw/Hermes** that provides AI agents with persistent, long-term memory capabilities. It automatically captures, stores, and retrieves knowledge across sessions without manual tagging.

## Key Features

### Hybrid Retrieval (Vector + BM25)
- **Vector Search**: Semantic similarity via LanceDB ANN (cosine distance)
- **BM25 Full-Text Search**: Exact keyword matching via LanceDB FTS index
- **Hybrid Fusion**: Combines vector and BM25 scores with configurable weights

### Cross-Encoder Reranking
- Multi-provider support: **Jina**, **SiliconFlow**, **Voyage AI**, **Pinecone**
- Compatible with any Jina-compatible endpoint
- Hybrid scoring: 60%% cross-encoder + 40%% original fused score
- Graceful degradation to cosine similarity on API failure

### Multi-Scope Isolation
- Built-in scopes: `global`, `agent:<id>`, `custom:<name>`, `project:<id>`, `user:<id>`
- Agent-level access control via `scopes.agentAccess`
- Default: each agent accesses `global` + its own `agent:<id>` scope

## Installation

```bash
openclaw plugins install memory-lancedb-pro@beta
```

## Configuration

```json
{
  "plugins": {
    "slots": { "memory": "memory-lancedb-pro" },
    "entries": {
      "memory-lancedb-pro": {
        "enabled": true,
        "config": {
          "embedding": {
            "provider": "openai-compatible",
            "apiKey": "***",
            "model": "text-embedding-3-small"
          },
          "autoCapture": true,
          "autoRecall": true,
          "smartExtraction": true,
          "extractMinMessages": 2,
          "extractMaxChars": 8000,
          "sessionMemory": { "enabled": false }
        }
      }
    }
  }
}
```

## Agent Tools

| Tool | Description |
|------|-------------|
| `memory_recall` | Retrieve relevant memories for a query |
| `memory_store` | Store a new memory |
| `memory_forget` | Delete a specific memory |
| `memory_update` | Update an existing memory |
| `memory_stats` | View memory statistics |
| `memory_list` | List memories by scope/category |
| `memory_search` | Full-text search memories |

## Architecture

```
index.ts (Entry Point)
├── store.ts (LanceDB storage layer)
├── embedder.ts (Embedding abstraction)
├── retriever.ts (Hybrid retrieval engine)
├── scopes.ts (Multi-scope access control)
├── tools.ts (Agent tool definitions)
├── smart-extractor.ts (LLM-powered extraction)
├── decay-engine.ts (Weibull decay model)
└── tier-manager.ts (Three-tier promotion/demotion)
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `@lancedb/lancedb` ≥0.26.2 | Vector database (ANN + FTS) |
| `openai` ≥6.21.0 | OpenAI-compatible Embedding API client |
| `@sinclair/typebox` 0.34.48 | JSON Schema type definitions |

## CLI Commands

```bash
openclaw memory-pro list [--scope global] [--category fact] [--limit 20]
openclaw memory-pro search "query" [--scope global]
openclaw memory-pro stats [--scope global]
openclaw memory-pro delete <id>
openclaw memory-pro export [--scope global] [--output memories.json]
openclaw memory-pro import memories.json [--scope global]
```

## Resources

- **GitHub**: https://github.com/ether-btc/memory-lancedb-pro
- **Documentation**: See `docs/` directory for architecture analysis and integration guides
