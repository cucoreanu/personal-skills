# Penpot design practices for AI agent skills

Research focused on what an AI agent skill should enforce when building UI mockups via the Penpot MCP Plugin API. Prefer Penpot-native terminology (boards, components, variants, flex layouts, tokens). Figma mappings noted only where they clarify.

**Date:** 2026-08-30  
**Primary sources:** Penpot Help Center, Penpot Plugin API docs, Penpot MCP docs, Apple HIG (layout/sheets), Atomic Design (component granularity).

---

## Executive summary

An agent skill that builds UI in Penpot via MCP must treat **structure as the product**, not absolute pixel placement. Enforce:

1. **Tokens → components → flex/grid layouts → screens** — never invent hard-coded colors/spacing when tokens exist; never duplicate a pattern that should be a component/variant.
2. **Flex (or grid) for almost every container** — set gaps/padding on the layout; use `auto` sizing when content should drive size; avoid invisible spacer rectangles and freehand `x`/`y` inside layout boards.
3. **Main vs copy discipline** — structural edits on **mains**; property overrides on **copies**; `detach()` only when intentionally breaking inheritance (and never expect detach on a main).
4. **Variant axes with stable layer names** — `State` / `Size` / `Type` (etc.) as properties; keep connected layers same name/type/hierarchy so overrides survive switches.
5. **API order matters** — `penpotUtils.addFlexLayout` when children already exist; `penpotUtils.createVariantContainer` (or the documented multi-step variant API order); append children in visual order; background shapes first for z-order.
6. **Mobile mockups respect HIG chrome** — status bar kept visible unless immersive; content inset to safe areas; sheets: Cancel leading / Done trailing; backgrounds may edge-bleed, interactive content must not.

Penpot’s own MCP guidance already encodes much of this (token tiers, `/`-grouped names, flex-for-stacks / grid-for-2D, depth ≤ 3–4). A skill should turn those into **hard checklists and refuse paths**, not soft suggestions.

---

## 1. Components first

### When to make a Penpot component vs a one-off shape

