---
title: Kubernetes, Lambda, and Fargate Are Different Abstractions, Not Just Different Services
subtitle: The right choice starts with control boundaries, workload shape, and operational ownership.
date: 2024-09-12
readingTime: 8 min read
tags:
  - AWS
  - Kubernetes
  - Lambda
  - Fargate
featured: false
---

# Kubernetes, Lambda, and Fargate Are Different Abstractions, Not Just Different Services

People often compare Kubernetes, Lambda, and Fargate as if they are three versions of the same thing.

They are not.

The more useful way to think about them is as different abstraction boundaries:

- Lambda abstracts the server and most of the runtime model around short-lived functions.
- Fargate abstracts the server for containers, while keeping container boundaries and service structure visible.
- Kubernetes gives you a control plane for orchestrating containers, which means much more flexibility and much more responsibility.

That framing makes the tradeoffs easier to reason about.

## Lambda: Best When the Unit of Work Is an Event

AWS's decision guide says Lambda is designed for event-driven, short-duration tasks and has a maximum execution time of 15 minutes.

That means Lambda is a great fit when:

- requests are naturally stateless
- scaling should happen per event
- you want tight integration with event sources like S3, API Gateway, DynamoDB Streams, or EventBridge

```ts
export async function handler(event: { key: string }) {
  const document = await loadFromS3(event.key)
  const summary = await summarize(document)
  await persistResult(event.key, summary)
}
```

This is simple, elastic, and operationally cheap. It becomes less attractive when you need persistent processes, complex runtimes, or long-running jobs.

## Fargate: Best When the Unit of Work Is a Containerized Service

AWS describes Fargate as serverless compute for containers, typically with ECS and also with EKS. It is a strong fit when you want container boundaries without managing EC2 nodes.

I like Fargate when:

- I want to package the full runtime into a container
- the workload runs longer than a Lambda should
- the service needs explicit CPU and memory sizing
- I want less infrastructure management than self-managed Kubernetes nodes

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: retrieval-worker
spec:
  containers:
    - name: worker
      image: my-registry/retrieval-worker:latest
      resources:
        requests:
          cpu: "1"
          memory: "2Gi"
```

With EKS on Fargate, AWS manages the compute side, but the pod model is still Kubernetes.

## Kubernetes: Best When You Actually Need a Platform

Kubernetes is the right answer when the problem is not "where do I run this code?" but "how do I operate many containerized workloads with consistent policy, deployment, networking, and scaling patterns?"

The upside:

- workload orchestration
- rich deployment controls
- service discovery
- autoscaling
- ecosystem and policy surface

The cost:

- more operational complexity
- more platform design decisions
- more failure modes

I do not think Kubernetes is automatically a sign of maturity. It is a sign that the organization has decided platform control is worth the extra complexity.

## EKS on Fargate Is a Specific Middle Ground

AWS's EKS documentation says Fargate removes the need to manage node groups, but it also comes with constraints. For example, Fargate on EKS does not support daemonsets, privileged containers, GPUs, or EBS volume attachment for pods.

That makes the choice clearer:

- if you need Kubernetes primitives but not full node management, EKS on Fargate can be attractive
- if you need lower-level flexibility, special workloads, or broader cluster features, node-based EKS is often the better fit

## My Practical Heuristic

I would usually choose like this:

- Lambda for event-driven functions and bursty glue logic
- Fargate for long-running containerized services where I want less ops burden
- Kubernetes when the real problem is platform standardization and workload orchestration

The important thing is not picking the most sophisticated option. It is picking the abstraction that matches the job.

That is what keeps systems understandable.
