---
title: Why RAG Quality Is Mostly Retrieval Design
subtitle: Most "the model hallucinated" complaints I've debugged turned out to be retrieval bugs three layers down.
date: 2026-03-22
readingTime: 7 min read
tags:
  - RAG
  - Retrieval
  - LLM Systems
featured: true
---

# Why RAG Quality Is Mostly Retrieval Design

Almost every "the model is wrong" ticket I've taken on a RAG system turned out, after a few hours of staring at traces, to be a retrieval bug. The model wasn't lying. It was reasoning over the wrong evidence, and doing it fluently.

I started keeping notes on what was actually broken when answers were bad. Out of ~40 issues I triaged on one project over a quarter, the split was roughly:

- 24 retrieval issues (chunking, ranking, or context assembly)
- 9 prompt or output-format issues
- 5 genuine model-knowledge gaps that no amount of retrieval would fix
- 2 we never got to the bottom of

The "switch to a bigger model" reflex would have helped maybe 5 of them. The other 30 needed work two layers below the prompt.

<figure class="my-10">
<svg viewBox="0 0 720 220" xmlns="http://www.w3.org/2000/svg" class="w-full rounded-xl border border-white/10 bg-white/[0.02]">
  <defs>
    <linearGradient id="rag-stage" x1="0" x2="1">
      <stop offset="0" stop-color="oklch(0.72 0.18 210)" stop-opacity="0.18"/>
      <stop offset="1" stop-color="oklch(0.72 0.18 210)" stop-opacity="0.05"/>
    </linearGradient>
  </defs>
  <g font-family="ui-sans-serif, system-ui" fill="#cbd5e1">
    <rect x="40" y="60" width="180" height="100" rx="14" fill="url(#rag-stage)" stroke="oklch(0.72 0.18 210 / 50%)"/>
    <text x="130" y="92" text-anchor="middle" font-size="15" fill="#e2e8f0" font-weight="600">Recall</text>
    <text x="130" y="115" text-anchor="middle" font-size="11">hybrid: BM25 + dense</text>
    <text x="130" y="132" text-anchor="middle" font-size="11" fill="#94a3b8">"is the answer in the candidate set?"</text>
    <rect x="270" y="60" width="180" height="100" rx="14" fill="url(#rag-stage)" stroke="oklch(0.72 0.18 210 / 50%)"/>
    <text x="360" y="92" text-anchor="middle" font-size="15" fill="#e2e8f0" font-weight="600">Ranking</text>
    <text x="360" y="115" text-anchor="middle" font-size="11">RRF + reranker</text>
    <text x="360" y="132" text-anchor="middle" font-size="11" fill="#94a3b8">"is the best evidence on top?"</text>
    <rect x="500" y="60" width="180" height="100" rx="14" fill="url(#rag-stage)" stroke="oklch(0.72 0.18 210 / 50%)"/>
    <text x="590" y="92" text-anchor="middle" font-size="15" fill="#e2e8f0" font-weight="600">Packaging</text>
    <text x="590" y="115" text-anchor="middle" font-size="11">dedupe + budget + frame</text>
    <text x="590" y="132" text-anchor="middle" font-size="11" fill="#94a3b8">"does the prompt show it well?"</text>
    <path d="M220 110 L270 110" stroke="oklch(0.72 0.18 210 / 60%)" stroke-width="1.5"/>
    <path d="M450 110 L500 110" stroke="oklch(0.72 0.18 210 / 60%)" stroke-width="1.5"/>
    <polygon points="265,107 270,110 265,113" fill="oklch(0.72 0.18 210 / 80%)"/>
    <polygon points="495,107 500,110 495,113" fill="oklch(0.72 0.18 210 / 80%)"/>
    <text x="360" y="40" text-anchor="middle" font-size="12" fill="#94a3b8">Three stages, three different failure modes</text>
  </g>
</svg>
</figure>

It helps to look at the pipeline as three stages, because each one fails in its own way and each one is fixed with different tooling.

