# Mockup design practices

Distilled from [Justinmind's mockup design guide](https://www.justinmind.com/mockup-design). Use for decisions the agent cannot infer from the task alone.

## Types of mockups

### Static vs interactive

- **Static** — fixed visual snapshot. Default for Penpot MCP work unless user asks for prototype behavior.
- **Interactive** — clickable flows, scroll, simulated usage. Use Penpot variants and linked frames when explicitly requested.

### Platform-specific

| Platform | Priorities |
|----------|------------|
| **Mobile** | Touch targets, simplified layout, large tap areas, thumb zones |
| **Web** | More complex layouts, mouse hover states, wider content |
| **Desktop** | Keyboard shortcuts, multi-window, dense toolbars |
| **Responsive** | Layouts that adapt across breakpoints; test at multiple widths |

## User-centric design

Before building:

- **User research** — behavior, preferences, pain points (use what the user provides).
- **Personas** — humanize the audience; let persona needs drive layout and copy density.
- **User journeys** — map start-to-finish flow; remove friction at each step.

Example: fitness app for elderly users → larger font sizes, simple navigation, high contrast.

## Readability & accessibility

- Clear, legible fonts (Arial, Helvetica, or project typeface).
- Sufficient contrast between text and background.
- Avoid color combinations that fail for color-vision deficiencies.
- Alternative text for images (note in layer names or annotations).
- Structure navigable without relying solely on color or pointer precision.

## Visual consistency

Maintain a style guide across all mockup screens:

- **Typography** — one font family; consistent sizes, weights, line heights.
- **Color** — limited palette; semantic roles (primary, surface, error).
- **Spacing** — consistent rhythm (8dp grid).
- **Iconography** — one icon set; consistent stroke/size.

## Real-world optimization

Test assumptions against:

- Different screen sizes and orientations
- Varying content lengths (empty, typical, overflow)
- Network or loading states when relevant to the product

A layout that works on desktop may fail on a small phone — verify at target breakpoints.

## Iterative feedback

- Establish a feedback loop (user testing, stakeholder review, team critique).
- Prioritize feedback aligned with design goals and user needs.
- Focus on actionable changes: layout, typography, color, user flow.
- Test → refine → retest until goals are met.

## Core components (detail)

### Layout & composition

- Grid system for order, balance, and alignment.
- Visual hierarchy: primary content prominent (size, weight, position); secondary content subordinate.
- Avoid scattered elements — every item should relate to the grid.

### Color & typography

- Color evokes emotion and supports brand (e.g. blue = trust, red = urgency).
- Typography must be readable at target sizes; tune line height and letter spacing.
- Color and type work together — neither alone defines usability.

### UI components & icons

- CTAs (e.g. "Add to Cart") need clear affordance: label, size, placement, consistent style.
- Reuse components; differentiate states with variants, not one-off shapes.

### Imagery & media

- High-quality, relevant images support content — do not decorate.
- Too many images clutter layout and distract from tasks.
- E-commerce: product detail shots. Travel: aspirational landscapes. Match imagery to user goal.

### Visual style & branding

- Integrate logo, palette, and typography consistently.
- Tech brand: minimal, clean lines. Fashion: bold color, expressive type.
- Consistency across touchpoints builds recognition and trust.

## Step-by-step (expanded)

1. **Define goal & scope** — product type, target audience, technical abilities of users.
2. **Wireframes** — placeholders for header, nav, content, footer, CTAs. Validate information flow.
3. **Grid** — align all elements; consistent spacing; structured framework.
4. **Color & typography** — palette and type scale before detailed UI.
5. **UI components** — interactive elements with attention to placement, size, styling.
6. **Refine** — images, icons, spacing, contrast; final polish for high-fi handoff.

When executing in Penpot, draw **outside-in**: screen container → section shells → component elements. See `penpot-design` [build-order.md](../../penpot-design/references/build-order.md).

## Challenges

### Balancing detail with usability

- Highly detailed mockups clarify vision but slow iteration.
- Prioritize elements that impact UX: primary nav, CTAs, key content.
- Use low-fi to iterate layout; add detail only after structure is approved.
- Usability test early and often.

### Design constraints

- Communicate with dev/stakeholders on technical limits.
- Prioritize features that deliver core value (MVP mindset).
- Design systems accelerate work and enforce consistency.

### Stakeholder alignment

- Shared vision of goals and audience.
- Present decisions with rationale tied to user needs.
- Consider feedback; decide when user goals override preference conflicts.
