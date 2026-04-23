---
title: Capacity Planning for AI Products Starts with Traffic Shape
subtitle: AI systems are expensive in the wrong places, so capacity planning has to begin with request shape, not just average QPS.
date: 2024-02-08
readingTime: 7 min read
tags:
  - Capacity Planning
  - AI Infrastructure
  - Kubernetes
featured: false
---

# Capacity Planning for AI Products Starts with Traffic Shape

Classic capacity planning often starts with average load. That is a useful number, but it is not the number that hurts you first.

For AI products, the more important questions are:

- What is the burst pattern?
- How variable are prompt and response sizes?
- Which steps are CPU-bound, GPU-bound, or network-bound?
- Which paths degrade gracefully, and which ones fail hard?

I like to think of AI capacity planning as workload segmentation, not one big throughput problem.

## Why AI Traffic Is Weird

Two requests at the same endpoint can have very different costs.

One user may ask for a short classification. Another may trigger retrieval, web research, tool calls, and a long synthesis. Treating those as the same "request" hides the real shape of the system.

That is why I prefer capacity models that estimate cost per path, not just requests per second.

## The Minimum Useful Model

At a practical level, I want every critical path to have a rough cost model:

```ts
type RequestClass = 'cheap' | 'standard' | 'heavy'

type CostModel = {
  cpuMs: number
  memoryMb: number
  externalCalls: number
  llmTokensIn: number
  llmTokensOut: number
}

const costByClass: Record<RequestClass, CostModel> = {
  cheap: { cpuMs: 40, memoryMb: 32, externalCalls: 0, llmTokensIn: 200, llmTokensOut: 60 },
  standard: { cpuMs: 140, memoryMb: 96, externalCalls: 2, llmTokensIn: 1600, llmTokensOut: 350 },
  heavy: { cpuMs: 260, memoryMb: 160, externalCalls: 5, llmTokensIn: 5000, llmTokensOut: 1200 },
}
```

This is not meant to be perfectly precise. It is meant to force clarity.

## Peak Readiness Is Usually an Enumeration Problem

A lot of planning pain comes from not knowing what actually exists in the system.

One of the most practical things I have done is build pipelines that:

- enumerate endpoints automatically
- pull historical traffic
- group by feature or path
- model growth assumptions separately

That approach is much more credible than arguing from intuition in a spreadsheet.

## Where Kubernetes Fits

Kubernetes is not the point of capacity planning, but it becomes useful once you need control over scheduling and isolation.

The parts I care about most are:

- separate workloads by behavior, not by organizational chart
- use requests and limits that reflect real resource profiles
- autoscale on the metric that actually predicts pain
- keep background jobs from stealing headroom from user-facing paths

For example:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: retrieval-api
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: retrieval-api
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 65
```

This is useful only if the workload is actually CPU-sensitive. If latency is dominated by model calls or queueing, CPU autoscaling alone gives false confidence.

## The Metrics I Trust

For AI-heavy systems, I care about these more than a single QPS number:

- p95 and p99 latency by request class
- queue depth
- token volume in and out
- cache hit rate
- external dependency latency
- saturation during burst events

If you do not segment by request class, the averages will flatter you.

## The Real Goal

Good capacity planning is not about proving the system is fine.

It is about knowing where the system bends, what gets degraded first, and which levers you can safely pull when traffic spikes. That is what makes peak readiness feel engineered instead of ceremonial.
