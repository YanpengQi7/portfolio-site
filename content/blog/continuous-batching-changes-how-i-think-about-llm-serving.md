---
title: Continuous Batching Changes How I Think About LLM Serving
subtitle: The biggest cost wins I've seen on self-hosted LLM serving came from the scheduler, not the model.
date: 2025-08-21
readingTime: 8 min read
tags:
  - LLM Serving
  - Continuous Batching
  - Systems
featured: false
---

# Continuous Batching Changes How I Think About LLM Serving

The first time I benchmarked a self-hosted Llama-3-8B on an A100, I assumed the throughput ceiling was about the model. Quantize harder, shard differently, swap kernels. The ceiling turned out to be the batcher.

I had a naive HuggingFace `generate` loop with a batch size of 8, serving prompts of mixed length. Measured throughput sat around 540 output tokens/sec across the batch. After switching to vLLM with continuous batching and PagedAttention, on the same GPU, same model, same quantization, throughput went to roughly 3,100 tokens/sec under the same request mix. About a 5.7× lift with no model change.

That number stopped me being clever about LLM cost for a while. The model was running the same arithmetic. The serving stack was just no longer wasting the GPU.

## Why static batching leaks so much

Autoregressive decoding is per-token. In a static batch of 8 sequences with output lengths {32, 40, 50, 64, 80, 96, 200, 512}, the slot that finishes at token 32 sits idle for 480 more steps while the longest sequence runs out. Average slot utilization on that batch is around 26%. The GPU is doing the same forward pass 8-wide, but most of those lanes are decoding padding.

You see this immediately on a `nvidia-smi` trace: SM utilization is high, but tokens/sec/$ is terrible because most of the SM activity is computing tokens nobody will use.

<figure class="my-10">
<svg viewBox="0 0 720 260" xmlns="http://www.w3.org/2000/svg" class="w-full rounded-xl border border-white/10 bg-white/[0.02]">
  <g font-family="ui-sans-serif, system-ui" fill="#cbd5e1" font-size="11">
    <text x="20" y="28" font-size="13" fill="#e2e8f0" font-weight="600">Static batching</text>
    <text x="380" y="28" font-size="13" fill="#e2e8f0" font-weight="600">Continuous batching</text>
    <g>
      <rect x="20" y="50" width="80" height="14" fill="oklch(0.72 0.18 210 / 60%)"/>
      <rect x="100" y="50" width="240" height="14" fill="#475569" opacity="0.4"/>
      <rect x="20" y="70" width="120" height="14" fill="oklch(0.72 0.18 210 / 60%)"/>
      <rect x="140" y="70" width="200" height="14" fill="#475569" opacity="0.4"/>
      <rect x="20" y="90" width="180" height="14" fill="oklch(0.72 0.18 210 / 60%)"/>
      <rect x="200" y="90" width="140" height="14" fill="#475569" opacity="0.4"/>
      <rect x="20" y="110" width="320" height="14" fill="oklch(0.72 0.18 210 / 60%)"/>
      <text x="180" y="140" fill="#94a3b8">↑ idle slots until longest finishes</text>
    </g>
    <g>
      <rect x="380" y="50" width="80" height="14" fill="oklch(0.72 0.18 210 / 60%)"/>
      <rect x="460" y="50" width="80" height="14" fill="oklch(0.65 0.16 280 / 60%)"/>
      <rect x="540" y="50" width="160" height="14" fill="oklch(0.7 0.16 160 / 60%)"/>
      <rect x="380" y="70" width="120" height="14" fill="oklch(0.72 0.18 210 / 60%)"/>
      <rect x="500" y="70" width="100" height="14" fill="oklch(0.65 0.16 280 / 60%)"/>
      <rect x="600" y="70" width="100" height="14" fill="oklch(0.7 0.16 160 / 60%)"/>
      <rect x="380" y="90" width="180" height="14" fill="oklch(0.72 0.18 210 / 60%)"/>
      <rect x="560" y="90" width="140" height="14" fill="oklch(0.65 0.16 280 / 60%)"/>
      <rect x="380" y="110" width="320" height="14" fill="oklch(0.72 0.18 210 / 60%)"/>
      <text x="540" y="140" fill="#94a3b8">↑ finished slots admit new sequences</text>
    </g>
    <text x="20" y="180" fill="#94a3b8">A slot is one sequence's decode lane across time. Static batching pads with nothing.</text>
    <text x="20" y="198" fill="#94a3b8">Continuous batching swaps in the next waiting request on the same step.</text>
    <text x="20" y="230" fill="#64748b" font-size="10">Bars are notional. Real benefit depends on request-length variance and KV memory.</text>
  </g>
