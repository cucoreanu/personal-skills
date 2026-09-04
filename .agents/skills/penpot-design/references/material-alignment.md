# Material-inspired alignment

MD3 as spacing inspiration — not Material chrome. Citations: `research/material-design-alignment.md`.

**Grid:** 4/8/12/16/24/32. Targets ≥48×48 (visual height may be 40). Gap between targets ≥8.

**Button-like** (`background` + optional `icon` + `label`), flex row or column:
- padding ≥12; icon↔label gap 8; center icon+label as one group
- active/pressed/disabled = variant (same geometry)

**Icon button:** 24 icon in 40–48 container; flex-center — no absolute nudging.

**Nav item:** column (icon over label, gap 4–8) or row; equal slots; `Active` variant.

**Slider** (one component, column flex, gap 8):
1. `label` + `value` (space-between)
2. `track` / `fill` / `thumb` (same track thickness)
3. optional `hint` — never loose absolute text on the canvas
