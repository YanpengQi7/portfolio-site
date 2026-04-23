---
title: AI Code Review in CI Needs Scopes, Rubrics, and Escalation
subtitle: The useful version of AI code review is constrained, observable, and humble about when humans should take over.
date: 2024-06-18
readingTime: 7 min read
tags:
  - CI/CD
  - Code Review
  - LLM Systems
featured: false
---

# AI Code Review in CI Needs Scopes, Rubrics, and Escalation

I like AI code review, but only when it knows what job it is doing.

The worst version is a bot that comments on everything with equal confidence. That creates noise and trains engineers to ignore it.

The better version is much narrower:

- look for a defined class of issues
- score findings against a rubric
- escalate only when confidence is high enough

That turns the model from a stylistic heckler into a useful reviewer.

## Start with Review Scope

I do not want one prompt that pretends to review all code quality dimensions at once.

I would rather split the problem into explicit scopes:

- security-sensitive changes
- risky concurrency or async patterns
- error handling regressions
- API contract changes

That usually leads to cleaner prompts and more stable behavior.

```ts
type ReviewScope =
  | 'security'
  | 'correctness'
  | 'api-contract'
  | 'operability'

type ReviewRequest = {
  scope: ReviewScope
  diff: string
  touchedFiles: string[]
}
```

The important thing is not the exact types. It is making the model review a bounded task.

## Rubrics Beat Vibes

If you want reliable output, the model should evaluate against explicit criteria instead of "tell me what looks wrong".

For example:

```ts
const rubric = {
  security: [
    'Does the diff introduce unvalidated input into privileged operations?',
    'Does the diff weaken authorization, secret handling, or data isolation?',
  ],
  correctness: [
    'Can the change break an existing control flow or edge case?',
    'Does the diff create a mismatch between producer and consumer assumptions?',
  ],
}
```

This does two things:

- makes outputs more comparable across runs
- gives humans a better reason to trust the comments

## Escalation Matters More Than Coverage

I do not need the AI to catch everything.

I do need it to avoid spamming low-quality comments into the main review flow. A useful system is selective.

That is why I like a tiered output model:

- high confidence findings block or request human attention
- medium confidence findings get summarized
- low confidence findings stay out of the way

## The Human Review Loop Should Be Designed In

An AI reviewer should not behave like the final authority.

It should produce artifacts that make human review faster:

- a short risk summary
- exact diff locations
- why the issue matters
- what evidence in the code triggered the finding

That is much better than vague advice about best practices.

## What I Would Log

The system is not mature unless it can be audited.

I would log:

- review scope
- model used
- confidence score
- outcome after human review
- false positive category

That gives you the data to improve prompts and reduce noise over time.

## The Standard I Care About

The goal is not to replace code review.

The goal is to compress the time engineers spend scanning for predictable risk, while leaving judgment, tradeoffs, and architecture calls where they belong: with people.
