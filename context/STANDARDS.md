# Standards

Status: ACTIVE in Module 3. Adapt these rules to your feature and follow them.

1. **Naming.** Variables and functions use camelCase and describe what they hold or do in domain terms — `service`, `price`, `saveNotes` — not single letters or generic names like `data` or `x`.

2. **File structure.** The three concerns stay in three files: `index.html` holds structure only, `styles.css` holds presentation only, `app.js` holds behavior and data. No inline styles, and no `<script>` content in the HTML beyond the single tag that loads `app.js`.

3. **Comments.** Comments explain why code exists, never what it does line by line. A comment restating the next line in English is deleted, not written.

4. **Commit messages.** Each commit message is one imperative-mood line describing what changed and why it mattered — "Add price validation to submit handler," not "fixed stuff" or "updates."

5. **Forbidden pattern.** Never use `innerHTML` to display text a user typed. Always use `textContent`, so user input can never be interpreted as HTML or executed as a script.

**Source of truth:** If STANDARDS.md and CLAUDE.md ever disagree, STANDARDS.md wins. It's written for a human to read and agree to first; CLAUDE.md is a restatement of the same rules for an agent, not an independent source of authority.

## Split Test

**Rule: Naming (camelCase, descriptive domain terms)**
This rule applies to every task in the project — there's no task that generates code without also naming something. It stays the same from task to task; nothing about it depends on what's currently being built. If it were missing from persistent context and only given per-task, the risk is *confusion*: without a standing convention, an agent might name things differently across sessions, and a reader stitching the file together would see inconsistent style with no way to tell if it was intentional.
**Verdict: belongs in CLAUDE.md.**

**Rule: Forbidden pattern (no innerHTML for user text)**
This also applies to every task that touches rendering, which is most of this project's tasks. It doesn't change — it's a hard security-relevant rule, not something that varies by context. If it were left out of persistent context, the risk is *poisoning*: a single generated snippet using `innerHTML` could introduce a real vulnerability, and unlike a style inconsistency, this kind of mistake compounds silently until an attacker exploits it.
**Verdict: belongs in CLAUDE.md.**

**Rule: Commit messages (imperative mood, what/why)**
This rule only applies to the narrow task of writing a commit — it has nothing to do with tasks like debugging, explaining a function, or reviewing code for a bug. It doesn't change task to task, but it's only *relevant* on a fraction of tasks. Leaving it in CLAUDE.md risks *distraction*: on every unrelated task (reading a stack trace, explaining a regex), the agent is still holding commit-formatting rules in its context that have nothing to do with the work in front of it.
**Verdict: belongs in the prompt, not CLAUDE.md.**

*Prompt snippet, to be used only when asking for a commit message:*
> "Write this commit message as one imperative-mood line describing what changed and why it mattered. Don't describe the diff mechanically — say what changed in plain terms."

## Colleague Test

Who read it: No classmate was reachable before the deadline. Simulated 
this test with Claude (Anthropic), disclosed here and in the README's 
AI Use section as a substitute for an unavailable classmate, not a 
real person's response.

What was misunderstood or asked about: The reader correctly inferred 
the file structure and security rule (rule 4), but could not tell what 
domain the app belonged to — the naming examples (service, price) hint 
at it but CLAUDE.md never states the app's purpose outright.

Revision made: Added a one-line context sentence at the top of CLAUDE.md 
stating the project is a subscription cost dashboard, so a reader (human 
or agent) doesn't have to infer the domain from variable-naming examples 
alone.