</svg>
</figure>

Continuous batching, the Orca-style iteration-level scheduling that vLLM and TGI adopted, breaks the "batch" into something dynamic. Per decode step, the scheduler asks: which sequences are still running, which finished, which can I admit from the queue? A request finishing at step 32 frees its slot at step 33, and step 33 already has a new prompt's prefill mixed in.

## Prefill and decode are different jobs

The serving stack has to treat them differently or it bottlenecks one with the other.

Prefill is one big matmul over the prompt. It's compute-bound, parallel across tokens, and finishes in one or two scheduler ticks for typical prompts. Decode is the iterative part: one token at a time, memory-bandwidth-bound, sensitive to batch size because that's where you amortize the weight loads.

Mixing them carelessly causes either head-of-line blocking (a 32k-token prefill starves decoders) or under-utilized decode steps (the scheduler waits for a clean batch). The serving systems that win measure these separately and either chunk prefills, prioritize decode, or run separated prefill/decode pools. The "disaggregated serving" work coming out of DeepSeek and others is a load-bearing version of the same idea.

## KV cache memory is usually the real ceiling

This is the one I keep seeing teams underestimate. On an 80GB A100 serving Llama-3-8B in fp16, the weights take ~16GB. The remaining ~60GB is KV cache and overhead. At 4k context, each sequence's KV cache for that model is on the order of 0.5GB. Naively, that's ~120 concurrent sequences max. In practice, fragmentation in a slab allocator can cap you at half of that long before you hit the math limit.

PagedAttention solved this by treating KV cache like virtual memory: fixed-size blocks, paged, no contiguous-allocation requirement. That's the part of vLLM that gets less press than continuous batching but matters just as much — without it, the batcher would still be blocked on memory it can't allocate.

The reason that 5.7× number above is real and not a benchmark trick is that the two changes compound. Better scheduling lets you keep more sequences in flight; better memory layout lets you actually fit them.

## What this changes for product teams

I stopped accepting "the model is too expensive" as a finished diagnosis. The right next question is: are you actually utilizing the GPU you're paying for?

The signal I look at first when someone hands me a serving cost problem:

- Average batch size during peak. If it's <8 on a model that fits 32+ in KV, the scheduler is the problem before the model is.
- Prefill latency p95 vs decode latency p95. If they're conflated in your metrics, you can't fix either.
- Token throughput per dollar. Not tokens per second. Per dollar of provisioned compute, which is what the bill is denominated in.

A team I worked with was about to upgrade from A100s to H100s to "fix" their throughput. The H100 would have helped maybe 1.5×. Switching their serving stack helped 4×. They didn't need the new hardware that quarter.

## Where Kubernetes doesn't help

Kubernetes is fine for the lifecycle around a serving binary: rolling deploys, isolation, autoscaling on the right metric. It does not improve the scheduler inside the model server. I've seen teams put vLLM in a Deployment, autoscale on GPU utilization, and then be confused that latency spikes when concurrency grows. GPU utilization isn't the metric; queue depth and KV-cache pressure are.

If the batcher is weak, no orchestrator wraps around it and makes the inside work better.

## My working view

The biggest LLM-serving wins available to most teams today still sit at the scheduling and memory layer, not the model layer. That's not an exciting answer — nobody puts "tuned the batcher" on their roadmap. But it's where the leverage is right now, and it's reachable without retraining anything.

If you self-host inference and you haven't profiled your batcher in the last quarter, that's probably the cheapest performance work on your backlog.
