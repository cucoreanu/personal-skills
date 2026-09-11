---
name: penpot-mockup
description: Plans and builds UI mockups in Penpot with user-centered workflow, fidelity levels, a six-step process, and outside-in canvas assembly. Use when creating mockups, screen mockups, wireframe-to-mockup work, low/high-fidelity UI, platform-specific layouts, or mockup design best practices in Penpot.
---

# Penpot Mockup

Methodology for mockup design in Penpot. Execute with Penpot MCP per **`penpot-design`** (components, flex, API, outside-in tree). Read `high_level_overview` once before writes.

## Ask first

Stop when any is missing:

1. **Goal & scope** — website, mobile app, desktop app, or responsive? What screen(s) or flow?
2. **Audience** — who uses this? (e.g. elderly users → larger type, simpler nav)
3. **Fidelity** — `low` (structure, layout, flow) or `high` (color, typography, imagery, polish)?
4. **Platform** — mobile, web, desktop, or responsive. Use project rules if set; else ask. Never assume.
5. **Instructions** — what to build/change. Multi-variant alternatives **only if asked**.

## Mockup vs wireframe vs prototype

| Stage | Purpose | Penpot focus |
|-------|---------|--------------|
| **Wireframe** | Layout, hierarchy, user flow — no visual polish | Simple shapes, placeholders, real spacing |
| **Mockup** | Visual design — look and feel, UI details | This skill |
| **Prototype** | Interactivity — clicks, flows, states | Only when user asks; use variants for states |

Default to **static visual mockups** unless the user asks for interactive/prototype behavior.

## Fidelity

**Low-fi** — validate structure and flow fast. Simple fills, placeholders, grid-aligned layout. Iterate layout and user flow before polish. Maps to `mockup` mode in `penpot-design`.

**High-fi** — client-ready or dev handoff. Color palette, typography, imagery, branded components. Maps to `design` mode in `penpot-design`.

## Six-step workflow

Work in this order. Do not skip to polish before structure is validated.

1. **Define goal & scope** — purpose, target audience, platform constraints.
2. **Wireframe** — outline sections, content areas, nav, CTAs with placeholders. Focus on hierarchy and flow.
3. **Grid system** — align elements; consistent spacing (8dp scale per `penpot-design`). Establish visual hierarchy (headline > supporting text).
4. **Color & typography** — limited palette; legible type (size, line height, letter spacing); sufficient contrast. See [mockup-practices.md](references/mockup-practices.md).
5. **UI components** — buttons, inputs, nav bars, icons. Appears twice → component. States → variants. Placement and size matter for usability.
6. **Refine details** — imagery, iconography, spacing, contrast. Export with `export_shape` to verify.

## Canvas assembly (required)

Methodology above is *what* to decide. When drawing in Penpot, follow **`penpot-design`** outside-in order — do not invent a different layer sequence:

1. Screen/container board (empty + flex)
2. Direct-child section shells (header, body, footer, …) in z-order
3. Each section’s components, then those components’ elements, recursively

Never create leaves first and wrap them. Full rule: [`../penpot-design/references/build-order.md`](../penpot-design/references/build-order.md).

## Best practices

- **User-centric** — design for user goals; consider personas and journey friction points.
- **Accessibility** — readable type, sufficient contrast, avoid color-only meaning; keyboard-navigable structure where relevant.
- **Visual consistency** — one style guide: typography, colors, spacing, icons across all screens.
- **Real-world** — consider screen sizes and orientations; responsive layouts when platform is multi-device.
- **Iterative feedback** — prioritize actionable feedback on layout, type, color, and flow over subjective polish.

## Core components checklist

Each screen mockup should address:

- [ ] Layout & composition (grid, alignment, hierarchy)
- [ ] Color & typography (palette, legible type)
- [ ] UI components & icons (CTAs, inputs, nav — componentized)
- [ ] Imagery & media (relevant, not cluttering)
- [ ] Branding (logo, colors, type consistent with brand)

## Pitfalls

| Challenge | Response |
|-----------|----------|
| Too much detail too early | Stay low-fi until layout and flow are validated |
| Constraints (time, tech, budget) | Focus MVP features; reuse design-system components |
| Stakeholder misalignment | Present rationale; tie decisions to user goals |

Deep reference: [mockup-practices.md](references/mockup-practices.md).

## Done

- [ ] Goal, audience, fidelity, platform, instructions confirmed
- [ ] Structure before polish (wireframe → grid → tokens → components → details)
- [ ] Canvas outside-in (container → child shells → nested elements)
- [ ] User-centric, accessible, visually consistent
- [ ] Components/variants per `penpot-design`; export checked
