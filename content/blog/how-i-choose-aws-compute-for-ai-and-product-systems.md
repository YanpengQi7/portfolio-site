---
title: How I Choose AWS Compute for AI and Product Systems
subtitle: The right AWS compute choice usually comes from workload shape, runtime control, latency goals, and ops appetite.
date: 2024-11-03
readingTime: 8 min read
tags:
  - AWS
  - Architecture
  - Infrastructure
featured: false
---

# How I Choose AWS Compute for AI and Product Systems

I do not think there is a single "best" AWS compute service.

The better question is: what kind of workload am I running, and what kind of operational ownership am I willing to take?

That question usually narrows the answer quickly.

## Step 1: Classify the Workload

Before I think about services, I classify the workload itself.

```ts
type WorkloadShape =
  | 'event-driven'
  | 'request-response-api'
  | 'long-running-service'
  | 'batch-job'
  | 'platform-workload'

type Constraints = {
  maxDurationMinutes?: number
  needsContainerControl: boolean
  needsKubernetesFeatures: boolean
  trafficPattern: 'steady' | 'bursty' | 'spiky'
}
```

Most compute debates become easier once these properties are explicit.

## When I Like Lambda

I like Lambda when the task is:

- short-lived
- stateless
- naturally event-driven
- not dependent on complex runtime packaging

Examples:

- file processing
- webhook handling
- scheduled checks
- lightweight API handlers

Lambda is often excellent for glue logic and bursty traffic, especially when idle time would make always-on infrastructure wasteful.

## When I Like Fargate

I like Fargate when I need:

- container packaging
- long-running services
- explicit resource sizing
- simpler operations than managing EC2-backed container clusters

Examples:

- internal microservices
- retrieval workers
- background processors
- APIs with non-trivial runtime dependencies

Fargate is also a good fit when a team wants the discipline of containers without the full operational surface area of Kubernetes nodes.

## When I Like Kubernetes or EKS

I like Kubernetes when the problem is platform consistency across many workloads, not just deployment of one service.

That usually means:

- multiple teams
- deployment policy requirements
- shared operational patterns
- standardized service and workload primitives

If I only have one or two services, Kubernetes is often too much. If I am building a platform that many services will live on, it starts making more sense.

## AI Systems Add New Selection Pressure

AI products change the decision a little because workload cost is more uneven.

I care about:

- request variance
- token volume
- external model latency
- whether tasks can be split into event-driven stages

A common pattern I like is mixing compute models:

```ts
const architecture = {
  ingestion: 'Lambda',
  apiLayer: 'Fargate',
  heavyOfflineJobs: 'Fargate or Batch',
  sharedPlatform: 'EKS when platform complexity is justified',
}
```

That is often better than trying to force the whole system into one compute abstraction.

## The Selection Questions I Actually Ask

These questions are usually enough:

- Does this need to run for more than 15 minutes?
- Is container control important?
- Is the traffic bursty enough that pay-per-invocation is a big win?
- Is this one service, or a growing platform surface?
- Do I need Kubernetes features, or do I just think they sound mature?

That last question saves a lot of pain.

## My Bias

My default bias is toward the simplest abstraction that still fits the workload.

I would rather explain clearly why a system uses Lambda plus Fargate than explain why a small product needed a full Kubernetes platform on day one.

Good architecture is usually not about picking the fanciest service. It is about choosing the one whose failure modes your team can actually operate.
