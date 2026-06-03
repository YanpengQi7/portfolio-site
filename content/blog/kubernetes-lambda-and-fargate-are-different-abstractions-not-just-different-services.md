---
title: Kubernetes, Lambda, and Fargate Are Different Abstractions, Not Just Different Services
subtitle: They're not three flavors of the same thing. They're different deals about what you own versus what AWS owns. The right pick depends on which parts of that deal you actually want.
date: 2024-09-12
readingTime: 9 min read
tags:
  - AWS
  - Kubernetes
  - Lambda
  - Fargate
featured: false
---

# Kubernetes, Lambda, and Fargate Are Different Abstractions, Not Just Different Services

The comparison gets framed as if you're picking a service. You're not. You're picking how much of the runtime and operating surface you want to own, and what kind of work you want the rest of your team to be doing six months from now.

Lambda, Fargate, and Kubernetes sit at three different points on that ownership curve. Once you see them that way, the "which one should I use" question turns into a different question — *which surface am I willing to operate?* — and the answer falls out almost mechanically.

<figure class="my-10">
<svg viewBox="0 0 720 260" xmlns="http://www.w3.org/2000/svg" class="w-full rounded-xl border border-white/10 bg-white/[0.02]">
  <g font-family="ui-sans-serif, system-ui" fill="#cbd5e1" font-size="11">
    <text x="360" y="28" text-anchor="middle" font-size="13" fill="#e2e8f0" font-weight="600">What you own vs. what AWS owns</text>
    <g>
      <line x1="60" y1="120" x2="660" y2="120" stroke="#475569" stroke-width="1"/>
      <text x="60" y="200" font-size="11" fill="#94a3b8">Less control</text>
      <text x="660" y="200" text-anchor="end" font-size="11" fill="#94a3b8">More control</text>
    </g>
    <g transform="translate(60,70)">
      <circle r="14" fill="oklch(0.7 0.16 160 / 60%)" stroke="oklch(0.7 0.16 160)" cx="40" cy="50"/>
      <text x="40" y="22" text-anchor="middle" font-size="13" fill="#e2e8f0" font-weight="600">Lambda</text>
      <text x="40" y="100" text-anchor="middle">function</text>
      <text x="40" y="116" text-anchor="middle" fill="#94a3b8">runtime: AWS</text>
      <text x="40" y="132" text-anchor="middle" fill="#94a3b8">scaling: AWS</text>
      <text x="40" y="148" text-anchor="middle" fill="#94a3b8">15-min cap</text>
    </g>
    <g transform="translate(260,70)">
      <circle r="14" fill="oklch(0.65 0.16 280 / 60%)" stroke="oklch(0.65 0.16 280)" cx="100" cy="50"/>
      <text x="100" y="22" text-anchor="middle" font-size="13" fill="#e2e8f0" font-weight="600">Fargate</text>
      <text x="100" y="100" text-anchor="middle">container, no nodes</text>
      <text x="100" y="116" text-anchor="middle" fill="#94a3b8">runtime: you</text>
      <text x="100" y="132" text-anchor="middle" fill="#94a3b8">scaling: you (HPA-style)</text>
      <text x="100" y="148" text-anchor="middle" fill="#94a3b8">long-running OK</text>
    </g>
    <g transform="translate(540,70)">
      <circle r="14" fill="oklch(0.72 0.18 30 / 60%)" stroke="oklch(0.72 0.18 30)" cx="60" cy="50"/>
      <text x="60" y="22" text-anchor="middle" font-size="13" fill="#e2e8f0" font-weight="600">EKS / k8s</text>
      <text x="60" y="100" text-anchor="middle">cluster + control plane</text>
      <text x="60" y="116" text-anchor="middle" fill="#94a3b8">runtime: you</text>
      <text x="60" y="132" text-anchor="middle" fill="#94a3b8">scaling, scheduling: you</text>
      <text x="60" y="148" text-anchor="middle" fill="#94a3b8">policy surface, all of it</text>
    </g>
  </g>
</svg>
</figure>

## Lambda: a deal about the runtime

The Lambda deal is straightforward. AWS owns the runtime, the scaling, the OS, the patching, the cold-start machinery. You own a function. You don't get to keep state, you don't get to run for more than 15 minutes, you don't get to choose how your code is packaged beyond the rules of the platform.

In exchange you get scale-to-zero, scale-to-thousands, and nothing to operate when traffic is zero.

When that deal is good:

