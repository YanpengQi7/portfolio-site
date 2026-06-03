---
title: AI Code Review in CI Needs Scopes, Rubrics, and Escalation
subtitle: A bot that comments on everything with equal confidence is worse than no bot at all. I have the noisy-PR receipts to prove it.
date: 2024-06-18
readingTime: 8 min read
tags:
  - CI/CD
  - Code Review
  - LLM Systems
featured: false
---

# AI Code Review in CI Needs Scopes, Rubrics, and Escalation

The first time I shipped an AI reviewer into a real CI pipeline, it commented on 17 things per pull request on average. Most of them were variants of "consider adding a comment here" and "this function could be clearer." Within two weeks, engineers were collapsing the bot's review section before reading it. Within four weeks, two real findings — one a SQL injection in a new endpoint, one a missing `await` in an error path — were buried in the noise and merged anyway.

The bot wasn't wrong about everything. It was wrong about confidence calibration, which is worse. A reviewer that cries wolf 16 times trains the team to ignore the seventeenth comment, which was the one that mattered.

I've rebuilt this kind of system three times since. The version that works is narrower, more opinionated, and quieter. Here's what changed.

## Constrain the scope before constraining the prompt

The first instinct is to write a better prompt. That's the wrong layer. The more useful intervention is upstream: don't ask the model to review the diff for "quality." Ask it to look for one named class of issue at a time.

The four scopes I run separately, with separate prompts and separate evaluators:

- **Security-sensitive changes.** New auth code, secret handling, input validation on privileged operations, anything touching a SQL query string. Strong prior: any finding here is worth a human look.
- **Concurrency and error handling.** Async patterns, retry logic, transactional boundaries. The class of bugs that doesn't fire in CI and fires in production.
- **API contract changes.** Renamed fields, changed response shapes, removed endpoints. Catches breaking changes to consumers the diff author may not know about.
- **Operability.** Logging that's about to leak a secret, log levels misused, error messages that won't help on-call.

These don't overlap much and they don't compete for budget in the prompt. Each scope's prompt knows what it's looking for and what it's explicitly *not* responsible for. Style isn't on the list. "Code could be clearer" isn't on the list. Existing humans are fine at those.

```ts
type ReviewScope = 'security' | 'concurrency' | 'api-contract' | 'operability'

type Finding = {
  scope: ReviewScope
  severity: 'block' | 'warn' | 'note'
  location: { file: string; line: number }
  evidence: string  // exact code that triggered the finding
  why: string       // why it matters in this scope
  confidence: number // 0-1, see below
}
```

The shape matters because the downstream behavior in CI depends on it. A `block` security finding can fail the build. A `note` operability finding can be summarized in a collapsed section. Without per-finding severity and scope, CI can't make that decision.

## Rubrics anchor what "good finding" means

Without a rubric, the model converges on whatever was loudest in its training set, which is style nits. The rubric tells it what to actually look for, in terms specific enough that two runs on the same diff produce comparable output.

A piece of the security rubric I'm running on one project:

```ts
const securityRubric = {
  // Each item is a concrete question with a concrete failure mode.
  unvalidated_input_to_privileged_op: {
    question: 'Does this diff pass user-controlled input into a privileged operation without validation?',
    privileged_ops: ['raw SQL', 'shell exec', 'eval', 'file path construction', 'auth decisions'],
    not_a_finding: 'input is validated upstream and the diff preserves that validation',
  },
  weakened_auth_or_isolation: {
    question: 'Does this diff weaken an existing authz check, tenant isolation, or secret handling?',
    require_evidence: 'cite the prior check being weakened',
    not_a_finding: 'the check is moved to a different layer that still enforces it',
  },
}
```

The `not_a_finding` field matters more than it looks. Half the false positives I've debugged came from the model recognizing the *shape* of an unsafe pattern in a context where the safety was just elsewhere. Naming the common safe-shape explicitly cuts that.

## Calibrate confidence before deciding what to post

A finding without a confidence score isn't actionable for CI. The CI doesn't know whether to block the merge, post a comment, or save it for a weekly summary.

What I do now: the model returns a self-rated confidence per finding, and that rating is *adjusted* by an independent pass before anything is posted. The independent pass is a smaller model running with a "is this finding well-supported by the cited evidence?" prompt. If both pass and final confidence > 0.8, post as a blocking comment. 0.5-0.8 posts as a non-blocking note. Below 0.5 goes to a weekly digest the security team reviews offline.

The actual numbers from one quarter on one project:

| Confidence bucket | Volume | Precision (human-confirmed real) |
|---|---|---|
| ≥0.8 | 4 findings / week | 78% |
| 0.5-0.8 | 11 / week | 41% |
| <0.5 | 30+ / week | 9% |

The 30+ low-confidence findings are exactly the ones that would have buried the high-confidence ones if everything got posted at the same volume. Keeping them out of the PR but visible in a digest preserves the signal without polluting the review surface.

## Escalation is the actual product

The AI reviewer is one source of input to code review. The reviewer that already exists — the senior engineer who knows this code — is the other one. The system has to make their job easier, not noisier.

What that looks like in practice:

- High-confidence findings post as suggestions with the exact diff range, evidence quote, and reason. A human reviewer can accept, dismiss, or escalate to the security team.
- A "why this matters" line is mandatory in every comment. "Possible SQL injection" without "because line 42 concatenates `req.body.name` into a raw query" gets thrown away. The evidence is the load-bearing part.
- A dismiss-with-reason flow logs why humans rejected findings. That's the corpus the prompt gets tuned against next quarter.
- Nothing about style. Nothing about tests "should be added." Those are real things humans do better and the bot getting opinionated about them is what poisons trust.

## What to log so you can improve the system

The first iteration of an AI reviewer is going to be wrong in specific ways. You'll only know which ways if you log the right things:

- Scope, prompt version, and model version per finding.
- Confidence score, both self-rated and adjusted.
- Outcome — was it accepted, dismissed, dismissed-as-noise, escalated?
- Time between the comment and any of those outcomes.

Once you have that data, the loop is straightforward: high-volume scopes with low acceptance rate need tighter scoping. Low-volume scopes with high acceptance rate can probably be expanded. Scopes whose acceptance rate degrades over time are usually a signal that the codebase or its conventions moved and the prompt didn't.

## The thing I'd say to a team about to ship one

The temptation is to make the bot impressive — make it weigh in on everything, make it sound thoughtful, make the PR look reviewed. That's the path to engineers collapsing the section.

The version that earns trust comments less and is right more often when it does. Pick the two scopes where your codebase actually bleeds. Anchor a rubric to specific failure modes. Gate posting by calibrated confidence. Log every outcome so you can tighten the prompts against your own ground truth. That's the system that gets read.

The goal isn't to replace code review. It's to claw back the part of code review that's currently spent scanning diffs for predictable risks, so the humans get to spend their time on the judgment calls only they can make.
