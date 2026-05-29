---
title: AI Reliability Copilot
subtitle: Incident Response Copilot for SRE Triage
slug: ai-reliability-copilot
tech: [Next.js, TypeScript, AI SDK, Prompt Evals, Incident Response, Vercel]
status: Completed
year: 2026
featured: true
demoUrl: https://ai-reliability-copilot.vercel.app/
---

# AI Reliability Copilot

## What it is
An AI incident-response copilot for reliability and SRE workflows. Paste raw incident context from logs, metrics, on-call notes, or alert JSON, and the app returns a structured nine-section response covering summary, severity, root-cause hypotheses, investigation checklist, mitigation, postmortem, and follow-ups.

## Key Features
- **Structured incident analysis** — converts noisy alert context into a consistent reliability report.
- **Alert JSON parsing** — supports operational inputs from tools like Datadog, PagerDuty, and Sentry.
- **Scenario library** — includes sample incidents for DB pool exhaustion, OOM crashloops, and checkout error spikes.
- **Bilingual output** — supports English and Chinese triage workflows.
- **Eval surface** — exposes prompt versions and reliability scenarios for comparing output quality.
- **Production demo controls** — rate-limited demo flow designed for public deployment.

## Technical Focus
The product is shaped around high-pressure incident work: keep the input path fast, preserve raw context, and force the model into an operationally useful structure instead of a generic explanation. The output format makes it easier for an on-call engineer to separate known facts, likely hypotheses, immediate mitigations, and post-incident follow-ups.

## What I Learned
- Incident copilots need structure more than verbosity; responders need the next useful action.
- Prompt evals are easier to reason about when scenarios mirror real alert streams.
- Bilingual reliability tools need domain-specific phrasing, not just translation.

## Tech Stack
Next.js, TypeScript, Vercel, AI SDK, structured prompting, prompt evals, incident-response workflows
