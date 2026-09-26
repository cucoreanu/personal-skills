# iPhone Duo principles

Rules from Apple's Design for iPhone Duo session (Marcos and Vince, Apple Design). Cite a section when a decision uses it. These rules are locked: the interview does not reopen them.

The outer display is the cover, visible when the device is closed. The inner display is the large screen, visible when the device is open.

## Size classes

Design two size classes: compact width on the outer display, regular width on the inner display. Use layout margins and horizontal safe area insets. Build the layout so it can resize freely.

Do not use fixed widths, breakpoints, or measurements taken from one screen.

## Side column

On the outer display, and on the inner display in landscape, app controls sit in a vertical column on the side. That column frees vertical space and keeps controls in thumb reach.

The outer display is wider and shorter than a traditional iPhone. Its column is on the right. It holds the tab bar, toolbars, navigation controls such as the back button, the status bar, and the Dynamic Island. The Dynamic Island grows vertically when a Live Activity arrives. Content sits in the uninterrupted area to the left of that column, comparable to the content area of an iPhone with traditional proportions.

On the inner display in portrait, keep horizontal bars. That pose has enough vertical space for content.

In the system side-by-side app view, controls sit on the outer edge. An app on the left puts its controls on the left edge, away from the center and within thumb reach.

## Chrome mapping

Map an existing iPhone app straight across:

- Toolbar buttons that were at the top go to the top of the side column.
- Toolbar buttons that were at the bottom go to the bottom of the side column.
- A tab bar stays bottom-aligned.

The column is shared with the status bar and Live Activities. When the column runs out of room, app controls collapse into an overflow menu.

A toolbar item that is too wide for the column stays in the navigation bar. A text button and a segmented control are the usual cases.

## Content alignment

Most content is offset so the side column does not cover it. Aligning to horizontal safe area insets does this.

Center on the full display, with no offset, only for an immersive visual screen that does not scroll, and only when no interactive element is covered by the side controls.

A full-width background or header may combine with a scrolling foreground that is inset. Every interactive element lives in that scrolling foreground.

## Poses

People hold Duo closed, open, partially folded like a book, seated like a laptop with the inner display facing them, or standing on its edges. The app is one experience across those poses. Functionality does not change with the pose, and the hierarchy does not change between the outer and inner displays. Opening and closing the device while the app is in use stays predictable.

Partially folded like a book, the display curves through the center. Content moves off that curve. Text and images shift aside. Buttons and other interactive elements move to the sides. The curve divides the layout.

Partially folded in portrait, interactive elements move to the bottom half so they stay in reach while the device rests on a surface.

Scrollable content may cross the curve. Interactive elements stay out of it. Prefer system components: sheets, alerts, menus, and toolbar buttons already move off the fold. Buttons that land in the fold are hard to tap.

## System multitasking

Dragging an app to the side with the iPhone home gesture creates a 50/50 split. The two halves run independently. That split is a system behavior, not an in-app layout to design.

Picture-in-picture video can pin to the top. The current app resizes vertically into the space that remains. Partially folded, the video fills half the screen, and apps follow that height as it changes.

## Inner display

Do not stretch the outer-display layout across the inner display. Pick one primary structure:

- **Sidebar.** Present the tab bar as a sidebar. Fits an information-dense app that already has a tab bar. The Health app is the session's example. It is a poor fit for every app.
- **Hierarchy side by side.** Show more than one level of the existing hierarchy at once. The levels are the same ones the outer display already has.
- **Two-column reflow.** A layout that stacks vertically on a narrow width rearranges into two columns when horizontal space allows. The Music app is the session's example.

## Tabletop

An optional layout for hands-free use while the device sits on a table: media at the top, tappable controls on the stable base at the bottom. It carries the same controls and the same hierarchy as the other poses.

## Sheets

On the outer display, sheet controls join the side column by default.

Turn that vertical bar off when it fits the sheet better. A sheet with a single toolbar button is the case the session calls out. With the bar off, the sheet stops short of the front camera and the status bar moves.

On the inner display, in landscape and in portrait, sheets use standard horizontal bars. Partially folded, sheets slide off the fold, as do other system components.