- The unit of work is genuinely an event — a file arrived, a webhook fired, a queue has a message, a cron tick happened.
- Throughput is wildly variable. Lambda costs nothing at idle and scales out by the thousands without you doing anything.
- The runtime fits comfortably inside what Lambda likes (sane package size, no long-lived connections, no weird native dependencies).

When the deal goes bad: when the work doesn't fit the function model. A two-hour ETL job in Lambda is a Lambda misuse. A websocket server is a misuse. A binary with 4GB of CUDA libraries is a misuse. The right answer in those cases is to stop trying to bend the workload to fit the function and pick the abstraction that wants a long-running process.

```ts
// The Lambda shape: short, stateless, one event in, side-effects out.
export async function handler(event: { key: string }) {
  const document = await loadFromS3(event.key)
  const summary = await summarize(document)
  await persistResult(event.key, summary)
}
```

## Fargate: a deal about the host

Fargate is the deal where AWS owns the host and you own the container. You package your code however you want. You set CPU and memory explicitly. You write a task definition. You scale it. You configure the health checks. AWS makes sure there's somewhere to run the container, gives you a network interface, and bills you per second per task.

The big difference from Lambda is conceptual: Fargate doesn't pretend your work is a function. It's a long-lived process holding connections and serving requests, the same shape your application has been since the 1990s. You think about it the same way you'd think about a Linux box, except the Linux box isn't your problem.

When this deal is good:

- The service is meant to run continuously. APIs, queue workers, background processors, anything that holds connection state.
- You want explicit, predictable resource sizing — 2 vCPU and 4GB, not whatever the runtime decides today.
- You want container discipline (immutable images, per-task IAM, repeatable deploys) without the cost of node operations.

When it stops fitting: when you actually need something Fargate doesn't give you. GPUs aren't in the deal as of this writing. Daemonset-style sidecars on every host aren't a fit. Heavy local-disk workloads aren't a fit. If you find yourself fighting Fargate's constraints, the system is asking for a different abstraction.

## Kubernetes: a deal about owning the platform

Kubernetes isn't a service. It's an operating model you put on top of compute. The deal is that you take on the cluster, the control plane (managed by EKS, but still yours to operate at the workload level), the policy surface, the networking model, the upgrade cycle, and in exchange you get one consistent primitive for running anything.

That deal is good when you have *anything* to run. Many services. Many teams. Workloads with different shapes that need consistent scheduling, networking, and policy. Operations like canary deploys, mesh-level mTLS, fleet-wide observability — things that are real wins at scale and pointless overhead for three services.

EKS-on-Fargate is a hybrid version of the deal: you get the Kubernetes API surface and lose the node operations. It's a genuinely useful middle ground for teams that want pod-level abstractions without managing a node fleet. The constraints are documented and they are real — no daemonsets, no GPUs, no privileged containers, no EBS volume attachment for pods. Inside those constraints, it's a thoughtful product.

The version of this deal that goes wrong is when a team adopts Kubernetes for one or two services. The platform surface is the whole point. If you're not using it, you're paying for it anyway.

## The three deals side-by-side

| | Lambda | Fargate | EKS |
|---|---|---|---|
| Unit of deployment | function | container task | pod |
| You own the runtime? | no | yes (image) | yes (image) |
| You own the OS? | no | no | partially (you control kubelet/node config on EC2 nodes) |
| Max single execution | 15 min | unbounded | unbounded |
| Scale to zero | yes (free) | possible but loses warm capacity | usually no, in practice |
| Local state | no | per-task ephemeral | per-pod ephemeral, plus volumes |
| Sweet spot | events, glue, bursty handlers | long-running services | platform for many services |
| Where it goes wrong | bending non-function work into functions | trying to do GPU or per-host things | adopting it for too few services |

## What I'd ask before picking

A short list of the questions that have actually decided this for me, in order:

- How long does one piece of work run? (15-minute boundary matters.)
- Is the work event-shaped or service-shaped? (Function vs long-running process.)
- How many independent services will this team operate in 12 months? (One or two: Fargate. Twenty: maybe EKS.)
- Do I need GPUs, daemonsets, custom networking, or shared-host scheduling tricks? (Yes: EKS with nodes.)
- Who's on call for the infrastructure layer? (If it's "everyone, sometimes," keep the surface small.)

The decision that consistently aged well in my experience was the one that matched workload shape to abstraction shape and didn't try to be clever about the rest. Picking the most sophisticated option you can defend isn't architecture. Picking the simplest one that fits is.
