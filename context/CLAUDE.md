# Claude instructions

Status: ACTIVE in Module 3.

This project is a subscription cost dashboard: users enter streaming
services and prices, and the app displays a running monthly total. As of
HW4 the subscriptions live in Cloudflare D1 behind `worker.js` (ADR-002);
`app.js` reaches them with `fetch`.

Read first: PROJECT.md, FEATURES.md, ARCHITECTURE.md, STANDARDS.md, TOOLS.md, STYLE.md. Do not read /curiosity unless asked.

These are the same rules as STANDARDS.md, restated as instructions for an agent. If this file and STANDARDS.md disagree, STANDARDS.md is the source of truth.

1. When naming variables and functions, use camelCase and choose names that describe what the value holds or what the function does in domain terms (e.g. `service`, `price`, `saveNotes`). Do not use single letters or generic names like `data` or `x`.

2. Keep structure, presentation, and behavior in separate files: HTML markup only in `index.html`, CSS only in `styles.css`, JavaScript only in `app.js`. Do not write inline styles. Do not add any `<script>` content to the HTML beyond the tag loading `app.js`.

3. When writing comments, explain why the code exists or why a decision was made. Do not write a comment that only restates what the next line does.

4. Never use `innerHTML` to render text that came from user input. Always use `textContent` instead, so user-typed content is never interpreted as HTML or executed as a script.

5. Never build SQL by concatenating strings or template literals. Use `env.DB.prepare(...).bind(...)` for every user value.

6. Never write a credential, token, or key into any file in this repository. A D1 `database_id` is an address and may go in `wrangler.toml`; an API token never does.

7. Never add a dependency or an external service without adding a row to TOOLS.md first.

8. Handle every failed response on the page with a message the user can read, and keep their input. Never throw to the console.

9. Every new Worker endpoint implements an EARS statement in FEATURES.md. Quote the statement in a comment above it.

When unsure, ask in a comment or in the chat rather than guessing, and say what you could not verify.
