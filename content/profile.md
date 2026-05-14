---
title: Profile
---

# Yanpeng Qi — Software Development Engineer & AI Builder

## Summary
Software engineer with 5 years of production experience across consumer platforms, AI-powered systems, distributed services, infrastructure-minded backend engineering, and full-stack web development. I build systems that combine LLMs, RAG pipelines, multi-agent orchestration, and modern cloud infrastructure at scale. Currently building Admitly — an AI-native platform for graduate school admissions — as a side project.

## Education
- **M.S. Computer and Information Technology**, University of Pennsylvania, 2018–2020
- **B.S. Material Physics**, Sun Yat-Sen University, 2013–2017

## Work Experience

### Software Development Engineer — Large-Scale Consumer Platform (2021 – Present) | Greater Seattle Area

**Consumer Experience Platform**

Led engineering across multiple high-impact initiatives on a 1M+ user product at ~1,000 TPS peak load.

- Built a Python pipeline to auto-extract API endpoints, pull historical traffic from internal observability systems, and apply growth-curve models for TPS forecasting — condensing a 4-month manual capacity planning process into 2 months. Directed peak-readiness planning for the team.
- Led end-to-end platform migration using percentage-based rollouts and URL-based state handoffs, eliminating full-page reloads and reducing average page load latency by 40%.
- Re-architected the product from a legacy server-rendered UI stack to React + Spring Boot. Designed a config-driven rule engine for onboarding flow routing — partner teams can now add new device journeys through JSON config without changing core logic.
- Built an internal AI knowledge assistant using a RAG pipeline and custom MCP server, consolidating scattered team docs into a single queryable interface. Mentored two interns through onboarding and early delivery.

**Identity and Platform Services**

- Built an identity-aware microservice on AWS Fargate for automated membership validation with fine-grained IAM policies ensuring secure cross-account data isolation.
- Led a cross-region migration of a Redis-backed device-awareness workload across EU infrastructure. Designed the migration plan and rollout docs, stood up the destination Lambda + Redis stack in advance, and used async dual-writes plus a full TTL overlap window to preserve cache consistency during cutover without meaningful latency impact.
- Integrated an AI code review assistant into CI/CD using AWS Lambda and a managed cloud LLM platform. Designed tiered prompt templates (critical vs. suggestions) — reduced manual review cycles by 25%.
- Deployed an async job orchestration system for large-scale metadata sync with custom CloudWatch alerting to detect authentication anomalies proactively.

## Contact
- Email: qyanpeng1995@gmail.com
- Location: Greater Seattle Area
- GitHub: github.com/YanpengQi7
- LinkedIn: linkedin.com/in/yanpeng-qi
