---
title: How AI Should Actually Help in Graduate Admissions
subtitle: I applied to grad school the year ChatGPT shipped. The places AI helped me weren't the places it markets itself for.
date: 2025-01-26
readingTime: 7 min read
tags:
  - AI Product
  - Education
  - Graduate Admissions
featured: false
---

# How AI Should Actually Help in Graduate Admissions

I applied to graduate programs the year ChatGPT shipped. I used it heavily and I think most of how it gets pitched to applicants is wrong.

The "AI writes your statement of purpose" product is the loudest version, and it's the one that produces the most predictable disaster. Adcoms have read these. They're fluent and generic and they all sound like each other. The places AI actually moved my application were quieter and much more boring: research, deadline tracking, draft critique, comparing programs. The pattern across all of them is that the model wasn't doing the thinking — it was compressing the time I spent on the parts that don't require thinking.

This post is the version of that I wish someone had written for me when I started.

## Where AI moved my application

I'll be concrete. The four places where the time-savings were large enough that I'd advise anyone applying to do the same:

**Program research.** I had a list of 18 programs at the top of my funnel. For each I needed: required GRE/IELTS, deadline, application fee, recommendations count, page-limit on SOP, whether they require a writing sample. Getting that into a spreadsheet by hand is six hours. Asking the model to read a program's admissions page and extract that schema saved most of those hours. The catch: I verified every field against the source page before applying. AI extraction is fast and it's wrong roughly 5-10% of the time on this kind of content, and "wrong about a deadline" is a category of mistake you don't recover from.

**Faculty fit triage.** For each program, I wanted a shortlist of 3-5 faculty whose work overlapped with mine. The model is bad at this if you ask it to recommend faculty cold — it hallucinates people, mis-attributes papers, invents affiliations. The model is good at this if you paste in a faculty list and your own research summary and ask it to score overlap with a short evidence quote per ranking. I used it as a filter, not an oracle. The shortlists it produced were always re-checked by reading at least one recent paper of each candidate before I mentioned them in a statement.

**Draft critique.** This is where AI was most useful and where it's most often mis-used. I never asked the model to write a SOP. I asked it specific structural questions about drafts I'd already written: "where does this draft repeat itself," "which sentence in the second paragraph is the weakest claim," "what's the strongest concrete result in this draft and is it doing enough work in the intro." The output of those questions was about ten times more useful to me than any "rewrite this" output.

**Deadline tracking and pre-submission checks.** A simple workflow: for each program, the model rendered a checklist of what was required and what I had. As pieces came in (recommendations submitted, transcript received) I updated the state and re-asked. This is so low-tech it's almost not worth mentioning, except that I missed almost nothing in my application cycle and that wasn't a coincidence.

## Where I'd warn anyone off

The places I saw AI products go badly in admissions, both in my own use and in friends':

**Generating SOPs from scratch.** The output is fluent and it has no voice. Adcoms read thousands of essays and the AI-written ones have a tell. Anecdotes get sanded down. Specifics get replaced with abstractions. The structure tends toward a five-paragraph essay shape that nothing else in academia uses. If you can't tell whether your draft was AI-written, ask three people who know you. They'll tell you it doesn't sound like you.

**Predicting admissions probabilities.** "Given my stats, what are my chances at X?" The model will give you a number. The number is uncorrelated with reality. Admissions is a function of fit, recommendations, timing, and committee composition — none of which the model knows. The confident percentages you'll get back are the worst kind of LLM output: precise, fluent, and wrong.

**Recommending faculty cold.** Without a faculty list to anchor against, the model invents people. It will give you names that don't exist at the institution, papers that were written by other people, or research interests that haven't been current for a decade. Anchor every recommendation in a source you've verified.

**Mass-personalizing emails to professors.** Faculty know what these look like. The thoughtful, specific outreach gets a response. The "I read your work on X" generic gets ignored or pattern-matches as AI-generated and damages your standing for a follow-up.

## The product I'd want to use

If I were building an admissions-assistance product (and I've thought about it more than once), I'd structure it around what the model is actually good at and let it refuse the parts it's not.

Three jobs, kept separate:

- **Research.** Grounded retrieval over program pages, faculty pages, and recent papers. Every claim cited. Refusal when the source isn't current. The hardest part of this is the ingestion pipeline — keeping a fresh, structured index of program requirements and faculty work. That's a database problem disguised as an AI problem.
- **Strategy.** Structured reasoning with explicit assumptions. If the assistant says "this program is a good fit for your interest in X," it should show the evidence: which faculty, which papers, which recent funding. No probability estimates. No confident "chances" numbers.
- **Writing.** Critique, not generation. Identify where a draft is vague, where it repeats, where the evidence is weak. Suggest the *applicant's own past work* as candidates for stronger evidence — pulled from a profile they uploaded, not invented. The goal is to make the applicant's draft sharper, not to produce a draft.

```python
def critique_statement_of_purpose(draft: str, profile: dict) -> list[Finding]:
    findings = []
    if not contains_specific_program_reason(draft):
        findings.append(Finding(
            issue="The 'why this program' paragraph is generic.",
            evidence=quote_paragraph(draft, 'program_fit'),
            suggestion="Tie this to a specific faculty member or a specific lab whose work overlaps your stated interests.",
            source_field='profile.research_interests',
        ))
    if not has_concrete_outcome_in_past_work(draft):
        findings.append(Finding(
            issue="Past work is described in capability terms, not outcome terms.",
            evidence=quote_paragraph(draft, 'past_work'),
            suggestion="Pick one project from your profile and add a concrete result — a metric, a publication, a deployed system.",
            source_field='profile.projects',
        ))
    return findings
```

The shape of the output matters. Each finding has an issue, the exact evidence in the draft, a concrete suggestion, and a *source field in the applicant's own profile* that the suggestion is anchored against. The model isn't writing a stronger essay. It's pointing at the place where the applicant has a stronger one available and isn't using it.

## What it would have to refuse

The discipline part of building this is the no list. The product I'd want would refuse:

- Writing a complete SOP from scratch.
- Predicting admissions probability with a number.
- Naming a faculty member without a citation that anchors the recommendation.
- "Improving" an essay by replacing the applicant's wording with smoother prose that erases voice.

The refusals aren't a limitation. They're the part that makes the rest of the product honest.

## What this means in practice

Graduate admissions is a place where AI can save applicants a real amount of time on the boring infrastructure of applying and make their own drafts sharper. It is not a place where AI should be writing the application or guessing the outcome. The applicants who use it for the first thing tend to come out ahead. The ones who use it for the second tend to produce identical-sounding essays in a stack of thousands.

The difference between the two outcomes isn't the model. It's product discipline about which jobs are the model's and which jobs aren't.
