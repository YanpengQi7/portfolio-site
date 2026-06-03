---
title: Model Routing Is a Product Decision, Not Just an Optimization
subtitle: A real routing layer cut my last project's LLM bill by 62%. The reason it worked was not the cheaper model — it was admitting which calls didn't deserve the expensive one.
date: 2025-11-16
readingTime: 6 min read
tags:
  - Model Routing
  - AI Product
  - Cost Engineering
featured: true
---

# Model Routing Is a Product Decision, Not Just an Optimization

Almost every "we need to add model routing" conversation I've been in started as a cost conversation and ended somewhere else. The cost framing makes sense — the bill is the thing that prompts the meeting — but it leads to bad routing.

Routing only works if you've decided which calls in your product actually need a frontier model and which ones were getting it by accident. That's a product question. The cost saving is a side effect of answering it honestly.

## The numbers from one rollout

On the last system where I shipped a routing layer end-to-end, we were serving a research-assistant workflow with seven distinct LLM calls per session: intent classification, query rewriting, two retrieval reranks, a synthesis call, a critique pass, and a "next-step" suggestion.

All seven were hitting GPT-4-class models when I started. The breakdown by call after routing:

| Step | Before | After | % of session cost (before / after) |
|---|---|---|---|
| Intent classify | frontier | small (Haiku-tier) | 9% → 0.4% |
| Query rewrite | frontier | small | 7% → 0.3% |
| Rerank ×2 | frontier | embedding + small | 22% → 1.1% |
| Synthesis | frontier | frontier | 38% → 73% |
| Critique | frontier | mid-tier | 16% → 19% |
| Next-step | frontier | small | 8% → 6% |

Total cost per session dropped 62%. p95 end-to-end latency dropped 31%, mostly because the small-model calls were 4-8x faster on the short prompts they were getting. Quality on the user-visible synthesis output, measured against a 200-prompt eval set with pairwise human preference, was statistically indistinguishable from the frontier-only baseline.

The synthesis step did get more expensive in absolute terms, because we started giving it a slightly longer context and one extra critique loop with the saved budget. That was the right tradeoff. The places we cheaped out were the places no human would have noticed.

<figure class="my-10">
<svg viewBox="0 0 720 240" xmlns="http://www.w3.org/2000/svg" class="w-full rounded-xl border border-white/10 bg-white/[0.02]">
  <g font-family="ui-sans-serif, system-ui" fill="#cbd5e1" font-size="11">
    <text x="360" y="28" text-anchor="middle" font-size="13" fill="#e2e8f0" font-weight="600">Tier by task shape, not by uniform default</text>
    <g transform="translate(40,60)">
      <rect width="190" height="140" rx="12" fill="oklch(0.7 0.16 160 / 12%)" stroke="oklch(0.7 0.16 160 / 50%)"/>
      <text x="95" y="26" text-anchor="middle" font-size="13" fill="#e2e8f0" font-weight="600">Small tier</text>
      <text x="95" y="46" text-anchor="middle">classify · extract · rewrite</text>
      <text x="95" y="64" text-anchor="middle" fill="#94a3b8">verifiable in code</text>
      <text x="95" y="82" text-anchor="middle" fill="#94a3b8">user never sees raw output</text>
      <text x="95" y="112" text-anchor="middle" font-size="12" fill="oklch(0.8 0.16 160)">~$0.001 / call</text>
    </g>
    <g transform="translate(265,60)">
      <rect width="190" height="140" rx="12" fill="oklch(0.65 0.16 280 / 12%)" stroke="oklch(0.65 0.16 280 / 50%)"/>
      <text x="95" y="26" text-anchor="middle" font-size="13" fill="#e2e8f0" font-weight="600">Mid tier</text>
      <text x="95" y="46" text-anchor="middle">critique · planning · rerank</text>
      <text x="95" y="64" text-anchor="middle" fill="#94a3b8">structured but model-limited</text>
      <text x="95" y="82" text-anchor="middle" fill="#94a3b8">internal-facing</text>
      <text x="95" y="112" text-anchor="middle" font-size="12" fill="oklch(0.78 0.16 280)">~$0.01 / call</text>
    </g>
    <g transform="translate(490,60)">
      <rect width="190" height="140" rx="12" fill="oklch(0.72 0.18 30 / 12%)" stroke="oklch(0.72 0.18 30 / 50%)"/>
      <text x="95" y="26" text-anchor="middle" font-size="13" fill="#e2e8f0" font-weight="600">Frontier tier</text>
      <text x="95" y="46" text-anchor="middle">synthesis · final answer</text>
      <text x="95" y="64" text-anchor="middle" fill="#94a3b8">user-visible and hard to verify</text>
      <text x="95" y="82" text-anchor="middle" fill="#94a3b8">errors compound downstream</text>
      <text x="95" y="112" text-anchor="middle" font-size="12" fill="oklch(0.8 0.18 30)">~$0.05+ / call</text>
    </g>
    <text x="360" y="222" text-anchor="middle" fill="#64748b" font-size="10">Tier prices illustrative; ratios are what matters.</text>
  </g>
