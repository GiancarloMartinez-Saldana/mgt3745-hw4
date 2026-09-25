# Architecture

Status: ACTIVE in Module 3.

Decisions, in order, newest first. An ADR is never edited after it is accepted; it is superseded.

## The Gate: HW4 rerun

Where should subscriptions live now that they must survive a cleared cache?

Same six criteria, same 1/3/5 rubrics, and the same weights as the HW3 Gate below. No weight changed: the budget is still $0 and I still have to be able to explain every line I ship. Doors: **Build** = Cloudflare Worker + D1 (what Session B set up); **Buy** = a hosted backend-as-a-service such as Supabase or Firebase; **Delegate** = an AI app builder that writes and hosts the backend for me.

| Criterion | Weight | Build (Worker + D1) | Buy (hosted BaaS) | Delegate (AI builder hosts it) |
|---|---:|---:|---:|---:|
| Cost to start | 5 | 3 → 15 | 3 → 15 | 3 → 15 |
| Cost to maintain | 4 | 4 → 16 | 3 → 12 | 2 → 8 |
| Time to working | 4 | 5 → 20 | 4 → 16 | 5 → 20 |
| Inspectability | 5 | 4 → 20 | 2 → 10 | 1 → 5 |
| Switching cost | 2 | 3 → 6 | 2 → 4 | 1 → 2 |
| Fit to spec | 4 | 5 → 20 | 4 → 16 | 3 → 12 |
| **Weighted total** | **24** | **97** | **73** | **62** |

Score notes (score → weighted):

- **Cost to start.** All three need an account on a free tier with real limits, so all three score 3. None is "no account needed" the way localStorage was.
- **Cost to maintain.** Build scores 4 because D1's free tier doesn't expire and the only upkeep is the wrangler login and version bumps. Buy's free tiers pause or cap inactive projects (3). Delegate burns credits on every change (2).
- **Time to working.** Build reached a deployed `GET /entries` returning `[]` in one Session B class. Buy needs an SDK and access rules first (4).
- **Inspectability.** `worker.js` is about 100 lines I can read top to bottom, and every SQL statement uses `bind()`. What I can't inspect is D1 itself: where the bytes sit and how Cloudflare replicates them. Hence 4, not 5.
- **Switching cost (scored from Session B experience).** Leaving takes `npm run db:export` plus a rewrite of one Worker for another host, which is medium (3). Buy ties the page to a vendor SDK. Delegate owns code I didn't write.
- **Fit to spec.** Build matches F-01/F-05 exactly and adds nothing the non-goals forbid. Buy adds auth and realtime I didn't ask for. Delegate tends to add features I would then have to verify.

## ADR-002: Entries move from localStorage to Cloudflare D1

**Title and date:** ADR-002 — Store subscriptions in Cloudflare D1 behind a Worker, September 24, 2026
**Status:** Accepted
**Supersedes:** ADR-001
**Door / concrete acquisition and execution choice:** Build. My own Cloudflare Worker (`worker.js`) and one D1 table (`schema.sql`) on Cloudflare's free plan, deployed with wrangler from my Codespace. The code was drafted by Claude Code and deployed and tested by me (see README → AI Use).

### Context

ADR-001's revisit trigger has fired. Module 4 requires that entries survive a cleared cache and show up on a second device, and localStorage can't do either. Here are the four things that must be recorded:

- **What data leaves the browser:** every subscription a user types (service name, monthly price) plus a server timestamp. Cloudflare also logs request metadata by default (IP address, user agent, time). The page tells users to enter fictional, non-sensitive information, and it now says entries go to a shared server.
- **To which vendor:** Cloudflare, Inc. The Worker runs on Cloudflare Workers and the rows sit in Cloudflare D1.
- **Under what terms:** Cloudflare's free plan and its standard Terms of Service and Privacy Policy. The data is stored in a region Cloudflare picks; I didn't choose one. I have no contract or data-processing agreement beyond the click-through terms.
- **Who is accountable:** me, Giancarlo Martinez-Saldana. I deployed it, I hold the Cloudflare login, and I'm responsible for what gets stored and for deleting it.

### Decision

Build: a single Cloudflare Worker (`worker.js`) serves `GET /entries`, `POST /entries`, and `DELETE /entries/:id` over one D1 table (`schema.sql`). The HW3 page keeps its render and validation code; only load, save, and delete now go through `fetch`. The Worker checks the service name (1–200 characters) and the price (a number > 0) again, because the page isn't the only possible client. CORS is narrowed from `*` to a list of my page origins. Innovation token spent: one, on Workers + D1, which were new to me this module. Everything else is boring (vanilla JS, one table, no framework).

### Alternatives considered

- **Buy: hosted BaaS (Supabase / Firebase), 73.** Fast, but the page would depend on a vendor SDK and access rules I can't fully read, and free projects pause when idle.
- **Delegate: AI builder that hosts it, 62.** Fastest to a demo, but it fails inspectability (1). I would be attesting to code I didn't write and can't explain, which is what ADR-001 refused.
- **Stay on localStorage:** can't meet the new requirement. That's the reason this ADR exists.

### Consequences

- **Better:** entries survive cleared site data and appear in a second browser (verified, see FEATURES.md). A bad price can no longer reach the table even from `curl`.
- **Harder: no offline use.** HW3 worked with no network. Now an outage means the page shows "Could not reach the server" and the user can't add anything.
- **Harder: a stranger's data in my table.** There's no login. Anyone with the Worker URL can read, add, or delete every row. CORS stops other websites from doing it in a browser, but `curl` ignores CORS.
- **Harder: testing.** Verifying a failure now needs a server (`npm run dev`, `?serverDown`, or DevTools offline). Opening a file isn't enough anymore.
- **Harder: a trust boundary to maintain.** A wrangler token lives in the Codespace, and a vendor's pricing or terms can change under me (tracked in TOOLS.md).

### Revisit trigger

- A second user needs their own private list. That needs authentication and a user column, so it's ADR-003.
- Real (non-fictional) financial data would be entered.
- The free tier's limits are hit, or Cloudflare changes the free plan's pricing or terms.
- Offline use becomes a requirement.

---

## HW3 record (superseded, kept as written)

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
Status: Superseded by ADR-002
Door / concrete acquisition and execution choice: Hand-built. Vanilla HTML/CSS/JavaScript, browser localStorage for persistence, no external services or paid tiers, no AI-generated code shipped without being personally read and understood line-by-line.
Context: F-01 needs to launch this week on a zero-dollar budget, inside a Codespace, verified against EARS acceptance criteria. F-01's own non-goals rule out most existing subscription-tracking services, since those typically require credential access or bank-statement scraping, which conflicts with the manual-entry constraint. I am a first-time programmer, so an AI-assisted build carries a real inspectability risk: I cannot yet independently verify that generated code is correct, which the course treats as a legitimate scoring input.
Decision: Build the subscription cost dashboard by hand, using vanilla JavaScript and localStorage, rather than integrating an existing subscription-tracking service or delegating implementation to an AI agent without full personal review.
Consequences and revisit trigger: Full inspectability and zero cost are gained; every line is one I can explain, satisfying this course's literacy requirement ahead of modules where delegated code must be reviewed. What's lost is speed and convenience — development is slower than an AI-assisted or Buy approach would allow, and users must manually enter every subscription rather than having them auto-detected. This decision must be revisited when Module 4 introduces a real database, since localStorage does not support multi-device or multi-user sync (already flagged in FEATURES.md's Constraints). At that point, ADR-002 should be written and this record marked Superseded — the reasoning here remains accurate for this week's constraints even after it's superseded.
