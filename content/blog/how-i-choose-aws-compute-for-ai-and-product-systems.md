---
title: How I Choose AWS Compute for AI and Product Systems
subtitle: A field guide written after a few too many migrations between Lambda, Fargate, and EKS. The lesson keeps being "match the abstraction to the workload, not your résumé."
date: 2024-11-03
readingTime: 9 min read
tags:
  - AWS
  - Architecture
  - Infrastructure
featured: false
---

# How I Choose AWS Compute for AI and Product Systems

I've migrated production workloads in both directions between Lambda and Fargate, and from self-managed Kubernetes to EKS-on-Fargate and back. The decisions that aged well were the ones where the team picked the abstraction that matched the workload's actual shape. The decisions that aged badly were almost always driven by what the team wanted to learn, or what looked good on an architecture diagram for a future state that never arrived.

This is the working heuristic I use now, written out so I can argue with it later.

## The questions I ask before I look at services

Before "Lambda vs Fargate vs EKS," I want concrete answers to four things. They're boring and they decide most of it.

1. **How long does a single unit of work run?** Under a second, under a minute, under fifteen minutes, longer? Lambda has a hard 15-minute cap and gets expensive on long-running compute regardless of timeout. Anything routinely past that bracket forces containers.
2. **What's the traffic shape?** Steady? Bursty by 10×? Spiky by 100×? Idle most of the day? Cold-start tolerance correlates strongly with this — a webhook handler that fires twice an hour shouldn't be paying for a warm container.
3. **What's the runtime footprint?** Python with a few pip packages, or a container with CUDA drivers, system binaries, and a 2GB model? Lambda's package size limits and the friction of custom runtimes start to bite around the 250MB unzipped mark.
4. **Who operates this in six months?** If it's the same two engineers, simplicity wins. If it's a platform team supporting 30 services, the surface that pays for Kubernetes' overhead is "we have many services that all want the same primitives."

If I can answer those, the service usually picks itself. The rest of this post is what that picking looks like in practice.

## Lambda: still the right answer more often than people admit

I default to Lambda for anything event-driven, short, and stateless. The places it has earned that default for me:

- S3 → process → DynamoDB pipelines, where each event is independent and finishes in under a few seconds.
- Webhook receivers that need to scale from 1 to 10,000 RPS for ten seconds and then go back to zero. Pay-per-invocation makes this nearly free at idle.
- Cron jobs for cleanup, syncing, or reporting, where "spin up a container" is more infra than the job deserves.
- API handlers that are CRUD with light transformation, deployed behind API Gateway or a Lambda Function URL.

What pushes me off Lambda, in order of how often it actually does:

- The job needs >15 min. Sometimes this is real, sometimes it's a sign the job should be split.
- Cold starts matter for the user, and the runtime + dependencies don't fit in a snappy bootstrap. Provisioned concurrency exists; it also undoes the pay-per-invocation case.
- The team starts wanting "just normal sockets" — a long-lived connection pool, a websocket server, an actually-stateful queue consumer.
- The deployment package is wrestling itself. By the time I'm building custom runtimes to fit native deps, I'd rather be in a container.

The mistake I see most often is leaving something on Lambda for two years past when it should have moved, because the migration "isn't worth it." It usually is.

## Fargate: the boring middle that does most of the work

For long-running services, my default is ECS on Fargate. It's the abstraction I reach for when I want "containers without nodes."

What it earns its keep on:

- Internal microservices and APIs where I want explicit CPU/memory sizing and predictable scale-out behavior.
- Background workers consuming from SQS that need to hold connections, batch work, and run for hours.
- Retrieval workers, embedding pipelines, and any AI-adjacent component that needs a real Python runtime with CUDA-free models or a packaged model artifact.
- Anything where the team wants the container discipline of immutable images and per-service IAM without taking on node operations.

The places Fargate stops being the right answer:

- GPU workloads. As of this writing Fargate doesn't do GPUs; if you need them, you're on EC2-backed ECS, EKS with GPU nodes, or SageMaker.
- Workloads that benefit from local disk in serious quantity — Fargate ephemeral storage exists but isn't cheap or fast at scale.
- Anything that genuinely needs daemonset-style sidecars across every host, which Fargate's per-task model doesn't fit.

Cost-wise, Fargate's per-vCPU-hour is meaningfully higher than equivalent EC2. The break-even with self-managed EC2-on-ECS is usually around the point you're keeping containers running 24/7 and have headcount to operate the node fleet. For most teams under maybe 30-40 services, Fargate wins on total cost of ownership even though it loses on the line-item bill.

## Kubernetes (EKS): the right answer when the problem is platform, not service

I'll say this directly: most teams that adopted EKS in the last few years didn't need EKS. They needed Fargate or App Runner with a CI pipeline.

EKS is the right answer when:

- You're supporting many teams with many services, and the value of one consistent deploy primitive across all of them is meaningful.
- You actually use the policy and networking surface — admission controllers, service mesh, fine-grained network policy, GitOps-style fleet management.
- You have workloads that genuinely benefit from co-scheduling on shared hosts (GPU sharing, daemonset-style observability, sidecars-everywhere patterns).
- There's a platform team whose job is to operate the cluster, not "the on-call rotation does it on the side."

When it's wrong:

- You have three services. Each of them could be a Fargate task and you'd have one less full-time job to do.
- The team is using Kubernetes primitives at the level of "we have Deployments and Services" and nothing else. That's the Fargate feature set with a node fleet attached.
- You're paying a platform team to make Kubernetes look like Heroku for your application developers. At that point you might as well use the thing that already looks like Heroku.

EKS-on-Fargate is its own specific middle ground — Kubernetes API surface without managing nodes. It's a real option when you want pod-level abstractions but not the node operational load. The constraints are documented (no daemonsets, no GPUs, no privileged containers, no EBS volume attachment); if you can live inside those, it's worth a serious look.

## Where AI workloads change the calculation

AI changes two things about this decision. First, cost variance per request is much wider — a single inference call can be 100× the cost of a normal API call, and the pricing model on Lambda/Fargate (provisioned compute time) doesn't track that variance well. Second, you're often calling an external model, which means your local compute is mostly orchestrating and waiting on I/O.

The pattern I keep arriving at:

- Lambda for the ingestion edges — webhooks, S3 triggers, scheduled syncs that pull data in.
- Fargate for the API layer that does the LLM orchestration. It's holding connections, managing streaming responses, handling retries, and shouldn't be cold-starting per request.
- Fargate or Batch for heavy offline jobs — backfills, evals, training-data prep.
- EKS only when "platform" is the actual problem, usually around the point a team is operating shared GPU infrastructure for multiple workloads.

Most AI products I've worked on land on Lambda + Fargate + an external model provider, and the architecture diagram fits on one page. That's a good sign.

## The single best filter I apply

The question that has caught the most wrong answers, including some of my own, is this: **do I need these Kubernetes features, or do I just think they sound mature?**

Mature isn't a feature. Operating something your team can actually debug at 3 AM is a feature. Pick the abstraction whose failure modes you're willing to own, and the rest of the decision tends to clarify itself.
