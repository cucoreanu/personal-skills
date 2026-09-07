#!/usr/bin/env node
/**
 * Attach a local file to an existing Calendar event via EventKit.
 * Calendar.app AppleScript cannot add attachments (no dictionary support).
 *
 * Usage:
 *   node attach.mjs --match "TITLE_SUBSTRING" --file /absolute/path.png
 *   node attach.mjs --match "TITLE_SUBSTRING" --file /path --start 2026-09-09
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

function usage(code = 1) {
  console.error(`Usage:
  node attach.mjs --match "TITLE_SUBSTRING" --file /absolute/path [--start YYYY-MM-DD]`);
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

function swiftSource({ match, filePath, startYmd }) {
  const startFilter = startYmd
    ? `
let startParts = "${startYmd}".split(separator: "-").compactMap { Int($0) }
guard startParts.count == 3 else { fputs("bad --start\\n", stderr); exit(1) }
let dayStart = Calendar.current.date(from: DateComponents(year: startParts[0], month: startParts[1], day: startParts[2]))!
let windowStart = dayStart.addingTimeInterval(-86400)
let windowEnd = dayStart.addingTimeInterval(86400 * 2)
`
    : `
let windowStart = Date().addingTimeInterval(-86400 * 14)
let windowEnd = Date().addingTimeInterval(86400 * 21)
`;

  return `import EventKit
import Foundation
import ObjectiveC

let match = ${JSON.stringify(match)}.lowercased()
let filePath = ${JSON.stringify(filePath)}
let fileName = (filePath as NSString).lastPathComponent
${startFilter}
let store = EKEventStore()
let sem = DispatchSemaphore(value: 0)
var granted = false
var authError: String?
store.requestFullAccessToEvents { ok, err in
  granted = ok
  authError = err?.localizedDescription
  sem.signal()
}
_ = sem.wait(timeout: .now() + 20)
if !granted {
  fputs("calendar access denied: \\(authError ?? "unknown")\\n", stderr)
  exit(4)
}

let pred = store.predicateForEvents(withStart: windowStart, end: windowEnd, calendars: nil)
let events = store.events(matching: pred).filter { ($0.title ?? "").lowercased().contains(match) }
guard let ev = events.first else {
  fputs("event not found\\n", stderr)
  exit(2)
}

let existing = (ev.perform(NSSelectorFromString("attachments"))?.takeUnretainedValue() as? [NSObject]) ?? []
let already = existing.contains { att in
  let name = att.perform(NSSelectorFromString("fileName"))?.takeUnretainedValue() as? String
  return name == fileName
}
func emit(_ skipped: Bool, _ title: String) {
  let payload: [String: Any] = [
    "ok": true,
    "skipped": skipped,
    "title": title,
    "fileName": fileName,
  ]
  let data = try! JSONSerialization.data(withJSONObject: payload)
  FileHandle.standardOutput.write(data)
  FileHandle.standardOutput.write(Data("\\n".utf8))
}

if already {
  emit(true, ev.title ?? "")
  exit(0)
}

let fileURL = URL(fileURLWithPath: filePath)
let attClass = NSClassFromString("EKAttachment") as! NSObject.Type
let att = attClass.perform(NSSelectorFromString("alloc"))?.takeUnretainedValue() as! NSObject
_ = att.perform(NSSelectorFromString("initWithFilepath:"), with: fileURL)
ev.perform(NSSelectorFromString("addAttachment:"), with: att)
do {
  try store.save(ev, span: .thisEvent, commit: true)
  emit(false, ev.title ?? "")
} catch {
  fputs("save failed: \\(error)\\n", stderr)
  exit(3)
}
`;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.match || !args.file) usage(args.help ? 0 : 1);

  const filePath = path.resolve(String(args.file));
  if (!fs.existsSync(filePath)) {
    print({ ok: false, error: `file not found: ${filePath}` });
    process.exit(1);
  }

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "remind-me-attach-"));
  const swiftPath = path.join(dir, "attach.swift");
  fs.writeFileSync(
    swiftPath,
    swiftSource({
      match: String(args.match),
      filePath,
      startYmd: args.start ? String(args.start) : null,
    }),
  );

  const result = spawnSync("swift", [swiftPath], {
    encoding: "utf8",
    maxBuffer: 2 * 1024 * 1024,
  });
  fs.rmSync(dir, { recursive: true, force: true });

  if (result.status !== 0) {
    print({
      ok: false,
      error: (result.stderr || result.stdout || "swift attach failed").trim(),
      hint: "Allow Calendar Full Access for Terminal/Cursor under System Settings → Privacy & Security → Calendars.",
    });
    process.exit(1);
  }

  const line = (result.stdout || "")
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.startsWith("{"))
    .pop();
  if (!line) {
    print({ ok: false, error: "no JSON from attach helper", stdout: result.stdout });
    process.exit(1);
  }
  process.stdout.write(`${line}\n`);
}

main();
