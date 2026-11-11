---
name: fresh-branch
description: >-
  Runs scripts/fresh-branch.sh to detect the default branch, fast-forward it,
  and create a branch with the name the agent chooses. The agent checks the
  repo matches that result and, when the script fails or the check does not,
  tells the user what must change in the workflow. Use when the user asks to
  start a branch, branch off main or master, update the default branch and
  branch from it, or begin work from a fresh up-to-date base.
---

# Fresh branch

The script changes the repo. You choose the branch name, run it, and check the result. Do not fetch, switch, merge, or create branches yourself.

## Name

Use the name the user gave. If they described the work and did not name the branch, take a short kebab-case name from that work, using the prefix (`feat/`, `fix/`, ...) that recent branches in this repo share. If there is no name and no task, ask first.

## Run

From the user's repo, where `<skill-dir>` is the directory containing this file:

```bash
bash "<skill-dir>/scripts/fresh-branch.sh" "<name>"
```

Exit 0 prints `{"ok":true,"default":"…","branch":"…","commit":"…","subject":"…"}`. Exit 1 prints `{"ok":false,"message":"<failing git command and its output>"}` on stderr. The script stops at the first failing git command, so a failure can leave the repo on the default branch.

## Check

On exit 0, confirm yourself, not from the JSON:

- `git branch --show-current` equals the name you passed
- `git rev-parse HEAD` equals `git rev-parse <default>`, and `origin/<default>` when an `origin` remote exists

Then tell the user the default branch, the new branch, and the short SHA and subject.

## On failure

Do not repair the repo with your own git commands, and do not edit this skill unless asked. Quote `message` (or the failed check), say which branch the repo is on now, and say what must change:

- **The repo** (uncommitted changes in the way, branch name taken, diverged default branch, network or auth): say what to change; the script can then run again.
- **The workflow** (no usable default branch, an unexpected layout, a crash with no JSON, or exit 0 that fails the check): name the assumption that failed and the change the workflow needs.
