---
title: Study Abroad Platform
subtitle: Full-Stack WeChat Mini Program + Admin Backend
slug: study-abroad-platform
tech: [WeChat Mini Program, Node.js, PostgreSQL, WeChat Pay]
status: Completed
year: 2023
featured: false
---

# Study Abroad Platform — Full-Stack WeChat Mini Program

## What it is
A WeChat Mini Program connecting Chinese high school students with study-abroad consultants. Students browse consultant profiles, book sessions, and pay via WeChat Pay. Consultants manage bookings and student documents through a separate admin panel.

## Key Features
- **Consultant Marketplace** — search/filter by country, school tier, success rate.
- **Booking System** — calendar-based slot selection with conflict detection.
- **WeChat Pay Integration** — native payment flow, webhook for order confirmation.
- **Document Upload & Review** — students upload essays/transcripts; consultants annotate and return feedback.
- **Admin Dashboard** — consultant CRM, revenue tracking, booking management.

## Architecture
- **Frontend**: WeChat Mini Program (WXML/WXSS/JS) — feels native on WeChat, which is where the target users already are.
- **Backend**: Node.js + PostgreSQL on a VPS. RESTful API with JWT auth.
- **Payments**: WeChat Pay Merchant API — required setting up a business account and handling async payment webhooks reliably.
- **Storage**: Tencent Cloud COS for document storage (S3-equivalent in China).

## What I Learned
- WeChat's Mini Program ecosystem is very opinionated — but that's a feature, not a bug. Following the platform conventions made the UX feel trusted to users.
- Payment webhooks must be idempotent. Duplicate webhook delivery is common; handled with an `orders.processed_at` timestamp guard.
- Chinese cloud services (Tencent Cloud) have much better performance for China-based users than AWS — the latency difference is significant.

## Tech Stack
WeChat Mini Program, Node.js, Express, PostgreSQL, WeChat Pay, Tencent Cloud COS, Nginx, Ubuntu VPS
