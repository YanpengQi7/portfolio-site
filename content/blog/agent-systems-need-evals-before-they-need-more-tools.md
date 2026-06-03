---
title: Agent Systems Need Evals Before They Need More Tools
subtitle: I've watched two teams add web search, memory, and planning loops to fix what was actually a retrieval-prompt bug. Both took six weeks. The eval would have taken two days.
date: 2026-02-11
readingTime: 7 min read
tags:
  - Agents
  - Evals
  - Production AI
featured: true
---

# Agent Systems Need Evals Before They Need More Tools

The fastest way I know to tell whether an agent system is real is to ask the team what their eval suite looks like. If the answer is some variant of "we've been trying it on a few examples and it feels better," the system isn't real yet — it's a demo that hasn't met its first regression.

I've watched two different teams in the last year respond to "the agent gives bad answers sometimes" by adding tools. One added a web-search step. The other added a planning loop and a memory layer. Both shipped after about six weeks. Both still gave bad answers sometimes, in slightly more sophisticated ways. In both cases the actual problem was a single retrieval call returning the wrong chunk for a class of queries, which a two-day eval pass would have located within the first hour.

More tools is the wrong reflex. It's the LLM-engineering equivalent of adding microservices to fix a monolith bug.

## Why agent systems are uniquely hard to debug without evals

A single LLM call has one place to be wrong. An agent has every step.

A four-step agent — retrieve, plan, act, summarize — with 90% step accuracy has 0.9⁴ ≈ 66% end-to-end accuracy. With 95% step accuracy that's 81%. The step that's failing is invisible from the final output, because the next step usually papers over it with something fluent. By the time you read the answer, the system has constructed a coherent story around whatever it did, including the wrong things.

The only way out of this is to score the intermediate steps separately. Otherwise you're debugging the final answer, which is the worst place to debug.

## What a minimum eval suite actually looks like

I think of an eval suite for an agent as three things, and you need all three before adding capability is honest.

**A scenario set, large enough to break things.** Not three examples. At least 20-30, picked to span the failure modes you've already seen plus the ones you're worried about. The mix matters more than the count — five database scenarios, five network, five auth, five edge cases on input format, five known-hard. A scenario suite that's all happy-path is just a regression test for vibes.

**A rubric with concrete anchors per dimension.** Generic "rate this 1-5" doesn't converge between runs or between graders. I wrote about this in more detail in [the incident-report rubric post](/blog/i-scored-my-llm-incident-reports-against-a-rubric) — the short version is that you need to write down what a 1 looks like and what a 5 looks like for each dimension, in concrete terms. "Specificity" anchored at 1 = "check the logs" and at 5 = a copy-pasteable command with the right flags.

**Step-level scoring, not just final answer.** Did retrieval surface the right document? Did the planner pick the right tool? Did the synthesizer use the cited evidence or freelance? If the only number you have is "final output good/bad," you can't tell which step regressed.

## The reflex I see most often, and why it goes wrong

Team has an agent. Agent fails on some queries. The instinct is: it must need more context, more tools, more steps. Add web search. Add a self-critique pass. Add a longer planning prompt.

What happens next, almost every time:

- The new step works on the failing examples someone showed in the meeting.
- It breaks something else nobody was looking at.
- Latency goes up 40-80% because there are more LLM calls in the path.
- Cost goes up similarly.
- The next "the agent is wrong" ticket comes in two weeks, and now the system has six steps to debug instead of four.

The version of this story where it ends well looks different. The team writes 25 scenarios, scores the current agent against a rubric, and finds out that the failures cluster in one place — usually retrieval, usually a specific class of inputs. They fix the one thing. Numbers move on the eval. They ship.

The eval is what makes the second version possible. Without it, you can't tell whether the new tool helped, because you have no baseline.

## What I've found when I actually do the scoring

A few patterns I keep seeing once a rubric is in place on a real system:

- The aggregate "average score 3.4" hides everything. Useful information is in the per-dimension and per-scenario breakdown. "Specificity 4.2, domain-correctness 2.6" tells you the model is articulate and wrong, which is a very different problem from "Specificity 2.1, domain-correctness 4.4," which is correct and unreadable.
- Fluent failures score higher than they should. An LLM-judge will give a well-organized wrong answer a 3.5 because it looks complete. The fix is veto-style scoring — if domain-correctness is below 3, the overall is capped at 3. Otherwise the polish carries the day.
- Same prompt, same scenario, scores drift across runs even at temperature 0.2. If you don't run N≥3 repeats and report the std-dev, you'll convince yourself things changed when they didn't.

None of those are obvious without measurement. All of them affect what you do next.

## Offline isn't enough; production tells you what your scenarios missed

The offline suite catches regressions. It doesn't catch the failures you didn't think of. The production signal does.

The minimal version of that loop:

- Sample 1-2% of real user sessions, anonymized, into a review queue.
- Score them against the same rubric on a weekly cadence.
- When a new failure mode shows up that the offline suite doesn't cover, add it as a scenario.

The offline suite grows over time. That's a sign the system is being learned from, not a sign that something's wrong.

## What I'd say to someone about to add another tool

Before adding a tool, write 20 scenarios that exercise the current system, score them, and find out where the failures actually live. If the answer is "we have no idea, we just know it's wrong sometimes," that's not a tool problem. That's the part you have to fix first, because adding a tool to an unmeasured system just hides the regression you're about to ship.

The agent systems I trust aren't the ones with the most capability. They're the ones whose teams can tell me, in numbers, what success looks like, how often they hit it, and what fails when they don't.
