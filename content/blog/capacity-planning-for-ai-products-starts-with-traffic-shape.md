---
title: Capacity Planning for AI Products Starts with Traffic Shape
subtitle: A single QPS number lied to me for a year. The thing that hurt at peak wasn't average load — it was the shape under it.
date: 2024-02-08
readingTime: 8 min read
tags:
  - Capacity Planning
  - AI Infrastructure
  - Kubernetes
featured: false
---

# Capacity Planning for AI Products Starts with Traffic Shape

The system was sized for "200 RPS at peak, with 2× headroom." We tested at 400 RPS in staging and it was fine. The first real Monday morning at scale, we held the same 200 RPS in aggregate and the synthesis path's p99 went from 4 seconds to 38. The dashboards said load was nominal. The bill said we'd over-provisioned. Both were technically true.

What actually happened: the aggregate number was masking a heavy-tail problem. The synthesis endpoint had ~3% of traffic by count and ~60% of compute by cost. At peak that 3% lined up with itself — multiple long-tail requests arriving inside the same minute — and the queue ahead of the LLM call grew faster than the workers could drain. The fix wasn't more capacity. It was finally treating "heavy" requests as their own class with their own pool, instead of averaging them into a single QPS number.

That experience changed how I think about capacity planning for anything where request cost varies by an order of magnitude or more. AI products are the loudest example. They're not the only one.

<figure class="my-10">
<svg viewBox="0 0 720 240" xmlns="http://www.w3.org/2000/svg" class="w-full rounded-xl border border-white/10 bg-white/[0.02]">
  <g font-family="ui-sans-serif, system-ui" fill="#cbd5e1" font-size="11">
    <text x="360" y="28" text-anchor="middle" font-size="13" fill="#e2e8f0" font-weight="600">Same endpoint. Three populations.</text>
    <g transform="translate(40,60)">
      <text x="0" y="0" fill="#94a3b8">cheap (60% of requests, 8% of cost)</text>
      <rect x="0" y="10" width="240" height="14" fill="oklch(0.7 0.16 160 / 60%)"/>
      <text x="245" y="22" font-size="10" fill="#94a3b8">~80ms p50</text>
    </g>
    <g transform="translate(40,110)">
      <text x="0" y="0" fill="#94a3b8">standard (37% of requests, 32% of cost)</text>
      <rect x="0" y="10" width="148" height="14" fill="oklch(0.65 0.16 280 / 60%)"/>
      <text x="153" y="22" font-size="10" fill="#94a3b8">~700ms p50</text>
    </g>
    <g transform="translate(40,160)">
      <text x="0" y="0" fill="#94a3b8">heavy (3% of requests, 60% of cost)</text>
      <rect x="0" y="10" width="12" height="14" fill="oklch(0.72 0.18 30 / 70%)"/>
      <text x="20" y="22" font-size="10" fill="#94a3b8">~4500ms p50 — these are the ones that bite</text>
    </g>
    <text x="40" y="216" font-size="10" fill="#64748b">A single "QPS" number averages the green bar with the orange one and tells you nothing about saturation.</text>
  </g>
</svg>
</figure>

## Why AI traffic breaks the average

Two requests at the same endpoint can differ in cost by 100× without looking different from the outside. One is a classification with a 200-token prompt and a 50-token answer. The other is a research synthesis with 5,000 tokens of retrieved context and 1,500 tokens of generation, plus three tool calls. Both show up as one tick on the requests-per-second graph.

The average-QPS framing assumes load is approximately stationary in cost. It's not. The right primitive for capacity planning here is *cost per request class*, and the right exercise is figuring out what your classes are.

For most systems I've worked on, three classes captures 95% of the variance:

- **Cheap**: classify, extract, simple rewrite. 50-300ms, near-zero external calls.
- **Standard**: retrieve-and-summarize, a single LLM call with grounding. 500-2000ms, 1-3 dependencies.
- **Heavy**: multi-step synthesis, research, planning agents. 3-15 seconds, 5+ dependencies, big token bills.

Once you've named the classes, every capacity decision gets clearer — pool sizing, autoscale metrics, SLOs, even quota policy. You stop arguing about "the system" and start arguing about three different sub-systems with three different constraints.

