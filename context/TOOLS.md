# TOOLS.md

The ledger of Trust Boundary crossings. One row per external service this
repository depends on. Read by the agent on every task, so keep it short: a
service not in use does not belong here.

Never put a credential in this file. A key, token, or password anywhere in
the repository is graded as a security failure regardless of the rest.

Each crossing statement answers three questions in one first-person sentence:
what crosses, to whom, and who is accountable.

| Service | Trusted with | Credentials live | Crossing statement | Switching cost |
|---|---|---|---|---|
| Cloudflare Workers + D1 | Every subscription a user types (service name, monthly price, timestamp); request metadata (IP, user agent, time) that Cloudflare logs by default | Cloudflare dashboard login; wrangler OAuth token inside the Codespace (never in the repo) | "Users' subscription names and prices leave the browser and are stored in Cloudflare D1 under Cloudflare's free-plan terms, in a region I did not choose, readable by anyone with the Worker URL; I am accountable." | **Medium**: `npm run db:export` for the data, then rewrite one ~100-line Worker for another host |
| GitHub + Codespaces | Source code, full commit history, context files, the devcontainer, and the running Codespace, where the wrangler token lives | GitHub account login | "My code, my history, and the Codespace that holds my Cloudflare token are hosted by GitHub under its terms, and the repository is public; I am accountable for keeping secrets out of every commit." | **Low**: `git clone` to any machine or host; the devcontainer is plain Node 22 |
| GitHub Copilot (VS Code extension installed by the devcontainer) | Whatever files and code are open in the Codespace editor, sent to GitHub/Microsoft as context for suggestions | GitHub account login | "Code I have open in the Codespace is sent to GitHub's Copilot service to generate suggestions, and any suggestion I accept is mine to verify; I am accountable for what I commit." | **Low**: uninstall the extension; nothing in the repo depends on it |
| wrangler (npm package, devDependency) | Runs with my full user permissions in the Codespace during `npm install` and every `npx wrangler` call; holds and uses the Cloudflare login token | No credential of its own; it stores the Cloudflare OAuth token in the Codespace's home directory | "Installing wrangler runs code written by Cloudflare and every package it depends on, with access to my Codespace and my Cloudflare token, pinned only to `^4`; like the event-stream incident, a compromised dependency would inherit that trust, and I am accountable for what I install." | **Medium**: wrangler is the deploy path, so leaving it means leaving Workers (see first row) |
| Claude Code (Anthropic, run from claude.ai) | The whole repository and my public HW3 repository, cloned into an Anthropic-hosted container; it edited files, ran the Worker locally, and pushed commits to a branch | claude.ai account login; GitHub access granted to the Claude GitHub app | "For HW4, my repository contents went to Anthropic's Claude Code service, which wrote and pushed changes on a branch I review before merging; I am accountable for every line I merge." | **Low**: stop using it; the repo does not depend on it |

## Revisit triggers

- A new service is added to the repository.
- A vendor changes pricing, terms, or region.
- A credential moves.
