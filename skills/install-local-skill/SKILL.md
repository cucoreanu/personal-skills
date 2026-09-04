---
name: install-local-skill
description: "Agent-only. After the user asks to create a PR for a new or updated skill under skills/ (never this skill), check project install vs source with scripts/diff-install.mjs; if missing or stale, ask to install locally via relative symlinks. Use when authoring or changing skills in this repo, opening a skill PR, or finishing skill work."
user-invocable: false
---

# Install local skill

Not a user command. Do not offer it as a slash skill. Never apply this workflow to **this skill** (`install-local-skill`).

## When

Run **after** the user has asked you to create a PR (or you are creating that PR), and only if this turn created or updated a skill under `skills/<name>/` other than `install-local-skill`.

Skip entirely when:

- The only skill touched is `install-local-skill`
- The user never asked for a PR and you are not opening one
- Context already shows the skill is released **and** local install matches source (see defer)

## Defer (do not prompt yet)

If it is unclear whether the skill was released, or a PR is in flight, **check install first** — do not ask until you know it is missing or stale.

From repo root:

```bash
node skills/install-local-skill/scripts/diff-install.mjs --skill <name>
```

Omit `--skill` to scan every authored skill except this one.

Fast path: if `.agents/skills/<name>` and `.claude/skills/<name>` already resolve to the same real path as `skills/<name>`, status is `ok` — **do not prompt**. Only run tree `diff` when the install is not that symlink layout.

Prompt only when `needsInstall` is non-empty (or that skill’s `status` is `missing`, `stale`, or `wrong-link`).

## Ask

Ask once, naming the skill(s):

> Install `<name>` locally in this repo (symlink `.agents` / `.claude` to `skills/`) so Cloud Agents and other tools pick it up?

Do not install on silence. Proceed only on an explicit yes.

## Install (same technique as this repo)

Do **not** use `npx skills add` (it copies into `.agents/skills/`). After yes:

```bash
node skills/install-local-skill/scripts/install.mjs <name>
```

That replaces the project install with relative symlinks:

- `.agents/skills/<name>` → `../../skills/<name>`
- `.claude/skills/<name>` → `../../.agents/skills/<name>`

Then re-run `diff-install.mjs --skill <name>` and confirm `status` is `ok`. Commit the new symlinks with the PR when they belong in git.

## Do not

- Prompt while still only drafting the skill, before a PR was requested
- Install `install-local-skill` via this workflow
- Global (`-g`) installs
- Copy trees into `.agents/skills/` or `.claude/skills/`
