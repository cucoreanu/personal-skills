#!/usr/bin/env node
/**
 * Find the next free daytime slot starting tomorrow (unless --day is set).
 *
 * Usage:
 *   node next-free.mjs
 *   node next-free.mjs --duration 60
 *   node next-free.mjs --day 2026-08-15 --duration 30
 *   node next-free.mjs --calendar Personal
 *
 * Only inspects the given calendar (default Personal) — keeps it fast/private.
 */

import { spawnSync } from "node:child_process";

function usage(code = 1) {
  console.error(`Usage:
  node next-free.mjs [--day YYYY-MM-DD] [--duration 30] [--start-hour 9] [--end-hour 18] [--calendar Personal] [--max-days 14]`);
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

function pad(n) {
  return String(n).padStart(2, "0");
}

function localParts(date) {
  return {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    isoDate: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
  };
}

function atLocal(y, m, d, hour, minute = 0) {
  return new Date(y, m - 1, d, hour, minute, 0, 0);
}

function addDays(date, n) {
  const x = new Date(date);
  x.setDate(x.getDate() + n);
  return x;
}

function formatLocal(date) {
  const { y, m, d } = {
    y: date.getFullYear(),
    m: pad(date.getMonth() + 1),
    d: pad(date.getDate()),
  };
  return `${y}-${m}-${d} ${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

function runJxa(source) {
  const result = spawnSync("osascript", ["-l", "JavaScript", "-e", source], {
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || "osascript failed").trim());
  }
  return (result.stdout || "").trim();
}

function fetchBusy(calendarName, y, m, d) {
  spawnSync("open", ["-a", "Calendar"]);
  // Component-style construction inside JXA via Date — query one calendar only.
  const source = `
const Calendar = Application("Calendar");
const cals = Calendar.calendars.whose({ name: ${JSON.stringify(calendarName)} })();
if (!cals.length) {
  JSON.stringify({ error: "calendar_not_found", calendar: ${JSON.stringify(calendarName)} });
} else {
  const cal = cals[0];
  const dayStart = new Date(${y}, ${m - 1}, ${d}, 0, 0, 0, 0);
  const dayEnd = new Date(${y}, ${m - 1}, ${d} + 1, 0, 0, 0, 0);
  const evts = cal.events.whose({
    _and: [
      { startDate: { _lessThan: dayEnd } },
      { endDate: { _greaterThan: dayStart } }
    ]
  })();
  const intervals = evts.map(e => ({
    start: e.startDate().toISOString(),
    end: e.endDate().toISOString(),
    summary: e.summary()
  }));
  JSON.stringify({ intervals });
}
`;
  const raw = runJxa(source);
  const parsed = JSON.parse(raw);
  if (parsed.error) throw new Error(`${parsed.error}: ${parsed.calendar}`);
  return parsed.intervals.map((iv) => ({
    start: new Date(iv.start),
    end: new Date(iv.end),
    summary: iv.summary,
  }));
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart;
}

function findSlotOnDay(day, durationMin, startHour, endHour, intervals) {
  const durationMs = durationMin * 60 * 1000;
  const windowStart = atLocal(day.y, day.m, day.d, startHour, 0);
  const windowEnd = atLocal(day.y, day.m, day.d, endHour, 0);
  let cursor = new Date(windowStart);

  while (cursor.getTime() + durationMs <= windowEnd.getTime()) {
    const candidateEnd = new Date(cursor.getTime() + durationMs);
    const conflict = intervals.some((iv) =>
      overlaps(cursor, candidateEnd, iv.start, iv.end),
    );
    if (!conflict) {
      return { start: cursor, end: candidateEnd, busyCount: intervals.length };
    }
    const blockers = intervals.filter((iv) =>
      overlaps(cursor, candidateEnd, iv.start, iv.end),
    );
    let jump = cursor.getTime() + 15 * 60 * 1000;
    for (const iv of blockers) jump = Math.max(jump, iv.end.getTime());
    cursor = new Date(jump);
  }
  return null;
}

function parseStartDay(dayArg) {
  const now = new Date();
  if (!dayArg || dayArg === "tomorrow") {
    return localParts(addDays(now, 1));
  }
  if (dayArg === "today") return localParts(now);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dayArg);
  if (!m) throw new Error(`Invalid --day: ${dayArg}`);
  return {
    y: Number(m[1]),
    m: Number(m[2]),
    d: Number(m[3]),
    isoDate: dayArg,
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) usage(0);

  const durationMin = Number(args.duration || 30);
  const startHour = Number(args["start-hour"] || 9);
  const endHour = Number(args["end-hour"] || 18);
  const maxDays = Number(args["max-days"] || 14);
  const calendar = args.calendar || "Personal";

  try {
    let day = parseStartDay(args.day);
    const checked = [];

    for (let i = 0; i < maxDays; i++) {
      const intervals = fetchBusy(calendar, day.y, day.m, day.d);
      checked.push({ day: day.isoDate, busy: intervals.length });
      const slot = findSlotOnDay(
        day,
        durationMin,
        startHour,
        endHour,
        intervals,
      );
      if (slot) {
        print({
          ok: true,
          calendar,
          day: day.isoDate,
          start: slot.start.toISOString(),
          end: slot.end.toISOString(),
          localStart: formatLocal(slot.start),
          localEnd: formatLocal(slot.end),
          durationMinutes: durationMin,
          busyCount: slot.busyCount,
          checked,
        });
        return;
      }
      const next = addDays(atLocal(day.y, day.m, day.d, 12, 0), 1);
      day = localParts(next);
    }

    print({
      ok: false,
      error: "No free slot found in range",
      calendar,
      durationMinutes: durationMin,
      checked,
    });
    process.exit(1);
  } catch (err) {
    print({
      ok: false,
      error: String(err.message || err),
      hint: "Allow Automation for Calendar if prompted. Prefer --calendar Personal.",
    });
    process.exit(1);
  }
}

main();