</svg>
</figure>

## The deciding question is failure containment

When I'm staring at a list of model calls and trying to figure out which tier each belongs in, the actual question I ask is: *if this call gets it wrong, what catches it?*

If the answer is "the next step in the pipeline validates the shape" or "a regex confirms the structure" or "we re-run with a fallback at higher temperature," I'm comfortable putting it on a smaller model. The failure is contained. The user never sees it.

If the answer is "the human user sees the output and decides," I want the frontier model. Or I want the smaller model with an explicit verification step. Either way I'm paying for confidence on that one.

The calls I most regret cheaping out on, every single time, are the ones where a small model wrote something that looked plausible, the system shipped it through, and a human had to debug *why their thing wasn't working* three days later.

## Tagging beats heuristics

What turned routing from "a clever if/else" into something I could actually operate was tagging every call by job, not by token count or latency budget. The router became a lookup table.

```ts
type CallTag =
  | 'classify-intent'
  | 'rewrite-query'
  | 'rerank-candidates'
  | 'synthesize-answer'
  | 'critique-draft'
  | 'extract-structured'

const route: Record<CallTag, { model: string; maxTokens: number; tempCap: number }> = {
  'classify-intent':     { model: 'haiku',  maxTokens: 64,  tempCap: 0 },
  'rewrite-query':       { model: 'haiku',  maxTokens: 128, tempCap: 0.2 },
  'rerank-candidates':   { model: 'haiku',  maxTokens: 256, tempCap: 0 },
  'synthesize-answer':   { model: 'opus',   maxTokens: 1500, tempCap: 0.4 },
  'critique-draft':      { model: 'sonnet', maxTokens: 600, tempCap: 0.2 },
  'extract-structured':  { model: 'haiku',  maxTokens: 400, tempCap: 0 },
}
```

The shape matters less than the discipline. Every call has a tag. Every tag has a documented choice. When someone wants to change the routing for `synthesize-answer`, they're proposing a product change, not editing a config file.

The version of this I see go wrong is when teams route by prompt length, or by some learned classifier on the input. That's clever and it tends to drift. Tags survive because they're attached to *what the code is asking for*, not what the input happens to look like today.

## Measure the decision, not the dispatch

A routing layer that only logs "called Haiku" isn't observable. I want to know whether the decision was a good one.

The dashboard I keep on a routing system has four panels:

- Cost per session, broken down by tag.
- Eval score per tag, against a tag-specific rubric. Synthesis and classify are not graded the same way.
- Fallback rate per tag — how often the small model output failed validation and triggered a frontier retry.
- Human-override rate on user-visible outputs.

The fallback-rate panel is the one that catches mistakes earliest. If a tag's fallback rate creeps from 2% to 8% over a release, the small model is no longer good enough for that job — either the upstream input distribution shifted, or someone changed the prompt. Either way I want to know before the cost savings turn into a quality problem.

## Where I'd push back on the "use one model for everything" instinct

I hear "just use the best model everywhere, engineer time is more expensive than tokens" a lot. It's a real argument and it's wrong in a specific way.

Once your product has more than a few calls per user-visible action, the cost stops being incidental and the latency adds up. Seven serial frontier calls is two-plus seconds of wall clock even with the fast tier. That's a worse user experience than one synthesis call with six small ones in front. The routing isn't just about the bill — it's about which call gets the latency budget at the end.

Routing well is one of the most underrated forms of product design in LLM apps. The teams that do it think more clearly about their own workflow than the ones who don't, because they had to decide what each step is actually for.