**Make a component when** the UI unit will appear more than once, must stay consistent under change, or is a named design-system atom/molecule (button, field, list row, nav item, card chrome). Penpot defines a component as a reusable layer/group with a **main** (source of truth) and **copies** (instances) that inherit and can override ([Components](https://help.penpot.app/user-guide/design-systems/components/)).

**Keep a one-off when** the shape is screen-unique decoration, throwaway exploration, or a layout scaffold that will never be reused. Penpot MCP best practices: establish a **single source of truth** per component/style and avoid duplicates ([Design file structure and best practices](https://help.penpot.app/mcp/design-file-structure-best-practices/)).

Atomic Design granularity maps cleanly: **atoms** (icon, label, color/type tokens) → **molecules** (labeled input, icon+label row) → **organisms** (nav bar, form section) → templates/pages as boards/screens ([Atomic Design](https://bradfrost.com/blog/post/atomic-web-design/)). In Penpot, tokens + library colors/typographies cover many “atoms”; components start where structure + behavior repeat.

### Nested components

- Prefer composing **instances inside mains** over deep one-off nesting.
- **Main components cannot contain other main components** when creating a layout component — Penpot blocks create-component in that case ([Flex/Grid layout components tutorial](https://penpot.app/blog/how-to-create-css-flex-and-grid-layout-components-in-penpot/)).
- Cap visual nesting depth around **3–4 levels** ([MCP design file structure](https://help.penpot.app/mcp/design-file-structure-best-practices/)).

### Variants (Active / State / Size)

Variants group related versions of one pattern under **properties** and **values** (e.g. Color, Size, State). Each variant is one unique combination of values ([Variants](https://help.penpot.app/user-guide/design-systems/variants/)).

**Use variants when** differences are the same pattern (Primary/Secondary, Default/Hover/Pressed, S/M/L). **Do not** mix unrelated components into one variant set ([MCP design file structure](https://help.penpot.app/mcp/design-file-structure-best-practices/)).

Boolean-like properties with exactly two opposing values (`true`/`false`, `on`/`off`, `yes`/`no`) show as toggles on copies ([Variants](https://help.penpot.app/user-guide/design-systems/variants/)).

**Override preservation** requires connected layers across variants:

1. Same name  
2. Same type (rect/ellipse/path/boolean count as same family)  
3. Same hierarchy level (groups, boards, layouts treated as equivalent)  

Renaming or regrouping breaks the connection ([Variants](https://help.penpot.app/user-guide/design-systems/variants/)).

### Main vs instance editing; detaching

| Action | Where |
|--------|--------|
| Structural change (add/remove layers, layout structure) | Main component |
| Content/style singularity (label text, one-off color) | Copy overrides; optional “Update main” to push back |
| Break inheritance | Detach **copy** only |

Detach turns a **copy** into a group and unlinks it from the main (`Ctrl/⌘ + Shift + K` / “Detach instance”) ([Components](https://help.penpot.app/user-guide/design-systems/components/)). Mains cannot be detached from themselves; to get free layers from a main, duplicate → detach the copy → delete the main if needed ([Penpot Community / 2.0 components](https://community.penpot.app/t/penpot-2-0-broke-all-of-our-designs/5080)).

Plugin API: `shape.detach()` removes component info and leaves a basic shape; without detaching, some manipulations (e.g. descendant removal) do not work as expected ([Plugin API `detach`](https://doc.plugins.penpot.app/); Penpot MCP High-Level Overview via plugin).

### Do / don’t — components

| Do | Don’t |
|----|--------|
| Create components for reusable UI units; name with `/` groups (`Buttons/Primary`) ([Components](https://help.penpot.app/user-guide/design-systems/components/), [MCP structure](https://help.penpot.app/mcp/design-file-structure-best-practices/)) | Recreate the same button as free shapes on every screen |
| Edit structure on the **main**; use `component.instance()` for placements ([LibraryComponent](https://doc.plugins.penpot.app/interfaces/LibraryComponent)) | Treat every copy as a main and diverge structure silently |
| Use variants for State/Size/Type of the **same** pattern ([Variants](https://help.penpot.app/user-guide/design-systems/variants/)) | Put Card and Modal under one variant set |
| Keep layer names/types aligned across variants for overrides ([Variants](https://help.penpot.app/user-guide/design-systems/variants/)) | Rename `label` → `Label` / `title` between variants |
| Detach copies when branching into a new component ([Components](https://help.penpot.app/user-guide/design-systems/components/)) | Call `detach()` on a main and expect it to work ([Community](https://community.penpot.app/t/cant-use-components/5102)) |

---

## 2. Alignment & layout

### Flex and grid (Penpot’s auto-layout equivalents)

Penpot **Flex Layout** is CSS Flexbox; **Grid Layout** is CSS Grid. Properties mirror web standards (direction, align, justify, gap, padding, sizing) so Inspect can emit production-ready layout code ([Flexible Layouts](https://help.penpot.app/user-guide/designing/flexible-layouts/)).

**Figma auto-layout ≈ Penpot Flex Layout.** Prefer:

- **Flex** for linear stacks (buttons, lists, forms, toolbars)  
- **Grid** for 2D structures (card galleries, dashboards)  

([MCP design file structure](https://help.penpot.app/mcp/design-file-structure-best-practices/))

Sizing modes (API / MCP overview): `fix` | `auto` | `fill` on layout and on `layoutChild`. Use **`auto`** when the container should grow with content (classic button/list pattern in Penpot docs). Children use `layoutChild.horizontalSizing` / `verticalSizing` and margins; absolute positioning opts a child out of the flow ([Flexible Layouts](https://help.penpot.app/user-guide/designing/flexible-layouts/); MCP High-Level Overview).

**API critical path:**

- Empty board: `board.addFlexLayout()` ([Board.addFlexLayout](https://doc.plugins.penpot.app/interfaces/FlexLayout))  
- Board that **already has children**: use `penpotUtils.addFlexLayout(container, dir)` so visual order is preserved — plain `addFlexLayout` can arbitrarily reorder children when children order suddenly drives display (MCP High-Level Overview).

Inside flex boards: change **gaps/padding**, not child `x`/`y` (unless `layoutChild.absolute === true`).

### Spacing systems (4 / 8 pt)

Penpot MCP guidance: define a **base spacing unit (e.g. 8px)** and derive margins/paddings from it ([MCP design file structure](https://help.penpot.app/mcp/design-file-structure-best-practices/)). Workspace **nudge amount** should match that baseline (docs explicitly cite “8px? 5px?”) ([Workspace basics](https://help.penpot.app/user-guide/designing/workspace-basics/)).

Practical agent rule: prefer **8pt scale** (`4, 8, 12, 16, 24, 32…`); allow 4pt half-steps when needed. Encode as tokens (`spacing.base.8`, semantic aliases) rather than magic numbers ([Design Tokens](https://help.penpot.app/user-guide/design-systems/design-tokens/), [MCP structure](https://help.penpot.app/mcp/design-file-structure-best-practices/)).

**Spacing tokens must be applied to Flex Layout boards**; if applied before flex exists, re-apply after ([Design Tokens](https://help.penpot.app/user-guide/design-systems/design-tokens/)).

### Constraints

When not using flex/grid, **resizing constraints** control behavior as the parent resizes. Defaults to **Scale**; options include Left/Right/Left&Right/Center (horizontal) and Top/Bottom/Top&Bottom/Center (vertical) ([Layers — Resizing constraints](https://help.penpot.app/user-guide/designing/layers/)). API mirrors this via `constraintsHorizontal` / `constraintsVertical` (MCP High-Level Overview). Prefer flex/grid for UI chrome; use constraints for decorative or absolute overlays.

### Optical alignment & guides

- Dynamic alignment snaps to edges/centers of nearby layers; distance readouts help equal distribution ([Workspace basics](https://help.penpot.app/user-guide/designing/workspace-basics/)).  
- Board **guides** (square / columns / rows) for geometric structure; never shown in exports ([Workspace basics](https://help.penpot.app/user-guide/designing/workspace-basics/), [Layers](https://help.penpot.app/user-guide/designing/layers/)).  
- Snap to pixel by default; disable only for intentional subpixel work ([Workspace basics](https://help.penpot.app/user-guide/designing/workspace-basics/)).

Agent takeaway: after programmatic builds, validate with `export_shape` and alignment/containment checks (`penpotUtils.isContainedIn`, analyze descendants) rather than trusting coordinates alone (MCP High-Level Overview; [MCP server](https://help.penpot.app/mcp/)).

### Mobile safe areas (mockup structure)

Apple HIG: a **safe area** is the region not covered by toolbars, tab bars, or other chrome, and must avoid device features (e.g. Dynamic Island). Respect system safe areas, margins, and guides; extend **backgrounds** edge-to-edge while keeping primary interactive content inset ([HIG — Layout](https://developer.apple.com/design/human-interface-guidelines/layout)).

For Penpot mockups: model phone boards at device presets ([Layers — boards](https://help.penpot.app/user-guide/designing/layers/)); reserve top/bottom inset regions (status / home indicator / nav / tab bar); put scrollable content in a flex column with padding matching those insets — do not hardcode “status bar = 20” as if universal.

### Do / don’t — layout

| Do | Don’t |
|----|--------|
| Apply flex/grid to most containers; set gap/padding on the layout ([MCP structure](https://help.penpot.app/mcp/design-file-structure-best-practices/), [Flexible Layouts](https://help.penpot.app/user-guide/designing/flexible-layouts/)) | Position every child with absolute `x`/`y` inside a flex board |
| Use `penpotUtils.addFlexLayout` when children already exist (MCP overview) | Call `board.addFlexLayout()` on a populated board and ignore reorder risk |
| Use `verticalSizing`/`horizontalSizing` `auto` for content-sized stacks ([Flexible Layouts](https://help.penpot.app/user-guide/designing/flexible-layouts/)) | Use invisible rectangles as spacers ([MCP structure](https://help.penpot.app/mcp/design-file-structure-best-practices/)) |
| Derive spacing from an 8px (or documented) base + tokens ([MCP structure](https://help.penpot.app/mcp/design-file-structure-best-practices/)) | Scatter 7px / 13px / 22px gaps |
| Keep interactive content in safe areas; bleed backgrounds only ([HIG Layout](https://developer.apple.com/design/human-interface-guidelines/layout)) | Place primary taps under the status bar / home indicator |

---

## 3. Design system structure

### Naming conventions

- **Components:** group with `/` — `FOLDER/COMPONENT` (e.g. `Buttons/Alert Button`) or Assets “Group” ([Components](https://help.penpot.app/user-guide/design-systems/components/)). MCP recommends functional categories and paths like `button/primary/default`, `form/input/text` ([MCP design file structure](https://help.penpot.app/mcp/design-file-structure-best-practices/)).  
- **Layers:** name by **function** (`background`, `icon`, `title`), not `rectangle 23`. Avoid repeating the parent component name on every child (`button` → children should not all start with `button-`) ([MCP design file structure](https://help.penpot.app/mcp/design-file-structure-best-practices/)).  
- **Pages:** split by process stage, screen size, feature, or atomic-design category ([Workspace basics](https://help.penpot.app/user-guide/designing/workspace-basics/)).  
- **Boards:** MCP says one board per **functional area/feature** (e.g. Onboarding, Dashboard) with a clear canvas map — not a chaotic infinite canvas ([MCP design file structure](https://help.penpot.app/mcp/design-file-structure-best-practices/)). For mobile app mockups, still use device-sized boards as screens when presenting flows; organize those boards under feature pages/areas.

### Library organization

Each file has a **local library** (components, colors, typographies, tokens). Publish as a **shared library** to connect across team files; updates and disconnect rules apply ([Libraries](https://help.penpot.app/user-guide/design-systems/libraries/)). Tokens in a connected library can be **imported** into the current file (replaces all local tokens/sets/themes — export first) ([Libraries](https://help.penpot.app/user-guide/design-systems/libraries/)).

API: `penpot.library.local` / `.connected`; `createComponent`, `createColor`, `createTypography`; tokens via `penpot.library.local.tokens` (MCP High-Level Overview; [Library](https://doc.plugins.penpot.app/interfaces/Library)).

### Tokens (color / spacing / typography)

Penpot tokens follow **W3C DTCG** format; support aliases `{token.name}` and math ([Design Tokens](https://help.penpot.app/user-guide/design-systems/design-tokens/)).

Recommended tiering for agents ([MCP design file structure](https://help.penpot.app/mcp/design-file-structure-best-practices/)):

| Tier | Role | Examples |
|------|------|----------|
| 1 Global | Raw scales | `color.base.neutral.100`, `spacing.base.8` |
| 2 Semantic | Meaning | `color.bg.default`, `color.text.primary` |
| 3 Component | Pattern-specific | `color.button.primary.bg` |

Apply via Tokens panel or Design sidebar bindings; spacing tokens need flex boards; token application is async (~100ms) in the plugin API (MCP overview). Prefer semantic tokens on UI; avoid inventing colors when a system exists ([Good prompting practices](https://help.penpot.app/mcp/good-prompting-practices-design/)).

Also keep **library colors/typographies** for classic assets when tokens are not yet used ([Libraries](https://help.penpot.app/user-guide/design-systems/libraries/)).

### Atoms → molecules → organisms in Penpot

| Atomic Design | Penpot practice |
|---------------|-----------------|
| Atoms | Tokens, library colors/typographies, icons as simple components |
| Molecules | Small components / variants (Button, Input+Label) |
| Organisms | Nested instances (Header = Logo + Nav + Actions) |
| Templates / Pages | Boards (and page tabs) composing organisms |

([Atomic Design](https://bradfrost.com/blog/post/atomic-web-design/); [MCP structure](https://help.penpot.app/mcp/design-file-structure-best-practices/))

### Do / don’t — design system

| Do | Don’t |
|----|--------|
| Use hierarchical `/` names and functional grouping ([Components](https://help.penpot.app/user-guide/design-systems/components/), [MCP structure](https://help.penpot.app/mcp/design-file-structure-best-practices/)) | Dump everything in an ungrouped flat Assets list |
| Drive color/type/spacing from tokens (or library styles) ([Design Tokens](https://help.penpot.app/user-guide/design-systems/design-tokens/), [MCP structure](https://help.penpot.app/mcp/design-file-structure-best-practices/)) | Hardcode hex and px on every layer when tokens exist |
| Alias semantic → global tokens ([Design Tokens](https://help.penpot.app/user-guide/design-systems/design-tokens/)) | Duplicate the same hex under five unrelated names |
| Publish shared libraries for cross-file reuse ([Libraries](https://help.penpot.app/user-guide/design-systems/libraries/)) | Copy-paste component mains between files without linkage |

---

## 4. iOS / HIG-adjacent patterns for mobile mockups

Use HIG only to structure **chrome and placement** in Penpot boards — not to reinvent Apple UIKit components pixel-perfect unless the product requires it.

### Safe area & full-bleed

- Safe area avoids toolbars, tab bars, and hardware features (Dynamic Island, etc.) ([HIG — Layout](https://developer.apple.com/design/human-interface-guidelines/layout)).  
- Extend backgrounds/artwork to screen edges; controls (tab bars, sidebars) sit **on top of** content — layouts must account for that ([HIG — Layout](https://developer.apple.com/design/human-interface-guidelines/layout)).  
- Avoid full-width buttons that ignore system margins; inset controls to feel native ([HIG — Layout](https://developer.apple.com/design/human-interface-guidelines/layout)).

**Penpot modeling:** screen board = device size; optional absolute overlays for status bar / home indicator / tab bar; main content = flex column with top/bottom padding ≈ safe insets; background layer may ignore those insets.

### Status bar

Keep the status bar **visible** unless an immersive experience (game, media) benefits from hiding it ([HIG — Layout](https://developer.apple.com/design/human-interface-guidelines/layout)). Mockups should include a status-bar region (time, signal, battery) so content is not designed into that strip.

### Toolbars / navigation chrome

HIG stresses grouping related controls with enough spacing so they remain usable ([HIG — Layout](https://developer.apple.com/design/human-interface-guidelines/layout/), linking to Toolbars). In Penpot: toolbars as **row flex** boards (gap 8–16, horizontal padding), often as components with variants for title + trailing actions.

### Sheets

For iOS/iPadOS single-view sheets ([HIG — Sheets](https://developer.apple.com/design/human-interface-guidelines/sheets/)):

- **Cancel** (or Close) on the **leading** edge of the top toolbar  
- **Done** on the **trailing** edge when present  
- Always provide a dismiss path alternate to Done (Cancel or Back)  
- Multi-step: first step Cancel + inactive Done; later steps Back replaces Cancel; final step activates Done  
- Prefer one sheet at a time from the main interface  

Mock as a board (rounded top corners optional) with a top flex toolbar row + content column.

### Tab bars

Prefer familiar bottom tab navigation for primary app areas; HIG discusses convertible tab bar / sidebar patterns for adaptive layouts ([HIG — Layout](https://developer.apple.com/design/human-interface-guidelines/layout/), Tab bars). Mock tab bars as fixed bottom flex rows inside the safe area (or as overlays with content padding equal to bar height).

### Do / don’t — mobile HIG mockups

| Do | Don’t |
|----|--------|
| Include status bar + home-indicator clearance in screen boards ([HIG Layout](https://developer.apple.com/design/human-interface-guidelines/layout)) | Design primary titles into the status-bar zone |
| Sheet: Cancel leading, Done trailing ([HIG Sheets](https://developer.apple.com/design/human-interface-guidelines/sheets/)) | Only a centered Done with no Cancel/Back |
| Bleed backgrounds; inset controls ([HIG Layout](https://developer.apple.com/design/human-interface-guidelines/layout)) | Edge-to-edge primary buttons that clash with device curves |
| Use Penpot device board presets for phone sizes ([Layers](https://help.penpot.app/user-guide/designing/layers/)) | Arbitrary 390×844 boards with no chrome regions |

---

## 5. Agent-specific pitfalls (programmatic design)

These failure modes are repeatedly called out in Penpot MCP tooling and docs.

### Absolute coords vs flex

Inside a flex/grid board, layout owns positions. Setting `x`/`y` fights the layout unless `layoutChild.absolute` is true (MCP High-Level Overview). Prefer building the board, enabling flex, then `appendChild` in visual order.

### Component copies that can’t change structure

Copies inherit structure; removing descendants without detach may only hide or no-op (MCP overview: remove on component-descendant boards can make shapes invisible; detach required for independent structural edits). **Never** try to rebuild a copy’s tree in place — switch variant, edit main, or detach deliberately ([Components](https://help.penpot.app/user-guide/design-systems/components/), MCP overview).

### Z-order

Z-order = order in parent `children` (later = on top). Add backgrounds first, foreground last; use `bringToFront` / `setParentIndex` / flex `layoutChild.zIndex` when needed (MCP High-Level Overview; [Flexible Layouts — z-index](https://help.penpot.app/user-guide/designing/flexible-layouts/)).

### Grouping then componentizing vs recreating

Preferred pipeline:

1. Build with boards + flex (semantic names)  
2. Nest instance components for atoms/molecules  
3. `penpot.library.local.createComponent([rootBoard])` once structure is correct  

Avoid: finalize as a copy → need deep edits → recreate from scratch without detach. Avoid wrapping mains inside mains ([layout component tutorial](https://penpot.app/blog/how-to-create-css-flex-and-grid-layout-components-in-penpot/)). Prefer **transforming** existing structure over “redesign from zero” ([Good prompting practices](https://help.penpot.app/mcp/good-prompting-practices-design/)).

### Other agent pitfalls

| Pitfall | Mitigation |
|---------|------------|
| Reorder when enabling flex on existing children | `penpotUtils.addFlexLayout` (MCP overview) |
| `resize()` on text sets `growType` to `fixed` | Restore `auto-width` / `auto-height`; wait ~100ms before reading bounds (MCP overview) |
| Token apply is async | Wait briefly before asserting styles (MCP overview) |
| Hex colors | Use caps `#FF5533` (MCP overview) |
| Fills/strokes arrays are immutable element-wise | Replace whole arrays (MCP overview) |
| Working on wrong page | MCP follows **focused** page/tab ([MCP server](https://help.penpot.app/mcp/)) |
| Large unsupervised rewrites | Describe changes first; small reversible steps ([MCP server](https://help.penpot.app/mcp/)) |
| No visual check | Use `export_shape` / screenshots; direct the gaze ([MCP](https://help.penpot.app/mcp/), [Good prompting](https://help.penpot.app/mcp/good-prompting-practices-design/)) |
| Inventing design-system values | Constraints: only existing tokens/components ([Good prompting](https://help.penpot.app/mcp/good-prompting-practices-design/)) |

### Do / don’t — agents

| Do | Don’t |
|----|--------|
| Build flex-first boards; append in paint order | Absolute-position a whole screen of siblings |
| Edit mains / switch variants for structural variants | Delete layers inside a live copy hoping it rebuilds |
| Detach only when forking | Detach everything “to make editing easier” |
| `createComponent` after layout is stable | Componentize every rectangle independently |
| Inspect with `shapeStructure` + export | Trust a single coordinate dump |

---

## 6. Penpot Plugin API realities

Citations mix published Plugin API docs, Help Center, and the Penpot MCP High-Level Overview (plugin runtime instructions returned by `high_level_overview`).

### `createComponent`

```js
const newComponent = penpot.library.local.createComponent([shape1, shape2]);
newComponent.name = 'My Button';
```

Creates a library component from shapes; returns `LibraryComponent` ([Library.createComponent](https://doc.plugins.penpot.app/interfaces/Library); [Plugins FAQ](https://help.penpot.app/plugins/faq/)). UI equivalent: select layers → Create component (`Ctrl/⌘ + K`) ([Components](https://help.penpot.app/user-guide/design-systems/components/)).

### Instances and mains

```js
const instance = component.instance();      // place a copy
const main = component.mainInstance();    // reference main shape
```

([LibraryComponent](https://doc.plugins.penpot.app/interfaces/LibraryComponent))

### Variants: `createVariantContainer` / low-level API

**Preferred (MCP utils):**

```js
const container = penpotUtils.createVariantContainer([
  { shape: s, properties: { Size: 'Small', State: 'Default' } },
  { shape: m, properties: { Size: 'Medium', State: 'Default' } },
  { shape: l, properties: { Size: 'Large', State: 'Hover' } },
]);
```

**Low-level order (must not skip/reorder)** — MCP overview:

1. `penpot.createVariantFromComponents(mainInstances)` → `VariantContainer` (always starts with `"Property 1"`) ([createVariantFromComponents](https://doc.plugins.penpot.app/) / MCP overview)  
2. `container.variants.renameProperty(0, name)`  
3. Extra properties: `addProperty()` then `renameProperty(pos, name)`  
4. For each variant component: `setVariantProperty(pos, value)`  

Switching on a copy: `instance.switchVariant(pos, value)` — nearest match if combination missing ([switchVariant](https://doc.plugins.penpot.app/); [Variants UI behavior](https://help.penpot.app/user-guide/design-systems/variants/)).

`LibraryComponent.transformInVariant()` turns a standard component into a variant set (duplicates + properties from name/path) ([LibraryComponent](https://doc.plugins.penpot.app/interfaces/LibraryComponent)).

### Flex: `addFlexLayout` / `penpotUtils.addFlexLayout`

```js
const board = penpot.createBoard();
const flex = board.addFlexLayout();
flex.dir = 'column';
flex.rowGap = 8;
flex.horizontalSizing = 'auto';
flex.verticalSizing = 'auto';
```

([FlexLayout](https://doc.plugins.penpot.app/interfaces/FlexLayout))

When children already exist: **`penpotUtils.addFlexLayout(container, dir)`** to preserve visual order (MCP High-Level Overview). Child layout props live on `shape.layoutChild` (`absolute`, margins, sizing, `zIndex`) ([LayoutChildProperties](https://doc.plugins.penpot.app/)).

### `detach`

`shape.detach()` — if component-linked, strips component info to a basic shape ([ShapeBase.detach](https://doc.plugins.penpot.app/)). Use on **copies** when independent structure is required (MCP overview; [Components](https://help.penpot.app/user-guide/design-systems/components/)).

### Library local components

`penpot.library.local.components` lists local components; find by name, then `.instance()`. Connected libraries: `penpot.library.connected` (MCP overview; [Libraries](https://help.penpot.app/user-guide/design-systems/libraries/)).

### Do / don’t — API

| Do | Don’t |
|----|--------|
| Follow variant creation order or use `createVariantContainer` (MCP overview) | Rename properties before the container exists / skip `setVariantProperty` |
| Use utils helpers (`addFlexLayout`, `setParentXY`, `findShapes`) (MCP overview) | Reimplement tree search and relative positioning ad hoc |
| Replace fills/strokes arrays wholesale (MCP overview) | Mutate `fills[0].fillColor` in place |
| Wait after token apply / text auto-size (MCP overview) | Assert geometry immediately after `resize`/`applyToken` |

---

## Skill implications

Workflows and checklists an agent skill should **require**:

- **Preconditions:** Confirm MCP connection + focused page; start with read-only inspect (`shapeStructure`, list components/tokens) before writes ([MCP server](https://help.penpot.app/mcp/)).  
- **Ruleset block:** `SOURCE=Penpot MCP`; `NO_INVENTING` colors/spacing/components when system exists; `IF_MISSING → TODO` ([Token-aware prompting](https://help.penpot.app/mcp/prompting-token-aware/), [Good prompting](https://help.penpot.app/mcp/good-prompting-practices-design/)).  
- **Build order checklist:** tokens (or confirm existing) → atom components → molecule variants → organism compositions → screen boards with flex.  
- **Layout gate:** every UI container is a board with flex or grid unless documented absolute overlay; gaps/padding from spacing tokens on flex boards; `penpotUtils.addFlexLayout` if children pre-exist.  
- **Component gate:** reuse via `instance()` / `switchVariant`; no duplicate mains for the same pattern; structure edits on mains only; detach only with explicit fork intent.  
- **Variant gate:** properties named `State`/`Size`/`Type` (etc.); unique combinations; layer names/types/hierarchy aligned across variants.  
- **Naming gate:** `/`-grouped component paths; functional layer names; depth ≤ 3–4.  
- **Mobile gate (when targeting iOS-like apps):** device board preset; status bar visible by default; safe-area padding for content; sheet toolbar Cancel leading / Done trailing ([HIG Layout](https://developer.apple.com/design/human-interface-guidelines/layout), [HIG Sheets](https://developer.apple.com/design/human-interface-guidelines/sheets/)).  
- **Z-order gate:** append background → content → overlays; verify with export.  
- **Verification gate:** `export_shape` screenshot review; containment/spacing audit (multiples of base unit); explain diffs before large writes ([MCP](https://help.penpot.app/mcp/), [Good prompting](https://help.penpot.app/mcp/good-prompting-practices-design/)).  
- **API gate:** prefer `penpotUtils.*`; never skip variant setup steps; restore text `growType` after resize; wait on async token/text layout.  
- **Negatives to encode:** no magic numbers when tokens exist; no invisible spacer rects; no absolute layout for stacks; no unsupervised “redesign everything”; no detaching mains; no mixing unrelated patterns into one variant set.

---

## Source index

| Source | URL |
|--------|-----|
| Penpot Components | https://help.penpot.app/user-guide/design-systems/components/ |
| Penpot Variants | https://help.penpot.app/user-guide/design-systems/variants/ |
| Penpot Flexible Layouts | https://help.penpot.app/user-guide/designing/flexible-layouts/ |
| Penpot Design Tokens | https://help.penpot.app/user-guide/design-systems/design-tokens/ |
| Penpot Libraries | https://help.penpot.app/user-guide/design-systems/libraries/ |
| Penpot Layers (boards, constraints) | https://help.penpot.app/user-guide/designing/layers/ |
| Penpot Workspace basics (guides, nudge) | https://help.penpot.app/user-guide/designing/workspace-basics/ |
| Penpot MCP overview | https://help.penpot.app/mcp/ |
| Penpot MCP design file structure | https://help.penpot.app/mcp/design-file-structure-best-practices/ |
| Penpot MCP good prompting (design) | https://help.penpot.app/mcp/good-prompting-practices-design/ |
| Penpot MCP token-aware prompting | https://help.penpot.app/mcp/prompting-token-aware/ |
| Penpot Plugins FAQ | https://help.penpot.app/plugins/faq/ |
| Plugin API Library | https://doc.plugins.penpot.app/interfaces/Library |
| Plugin API LibraryComponent | https://doc.plugins.penpot.app/interfaces/LibraryComponent |
| Plugin API FlexLayout | https://doc.plugins.penpot.app/interfaces/FlexLayout |
| Plugin API VariantContainer | https://doc.plugins.penpot.app/interfaces/VariantContainer |
| Layout components tutorial | https://penpot.app/blog/how-to-create-css-flex-and-grid-layout-components-in-penpot/ |
| Apple HIG Layout | https://developer.apple.com/design/human-interface-guidelines/layout |
| Apple HIG Sheets | https://developer.apple.com/design/human-interface-guidelines/sheets |
| Atomic Design (Brad Frost) | https://bradfrost.com/blog/post/atomic-web-design/ |
| Penpot Community (main vs detach) | https://community.penpot.app/t/penpot-2-0-broke-all-of-our-designs/5080 |
| Penpot MCP High-Level Overview | Plugin tool `high_level_overview` (runtime API contract for agents) |
