#!/usr/bin/env node
/**
 * Fast check: authored skills/ vs project install (.agents + .claude).
 *
 * Usage:
 *   node diff-install.mjs
 *   node diff-install.mjs --skill writing --skill remind-me
 *
 * Exits 0. JSON on stdout. Skips install-local-skill unless named with --skill.
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SELF = "install-local-skill";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../../..");

function parseArgs(argv) {
  const skills = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--skill") {
      const next = argv[++i];
      if (!next) usage();
      skills.push(next);
    } else if (a === "--help" || a === "-h") usage(0);
    else usage();
  }
  return { skills };
}

function usage(code = 1) {
  console.error(`Usage:
  node diff-install.mjs
  node diff-install.mjs --skill <name> [--skill <name>...]`);
  process.exit(code);
}

function isSkillDir(dir) {
  return fs.existsSync(path.join(dir, "SKILL.md"));
}

function listAuthored() {
  const root = path.join(repoRoot, "skills");
  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter((e) => e.isDirectory() && isSkillDir(path.join(root, e.name)))
    .map((e) => e.name)
    .sort();
}

function linkInfo(p) {
  if (!fs.existsSync(p)) {
    return { path: p, exists: false, symlink: false, realpath: null };
  }
  const st = fs.lstatSync(p);
  const symlink = st.isSymbolicLink();
  let realpath = null;
  try {
    realpath = fs.realpathSync(p);
  } catch {
    realpath = null;
  }
  return { path: p, exists: true, symlink, realpath };
}

function contentDiff(a, b) {
  if (!fs.existsSync(a) || !fs.existsSync(b)) return null;
  try {
    if (fs.realpathSync(a) === fs.realpathSync(b)) return null;
  } catch {
    /* compare as trees */
  }
  const r = spawnSync("diff", ["-rq", a, b], { encoding: "utf8" });
  if (r.status === 0) return null;
  const out = `${r.stdout || ""}${r.stderr || ""}`.trim();
  return out || "differ";
}

function inspect(name) {
  const authored = path.join(repoRoot, "skills", name);
  const agents = path.join(repoRoot, ".agents", "skills", name);
  const claude = path.join(repoRoot, ".claude", "skills", name);
  const authoredInfo = linkInfo(authored);
  const agentsInfo = linkInfo(agents);
  const claudeInfo = linkInfo(claude);
  const authoredReal = authoredInfo.realpath;
  const agentsMatch = Boolean(authoredReal && agentsInfo.realpath === authoredReal);
  const claudeMatch = Boolean(authoredReal && claudeInfo.realpath === authoredReal);

  let status = "ok";
  let content = null;
  if (!authoredInfo.exists) status = "no-source";
  else if (!agentsInfo.exists || !claudeInfo.exists) status = "missing";
  else if (agentsMatch && claudeMatch) status = "ok";
  else {
    content = contentDiff(authored, agentsInfo.exists ? agents : authored);
    const claudeDiff = claudeInfo.exists ? contentDiff(authored, claude) : "missing";
    const sameContent = content === null && claudeDiff === null;
    status = sameContent ? "wrong-link" : "stale";
    if (claudeDiff && claudeDiff !== content) {
      content = [content, claudeDiff].filter(Boolean).join("\n");
    }
  }

  return {
    name,
    status,
    authored: authoredInfo,
    agents: { ...agentsInfo, matchesAuthored: agentsMatch },
    claude: { ...claudeInfo, matchesAuthored: claudeMatch },
    contentDiff: content,
  };
}

function main() {
  const { skills: requested } = parseArgs(process.argv.slice(2));
  const authored = listAuthored();
  const names = requested.length
    ? requested
    : authored.filter((n) => n !== SELF);

  const results = names.map(inspect);
  const payload = {
    repoRoot,
    self: SELF,
    skills: results,
    needsInstall: results
      .filter((s) => s.name !== SELF && s.status !== "ok" && s.status !== "no-source")
      .map((s) => s.name),
  };
  process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
}

main();