## Recall: the candidate set is where most of the damage happens

If the right chunk never makes it into the top-K, ranking and prompting can't recover. That's the boring truth and it gets ignored constantly because it's invisible from the chat UI.

The single biggest recall win I've shipped was switching from pure dense retrieval to a hybrid: BM25 plus dense, fused with reciprocal rank fusion. On a 12k-document support corpus I evaluated against, top-10 recall on a labeled question set moved from 0.71 to 0.86 — and the BM25 side was carrying most of the gain on questions with exact product names, error codes, and acronyms, which the embedding model kept mapping to semantically-adjacent-but-wrong neighbors.

Dense retrieval is great at "the user asked about X, the doc says Y which means X." It's surprisingly bad at "the user typed `ECONNRESET`." Anyone who has shipped RAG over a real corpus with proper nouns in it has hit this.

The other recall lever that actually moved numbers for me was chunking. I used to default to 500-token chunks with 50-token overlap because that was in some tutorial. The corpus that needed it most — long PDFs with section headings — wanted ~200-token chunks bounded by heading, with the heading prepended to every chunk's text. That single change pulled top-10 recall up another 6 points and stopped a class of "the model answered about the wrong section" complaints.

## Ranking: where precision gets won

Once recall is decent, ranking is where you decide whether the model sees the good chunk first or the merely-relevant one first. The model will use the top few, regardless of what came below.

A cross-encoder reranker on the top 50 candidates, returning a top 5, has been the highest-ROI ranking change I've made consistently. The reranker is small enough to run on CPU under 100ms for that batch size. On the same support-docs eval, MRR on the labeled set went from 0.42 to 0.61 after dropping a reranker in front of the final selection. Nothing else changed.

Two ranking failure modes I look for first when an answer is bad:

- A near-duplicate of an old version of the doc outranking the current one. Source-quality and freshness signals usually fix this faster than tuning weights.
- The top-3 being three paraphrases of the same paragraph, so the model sees one fact three times instead of three facts once.

## Packaging: the quiet multiplier

This is the stage I underestimated for the longest time. Even with great chunks at the top, sloppy context assembly burns the model's attention budget.

Things I now do by default:

- Dedupe aggressively before packaging. If chunk A and chunk B have >0.9 cosine similarity, drop one.
- Keep a context budget. I'd rather pass 4 high-quality chunks than 12 that overflow into truncation.
- Frame each chunk with its source and section, so the model can cite it back. "Source: handbook §3.2" beats a wall of unattributed text every time.
- Tell the model what to do when the evidence is thin. A one-line "if the context does not contain the answer, say so" instruction cut my fabrication rate on out-of-corpus questions by more than half on a small eval set.

The last one matters more than people think. If the prompt makes it cheap to improvise, the model improvises. If the prompt makes improvising expensive — by requiring citations, or by making refusal an explicit option — it stops.

## The metrics I actually look at

Top-line answer quality scores are a lagging indicator and they hide where things break. The four I keep on a dashboard:

- **Top-K recall on a labeled eval set.** Did the right evidence make it in?
- **MRR on the same set.** Was it ranked well?
- **Answer-context faithfulness.** Does the answer use the cited chunks, or did the model freelance?
- **Failure buckets by root cause.** Not "accuracy went down 3 points." More like "retrieval missed on 4, ranking buried it on 2, prompt instructed wrong on 1."

If a team only watches the last number — overall accuracy — they'll keep being surprised. Each underlying number is fixable independently. The aggregate is not.

## What I'd push back on

The "RAG is solved, just use a long context window" take keeps coming back. It is not solved. Long context helps when you're working over a single document and can stuff the whole thing in. It does not help when the corpus is a thousand documents and the model still needs to find the right one. Retrieval is the part that does that. You don't get to skip it by spending more on tokens.

RAG isn't prompt engineering with a vector database glued on. It's an information architecture problem with a language model at the end. When the architecture is designed properly, the model starts looking smarter without anyone touching the model.
