---
title: AI Financial Intelligence Agent
subtitle: Multi-Tool Reasoning Agent for Investment Signal Generation
slug: ai-financial-agent
tech: [Python, Claude, Function Calling, Embeddings, ChromaDB, FastAPI]
status: Completed
year: 2024
featured: true
---

# AI Financial Intelligence Agent

## What it is
A multi-tool reasoning agent that chains 5 specialized tools to produce structured investment signals with cited sources — processing 500+ articles per day in under 3 seconds per query.

## How it Works

### Multi-Tool Reasoning Chain
Uses Claude function calling to orchestrate 5 tools in sequence:
1. **News Tool** — fetches recent articles by ticker/topic
2. **SEC Filings Tool** — retrieves 10-K, 10-Q, 8-K excerpts
3. **Price Tool** — pulls historical and real-time price data
4. **Technicals Tool** — computes moving averages, RSI, volume signals
5. **Sentiment Tool** — few-shot classifier for market sentiment

Claude decides which tools to call and in what order based on the query — it's not a fixed pipeline. The final output is a structured investment signal with source citations, generated in < 3s latency.

### News Clustering Pipeline
Built an embedding-based clustering pipeline with a 0.92 cosine similarity threshold. Clusters track growth velocity — a cluster that doubles in size in 2 hours signals an emerging story. This reduced false-positive alerts by 45% compared to keyword-based approaches.

### Sentiment Classifier
Few-shot classifier (87% accuracy) trained on labeled financial headlines. Backtesting against historical price movements achieved 79% precision on high-impact events — events where sentiment shifted sharply and price followed within 24 hours.

## Key Technical Decisions

**Why function calling over a fixed pipeline?** Financial queries are diverse — "what happened to NVDA last week" vs "compare MSFT and GOOGL on cloud growth" require completely different tool sequences. Letting Claude decide the sequence via function calling handles this naturally.

**Why cosine threshold at 0.92?** Lower thresholds merged too many unrelated stories. Higher thresholds fragmented the same story into noise. 0.92 was calibrated against 2 weeks of labeled data.

**Latency target of < 3s**: Achieved by parallelizing independent tool calls (news + price + technicals can run simultaneously; SEC filings only called when query mentions fundamentals). Sequential bottleneck is Claude's reasoning step.

## Tech Stack
Python, FastAPI, Anthropic Claude (function calling), OpenAI Embeddings, ChromaDB, PostgreSQL, Redis (caching), yfinance, SEC EDGAR API
