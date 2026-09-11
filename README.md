# personal-skills

Personal [Agent Skills](https://agentskills.io/) for Cursor / Claude Code / Codex.

```bash
npx skills add cucoreanu/personal-skills
```

## Skills

### remind-me

Creates and reschedules macOS Reminders (fast nudges) and private Calendar events (time blocks). Default schedule: next free day starting tomorrow unless the user names an exact time. Never shares calendars or invites to anyone. Use when the user says "remind me", "add a reminder", "move reminder", "reschedule reminder", "push that reminder to", "put this on my calendar", "schedule this", "block time", or "don't let me forget".

```bash
npx skills add cucoreanu/personal-skills --skill remind-me
```

- Path: [`skills/remind-me/`](./skills/remind-me/)
- Compatibility: macOS with Reminders and Calendar; AppleScript via `osascript`
- Scripts (JS only): `where.mjs`, `next-free.mjs`, `move-reminder.mjs`

### writing

Proofreads messages and teaches reusable writing patterns. Use when the user pastes a work message, Slack draft, status update, public/social reply, or asks for proofreading, tone, clarity, grammar, flow, or constructive feedback on writing they will send.

```bash
npx skills add cucoreanu/personal-skills --skill writing
```

- Path: [`skills/writing/`](./skills/writing/)
- Response shape: clean version → what changed and why → risk check → better pattern to learn
- Patterns: work updates (context → focus → pause → reason → status) · joke nits (definition last, once; do not reuse “bar for” on every later comment)

### penpot-design

Designs UI in Penpot via MCP with component discipline, flex alignment, outside-in build order, mockup/design modes, and optional skill updates from user feedback. Use for Penpot mockups, high-fidelity designs, Penpot MCP work, or component/variant refactors in Penpot.

```bash
npx skills add cucoreanu/personal-skills --skill penpot-design
```

- Path: [`skills/penpot-design/`](./skills/penpot-design/)
- Modes: `mockup` (low-fi validation; multi-alt only when asked) · `design` (higher fidelity)
- Canvas: outside-in (container → child shells → nested elements)
- Extendable: asks before capturing reusable user feedback into the skill; updates `personal-skills` after the current task, then reinstalls
- References: Material-inspired control alignment, Penpot API pitfalls, canvas build order
- Research notes: [`research/penpot-design-practices.md`](./research/penpot-design-practices.md), [`research/material-design-alignment.md`](./research/material-design-alignment.md)

### penpot-mockup

Plans and builds UI mockups in Penpot with user-centered workflow, fidelity levels, a six-step process, and outside-in canvas assembly. Use when creating mockups, screen mockups, wireframe-to-mockup work, low/high-fidelity UI, platform-specific layouts, or mockup design best practices in Penpot.

```bash
npx skills add cucoreanu/personal-skills --skill penpot-mockup
```

- Path: [`skills/penpot-mockup/`](./skills/penpot-mockup/)
- Execute builds with **`penpot-design`** (components, flex, API, outside-in tree)
- Fidelity: `low` (structure/flow) or `high` (color, type, polish)

### install-local-skill

Agent-only. After the user asks to create a PR for a new or updated skill under skills/ (never this skill), check project install vs source with scripts/diff-install.mjs; if missing or stale, ask to install locally via relative symlinks. Use when authoring or changing skills in this repo, opening a skill PR, or finishing skill work.

```bash
npx skills add cucoreanu/personal-skills --skill install-local-skill
```

- Path: [`skills/install-local-skill/`](./skills/install-local-skill/)
- `user-invocable: false` — agents invoke this; it is not a user slash command
- Scripts: `diff-install.mjs` (fast symlink/realpath check, `diff -rq` only if needed), `install.mjs` (relative `.agents` / `.claude` symlinks)

## License

MIT
