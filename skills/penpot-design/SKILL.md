---
name: penpot-design
description: Designs UI in Penpot via MCP with component discipline, flex alignment, mockup/design modes, and optional skill updates from user feedback. Use for Penpot mockups, high-fidelity designs, Penpot MCP work, or component/variant refactors in Penpot.
---

# Penpot Design

Penpot MCP only — no parallel HTML/CSS unless asked. Read `high_level_overview` once; inspect focused page (`shapeStructure`, components/tokens) before writes.

## Ask first

1. **Mode:** `mockup` or `design`?
2. **Instructions:** what to build/change. Multi-variant alternatives **only if asked**.
3. **Platform:** use project rules if set; else ask. Never assume iOS/Android/web.

Stop when any is missing.

## Modes

**Mockup** — low-fi validation: structure, hierarchy, flow; simple fills, real spacing; no polish unless asked.

**Design** — higher fidelity: tokens, typography, states, chrome. Same component/flex rules. Prefer group → componentize → refine over rebuild.

## Rules

**Components:** appears twice → component/instance. Same foundation, different state → **variants** (`Active`, `State`, `Size`, …). Structure on **mains**; overrides on copies; `detach()` to fork only. Names: `Toolbar/Button`; layers: `background`, `icon`, `label` (stable across variants). Depth ≤ 4; no mains inside mains.

**Layout:** flex/grid; `penpotUtils.addFlexLayout` if children exist. Spacing: 8dp scale (4 half-step). Controls: [material-alignment.md](references/material-alignment.md). Active = variant/style, not layout shift. Z-order: background → content → overlays.

**Process:** group existing → `createComponent` → replace dupes with instances. Order: tokens → atoms → variants → screens. Verify with `export_shape`. Plan before large rewrites.

**API:** [penpot-api.md](references/penpot-api.md). Deep dive: repo `research/penpot-design-practices.md`.

## Extendability

If feedback could become a **generic** Penpot rule (not project-specific), ask: *"Add this to `penpot-design` after we finish?"*

- **Yes:** note wording during task; after task done edit `personal-skills/skills/penpot-design/`; reinstall:
  ```bash
  npx skills add cucoreanu/personal-skills --skill penpot-design
  ```
  then confirm what changed.
- **No:** session-only. Never edit skill mid-task unless user asks now.

## Done

- [ ] Mode, instructions, platform (if needed) confirmed
- [ ] Dupes are components; states are variants
- [ ] Flex/grid + Material-inspired control alignment
- [ ] Mockup low-fi / design hi-fi per mode; export checked
