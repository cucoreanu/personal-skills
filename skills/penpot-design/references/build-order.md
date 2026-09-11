# Canvas build order (outside-in)

Deterministic tree assembly. Library work (tokens, reusable mains) may happen first; **placing or drawing on the canvas always follows this tree.**

## Rule

Never create a child before its parent exists. Never park leaves on the page and wrap them later.

At every node:

1. **Container** — create the board/group **empty**. Enable flex/grid. Set size, padding, gap.
2. **Direct children** — create each immediate child as a shell, in **z-order** (background → content → overlays). Reuse library **instances** here; do not invent a parallel tree of free shapes.
3. **Recurse** — for each child that is itself a container, repeat 1–3 in the same sibling order.

Finish a level’s shells before descending. Do not skip a level.

## Example (one screen)

```
1. Screen board (flex column)
2. Shells: Header | Body | Footer
3. Header: Logo | Nav
4. Nav: NavItem, NavItem, …
5. Body: Card, Card, …
6. Card: media | title | actions
7. Footer: …
```

## Forbidden

- Draw a button, then a header around it, then a screen around that
- Create all texts/icons at page root, then `appendChild` into parents
- Deep-fill one nested card before sibling section shells exist
- Enable flex on a board that already has unordered children without `penpotUtils.addFlexLayout`

## Library vs canvas

| Phase | Order |
|-------|--------|
| Library | tokens → atom/molecule **mains** + variants |
| Canvas | this outside-in tree; children of screens are instances, not new mains |

If a needed main does not exist, create that **main** (outside-in inside the main), then return to the screen tree and place an **instance**.
