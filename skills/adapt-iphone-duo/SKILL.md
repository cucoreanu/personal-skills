---
name: adapt-iphone-duo
description: Interviews the user one decision at a time about adapting an existing iPhone app to iPhone Duo and writes an adaptation decision record only after they confirm a shared understanding. Use when the user is designing or adapting an app for iPhone Duo, a folding iPhone, outer and inner displays, or side-placed controls.
---

# iPhone Duo

Adapt an existing iPhone app to iPhone Duo. Produce a written decision record. Do not draw, mock up, or write code.

Session rules: [principles.md](references/principles.md). Read it before the first question. Cite it by section whenever a rule applies. Record shape: [record.md](references/record.md).

## Conduct

Interview me relentlessly about every aspect of this until we reach a shared understanding. Walk down each branch of the decision tree, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer.

Ask the questions one at a time, waiting for feedback on each question before continuing. Asking multiple questions at once is bewildering.

If a fact can be found by exploring the environment (filesystem, tools, etc.), look it up rather than asking me. The decisions, though, are mine — put each one to me and wait for my answer.

Do not act on it until I confirm we have reached a shared understanding.

"This" is the adaptation of the app in front of you. A recommendation the user accepts is their decision. "Go with all the recommendations" fills every remaining open branch, then read the record back and wait for confirmation.

## Before the forks

Establish the current iPhone app. Read the codebase or design in the workspace and treat what you find as fact. If there is no app yet, establish chrome, hierarchy, and content style one question at a time. Do not invent an information architecture. Do not start from a blank Duo layout.

One record per app. Add a section per surface only when chrome, hierarchy, or content style differ.

## Decision tree

Walk in this order. Skip a branch the facts close, and say in one sentence why. A choice that breaks a locked rule in [principles.md](references/principles.md) is restated with that rule and the same recommendation.

1. **Chrome mapping.** Propose the mapping. Top toolbar buttons go to the top of the side column, bottom toolbar buttons to the bottom, tab bar stays bottom-aligned. Text buttons and segmented controls stay in the nav bar. The user confirms.
2. **Content alignment.** Scrolling content insets to the horizontal safe area. A full-width background may sit behind an inset scrolling foreground, with every control inside that foreground. Full-bleed, unshifted layout only for an immersive screen that does not scroll and whose controls stay clear of the side column.
3. **Inner display.** One structure, asked with the pick already filled in. Information-dense and has a tab bar → sidebar. Otherwise two or more hierarchy levels → those same levels side by side. Otherwise → the vertical stack reflows into two columns. Features stay the same on the outer and inner displays.
4. **Tabletop.** Ask only if the app has a hands-free or media-while-seated use. Same controls and hierarchy as every other pose. Otherwise record no custom tabletop layout.
5. **Sheets.** Ask only if the app has sheets. A sheet with a single toolbar button turns the outer vertical bar off. Any other sheet keeps side controls on the outer display.
6. **Video.** Ask only if the app plays video and custom chrome would fight system picture-in-picture resize or land in the fold. Otherwise record system picture-in-picture behavior.

## After confirmation

Write `iphone-duo.md` in the app project's root, using [record.md](references/record.md). If no app project is open, leave the record in the chat and ask where to put it.
