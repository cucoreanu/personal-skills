# personal-skills

Personal [Agent Skills](https://agentskills.io/) for Cursor / Claude Code / Codex.

```bash
npx skills add cucoreanu/personal-skills
```

Authored packages live under [`skills/`](./skills/). The same folders are also installed as Cursor **project skills** in [`.cursor/skills/`](./.cursor/skills/) so Cloud Agents and local workspaces can load them without a separate `npx skills add`.

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

Proofreads Slack-style workplace messages and teaches reusable writing patterns. Use when the user pastes a work message, Slack draft, status update, or asks for proofreading, tone, clarity, grammar, flow, or constructive feedback on writing they will send at work.

```bash
npx skills add cucoreanu/personal-skills --skill writing
```

- Path: [`skills/writing/`](./skills/writing/)
- Response shape: clean version → what changed and why → risk check → better pattern to learn

### penpot-design

Designs UI in Penpot via MCP with component discipline, flex alignment, mockup/design modes, and optional skill updates from user feedback. Use for Penpot mockups, high-fidelity designs, Penpot MCP work, or component/variant refactors in Penpot.

```bash
npx skills add cucoreanu/personal-skills --skill penpot-design
```

- Path: [`skills/penpot-design/`](./skills/penpot-design/)
- Modes: `mockup` (low-fi validation; multi-alt only when asked) · `design` (higher fidelity)
- Extendable: asks before capturing reusable user feedback into the skill; updates `personal-skills` after the current task, then reinstalls
- References: Material-inspired control alignment, Penpot API pitfalls
- Research notes: [`research/penpot-design-practices.md`](./research/penpot-design-practices.md), [`research/material-design-alignment.md`](./research/material-design-alignment.md)

## License

MIT
