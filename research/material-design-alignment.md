# Material Design 3 — alignment for button-like controls

Research for Penpot agent skills. Material is **inspiration for alignment and spacing**, not a mandate to clone Material components pixel-for-pixel. Platform chrome still comes from the project (or an ask).

**Date:** 2026-08-30  
**Primary sources:** m3.material.io (specs/guidelines that return measurable tables), Material accessibility & density foundations.

---

## Executive summary

When building layered controls (background + icon + label) in Penpot:

1. Treat the control as a **flex unit** (row or column) with **stable gaps** from a **4dp/8dp** scale — never freehand `x`/`y` inside the control.
2. Meet **≥48×48dp** touch targets even when the visual container is shorter (e.g. 40dp button height).
3. Keep **icon and label optically centered as one group** inside the container; active/selected states change **style/variant**, not layout geometry.
4. Label rows beside sliders sit **outside** the track; track active/inactive share the same thickness; handle stays on the track centerline.

---

## 1. Button anatomy

Material buttons are composed of container, optional icon, label text, and a state layer for interaction feedback ([Buttons – specs](https://m3.material.io/components/buttons/specs)).

**Measurable patterns from related MD3 specs (segmented buttons share the same control family):**

| Attribute | Value | Source |
|-----------|-------|--------|
| Container height (common / segmented) | 40dp | [Segmented buttons – specs](https://m3.material.io/components/segmented-buttons/specs) |
| Left/right padding (min) | 12dp | [Segmented buttons – specs](https://m3.material.io/components/segmented-buttons/specs) |
| Padding between icon and label | 8dp | [Segmented buttons – specs](https://m3.material.io/components/segmented-buttons/specs) |
| Label alignment | Center | [Segmented buttons – specs](https://m3.material.io/components/segmented-buttons/specs) |
| Target size | 48dp | [Segmented buttons – specs](https://m3.material.io/components/segmented-buttons/specs), [Accessibility – structure](https://m3.material.io/foundations/designing/structure) |

**Agent mapping for Penpot:**

- Layers: `background` (container) → optional `icon` → `label` (names stable across variants).
- Flex **row**, `alignItems: center`, `justifyContent: center` (or space-between for trailing-icon patterns).
- Horizontal padding ≥ 12dp; icon↔label gap = 8dp.
- Visual height often 40dp; hit area / parent min height still ≥ 48dp when targeting touch.

Density: each density step typically removes **4dp** from vertical padding/height; do not shrink interactive targets below 48×48dp ([Grids & spacing – density](https://m3.material.io/foundations/layout/grids-spacing/density)).

---

## 2. Icon buttons

- Default **symbol** size often **24dp**, with **48×48dp** target ([Accessibility – structure](https://m3.material.io/foundations/designing/structure), [Icons – applying](https://m3.material.io/styles/icons/applying-icons)).
- Optical sizes include 20 / 24 / 40 / 48dp; 20dp symbols may use a 40dp target when pointer input dominates ([Icons – applying](https://m3.material.io/styles/icons/applying-icons)).
- **Center** the icon in the container (flex center both axes). Do not offset by eye with absolute coords.

Guidelines for icon-button usage: [Icon buttons](https://m3.material.io/components/icon-buttons/guidelines).

---

## 3. Toggle / segmented / nav items

**Segmented:** same height/padding/gap as above; selection is a **state** on the segment, not a size change ([Segmented buttons – specs](https://m3.material.io/components/segmented-buttons/specs)).

**Navigation bar:** compact layouts use vertical item stacks (icon above label); medium may use horizontal items ([Navigation bar – specs](https://m3.material.io/components/navigation-bar/specs)). Active destination is indicated by color/indicator — keep icon+label **geometry identical** across selected/unselected variants so switches do not reflow.

**Agent rule:** `Active` / `Selected` as a **variant property**. Same layer tree; only fills/weights change.

---

## 4. Sliders

Anatomy (guidelines): value indicator (optional), stop indicators (optional), **active track**, **handle**, **inactive track**, optional inset icon ([Sliders – guidelines](https://m3.material.io/components/sliders/guidelines)).

- Active and inactive tracks are the **same size** (thickness).
- Icons/text that explain the range live **outside** the slider (or as stop indicators), not as random free-floating absolute labels.
- Optional value indicator appears with the handle; if value is shown elsewhere, omit the built-in indicator.
- Sizes XS–XL change emphasis/target; keep handle centered on the track.

**Agent mapping for Penpot `Controls/Slider`:** flex **column** — row of `label` + `value`, then track row (`track` / `fill` / `thumb`), then optional `hint`. Gap 8dp between rows; horizontal insets consistent with parent padding.

---

## 5. Alignment principles

| Principle | Rule | Source |
|-----------|------|--------|
| Grid | Prefer **4dp / 8dp** increments | [Density](https://m3.material.io/foundations/layout/grids-spacing/density) (4dp density steps), [Accessibility](https://m3.material.io/foundations/designing/structure) (8dp between targets) |
| Touch | ≥ **48×48dp** targets | [Accessibility](https://m3.material.io/foundations/designing/structure) |
| Icon vs target | 24dp icon inside 48dp target | [Accessibility](https://m3.material.io/foundations/designing/structure), [Icons](https://m3.material.io/styles/icons/applying-icons) |
| Target spacing | ≥ **8dp** between targets | [Accessibility](https://m3.material.io/foundations/designing/structure) |
| Control internals | Center label; 8dp between icon and label | [Segmented buttons](https://m3.material.io/components/segmented-buttons/specs) |
| Unit centering | Icon+label centered **as a group** in the container | Same |

Baseline: keep label text on one baseline across a toolbar row; do not mix absolute Y offsets per item.

---

## 6. Do / don’t (Penpot agent)

| Do | Don’t |
|----|--------|
| Flex row/column with gap 8 and padding ≥ 12 for button-like controls | Absolute-position icon and label inside a button board |
| Use variants for selected/pressed/disabled | Move layers or change padding when “active” |
| Keep layer names `background` / `icon` / `label` / `track` / `thumb` across variants | Rename layers per variant |
| Enforce 48dp targets (visible chrome may be 40dp) | Shrink hit areas for aesthetics |
| Space adjacent targets ≥ 8dp | Pack icons with 2dp gutters |
| Put slider labels/hints in the component flex stack | Loose absolute captions near the track |

---

## Skill implications

1. Button-like component = flex container; children aligned center; gaps from 8dp scale.  
2. Min visual height often 40dp; ensure ≥48dp interactive area for touch mockups.  
3. Icon buttons: center 24dp icon in ≥40–48dp container.  
4. Nav/toolbar items: column or row flex; Active is a variant, not a layout edit.  
5. Slider molecule includes label, value, track, thumb, optional hint — one component.  
6. Cite Material numbers when justifying spacing; defer platform chrome to the project.

---

## Source index

| Source | URL |
|--------|-----|
| Buttons specs | https://m3.material.io/components/buttons/specs |
| Segmented buttons specs | https://m3.material.io/components/segmented-buttons/specs |
| Icon buttons guidelines | https://m3.material.io/components/icon-buttons/guidelines |
| Icons applying | https://m3.material.io/styles/icons/applying-icons |
| Navigation bar specs | https://m3.material.io/components/navigation-bar/specs |
| Sliders guidelines | https://m3.material.io/components/sliders/guidelines |
| Accessibility / targets | https://m3.material.io/foundations/designing/structure |
| Density / 4dp steps | https://m3.material.io/foundations/layout/grids-spacing/density |
