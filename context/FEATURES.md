# Features and specification

## Context

Streaming viewers who already subscribe to multiple platforms face two related but distinct frictions: they lose track of what they're actually paying for (both interviewees underestimated their subscription count when asked directly), and when they can't quickly find something appealing, they default to a low-risk rewatch or leave the platform entirely rather than searching harder (INT-01's Gilmore Girls fallback, INT-02's shift to YouTube). A related thread from INT-02 is a shift toward wanting to watch with focus and in order, rather than passively or out of sequence. The desired progress is for a viewer to make an intentional, low friction choice about what to watch and what to pay for, without needing to open five apps or mentally track five bills.

## Users

PROFILE-01 — College student who shares streaming accounts with roommates and family. Frequently can't decide what to watch and defaults to rewatching a familiar comfort show (Gilmore Girls) rather than risk disappointment on something new. Budget-conscious, shared-account friction includes ads on a roommate's cheaper tier and repeated logouts from an out-of-state location. Evidence: INT-01, JOB-01.
PROFILE-02 — Fraternity member with mostly personal subscriptions. Has shifted from casual, out of order childhood viewing to watching with deliberate focus and intent. Follows a structured decision path (time available → format → Recommended/My List → browse) and, when nothing fits, switches platforms (YouTube), waits, or pirates rather than adding a new subscription. Evidence: INT-02, JOB-02.

## Scope

Included behavior:

A dashboard where a user manually enters or confirms which streaming services they subscribe to and at what price.
A single search/browse view that lets a user filter by mood and format (short vs. long form) across the services they've entered.
A "pick for me" flow with two modes: a low-risk familiar pick, or a filtered new suggestion matched to available time and format.
Visibility into estimated monthly spend across entered subscriptions.

Non-goals:

