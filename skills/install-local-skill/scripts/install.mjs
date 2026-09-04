#!/usr/bin/env node
/**
 * Project-local install: relative symlinks, same layout as this repo.
 *
 *   .agents/skills/<name>  →  ../../skills/<name>
 *   .claude/skills/<name>  →  ../../.agents/skills/<name>
 *
 * Usage:
 *   node install.mjs <name> [<name>...]
 *
 * Does not install install-local-skill unless --self is passed.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SELF = "install-local-skill";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../../..");

function usage(code = 1) {
  console.error(`Usage:
  node install.mjs <skill-name> [<skill-name>...]
  node install.mjs --self`);
  process.exit(code);
}

function parseArgs(argv) {
  const names = [];
  let allowSelf = false;
  for (const a of argv) {
    if (a === "--self") allowSelf = true;
    else if (a === "--help" || a === "-h") usage(0);
    else if (a.startsWith("-")) usage();
    else names.push(a);
  }
  return { names, allowSelf };
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function replaceWithSymlink(linkPath, target) {
  try {
    fs.lstatSync(linkPath);
    fs.rmSync(linkPath, { recursive: true, force: true });
  } catch {
    /* missing */
  }
  fs.symlinkSync(target, linkPath);
}

function installOne(name, allowSelf) {
  if (name === SELF && !allowSelf) {
    return { name, skipped: true, reason: "self" };
  }
  const source = path.join(repoRoot, "skills", name);
  if (!fs.existsSync(path.join(source, "SKILL.md"))) {
    return { name, ok: false, error: "no skills/<name>/SKILL.md" };
  }

  const agentsDir = path.join(repoRoot, ".agents", "skills");
  const claudeDir = path.join(repoRoot, ".claude", "skills");
  ensureDir(agentsDir);
  ensureDir(claudeDir);

  const agentsLink = path.join(agentsDir, name);
  const claudeLink = path.join(claudeDir, name);
  replaceWithSymlink(agentsLink, path.join("..", "..", "skills", name));
  replaceWithSymlink(claudeLink, path.join("..", "..", ".agents", "skills", name));

  return {
    name,
    ok: true,
    agents: agentsLink,
    claude: claudeLink,
    source,
  };
}

function main() {
  const { names, allowSelf } = parseArgs(process.argv.slice(2));
  if (!names.length && !allowSelf) usage();
  const toInstall = names.length ? names : allowSelf ? [SELF] : [];
  if (allowSelf && !toInstall.includes(SELF)) toInstall.push(SELF);

  const results = toInstall.map((n) => installOne(n, allowSelf));
  process.stdout.write(`${JSON.stringify({ repoRoot, results }, null, 2)}\n`);
  if (results.some((r) => r.ok === false)) process.exit(1);
}

main();
