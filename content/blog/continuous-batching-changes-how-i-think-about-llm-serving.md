---
title: Continuous Batching Changes How I Think About LLM Serving
subtitle: Better LLM serving is often a scheduling and memory problem before it becomes a model problem.
date: 2025-08-21
readingTime: 7 min read
tags:
  - LLM Serving
  - Continuous Batching
  - Systems
featured: false
---

# Continuous Batching Changes How I Think About LLM Serving

One of the most useful serving ideas in modern LLM infrastructure is continuous batching.

The key intuition is simple: if one sequence in a generation batch finishes, the system should not leave that slot idle while waiting for the longest sequence to complete. It should admit a new sequence into the next generation step.

That sounds obvious after you hear it. It is still a big shift in how to think about serving.

## Why Static Batching Leaves Performance Behind

Autoregressive generation is iterative. Requests in the same batch do not finish at the same time.

With static batching, shorter sequences stop using useful capacity, but their slots cannot be repurposed until the batch is completely done. That leaves the GPU underutilized.

The Anyscale article on continuous batching explains this clearly and also points to Orca-style iteration-level scheduling as the core idea behind newer LLM serving systems.

## Prefill and Decode Are Different Workloads

Another useful mental model is separating:

- prefill: ingesting the prompt
- decode: generating tokens one step at a time

Those phases stress the system differently. Prefill is more parallel. Decode is iterative and sensitive to scheduling.

That is why good serving systems think carefully about queueing and admission instead of treating every inference step the same way.

## The Simplified Scheduler

At a high level, the serving loop looks something like this:

```python
while True:
    finished = [seq for seq in active if seq.is_complete()]
    for seq in finished:
        active.remove(seq)

    while waiting and len(active) < max_batch_size:
        active.append(waiting.pop(0))

    if not active:
        continue

    run_decode_step(active)
```

Real systems are more complicated than this, especially because prompt ingestion and KV-cache memory management matter a lot. But the simplified loop captures the idea.

## Memory Layout Is the Quiet Multiplier

Continuous batching gets even better when paired with smarter KV-cache management.

This is why systems like vLLM became so important. The serving gains are not just about scheduling more cleverly. They are also about allocating memory in a way that reduces waste and keeps batch sizes higher.

That combination changes both throughput and latency characteristics.

## What This Means for Product Teams

The practical takeaway is that model serving cost is not just "price per token".

It is also a function of:

- sequence length variance
- queueing policy
- memory fragmentation
- batch admission logic
- saturation behavior under load

Teams that ignore serving architecture often end up paying for bigger hardware before they fix the scheduler.

## Where Kubernetes Helps and Where It Does Not

Kubernetes can help with:

- workload isolation
- deployment safety
- autoscaling policies
- operational consistency

But Kubernetes does not solve the serving problem itself.

If the batching policy is weak, putting the server in a `Deployment` does not make it efficient. The scheduler inside the model server still matters more.

## My Working View

For LLM products, I now think about serving as a systems problem first:

- scheduling
- memory
- queueing
- admission control

That does not replace model optimization. It just means the biggest wins are often one layer lower than people expect.
