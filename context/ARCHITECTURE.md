# Architecture

Status: ACTIVE in Module 3.

## Gate

Budget: $0. No paid service or subscription can be part of the solution.
Deadline: this feature must be working and verified by Thursday, September 17, 11:59 PM ET.
Non-goal from FEATURES.md: no credential scraping or automated login to real streaming accounts — subscription data must be user-entered.
Course requirement: the feature must be built and run from a fresh Codespace via Live Server, regardless of which door the Gate favors.

Cost to start
1: Requires payment or a paid account to begin
3: Free tier available but with real limits
5: Entirely free, no account needed

Cost to maintain
1: Ongoing subscription or fees required
3: Free but requires occasional manual upkeep
5: Free and effectively zero upkeep

Time to working
1: Would take multiple weeks to get running
3: Working within a few days
5: Working within hours

Inspectability
1: I cannot read or verify the resulting code at all
3: I can follow the code but would miss subtle bugs
5: I wrote every line and can explain it fully

Switching cost
1: Locked in; painful to replace later
3: Some rework needed to replace
5: Trivial to replace or modify later

Fit to spec
1: Actively conflicts with a stated non-goal
3: Meets the core behavior but misses details
5: Matches Behavior, Scope, and non-goals exactly

| Criterion | Weight | Hand-built — Score | Hand-built — Weighted | Existing-service — Score | Existing-service — Weighted | AI-assisted — Score | AI-assisted — Weighted |
|---|---:|---:|---:|---:|---:|---:|---:|
| Cost to start | 5 | 5 | 25 | 3 | 15 | 5 | 25 |
| Cost to maintain | 4 | 5 | 20 | 3 | 12 | 5 | 20 |
| Time to working | 4 | 3 | 12 | 5 | 20 | 5 | 20 |
| Inspectability | 5 | 5 | 25 | 1 | 5 | 1 | 5 |
| Switching cost | 2 | 5 | 10 | 1 | 2 | 3 | 6 |
| Fit to spec | 4 | 5 | 20 | 1 | 4 | 3 | 12 |
| **Total** | **24** | | **112** | | **58** | | **88** |

## ADR-001

Title and date: ADR-001 — Build the subscription cost dashboard by hand, September 17, 2026
Status: Accepted
Door / concrete acquisition and execution choice: Hand-built. Vanilla HTML/CSS/JavaScript, browser localStorage for persistence, no external services or paid tiers, no AI-generated code shipped without being personally read and understood line-by-line.
Context: F-01 needs to launch this week on a zero-dollar budget, inside a Codespace, verified against EARS acceptance criteria. F-01's own non-goals rule out most existing subscription-tracking services, since those typically require credential access or bank-statement scraping, which conflicts with the manual-entry constraint. I am a first-time programmer, so an AI-assisted build carries a real inspectability risk: I cannot yet independently verify that generated code is correct, which the course treats as a legitimate scoring input.
Decision: Build the subscription cost dashboard by hand, using vanilla JavaScript and localStorage, rather than integrating an existing subscription-tracking service or delegating implementation to an AI agent without full personal review.
Consequences and revisit trigger: Full inspectability and zero cost are gained; every line is one I can explain, satisfying this course's literacy requirement ahead of modules where delegated code must be reviewed. What's lost is speed and convenience — development is slower than an AI-assisted or Buy approach would allow, and users must manually enter every subscription rather than having them auto-detected. This decision must be revisited when Module 4 introduces a real database, since localStorage does not support multi-device or multi-user sync (already flagged in FEATURES.md's Constraints). At that point, ADR-002 should be written and this record marked Superseded — the reasoning here remains accurate for this week's constraints even after it's superseded.