## What I actually measure

The QPS number isn't useless; it's just the lagging one. The ones that have predicted pain for me, in roughly the order they catch it:

- **Queue depth at the LLM-call layer.** When this rises and stays risen, you're going to see latency cliffs in the next two minutes. CPU usage and request rate often look fine while this is happening.
- **p95 and p99 latency by request class.** The aggregate p99 averages a frozen-heavy class with a fine cheap class. The per-class number tells you which one is broken.
- **Token volume in and out per minute.** This is the real "load" number for anything paying per-token. It correlates with cost long before it correlates with errors.
- **External dependency p95.** Vector DB, embedding API, model provider. When a dependency degrades by 200ms, the heavy class disproportionately eats it.
- **Cache hit rate, broken down by what's being cached.** Retrieval-cache hit rate tanking is a leading indicator for queueing pressure on the LLM workers.

If a dashboard only shows aggregate QPS and CPU, it'll lie to you the same way mine did. The shape is in the per-class breakdown.

## What concurrency math actually looks like for an LLM step

The instinct from classical capacity planning is to compute "needed concurrency = arrival rate × service time." That instinct is correct, and the trap is in service time. For an LLM call, service time is mostly the model provider's latency, which is mostly out of your control and varies with prompt length and model load.

Worked example. The heavy class arrives at 0.3 RPS sustained, with a 15 RPS minute-scale burst. Service time per heavy request averages 6s. Steady state needs ~2 in-flight workers. The burst needs *90*. If the heavy pool is sized for "2 with 2× headroom," the burst queues. The queue serves at 4 workers' service rate, and 90 - 4 = 86 requests pile up at the head until things drain.

The fix is one of:

- Pool the heavy class so it can scale to burst-size concurrency without contending with the cheap class.
- Cap heavy concurrency per user/session so a single client can't fill the queue.
- Shed heavy requests early when queue depth crosses a threshold, with an honest "this took too long, try again" rather than a 30s timeout the user will rage-click through.

All three usually end up applied. The "more capacity" answer doesn't, because heavy load is bursty enough that you'd be paying for idle workers most hours of the day.

## Where Kubernetes shows up — and where it doesn't help

Kubernetes is useful for the *isolation* part of this: separate Deployments for cheap and heavy, separate HPAs with separate metrics, separate resource requests so the scheduler doesn't pile them onto the same node.

The thing it doesn't fix is the metric you autoscale on. CPU utilization is a fine signal for the cheap class. It's the wrong signal for the heavy class, because heavy load is mostly waiting on external calls — CPU stays low while wall-clock latency goes through the roof. Autoscaling on queue depth, or on requests-in-flight per pod, predicts saturation better than CPU does for that workload.

```yaml
# What I actually want for the heavy pool — queue-depth driven, not CPU driven.
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata: { name: synthesis-pool }
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: synthesis-worker
  minReplicas: 4
  maxReplicas: 40
  metrics:
    - type: External
      external:
        metric: { name: synthesis_queue_depth }
        target: { type: AverageValue, averageValue: "3" }
```

That config says: if average queue depth across the pool stays above 3, scale up. CPU isn't mentioned. The actual saturation indicator is what we autoscale on.

## What a good capacity-planning artifact looks like

The deliverable from a capacity exercise shouldn't be "we can handle N RPS." It should be:

- A table of request classes with arrival rate (steady, burst), service time (p50, p95), and external dependencies per request.
- A concurrency budget per class, with explicit pool sizes and burst headroom.
- The metric each pool autoscales on, and why that metric is the saturation indicator.
- A degradation plan: which class sheds first when the system bends, and what the user sees when it does.

That artifact survives growth. "We can handle 200 RPS" doesn't, because it's already wrong by the next quarter and nobody can tell why.

## The thing I keep relearning

The capacity number that matters most isn't the one for the average request. It's the one for the request class that costs you the most per unit and arrives in correlated bursts. Find that class first. Plan for its burst, not the aggregate average. Everything else is easier once that's done.

Good capacity planning isn't about proving the system can take it. It's about knowing exactly which part bends, what gets shed when it bends, and what users see when it does. Anything less is a guess in a spreadsheet.
