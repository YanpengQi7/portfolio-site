---
title: I Scored My LLM's Incident Reports Against a Rubric. Here's What Broke.
subtitle: Prompt iteration without a regression suite is vibes. A 5-dimension rubric, 5 scenarios, and the surprises that fell out.
date: 2026-03-15
readingTime: 9 min read
tags:
  - Evals
  - LLM as Judge
  - SRE
  - Production AI
featured: true
---

# I Scored My LLM's Incident Reports Against a Rubric. Here's What Broke.

I built [an incident-response copilot](https://github.com/YanpengQi7/ai-reliability-copilot) — paste logs, metrics, and on-call notes, get back a structured 9-section report: severity, ranked root-cause hypotheses with evidence, investigation checklist, mitigation plan with rollbacks, postmortem skeleton, follow-ups.

The interesting part isn't the prompt. It's that **every change to the prompt is now scored against a fixed rubric across a fixed scenario set, with an LLM-as-judge**, before it ships. "It feels better" doesn't ship. "Average rubric overall went from 2.8 → 4.3 across 5 scenarios" does.

This post is the rubric, the scenarios, and the things that surprised me when I actually ran it.

I wrote a [more abstract version](/blog/agent-systems-need-evals-before-they-need-more-tools) of this argument earlier. This one is concrete: code, numbers, mistakes.

## Why bother

Without a rubric and a regression suite, prompt iteration is vibes. You change something. You re-run one example. You decide it's "better." You ship.

You can't justify the change. You can't catch regressions on the 4 scenarios you didn't re-test. You can't onboard a teammate to "improve the prompt" without handing them your taste.

For a side project this is fine. For anything claiming to be production AI it's malpractice.

## The rubric: 5 dimensions, 1–5 each, with concrete anchors

The hardest part of any rubric is getting two reviewers (human or LLM) to converge on the same score. The trick: **anchor every dimension with a concrete example at 1 and at 5**, not adjectives like "good" or "thorough."

| Dim | What it measures | 1 anchor (poor) | 5 anchor (excellent) |
|---|---|---|---|
| **Specificity** | Concreteness of commands/metrics | "check the logs" | `kubectl logs -n prod -l app=payment-svc --since=15m \| grep -iE "connection refused"` |
| **Safety** | Avoidance of destructive ops; presence of rollback | Recommends `DROP TABLE` on prod | Every mitigation has rollback; risky ops gated by safer alternatives |
| **Actionability** | Can on-call execute in under 5 min? | Vague "investigate further" | Every step copy-pasteable, no further research |
| **Domain correctness** | Right SRE mechanism, no invented evidence | Mis-attributes OOM to CPU | Correct root cause, correct mechanism |
| **Completeness** | All 9 output sections substantively filled | Multiple empty sections | All 9 substantive, postmortem H2s in order |

Full anchors and weights live in [`src/lib/eval/rubric.ts`](https://github.com/YanpengQi7/ai-reliability-copilot/blob/main/src/lib/eval/rubric.ts).

The 1-anchor matters more than the 5-anchor. Without it, the judge happily gives anything coherent a 3.

## The scenario suite: 5 incidents, picked to be different on purpose

| Slug | Category |
|---|---|
| db-connection-pool-exhausted | Database |
| bad-deploy-memory-leak | Deploy |
| upstream-dependency-timeout | Dependency |
| dns-misconfiguration | Network |
| cache-stampede | Capacity |

Five is narrow. I know. The point is breadth across failure categories, not statistical coverage. Each scenario carries realistic metrics, log snippets, deploy history, on-call notes, plus an `expected_severity` and `expected_root_cause` used to grade `domain_correctness`.

When a prompt change improves Database scenarios but tanks Network scenarios, you see it. With one cherry-picked example you don't.

## LLM-as-judge — and the bias I had to design around

The judge is itself an LLM call (`generateObject` against a `RubricScores` schema) running at `temperature: 0`. It receives the analysis plus the ground truth from the scenario, and is prompted to **cite a concrete element of the analysis to justify each score**. The citation requirement matters — without it, judges score by gestalt and the scores drift.

Here's the part that surprised me:

**When the judge is in the same model family as the analyzer, it grades ~10–20% optimistic.**

I don't have rigorous numbers across providers yet — this is from comparing judge scores to my own human re-scoring on a sample. But the pattern was consistent enough to act on: my plan for production is **periodic human review on a random sample (N=20 per release)** to keep the judge calibrated, with a target of ≥80% agreement on overall score within ±0.5.

If you're shipping LLM-as-judge without a human calibration loop, you're trusting the model to grade itself. It will be kind.

## Things that broke (the actually useful part)

Real findings from running this over a month of prompt iterations:

**1. Adding more sections made `actionability` worse.** Early versions had 6 sections. I added 3 more (customer comms, postmortem skeleton, follow-ups). Overall completeness went up. Actionability went *down* — the model spread budget across more sections, so each individual command got vaguer. Fix: explicit per-section length guidance + a "specificity floor" instruction.

**2. The judge over-rewards confident wrong answers.** A polished postmortem for the wrong root cause scored higher than a hesitant correct one until I made `domain_correctness` veto-style: cap overall at 3 if domain_correctness < 3.

**3. Severity drift across runs.** Same scenario, same prompt, severity oscillated P1↔P2 across runs at `temperature: 0.2`. I haven't fixed this yet — the roadmap item is N=3 repeats per scenario with std-dev reporting. Honest about it in the [limitations section](https://github.com/YanpengQi7/ai-reliability-copilot/blob/main/EVALUATION.md#limitations--honesty).

**4. The 9-section schema is opinionated and that's a feature.** Real incidents don't always fit it. But comparable structured output > flexible output you can't grade. I'd rather have a rubric that occasionally penalizes a weird incident than no rubric at all.

## What this changes in practice

When evaluation is real, the questions you ask about the system change.

You stop asking "can the agent do this?" You start asking:

- How often does it do this well? (across scenarios, not one example)
- What are the dominant failure buckets? (which dimension, which scenario class)
- Which step should be simplified, constrained, or validated? (vs. adding more tools)

That leads to better systems than adding one more clever tool ever will. Most "agent improvements" I see in the wild — more tools, more memory, more planning steps — are responses to symptoms a rubric would have located precisely.

## Try it / poke at it

- **Repo:** [github.com/YanpengQi7/ai-reliability-copilot](https://github.com/YanpengQi7/ai-reliability-copilot)
- **Live demo:** [ai-reliability-copilot.vercel.app](https://ai-reliability-copilot.vercel.app)
- **Eval methodology:** [EVALUATION.md](https://github.com/YanpengQi7/ai-reliability-copilot/blob/main/EVALUATION.md)
- **Rubric source:** [`src/lib/eval/rubric.ts`](https://github.com/YanpengQi7/ai-reliability-copilot/blob/main/src/lib/eval/rubric.ts)

The rubric is opinionated and the scenario set is small. I'd genuinely like critique on both — open an issue if you have a category I'm missing, or if your judge-calibration numbers look different from mine.
