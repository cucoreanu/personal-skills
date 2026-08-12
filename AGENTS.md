# Agent instructions

Guidance for any coding agent working in this repo.

## README skill entries

When you add or change a skill under `skills/`:

1. Update `README.md` **Skills** with that skill’s description (from `SKILL.md` frontmatter `description` when possible).
2. Put the **individual install command** immediately after that skill’s description — not in a shared “install one skill globally” section at the top.

```bash
npx skills add cucoreanu/personal-skills --skill <skill-name> -g -y
```

3. Keep the top-level install (whole package) only:

```bash
npx skills add cucoreanu/personal-skills
```

4. Do not document a single skill’s install outside its own README subsection.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/) (`feat`, `fix`, `docs`, …).
