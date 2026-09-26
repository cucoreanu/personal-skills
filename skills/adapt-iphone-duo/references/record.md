# Adaptation record

Write this to `iphone-duo.md` in the app project's root after the user confirms the shared understanding. If no app project is open, deliver this in the chat and ask where to put it.

Omit a surface section when every surface shares the same chrome, hierarchy, and content style. Omit a skipped branch only from the decision list; keep it under closed branches.

```markdown
# iPhone Duo — [app name]

## App

[What the existing iPhone app is. Separate facts found in the workspace from facts the user stated.]

## Locked constraints

- [Rule, one line.] See principles.md § [section].

## Decisions

### Chrome mapping

[Where each control goes. Wide items that stay in the navigation bar.]

### Content alignment

[Inset, mixed, or full-bleed. Which surfaces.]

### Inner display

[Sidebar, hierarchy side by side, or two-column reflow. Why this one.]

### Tabletop

[Custom tabletop layout, or none.]

### Sheets

[Outer vertical bar on or off, per sheet. Omit if the app has no sheets.]

### Video

[System picture-in-picture, or the custom-chrome exception. Omit if the app plays no video.]

## Closed branches

- [Branch skipped, and the fact that closed it.]

## Surfaces

### [Surface name]

[Repeat the decisions that differ on this surface.]
```
