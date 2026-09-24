# Claude instructions

Status: ACTIVE in Module 3.

This project is a subscription cost dashboard: users enter streaming
services and prices, and the app displays a running monthly total.

These are the same rules as STANDARDS.md, restated as instructions for an agent. If this file and STANDARDS.md disagree, STANDARDS.md is the source of truth.

1. When naming variables and functions, use camelCase and choose names that describe what the value holds or what the function does in domain terms (e.g. `service`, `price`, `saveNotes`). Do not use single letters or generic names like `data` or `x`.

2. Keep structure, presentation, and behavior in separate files: HTML markup only in `index.html`, CSS only in `styles.css`, JavaScript only in `app.js`. Do not write inline styles. Do not add any `<script>` content to the HTML beyond the tag loading `app.js`.

3. When writing comments, explain why the code exists or why a decision was made. Do not write a comment that only restates what the next line does.

4. Never use `innerHTML` to render text that came from user input. Always use `textContent` instead, so user-typed content is never interpreted as HTML or executed as a script.
