---
title: Your Personal GPT Should Be a Knowledge System, Not a Prompt Wrapper
subtitle: I built two versions of a personal assistant — a clever prompt and a real retrieval system. Only one of them was still useful three months later.
date: 2025-05-09
readingTime: 8 min read
tags:
  - Personal AI
  - Retrieval
  - System Design
featured: false
---

# Your Personal GPT Should Be a Knowledge System, Not a Prompt Wrapper

The first "personal AI" I built for myself was a system prompt. About 1,200 words of "you are a helpful assistant who knows my work style, prefers concise replies, knows I'm an engineer working on AI infrastructure, and writes the way I write." I put it in a custom GPT, used it for two weeks, and then stopped using it. It was a marginally more pleasant ChatGPT.

The second version was different. Notes from Obsidian indexed nightly into a vector store. A small retrieval layer that pulled the relevant chunks before generation. A calendar tool. A "what did I write about this last month" lookup. The persona was 80 words instead of 1,200. I still use it.

The persona is the smallest part of a useful personal AI. The thing that makes it useful is whether it can find the right material in your own work at the moment you ask. That's a retrieval system, not a prompt. The teams who confuse the two ship things that demo well and decay fast.

## Why the persona-only version decays

The thing a system prompt can do is shape style. It can make the output more concise, more direct, more in your voice. It can't help with the actual work problem: I am asking the assistant a question that depends on things I know that the model doesn't.

The reason I stopped using the first version was that every useful question I had — "what did I decide about X last quarter," "what's the open thread I left on Y," "summarize what I've written about Z" — required me to paste context into the prompt manually. At which point the model is doing the easy part (writing the answer) and I'm doing the hard part (finding the material). That's not an assistant. That's a typewriter.

The second version inverts this. The retrieval layer does the finding. The model does the writing. The persona just makes the writing tolerable.

## The architecture, drawn at the right altitude

The version I run now is small enough to fit in a few hundred lines, but the boxes matter:

- **Ingestion.** Obsidian vault → markdown parsed → chunked by heading → embedded → upserted into a vector store with metadata (file, heading path, last-modified). Runs nightly via a cron. Skips unchanged files via content hash.
- **Retrieval.** Hybrid: BM25 over the same chunks, dense over embeddings, fused with reciprocal rank fusion. Filters by metadata when the query is scoped ("notes from this quarter," "things tagged #project-x").
- **Tools, narrow ones.** `find_note`, `summarize_note`, `list_recent_writing`, `get_calendar_today`. Each tool returns structured data with explicit fields. No "do anything" general-purpose tool.
- **Generation.** The model is given the retrieved chunks, the user's question, and a short persona. It is told explicitly to cite the file it pulled each claim from. If the retrieved context doesn't answer the question, it says so rather than improvising.
- **Memory, deliberate.** Conversation history is short and per-session. Saved preferences ("when I ask for a draft, write it in 200-300 words") are stored separately and explicit. Nothing learns "implicitly" from my chats and surfaces it later — that's the pattern that produces the spookiest failure modes.

That's it. There's no agentic loop, no self-critique pass, no "the assistant decides which tool to use next" cleverness. The boring shape is the part that keeps working.

## Memory is where personal AIs most often go wrong

The "let the assistant remember everything" framing is a bad memory system disguised as a good one. Three things get mixed together that shouldn't be:

- **Durable knowledge.** Your notes, your documents, your projects. This is what you want the assistant to *reason over*. It's a corpus, not a memory.
- **Session state.** The current conversation, including refinements and corrections inside it. Short, ephemeral, scoped to one task.
- **Stable preferences.** "I prefer markdown over prose." "When I ask for a summary, aim for 150 words." These are deliberate and explicit, and they shouldn't change because the model inferred something from a chat last week.

The pattern that produces the "why does it remember that?" moments is fuzzing those three together into one memory layer. The fix is keeping them separate at the storage layer, not just in your head.

The assistant should know the durable knowledge by retrieving it on demand. It should have the current session in working memory. It should have stable preferences loaded as configuration. Nothing else should persist between sessions without explicit opt-in.

## Retrieval is the product

If the assistant can't surface the right material at the right time, the rest of the system is decorative. That's where the engineering effort should go.

The things that have moved the needle for my own system, in order of impact:

- **Chunking by heading, not by token count.** Markdown notes have natural section boundaries. Splitting at heading boundaries with the heading path prepended to each chunk made retrieval recall go up substantially compared to my first "split every 500 tokens" version. The heading carries the topic; the body carries the content.
- **Metadata-aware retrieval.** Last-modified date, tags, source path. When I ask "what did I write last week about onboarding," I want the retriever to filter before it ranks, not to hope the date shows up in the chunk text.
- **Hybrid search.** Dense embeddings handle "what did I say about retrieval quality." BM25 handles "find the note about `pgvector`." Both, fused, handles real queries that have one of each.
- **Source freshness.** A nightly re-embed of changed files is enough. Doing this in real time is overkill for a personal system; doing it never means stale notes sit in the index for weeks.

I'd spend retrieval-engineering effort here before I'd spend it on a fancier prompt. The prompt has to be reasonable. The retrieval is what makes the assistant correct.

## Tools should be narrow on purpose

The temptation is to give the assistant a big general-purpose `query_database` or `execute_command` tool and let it figure things out. That's the path to brittleness.

The tools that work, in my experience, are small and shaped like the actual job:

- `get_calendar_events_for(date_range)` — not `query_calendar(arbitrary_request)`.
- `summarize_note(file_path, target_length)` — not `process_document(prompt)`.
- `find_notes_matching(query, date_range, tags)` — not `search(everything)`.

Narrow tools are easier to test, easier to debug when they fail, and harder for the model to misuse. The cost is that you have to add a new tool when you have a new job, which forces you to think about what the job actually is. That's the right cost.

## The honest test of whether you've built a knowledge system or a prompt wrapper

Four questions. If the answers are concrete, it's a knowledge system. If they're fuzzy, it's still a wrapper.

- **What corpus is it grounded on?** "My Obsidian vault as of last night, ~3,400 notes, indexed by heading-bounded chunks with metadata." Good. "It learns my stuff over time." That's a wrapper.
- **What can it actually do?** A list of named tools, each with a specific input shape. Good. "It can do whatever I ask, I guess." Wrapper.
- **What does it remember between sessions?** "Three named stable preferences and zero implicit memory." Good. "Conversational context, mostly." Wrapper.
- **How do you know when it helped?** "I check retrieval recall on a small eval set monthly, and I track how often I have to manually find the source after asking." Good. "It feels useful." Wrapper.

The wrapper version is fun to build. It's not the same thing as a personal AI that earns daily use. The thing that earns daily use is boring: a clean ingestion pipeline, a good retrieval layer, a few narrow tools, and a short persona that gets out of the way.

If you build the retrieval well, the rest of the system stops needing to be clever. That's usually the sign that the architecture is right.