The app does not log into or scrape streaming accounts via credentials; all subscription data is user-entered.
The app does not stream, host, or link to pirated content, regardless of what INT-02 reported doing.
The app does not execute cancellations or any payment action on the user's behalf, it surfaces information, the user acts on it elsewhere.
The app does not attempt to solve account sharing/login kickout problems (INT-01's HBO Max out-of-state issue), that's a platform side limitation, not something this app can fix.

### Kano hypotheses
Provide at least six features. For each, name the user segment, date, category, and evidence-based reasoning. These are tentative hypotheses, not validated survey findings.

| Feature ID | Feature | Kano hypothesis | Segment / date | Evidence and reasoning |
|---|---|---|---|---|
| F-01 |Subscription cost dashboard (all entered services + total monthly spend)|Must-be|Both segments/ 9/10/26|Both participants underestimated their own subscription count by 1–2 services when asked directly (INT-01: guessed 5, actual 7; INT-02: guessed 4, actual 5). Its absence is already causing quiet confusion; without it, users are surprised by their own spend.|
| F-02 |"Pick for me" - safe mode (surfaces a familiar/rewatched title)|Attractive|PROFILE-01 / 9/10/26|INT-01 described defaulting to Gilmore Girls ~99% of the time as a compromise, not a genuine first choice, an explicit low-effort, low-risk shortcut matches her reported workaround directly.|
| F-03 |Cross-platform mood/format filter (short vs. long-form, across all entered services)|Performance|PROFILE-02/ 9/10/26|INT-02 already performs this filtering manually and sequentially (time available → format → Recommended tab → My List → browse) inside a single app; consolidating it across apps is a direct extension of an existing behavior, and more coverage should map to more satisfaction.|
| F-04 |Per-service "last opened" usage nudges (e.g., "you haven't opened this in 60 days")|Reverse|PROFILE-01 / 9/10/26|INT-01 explicitly said she doesn't consider any subscription useless even if underused, framing each as providing unique value "even if not a lot." A nudge implying she should reconsider low-usage services works against that stated attitude and risks feeling judgmental rather than helpful.|
| F-05 |Manual subscription entry with price and renewal date|Must-be|Both segments / 9/10/26|This is the underlying data source that makes F-01 possible at all; without it, the cost dashboard cannot function. Neither participant mentioned wanting this specifically, which is typical of Must-be features, its absence would be the noticeable failure, not its presence.|
| F-06 |"Why I picked this" reasoning shown on suggestions (e.g., "You've watched this 3 times before" or "Matches: 20 min, comedy, on a service you already pay for")|Attractive|Both segments / 9/10/26|Neither participant asked for this, but it targets what both distrust about picking something new, INT-01 says new choices are "disappointing"; INT-02 relies on curated sources ("been told its good/recommended") rather than blind browsing. A visible reason turns a suggestion into something closer to a trusted recommendation instead of another blind gamble.|

## Behavior

1. On first use, the user manually enters each streaming service they subscribe to, its monthly price, and (optionally) its renewal date (F-05).
2. The dashboard displays the full list of entered services and a running total of monthly spend (F-01).
3. From the dashboard, the user selects "What should I watch?" and chooses one of two modes: Safe pick or Something new.
4. If Safe pick is chosen, the system returns one title (or a select few) that the user has marked as a past favorite and if they have none then the system will choose frequently rewatched, at random or by recency (F-02).
5. If Something new is chosen, the user selects a mood/format filter (short vs. long form; a small set of genre tags), and the system returns a filtered list of titles drawn only from the services the user has entered (F-03).
6. If the filtered list in step 5 returns zero results, the system displays a message stating no matches were found in the user's current subscriptions, rather than silently returning nothing or suggesting an unowned service.
7. Whenever the system returns a suggested title in either mode, it displays a one-line reason for that suggestion alongside it (F-06).
8. The user can, at any time, edit or remove a subscription entry, which immediately updates the spend total in step 2.

## Constraints

Platform: Web application, responsive for mobile browser use; no native app required for this spec.
Data: All subscription and price data is user-entered and self-reported; the system does not verify accuracy against any billing source.
Privacy: No streaming account credentials are collected, stored, or transmitted at any point.
Scope limit: The system does not access or index actual streaming catalogs; the "Something new" filter (F-03) operates only over content the user has manually tagged or a static demo dataset, not a live catalog integration.
Timing: The dashboard total (step 2) shall reflect an edited entry (step 8) without requiring a page reload.

## Acceptance

- Ubiquitous: The system shall not display, link to, or reference pirated content sources at any point in the "Something new" or "Safe pick" flows.
- Event-driven: When a user adds a new subscription entry with a price, the system shall update the total monthly spend shown on the dashboard within 2 seconds.
- State-driven: While a subscription list contains zero entered services, the system shall disable the "What should I watch?" button rather than allow the user to reach an empty Safe pick or Something new flow.
- Unwanted: If a mood/format filter returns zero matching titles, then the system shall display a message stating no matches were found, rather than an empty screen or a suggestion outside the user's entered services.
- Optional: Where a subscription entry includes a renewal date, the system shall display that date alongside the service in the dashboard list.
- Unwanted: If a submitted service name is empty or a submitted price is not a positive number, then the system shall display a distinct error message for each case and shall not save the entry.
- State-driven: While a save operation fails, the system shall preserve the entry in the input field and shall not modify the previously saved list or total.

## Handoff reflection

I asked a reader (Claude) to check FEATURES.md against the "could two competent people disagree" test. Three real gaps surfaced. First, Behavior step 4 never defines whether "favorite" is user-marked or system-inferred, and separately gives two conflicting selection rules ("at random or by recency"). Second, Behavior and Acceptance contradicted each other on F-06: Behavior implies a reason is always shown, while the Optional acceptance criterion implies it's sometimes absent. I revised step 4 to have an order of operations and reconciled F-06 to actually be optional instead of a more important feature. Smaller gaps remain unresolved: the empty-subscription-list state referenced in Acceptance never appears in the numbered Behavior sequence, and the zero-favorites edge case for Safe pick isn't handled anywhere. These are acceptable remaining limits for this pass, but a future revision should walk Behavior and Acceptance side by side to confirm every acceptance criterion maps to an explicit step.


## Verification

**Scope note:** Per ADR-001 and the assignment's "choose small" guidance, only F-01 (subscription cost dashboard) and F-05 (manual subscription entry) were selected for the HW3 build. Statements tied to unselected features (F-02 Safe pick, F-03 filtering, F-06 reasoning display) are marked CANNOT TEST YET, since those flows were never implemented this cycle.

| # | Acceptance statement | Result | Evidence / reason |
|---|---|---|---|
| 1 | Ubiquitous: no pirated content sources referenced in Safe pick / Something new flows | CANNOT TEST YET | Neither flow (F-02/F-03) was built this cycle; out of scope per ADR-001. |
| 2 | Event-driven: adding a subscription updates total spend within 2 seconds | PASS | Added three subscriptions (netflix $20, hulu $13, spotify $15); total updated to $48.00 immediately on each addition. See [screenshot](docs/subscription-dashboard.png). |
| 3 | State-driven: "What should I watch?" disabled with zero entries | CANNOT TEST YET | This button belongs to the F-02/F-03 flow, not built this cycle. |
| 4 | Unwanted: zero filter matches show a no-matches message | CANNOT TEST YET | Mood/format filter (F-03) not built this cycle. |
| 5 | Optional: renewal date displayed alongside service when given | FAIL | No renewal date field exists in `index.html`/`app.js`. Genuine gap between Behavior step 1 and shipped code. |
| 6 | Unwanted: invalid service name or price rejected with a distinct error, entry not saved | PASS | Tested empty service name and $0/negative price separately; each produced a distinct, correct error message and no invalid entry was saved. |
| 7 | State-driven: failed save preserves the entry and leaves prior list/total unchanged | PASS | Tested with `?failSave` in the URL; correct error message shown, entry remained in the input field, and the previously saved list and total were unmodified. |

## AI assistance
I asked it to help me have arrows for clear visuals. It also helped me organize all my points to develop my kano hypotheses and other structural details. Lastly I made a new chat and dropped in all of the assignment info and what I wrote and asked it to be my peer because it is late on a Thursday (I hope this is allowed), and I knew it would be a more thorough check anyways.
