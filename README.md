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

## License

MIT
