#!/usr/bin/env node
/**
 * Resolve where a remind-me item should go.
 *
 * Usage:
 *   node where.mjs reminder --text "don't forget oat milk"
 *   node where.mjs calendar --text "block time for deep work"
 *   node where.mjs calendar --text "…" --suggested "Work"
 *
 * Reminder: match known lists from context; else "Reminders".
 * Calendar: prefer Personal. If the target looks non-personal / shared / team,
 * return action ask_confirm_or_new (agent must ask the user).
 */

import { spawnSync } from "node:child_process";

function usage(code = 1) {
  console.error(`Usage:
  node where.mjs reminder --text "…"
  node where.mjs calendar --text "…" [--suggested Name]`);
  process.exit(code);
}

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith("--")) args[key] = true;
      else {
        args[key] = next;
        i++;
      }
    } else args._.push(a);
  }
  return args;
}

function runJxa(source) {
  const result = spawnSync("osascript", ["-l", "JavaScript", "-e", source], {
    encoding: "utf8",
    maxBuffer: 5 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || "osascript failed").trim());
  }
  return (result.stdout || "").trim();
}

function listReminderLists() {
  const raw = runJxa(`
const Reminders = Application("Reminders");
JSON.stringify(Reminders.lists().map(l => l.name()));
`);
  return JSON.parse(raw);
}

function listCalendars() {
  spawnSync("open", ["-a", "Calendar"]);
  const raw = runJxa(`
const Calendar = Application("Calendar");
JSON.stringify(Calendar.calendars().map(c => c.name()));
`);
  return JSON.parse(raw);
}

function print(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

/** Known reminder lists → matchers. First match wins. Else Reminders. */
const REMINDER_RULES = [
  {
    list: "Shopping",
    test: (t) =>
      /\b(shop|shopping|buy|grocer|oat milk|eggs|dishwasher|errand|pick up)\b/i.test(
        t,
      ),
  },
  {
    list: "What I want to do today",
    test: (t) =>
      /\b(today|tonight|this morning|this afternoon|asap|before end of day)\b/i.test(
        t,
      ),
  },
  {
    list: "What I want to do this month",
    test: (t) => /\b(this month|by month.?end|later this month)\b/i.test(t),
  },
  {
    list: "Goals",
    test: (t) =>
      /\b(goal|aspire|habit|want to|someday|5k|without stopping)\b/i.test(t),
  },
];

const DEFAULT_REMINDER_LIST = "Reminders";

/** Calendars safe to use without asking. */
const PERSONAL_CALENDARS = new Set(["Personal"]);

const NON_PERSONAL_HINT =
  /\b(work|team|shared|invite|public|company|staff|cdo|3pillar|cisco|family calendar|holidays?|birthdays?|siri)\b/i;

function resolveReminder(text, lists) {
  const available = new Set(lists);
  for (const rule of REMINDER_RULES) {
    if (rule.test(text) && available.has(rule.list)) {
      return {
        ok: true,
        kind: "reminder",
        list: rule.list,
        matched: rule.list,
        availableLists: lists,
      };
    }
  }
  const list = available.has(DEFAULT_REMINDER_LIST)
    ? DEFAULT_REMINDER_LIST
    : lists[0] || DEFAULT_REMINDER_LIST;
  return {
    ok: true,
    kind: "reminder",
    list,
    matched: "default",
    availableLists: lists,
  };
}

function looksNonPersonal(name, text) {
  if (!name) return false;
  if (PERSONAL_CALENDARS.has(name)) return false;
  if (NON_PERSONAL_HINT.test(name)) return true;
  if (NON_PERSONAL_HINT.test(text)) return true;
  // Any calendar other than Personal requires confirm.
  return name !== "Personal";
}

function resolveCalendar(text, calendars, suggested) {
  const available = new Set(calendars);
  const preferred =
    suggested ||
    (available.has("Personal") ? "Personal" : null);

  if (!preferred) {
    return {
      ok: true,
      kind: "calendar",
      action: "ask_confirm_or_new",
      suggested: null,
      prompt:
        "Ask the user to confirm or provide a name for a new private personal calendar.",
      availableCalendars: calendars,
    };
  }

  if (looksNonPersonal(preferred, text) || !PERSONAL_CALENDARS.has(preferred)) {
    return {
      ok: true,
      kind: "calendar",
      action: "ask_confirm_or_new",
      suggested: preferred,
      prompt:
        "Ask the user to confirm or provide a name for a new private personal calendar.",
      reason: PERSONAL_CALENDARS.has(preferred)
        ? "context suggests a non-personal calendar"
        : `"${preferred}" is not the private Personal calendar`,
      availableCalendars: calendars,
    };
  }

  if (!available.has(preferred)) {
    return {
      ok: true,
      kind: "calendar",
      action: "ask_confirm_or_new",
      suggested: preferred,
      prompt:
        "Ask the user to confirm or provide a name for a new private personal calendar.",
      reason: `"${preferred}" not found in Calendar`,
      availableCalendars: calendars,
    };
  }

  return {
    ok: true,
    kind: "calendar",
    action: "use",
    calendar: preferred,
    availableCalendars: calendars,
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const kind = args._[0];
  const text = String(args.text || "");
  if (!kind || args.help) usage(kind ? 0 : 1);

  try {
    if (kind === "reminder") {
      const lists = listReminderLists();
      print(resolveReminder(text, lists));
      return;
    }
    if (kind === "calendar") {
      const calendars = listCalendars();
      print(resolveCalendar(text, calendars, args.suggested || null));
      return;
    }
    usage();
  } catch (err) {
    print({
      ok: false,
      error: String(err.message || err),
      hint: "Allow Automation for Reminders/Calendar if prompted.",
    });
    process.exit(1);
  }
}

main();
