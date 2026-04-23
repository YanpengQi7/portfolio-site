---
title: Model Routing Is a Product Decision, Not Just an Optimization
subtitle: Routing works best when it reflects task shape, latency tolerance, and quality requirements.
date: 2025-11-16
readingTime: 5 min read
tags:
  - Model Routing
  - AI Product
  - Cost Engineering
featured: true
---

# Model Routing Is a Product Decision, Not Just an Optimization

A lot of model routing conversations start with cost. That makes sense, but it is incomplete.

The better way to think about routing is this: different tasks deserve different levels of reasoning, latency, and spend. Routing is product design expressed as infrastructure.

## Not Every Call Deserves the Same Model

In a real AI workflow, tasks are uneven.

Some steps are cheap classification problems:

- intent labeling
- metadata extraction
- simple rewriting

Others are expensive reasoning problems:

- synthesis across multiple retrieved sources
- long-form critique
- research planning
- evaluation and judgment

Running the same model on all of them is usually lazy architecture.

## The Best Routing Logic Starts with Task Tags

I prefer tagging model calls by job type instead of letting routing emerge from ad hoc conditions.

Examples:

- `retrieve-and-summarize`
- `evaluate-draft`
- `deep-research`
- `structured-extraction`

Once calls are tagged, routing becomes easier to reason about. You can map tags to:

- target model
- max tokens
- latency budget
- retry policy
- evaluation threshold

That turns model selection into something observable instead of magical.

## Cheap Models Are Good When Failure Is Contained

I am happy to use a cheaper model when the task has one of these properties:

- output is easy to validate
- downstream stages can correct errors
- user impact is low if the result is imperfect

I am much less aggressive when the step is user-visible and hard to verify. That is where quality debt shows up fastest.

## Routing Only Matters If You Measure the Right Things

A routing layer should not just tell you what model was called. It should tell you whether the decision was actually good.

The metrics I care about are:

- cost by task tag
- latency by task tag
- evaluation score by task tag
- fallback rate
- human correction rate on user-visible outputs

Without those, routing is just a clever-looking abstraction.

## The Hidden Benefit

Good routing forces you to understand your workflow at a deeper level.

You start asking better questions:

- Which steps actually require high reasoning?
- Which ones are mostly formatting?
- Where is quality essential, and where is speed more valuable?

That is why I like routing work. It improves both the system and the thinking behind the system.
