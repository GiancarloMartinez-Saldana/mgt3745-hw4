# Cost Tracker: Subscriptions Leave the Browser

## What

HW3 repository: [GiancarloMartinez-Saldana/mgt3745-hw3](https://github.com/GiancarloMartinez-Saldana/mgt3745-hw3)

Streaming viewers lose track of what they pay for: both people I interviewed
guessed low on their own subscription count ([PROJECT.md](context/PROJECT.md),
[USERS.md](context/USERS.md)). This page implements F-01/F-05 from
[FEATURES.md](context/FEATURES.md). You enter each service and its monthly
price, and the dashboard keeps a running total of your monthly spend. In HW3
the list lived in one browser's localStorage. **As of HW4 it lives in
Cloudflare D1 behind a small Worker, so it survives a cleared cache and shows
up in any browser** ([ADR-002](context/ARCHITECTURE.md#adr-002-entries-move-from-localstorage-to-cloudflare-d1)).

## See It Work

The GIF shows three subscriptions saved to D1 ($48.00), then all site data
cleared and the page reloaded: the list and total come back from the
server. Deleting one recalculates the total to $35.00.

![Subscription dashboard: three subscriptions saved, site data cleared, page reloaded, all three still there with a $48.00 total](docs/see-it-work.gif)

*Recorded against `npm run dev` (the same `worker.js` on wrangler's local D1
emulator), since this GIF was made before the Cloudflare deploy. Replace it
with a recording against the deployed URL once it's live.*

Server unreachable, simulated with `?serverDown`:

![Page showing "Could not reach the server. Your subscriptions are safe; try again shortly."](docs/server-unreachable.png)

```mermaid
flowchart LR
  A[Page loads] --> B[GET /entries]
  B -->|200| C[renderNotes + total]
  D[User submits service + price] --> V{page validation}
  V -->|bad| F[showError on page]
  V -->|ok| E[POST /entries]
  E -->|201| B
  E -->|400 + reason| F
  G[User clicks Delete] --> H[DELETE /entries/:id]
  H -->|204| B
  B -->|500 or network fails| F
```

## How to Run

Deployed: <https://mgt3745-hw4.mgt3745-hw4-giancarlo.workers.dev/entries> ← replace with the URL `npx wrangler deploy` prints. It should return `[]` or a list of entries, never an error.

From a fresh Codespace:

1. Open the repository in a Codespace. The devcontainer installs xdg-utils and runs `npm install`.
2. `npx wrangler login --device`, then follow [docs/SESSION_B_COMMANDS.md](docs/SESSION_B_COMMANDS.md):
   - `npx wrangler d1 create mgt3745-entries`, then paste the printed `database_id` into `wrangler.toml` in place of `PASTE_ID_HERE`.
   - `npx wrangler d1 execute mgt3745-entries --remote --file=schema.sql`. The table stores `service` and `price`, not the template's `text`.
   - Add your Live Server origin (Ports tab, port 5500, e.g. `https://<codespace-name>-5500.app.github.dev`) to `ALLOWED_ORIGINS` in `worker.js`, then `npx wrangler deploy`.
3. Paste the deployed URL into `app.js` as `deployedApi`.
4. Right-click `index.html`, choose **Open with Live Server**.

Test a POST without the page:

```bash
curl -X POST https://mgt3745-hw4.<your-subdomain>.workers.dev/entries \
  -H 'content-type: application/json' -d '{"service":"Netflix","price":20}'   # 201
curl -X POST https://mgt3745-hw4.<your-subdomain>.workers.dev/entries \
  -H 'content-type: application/json' -d '{"service":"Netflix","price":0}'    # 400 price must be a number greater than 0
```

To run everything locally instead: `npx wrangler d1 execute mgt3745-entries --local --file=schema.sql`, then `npm run dev` (port 8787), then serve the page on `127.0.0.1:5500`. A page served from localhost talks to the local Worker automatically. Add `?serverDown` to the page URL to test the outage message.

## Status

| Feature | EARS statement | Verdict |
|---|---|---|
| Save a subscription | WHEN a valid subscription is submitted, THE SYSTEM SHALL store it on the server and confirm it on the page | PASS (local) |
| Reject a bad price (HW4 rule) | IF a submitted price is not a number greater than 0, THEN THE SYSTEM SHALL reject it and say why | PASS (local) |
| Reject a bad name | IF the service name is missing, empty, or longer than 200 characters, THEN THE SYSTEM SHALL reject it and say why | PASS (local) |
| Survive cleared cache | THE SYSTEM SHALL return stored subscriptions to any browser, including one whose site data was cleared | PASS (local) |
| Delete updates total | WHEN the user removes a subscription, THE SYSTEM SHALL delete it on the server so the total no longer includes it | PASS (local) |
| Network down / 500 / 400 | IF the server can't be reached or returns an error, THEN THE SYSTEM SHALL tell the user on the page | PASS (local) |
| Two clients, one table | Private per-user lists | DEFERRED (ADR-002 → ADR-003) |
| Renewal date (HW3 #5) | Where a renewal date is given, THE SYSTEM SHALL display it | FAIL (not built, unchanged from HW3) |

"Local" means walked against `npm run dev` on 9/24. The full verification
table, including SQL injection, XSS, and CORS checks, is in
[FEATURES.md](context/FEATURES.md#hw4-verification).

## Links

- HW3 repository (as submitted): <https://github.com/GiancarloMartinez-Saldana/mgt3745-hw3>
- Deployed Worker: <https://mgt3745-hw4.mgt3745-hw4-giancarlo.workers.dev>

Reading order for a stranger: [PROJECT.md](context/PROJECT.md) →
[USERS.md](context/USERS.md) → [FEATURES.md](context/FEATURES.md) →
[ARCHITECTURE.md](context/ARCHITECTURE.md) → [STANDARDS.md](context/STANDARDS.md) →
[TOOLS.md](context/TOOLS.md) → [STYLE.md](context/STYLE.md) →
[CLAUDE.md](context/CLAUDE.md)

## AI Use

**What did the agent write?** Claude Code (Anthropic's coding agent, run from
claude.ai) did the HW4 build on a branch:
- copied my HW3 files in
- changed `schema.sql` and `worker.js` to store `service` + `price`
- added the price validation rule, `DELETE`, and the CORS allow-list
- rewired `app.js` from localStorage to `fetch`
- drafted the Gate rerun, ADR-002, the TOOLS.md rows, the STYLE.md tokens and refusals, and the HW4 verification table

**What was checked, and how?** The agent ran the real `worker.js` under
`wrangler dev` with a local D1. It hit every path with `curl`: 201, each
400, 404, 500 with no binding, a SQL-injection string, and CORS from an
allowed and a disallowed origin. It then drove the actual page in Chromium
with Playwright: add three, clear all site data, reload, check a second
browser profile, delete, render HTML as text, and simulate an outage.
FEATURES.md records what each check returned. I still need to read the
diff line by line against STANDARDS.md before merging.

**What could not be fully verified?** The deployed Worker. The Cloudflare
login, `d1 create`, and `deploy` require my account, so the "PASS (local)"
rows still need a walk on the real URL. For the Worker specifically, the
thing I can't fully inspect is **D1 itself**: where Cloudflare physically
stores the rows, how it replicates them, and what it logs about each
request. I can read every line of `worker.js`, but not the platform under
it. That's why TOOLS.md records the crossing, and why the page tells users
to enter fictional data.

Hours spent: ___.
