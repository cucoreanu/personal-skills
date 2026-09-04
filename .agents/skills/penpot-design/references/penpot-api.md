# Penpot API pitfalls

Prefer `penpotUtils.*`. Full research: `research/penpot-design-practices.md`.

**Components:** `penpot.library.local.createComponent([shapes])` → `.instance()` / `.mainInstance()`. Structure edits on **main** only. `detach()` on **copies** only; copy descendants may hide not delete — detach to fork.

**Flex:** empty board → `addFlexLayout()`. Existing children → `penpotUtils.addFlexLayout(board, dir)`. Set gap/padding, not child x/y (unless `layoutChild.absolute`). Z-order = child order; backgrounds first.

**Variants:** prefer `penpotUtils.createVariantContainer([{ shape, properties }])`. Same layer **name/type/hierarchy** across variants. Switch: `switchVariant(pos, value)`.

**Geometry:** `penpotUtils.setParentXY` for relative position. Replace whole `fills`/`strokes` arrays; hex caps (`#0A84FF`). Text `resize` → restore `growType`; wait ~100ms for bounds/tokens.

**Verify:** `shapeStructure`, `findShapes`, `export_shape`. Confirm focused page before writes.
