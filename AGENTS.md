# Agent instructions

Guidance for any coding agent working in this repo.

## README skill entries

When you add or change a skill under `skills/`:

1. Mirror the skill folder into `.cursor/skills/<skill-name>/` so Cursor Cloud Agents and local repo skill discovery can load it (`.cursor/` is otherwise gitignored as a Skills CLI install artifact).
2. Update `README.md` **Skills** with that skill’s description (from `SKILL.md` frontmatter `description` when possible).
3. Put the **individual install command** immediately after that skill’s description — not in a shared “install one skill globally” section at the top.

```bash
npx skills add cucoreanu/personal-skills --skill <skill-name>
```

Do **not** add `-g` / `-y` (or other install flags) to documented commands — leave scope and prompts to the user/CLI defaults.

4. Keep the top-level install (whole package) only:

```bash
npx skills add cucoreanu/personal-skills
```

5. Put each skill’s install command under that skill’s heading section in README.md. Do not repeat it at the top of the README or in any shared install block.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/) (`feat`, `fix`, `docs`, …).
