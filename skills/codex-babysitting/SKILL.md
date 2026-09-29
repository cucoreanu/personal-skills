---
name: codex-babysitting
description: Monitor one GitHub PR for new review feedback, implement only meaningful fixes, and push back on unrealistic or overly defensive comments with evidence. Use when the user asks to babysit, watch, or monitor Codex/reviewer comments on a PR.
---

# Codex Babysitting

Watch one GitHub PR and handle new review feedback until a stop condition is met.

## Invocation

The first argument is the PR URL. An optional second argument is the polling interval in minutes.
Default interval is `5`. Reject non-positive values.

Examples:

```text
codex-babysitting https://github.com/org/repo/pull/123
codex-babysitting https://github.com/org/repo/pull/123 10
codex-babysitting https://github.com/org/repo/pull/123 10 min
```

## Start

1. Parse the PR URL and confirm the current checkout is the PR head branch.
2. Create or reuse a heartbeat automation for this run. Include:
   - PR URL
   - checkout path
   - polling interval
   - stop conditions
   - rule that push/reply/resolve needs explicit user confirmation unless standing permission was already granted
3. Identify the authenticated Codex identity used on the PR.
4. Load open review threads, PR comments, review states, and reactions.
5. Track each actionable item's stable ID and latest update timestamp.
6. Before each scan, stop immediately if Codex already added a thumbs-up (`+1`) reaction on the PR.

## Scan loop

At each scan, fetch the same PR data and compare IDs/timestamps. Only process newly changed feedback.

For each actionable item, read the full thread, changed code, and relevant tests, then classify:

- **Fix**: real defect/regression/security issue/clear project-standard violation.
- **Expected**: current behavior is intentional and already justified by code/tests/requirements.
- **Unrealistic**: theoretical or improbable edge case with weak user impact and no concrete evidence.
- **Over-defensive**: asks for speculative guard rails that add complexity/noise without proportional value.
- **Needs direction**: unclear/conflicting/scope-expanding request that cannot be safely decided from PR context.

## Meaningful-change gate

Only implement a fix when the feedback passes this gate:

1. **Credible trigger**: reproducible now, or a plausible production path grounded in the current code.
2. **Meaningful impact**: affects real users, reliability, security, compliance, or recurring maintenance cost.
3. **Reasonable trade-off**: benefit clearly outweighs added complexity and long-term burden.

If any gate fails, classify as **Unrealistic** or **Over-defensive**.

## Challenge low-value feedback

For **Unrealistic** and **Over-defensive** comments:

1. Do not change code only to satisfy the comment.
2. Reply with concise evidence:
   - why the scenario is unlikely or out-of-scope for this PR
   - current safeguards/behavior
   - why extra defensive code would be noise or cost without meaningful benefit
3. Keep tone firm and professional. Challenge assumptions, not people.
4. Resolve the thread after replying when the reasoning is complete and non-blocking.

## Action by class

- **Fix**
  1. Implement the smallest scoped correction.
  2. Run relevant verification.
  3. If verification fails, do not resolve the thread.
  4. Commit with repository commit conventions.
  5. Ask user confirmation that covers push + reply + thread resolution.
  6. Only after confirmation: push, reply with outcome/evidence, resolve thread.
- **Expected**
  1. No code change.
  2. Reply with evidence.
  3. Resolve after replying.
- **Unrealistic / Over-defensive**
  1. No code change.
  2. Reply with evidence-based pushback.
  3. Resolve after replying.
- **Needs direction**
  1. Leave unresolved.
  2. Ask PR author for decision.
  3. Stop monitoring loop until direction is provided.

General PR conversation comments cannot be GitHub-resolved. Reply there and resolve only linked review threads.

## Stop conditions

Stop after any of:

- Codex thumbs-up reaction added
- user-directed stop
- PR closed or merged
- authentication/authorization failure
- unresolved **Needs direction**

When stopping, pause/delete the matching heartbeat and report stop reason plus automation ID.

## Safeguards

- Never fabricate comments, reactions, approvals, test outcomes, or identities.
- Resolve only threads actually handled in this run.
- Never push/reply/resolve before required user confirmation.
- Summarize each scan: new feedback, actions taken, unresolved blockers, next scan or stop reason.
