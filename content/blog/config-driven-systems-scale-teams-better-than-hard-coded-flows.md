---
title: Config-Driven Systems Scale Teams Better Than Hard-Coded Flows
subtitle: I once watched a team ship six weeks of "add a region" tickets that should have been a config change. The fix wasn't more engineers — it was admitting that the platform owned the wrong things.
date: 2023-11-14
readingTime: 7 min read
tags:
  - System Design
  - Config-Driven Design
  - Platform Engineering
featured: false
---

# Config-Driven Systems Scale Teams Better Than Hard-Coded Flows

The product team wanted to launch in two new regions. Each region needed slightly different onboarding steps, slightly different document collection, a different ID verification provider. The platform had been built two years earlier with the regions hard-coded — branches in code, conditionals in services, region-specific paths through the controllers.

Each new region was a six-week project. Not because the work was hard; because the work touched twelve services, three review queues, and a release train that ran every two weeks. The engineering team wasn't slow. The architecture had quietly turned product configuration into engineering work.

The fix was structural. Move the things that were going to keep changing — flow steps, verification providers, document requirements — out of code and into a configuration that operators could safely edit. Keep in code the things that shouldn't change without engineering judgment: the state machine that ran a flow, the validation that ran on every config change, the failure semantics. After a quarter of work, a new region was a config PR plus a smoke test. The next two regions shipped in two weeks each.

This post is what I learned about which things belong in config and which things don't, written from the wrong-side and the right-side of that line.

## Config works when the workflow's shape is stable and its instances multiply

The pattern that pays off is "same kind of thing, lots of variants." Onboarding flows that all have a request-info → verify → review → activate shape, but with different steps per market. Pricing rules that all have a tier × feature × region structure. Notification rules that all match on event type, audience, and channel.

When the shape is stable, you can model it once in code, validate it carefully, and let the variants live in a configuration store. New variant = new row, not new deploy.

The pattern that fails is "I'll move this into config so it's flexible." If you can't predict the shape of the next variant, you don't have a config problem yet — you have a domain you haven't modeled. Config-driven design exposed too early just becomes a worse scripting language with a worse debugger.

The diagnostic question I now use: *can I describe the next three variants without changing the schema?* If yes, config. If no, more code, until the shape stabilizes.

## What goes in the config, and what stays in the code

The thing that took me a while to get right is that config-driven doesn't mean *everything-in-config*. The line that has held up:

- **Config owns: declarative variants.** Which steps in which order. Which provider for verification. Which fields are required for which document type. Which feature flags gate which paths. Things a non-engineer should be able to change with a PR, a review, and a deploy.
- **Code owns: the engine.** The state machine that runs the steps. The retry semantics. The auth checks. The audit log. The thing that interprets the config and decides what to do when the config is malformed.

The mistake I made early was letting config grow until it had loops, conditionals, and arithmetic. At that point you've reinvented Lua, badly, without a debugger. The rule I use now: config is data, not behavior. If a variant needs new behavior, that's a code change. If it needs the same behavior with different inputs, that's a config change.

```ts
// Config — declarative, validated, owned by the product team.
type RouteRule = {
  id: string
  productType: 'savings' | 'checking' | 'loan'
  region: 'us' | 'eu' | 'sg' | 'br'
  nextStep: 'overview' | 'eligibility' | 'checkout'
  requires?: string[] // feature flags that must be on
}

// Code — the engine that resolves which rule applies, owned by platform.
function resolveNextStep(rules: RouteRule[], ctx: { productType: string; region: string; flags: string[] }) {
  const matched = rules.find(r =>
    r.productType === ctx.productType &&
    r.region === ctx.region &&
    (r.requires ?? []).every(f => ctx.flags.includes(f))
  )
  if (!matched) throw new ConfigGapError(ctx) // explicit failure, not silent fall-through
  return { ruleId: matched.id, nextStep: matched.nextStep }
}
```

The `ConfigGapError` is doing real work. The worst failure mode of a config-driven system is the request that matches nothing and gets silently dropped into a default. Be explicit about gaps. Pager rules can catch them; default-routing hides them for months.

## Validation has to be load-bearing

The leverage of config-driven design is that operators move faster. The risk is that they move faster into a broken state.

Three layers of validation have to exist before you can stop being scared of config changes:

- **Schema validation at PR time.** Types, enums, required fields, referential integrity (does the verification provider this rule references actually exist?). Fail the PR check before a human reviews it.
- **Compatibility checks.** If you remove a rule, what existing sessions depend on it? If you reorder steps, what users mid-flow get stuck? A migration plan should be part of the PR template, not a thing you remember to think about.
- **Dry-run against production traffic.** Replay the last 24 hours of decisions against the new config and diff the outcomes. The number of times this has caught "looks fine, breaks 4% of users" is high enough that I now consider it table stakes.

Skip these and config-driven design just moves bugs from code review (where they're caught) to runtime (where they're not).

## Make the system explain its decision

The other failure mode I've learned to design against: nobody can tell why a particular request got a particular outcome. Five rules could have matched. Which one won? Why did the others lose?

Every resolution should return enough information to reconstruct the decision after the fact:

```ts
return {
  matchedRuleId: matched.id,
  nextStep: matched.nextStep,
  reason: `matched product=${ctx.productType} region=${ctx.region} flags=[${ctx.flags.join(',')}]`,
  rejected: rejectedRules.map(r => ({ id: r.id, missedOn: diffOf(r, ctx) })),
}
```

This is the single thing that has saved me the most operational pain. When a user lands in an unexpected branch, you don't want to re-derive the rule resolution by hand. You want the log line that says exactly which rule won and which conditions the losing rules failed.

## Why this scales teams more than it scales systems

The deeper reason config-driven design pays off isn't elegance. It's that it moves routine variation out of the engineering team's queue.

Engineers stop being the bottleneck for "launch in a new region" or "change the document requirement for product X." Those become operator workflows with a defined path: edit config, run validation, dry-run, ship. Engineering shows up when the *shape* needs to change — when there's a genuinely new kind of step, a new failure mode, a new invariant to enforce. That's the work that needs engineering judgment. Everything else was bottlenecked on engineering for the wrong reasons.

The teams I've seen scale well around this didn't have more engineers. They had a sharper line between what was config and what was code, and a config layer that operators trusted enough to use without escalation.

## The thing to watch out for

The pattern goes wrong when config-driven design gets used to paper over an unstable domain model. "We'll move this into config so we can change it later" is a real warning sign — it usually means nobody knows what the shape should be, and the config will absorb the indecision until it becomes unreadable.

If you can't write down the schema and explain it in one paragraph, the domain isn't ready for config-driven yet. Build the next two variants in code. Look at what stayed the same and what changed. Then extract the config layer once you can name what it's modeling.

When the line is drawn right — engine in code, variants in config, validation as the gate — config-driven systems are one of the cleanest ways to let a team scale without growing the platform's blast radius. Drawn wrong, it's just hidden complexity. The discipline is in the drawing.
