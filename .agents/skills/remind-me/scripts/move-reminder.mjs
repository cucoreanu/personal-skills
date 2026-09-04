#!/usr/bin/env node
/**
 * Move (reschedule) an existing macOS Reminder.
 *
 * Usage:
 *   node move-reminder.mjs --match "Push personal-skills" --due 2026-08-12T10:30:00
 *   node move-reminder.mjs --id "x-apple-reminder://…" --due 2026-08-12T10:30:00
 *   node move-reminder.mjs --match "…" --list Reminders --due 2026-08-12T10:30:00
 *   node move-reminder.mjs --match "…" --due tomorrow-10:30
 *
 * --due accepts:
 *   - ISO local-ish: YYYY-MM-DDTHH:MM[:SS]
 *   - tomorrow-HH:MM
 *   - today-HH:MM
 */

import { spawnSync } from "node:child_process";

function usage(code = 1) {
  console.error(`Usage:
  node move-reminder.mjs (--match "text" | --id "x-apple-reminder://…") --due WHEN [--list Reminders]
  WHEN: YYYY-MM-DDTHH:MM | tomorrow-HH:MM | today-HH:MM`);
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

function print(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function escapeAs(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function parseDue(dueArg) {
  const now = new Date();
  let m = /^tomorrow-(\d{1,2}):(\d{2})$/.exec(dueArg);
  if (m) {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    d.setHours(Number(m[1]), Number(m[2]), 0, 0);
    return d;
  }
  m = /^today-(\d{1,2}):(\d{2})$/.exec(dueArg);
  if (m) {
    const d = new Date(now);
    d.setHours(Number(m[1]), Number(m[2]), 0, 0);
    return d;
  }
  m = /^(\d{4})-(\d{2})-(\d{2})T(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(dueArg);
  if (m) {
    return new Date(
      Number(m[1]),
      Number(m[2]) - 1,
      Number(m[3]),
      Number(m[4]),
      Number(m[5]),
      Number(m[6] || 0),
      0,
    );
  }
  throw new Error(`Invalid --due: ${dueArg}`);
}

function parts(date) {
  return {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    H: date.getHours(),
    MIN: date.getMinutes(),
    local: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`,
  };
}

function runOsascript(source) {
  const result = spawnSync("osascript", ["-e", source], {
    encoding: "utf8",
    maxBuffer: 5 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || "osascript failed").trim());
  }
  return (result.stdout || "").trim();
}

function moveByMatch(listName, match, due) {
  const p = parts(due);
  const listLit = escapeAs(listName);
  const matchLit = escapeAs(match);
  const source = `
tell application "Reminders"
  tell list "${listLit}"
    set matches to (every reminder whose name contains "${matchLit}" and completed is false)
    if (count of matches) is 0 then error "No incomplete reminder matching: ${matchLit}"
    set r to item 1 of matches
    set d to current date
    set time of d to 0
    set day of d to 1
    set year of d to ${p.y}
    set month of d to ${p.m}
    set day of d to ${p.d}
    set hours of d to ${p.H}
    set minutes of d to ${p.MIN}
    set seconds of d to 0
    set due date of r to d
    return (id of r) & "\\t" & (name of r) & "\\t" & ((due date of r) as string)
  end tell
end tell
`;
  return runOsascript(source);
}

function moveById(reminderId, due) {
  const p = parts(due);
  const idLit = escapeAs(reminderId);
  // Search lists for id — keep it narrow by iterating lists in AppleScript.
  const source = `
tell application "Reminders"
  set targetId to "${idLit}"
  set foundReminder to missing value
  repeat with L in lists
    try
      repeat with r in (reminders of L)
        if (id of r as string) is targetId then
          set foundReminder to r
          exit repeat
        end if
      end repeat
    end try
    if foundReminder is not missing value then exit repeat
  end repeat
  if foundReminder is missing value then error "Reminder id not found: " & targetId
  set d to current date
  set time of d to 0
  set day of d to 1
  set year of d to ${p.y}
  set month of d to ${p.m}
  set day of d to ${p.d}
  set hours of d to ${p.H}
  set minutes of d to ${p.MIN}
  set seconds of d to 0
  set due date of foundReminder to d
  return (id of foundReminder) & "\\t" & (name of foundReminder) & "\\t" & ((due date of foundReminder) as string)
end tell
`;
  return runOsascript(source);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || (!args.match && !args.id) || !args.due) usage(args.help ? 0 : 1);

  try {
    const due = parseDue(String(args.due));
    const list = args.list || "Reminders";
    const raw = args.id
      ? moveById(String(args.id), due)
      : moveByMatch(list, String(args.match), due);
    const [id, name, dueStr] = raw.split("\t");
    print({
      ok: true,
      id,
      name,
      list: args.id ? null : list,
      due: due.toISOString(),
      localDue: parts(due).local,
      dueDisplay: dueStr,
    });
  } catch (err) {
    print({
      ok: false,
      error: String(err.message || err),
      hint: "Allow Automation for Reminders if prompted. Prefer --match with --list over --id (faster).",
    });
    process.exit(1);
  }
}

main();
