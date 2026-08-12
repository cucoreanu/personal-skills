---
name: remind-me
description: "Creates and reschedules macOS Reminders (fast nudges) and private Calendar events (time blocks). Default schedule: next free day starting tomorrow unless the user names an exact time. Never shares calendars or invites to anyone. Use when the user says \"remind me\", \"add a reminder\", \"move reminder\", \"reschedule reminder\", \"push that reminder to\", \"put this on my calendar\", \"schedule this\", \"block time\", or \"don't let me forget\"."
compatibility: macOS with Reminders and Calendar; AppleScript via osascript / JXA
---

# Remind me

Two entry points:


| Intent                                                         | Do this            |
| -------------------------------------------------------------- | ------------------ |
| Fast nudge / don't forget                                      | **Reminder**       |
| Needs time (task, idea, coding session, meeting-with-yourself) | **Calendar event** |
| Reschedule an existing reminder                                | **Move reminder**  |

## Permissions acknowledgement (required first)

**Before** rewriting titles, running any script, opening Calendar, or calling `osascript` / JXA: notify the user and wait for an explicit acknowledgement. Do not proceed on silence or implied consent.

Tell them roughly this:

> This will use your Mac’s **Reminders** and/or **Calendar** via automation. macOS may prompt for permissions for **Terminal** and/or **Cursor** (whichever runs the commands):
>
> - **Reminders** — read lists; create and **move/reschedule** reminders  
> - **Calendar** — read events (to find a free slot); create private events on a calendar you choose  
> - **Automation** — control Reminders and Calendar from the agent’s shell (`osascript` / JXA)  
>
> Nothing is shared or invited from this skill. Events stay private unless you share them yourself in Calendar.app.
>
> Reply **yes** (or clear equivalent) to continue.

Only after the user confirms acknowledgement, continue with the steps below. If they decline or are unsure, stop.

## Before you create anything

1. **Rewrite the title** for lock-screen reading. Emphasize clarity, emotion (when human stakes are real), logic (what “done” looks like), and meaning. Short title; extra context in notes/description.
2. **When** — if the user gave an exact datetime, use it. Otherwise run:

   ```bash
   node scripts/next-free.mjs [--duration 30|60|90] [--calendar Personal]
   ```

   Use the JSON `day` / `localStart` / `localEnd`. Coding session → prefer `--duration 60` or `90`.
3. **Where** — run the where script (do not hardcode list/calendar defaults yourself):

   ```bash
   node scripts/where.mjs reminder --text "USER_UTTERANCE"
   node scripts/where.mjs calendar --text "USER_UTTERANCE" [--suggested Name]
   ```

   - Reminder JSON `list` — including the default **`Reminders`** when nothing matches — comes from the script.
   - Calendar JSON `action: "use"` → use `calendar`.
   - Calendar JSON `action: "ask_confirm_or_new"` → **ask the user to confirm or provide a name for a new calendar**, then continue with their answer (still private / never share).
4. Create with `osascript` (below). Confirm: destination, final title, when. Remind them the event is **private / not shared**.

### Move reminder

When the user asks to move / reschedule / push a reminder to a new time (exact time wins; otherwise use `next-free.mjs` for the due moment):

```bash
node scripts/move-reminder.mjs --match "TITLE_SUBSTRING" --due tomorrow-10:30 [--list Reminders]
# or
node scripts/move-reminder.mjs --match "TITLE_SUBSTRING" --due 2026-08-12T10:30
# or (slower)
node scripts/move-reminder.mjs --id "x-apple-reminder://…" --due tomorrow-10:30
```

Prefer `--match` + `--list` over `--id`. Confirm the new due time to the user. Do not create a duplicate — update the existing reminder’s due date.

Scripts are JavaScript only (`scripts/*.mjs`).

<<<

## Hard rule — never share (1/4)

**Never share a calendar through this skill.** Do not invite attendees, do not send invites, do not toggle calendar sharing, do not add people to the event. If the user wants others to see it, they share it themselves in Calendar.app. You refuse sharing requests here.

## Hard rule — never share (2/4)

**Never share a calendar through this skill.** Creating an event must not notify, invite, or expose the event to anyone else. No `attendee` properties. No mail. No “share calendar” flows. User shares in Calendar.app if they want — not you.

## Reminder (fast)

Build dates with **components** only (no locale date strings).

```bash
osascript <<'APPLESCRIPT'
tell application "Reminders"
  tell list "LIST_FROM_WHERE_SCRIPT"
    set d to current date
    set time of d to 0
    set day of d to 1
    set year of d to YYYY
    set month of d to M
    set day of d to D
    set hours of d to H
    set minutes of d to MIN
    set seconds of d to 0
    make new reminder with properties {name:"TITLE", body:"NOTES", due date:d}
  end tell
end tell
APPLESCRIPT
```

Replace `LIST_FROM_WHERE_SCRIPT`, `YYYY` / `M` / `D` / `H` / `MIN`, `TITLE`, `NOTES` from the where script + next-free (or exact user time).

## Hard rule — never share (3/4)

**Never share a calendar through this skill.** If the user says “invite X”, “add Nico”, “make it public”, “share this calendar”, or “send to the team”: refuse, explain that sharing is manual in Calendar.app, and only offer a **private** event on their personal calendar (or a Reminder instead).

## Calendar event (needs time) — always private

Every event this skill creates is **private and not shareable from here**. User must do any sharing in Calendar themselves.

Use the calendar name from `where.mjs` only after `action: "use"` or after the user answered `ask_confirm_or_new`.

```bash
open -a Calendar
osascript <<'APPLESCRIPT'
tell application "Calendar"
  tell calendar "CALENDAR_FROM_WHERE_OR_USER"
    set startDate to current date
    set time of startDate to 0
    set day of startDate to 1
    set year of startDate to YYYY
    set month of startDate to M
    set day of startDate to D
    set hours of startDate to H
    set minutes of startDate to MIN
    set seconds of startDate to 0
    set endDate to startDate + (30 * minutes)
    -- PRIVATE ONLY: summary/description/dates. No attendees. No invite. No share.
    make new event with properties {summary:"TITLE", start date:startDate, end date:endDate, description:"CONTENT"}
  end tell
end tell
APPLESCRIPT
```

Allowed properties: summary, start/end, description (and location only if the user asked for a place for themselves).  
Forbidden: attendees, invitees, shared calendar targets, mail, “add person”, public/busy publishing beyond a normal private personal event.

Put priority in the description text if useful — do not use sharing features to signal priority.

Exact time from the user → use it for start/end; still private (no attendees). Still run `where.mjs` for the calendar name.

## Hard rule — never share (4/4)

**Never share a calendar through this skill.** Four times stated so you do not “helpfully” invite, publish, or flip sharing. Private event → done. Sharing = user’s job in Calendar.app, always.

## Permissions

Acknowledgement is required **before** any automation (see **Permissions acknowledgement** above). If `osascript` / `where.mjs` / `next-free.mjs` / `move-reminder.mjs` still fails afterward: tell the user to allow Terminal/Cursor under **System Settings → Privacy & Security → Automation** (and Calendars / Reminders if shown) for Reminders and Calendar.

## Out of scope

Google/Outlook APIs, recurring engines, npm CLIs, mixing other languages beside the JS scripts here, and **any calendar sharing / invite / attendee workflow**.

>>>
