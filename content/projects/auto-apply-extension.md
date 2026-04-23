---
title: Auto-Apply Extension
subtitle: AI Chrome Extension for Intelligent Job Applications
slug: auto-apply-extension
tech: [Chrome Extension, TypeScript, Claude, Manifest V3, React]
status: Completed
year: 2024
featured: false
---

# Auto-Apply Extension — AI-Powered Job Application Chrome Extension

## What it is
A Chrome extension that reads job postings and auto-fills application forms using the candidate's resume. Think "1-click apply" but actually intelligent — it understands form context and tailors responses, not just copy-pastes.

## How it Works
1. **Content Script** — scrapes the job posting text and detects form fields on the current page.
2. **Background Service Worker** — sends the job description + user's stored profile to Claude.
3. **AI Layer** — Claude maps each form field (label + placeholder) to the right resume section and generates a tailored answer. Cover letter fields get a custom paragraph; skills fields get filtered to what's relevant.
4. **Injection** — content script fills fields programmatically, user reviews and submits.

## Key Technical Challenges
- **Form field detection**: Job boards use wildly different HTML structures. Built a heuristic classifier (label text + input type + aria attributes) that hits ~90% accuracy across Greenhouse, Lever, Workday, LinkedIn.
- **Context window management**: Some job postings are 3000+ tokens. Used Claude Haiku for the fast "extract key requirements" step, then fed a compressed summary to Sonnet for the fill step.
- **Latency**: Users expect instant fill. Parallelized per-field API calls, targeting < 3s total for a 10-field form.

## What I Learned
- Chrome's Manifest V3 service workers have strict memory limits — had to be careful about caching the user's profile in `chrome.storage.local` vs in-memory.
- Structured outputs (tool use) are essential here: free-form text responses are unpredictable when you need exact field values.

## Tech Stack
TypeScript, Chrome Extension Manifest V3, Anthropic Claude (Haiku + Sonnet), Webpack, React (popup UI)
