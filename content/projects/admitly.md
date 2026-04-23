---
title: Admitly
subtitle: AI-Powered Graduate Admission Copilot
slug: admitly
tech: [Next.js, Claude, RAG, pgvector, Multi-Agent, Supabase, TypeScript]
status: In Development
year: 2025
featured: true
demoUrl: https://admitly-smoky.vercel.app/
---

# Admitly — AI-Powered Graduate Admission Copilot

## What it is
An AI-native platform for Chinese students applying to US graduate programs. The application process is information-dense and highly personal — exactly what LLMs excel at, given the right context architecture.

## Key Numbers
- **16 task-tagged AI operations** across 4 agent pipelines
- **12-step autonomous Deep Research agent** for program discovery
- **5-stage essay coaching pipeline** with LLM-as-judge evaluation
- **78% pass rate** across 10 SOP prompts in LLM-judge eval framework
- **92% factual precision** on RAG pipeline with hybrid search
- **54% reduction** in per-pipeline LLM cost via model routing

## AI Architecture

### RAG Pipeline
Program data lives in Supabase with pgvector. The retrieval layer uses **hybrid search**: BM25 for keyword precision (critical for named entities like school names and deadlines) + dense vector search for semantic intent + RRF (Reciprocal Rank Fusion) for final re-ranking. Chunking is at the paragraph level per program section — each chunk is independently meaningful so precision stays high.

The insight: pure vector search misses exact matches. If a user types "CMU LTI," the embedding space might rank it 8th. BM25 protects proper nouns; vectors handle fuzzy intent. Hybrid gets you both.

### Model Routing
Every Claude call goes through a central router with a `task_tag` — strings like `"school.match"` or `"essay.critic"`. The router maps tags to models based on three factors: reasoning depth required, expected token count, and budget per query.

- **Haiku** — parsing, classification, form validation (fast + cheap)
- **Sonnet** — evaluation, routing decisions, program matching (reasoning without Opus cost)
- **Opus** — Deep Research agent, essay critique (quality is the constraint)

This reduced per-pipeline LLM cost by 54% vs. naively using Opus everywhere.

### Multi-Agent Orchestration
The Deep Research flow chains 12 steps: web scraping (.edu-whitelisted) → semantic chunking → embedding → hybrid retrieval → gap analysis → advice generation. Agents communicate through Zod-validated JSON payloads — failures are caught at the boundary, not silently propagated. An explicit **LLM-as-judge evaluator** scores every agent output (faithfulness, relevance, consistency, 0–1 scale) before it passes downstream. Below 0.7 triggers a retry.

### Prompt Caching
The program database context is identical across most queries in a session. Caching it with `cache_control: ephemeral` cuts that cost by up to 90%. Structure: static cached preamble → dynamic user-specific section → query. Cache TTL is 5 minutes — optimized for session-level reuse.

## What I Learned
- Hybrid search is non-negotiable when your domain has named entities. Pure vector loses on proper nouns.
- The evaluator stage is the most important architectural decision in a multi-agent system. Without it, errors compound silently across agent boundaries.
- Prompt caching requires discipline: the cached block must be byte-identical, so you can't inject per-user data into it. Structure your prompts accordingly.
- Model routing closes a feedback loop only if you log it: task_tag, model used, token count, eval score, cost per call.

## Tech Stack
Next.js 15, TypeScript, Tailwind, shadcn/ui, Supabase (Postgres + pgvector + Auth + Storage), Anthropic Claude (Opus/Sonnet/Haiku), Vercel AI SDK, Zod, pnpm
