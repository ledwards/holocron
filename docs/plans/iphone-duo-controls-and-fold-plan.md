# iPhone Duo: vertical controls and fold-aware panes

## Current snapshot
Holocron already measures its panes (`AdaptiveWorkspace`, Rules) and splits at 620 points, so iPhone Duo's inner display gets browser + detail. Its tab bar and headers are drawn by React Navigation in JavaScript, so they do not follow iPhone Duo's system layout: on the outer display, and on the inner display in landscape, the system moves tab bars, toolbars and the status bar to a vertical strip on one edge (HIG "Designing for iPhone Duo", Vertical controls). Holocron keeps a 62-point bottom bar and a top header there. The panes also ignore the fold: the detail pane straddles the crease when the device is partly folded.

Constraints: this repository is built in a Linux cloud session with no Xcode, so native code cannot be compiled or run here, and no simulator screenshot is possible. React Native 0.73 does not expose iOS 27.1's reserved-region (fold) API.

## Goal and scope
In: a vertical control strip (tabs, plus each screen's Back and mode buttons) on the edge where the system put its own status area; search docks and lists that reserve space for whichever placement is active; Cards, Decklists and Rules panes that meet at a vertical fold; Cards and Decklists stacked around a horizontal fold (detail above, browser below). Rendered screenshots of the real components at iPhone Duo sizes.
Out: the native fold module (needs Xcode 27.1), App Store work, any redesign of rows, gallery or icons.

## Phases and exit criteria
1. Pure layout decisions (`lib/duoLayout.ts`): control placement from safe-area insets; pane split from a fold region. Exit: unit tests for iPhone portrait/landscape, iPad, both Duo displays, Split View, and folds inside/outside a pane.
2. Navigation: placement context, side tab bar with the focused screen's header actions at the top, headers hidden in that mode, safe-area edges and bottom clearance follow placement. Exit: component tests in both placements; existing tests unchanged.
3. Fold-aware panes via a `FoldRegion` context fed by an optional native module. Exit: workspace tests for vertical and horizontal folds.
4. Web-rendered screenshots of the real app at iPhone Duo sizes (throwaway build outside the repo). Exit: screenshots of every pose reviewed.

## Human-required steps
- ~~Run on the iPhone Duo simulator to confirm the strip is a one-sided safe-area inset.~~ Done (see Simulator results).
- ~~Implement and compile the native fold module (`HolocronFold`, below) on a Mac.~~ Done.
- Physical-device checks before release (still open).

## Native fold module contract (implemented in `ios/holocron/HolocronFold.m`)
`NativeModules.HolocronFold`: `getDivisionRegion(): Promise<{x,y,width,height} | null>` in window points, from `view.reservedRegions(kind: .division)` on the root view; emits `holocronFoldChanged` with the same payload (null when flat or closed). Without the module (Android, older iOS, Jest) the hook returns null and the panes behave as on a flat display. Implementation notes: change notifications come from `UIHingeInteraction` (the reserved-region API has none), and the hinge status gates the result, because the division region stays active when the device is fully open.

## Validation
Jest unit/component tests; full unit and e2e suites; web screenshots at 466x678 / 678x466 (outer) and 890x626 / 626x890 (inner, estimated points: Apple publishes pixels only); simulator and device checks above.

## Risks
- The inset signal is inferred from Apple's statement that iPhone Duo safe areas are asymmetric with controls on one edge; unverified without the simulator. Failure mode is today's layout, not a broken one.
- Header titles are not shown in the strip (iPhone Duo's vertical strip holds symbols); the deck's tournament name then appears only in the list.
- The deck-mode icon can be the same list symbol as the Cards tab, now in the same strip; kept to avoid an unrequested icon change, flagged for a decision.

## Sources
- https://developer.apple.com/tutorials/data/design/human-interface-guidelines/designing-for-iphone-duo.md
- https://developer.apple.com/videos/play/tech-talks/111461/
- https://developer.apple.com/videos/play/tech-talks/111463

## Simulator results (iPhone Duo, Xcode 27.1, iOS 27.1)
Safe-area insets (top / right / bottom / left) read with `useSafeAreaInsets()`:

| Posture | Window (pt) | Insets | Placement |
| --- | --- | --- | --- |
| Closed, portrait | 466x678 | 0 / 84 / 34 / 0 | right |
| Closed, landscape (strip right) | 678x466 | 0 / 84 / 34 / 0 | right |
| Closed, landscape (strip left) | 678x466 | 0 / 0 / 34 / 84 | left |
| Open, flat landscape | 951x669 | 0 / 84 / 34 / 0 | right |
| Open, upright | 669x951 | 82 / 0 / 34 / 0 | bottom |

Partly folded, the division region is 40 points wide, centred: `{x: 455.5, y: 0, width: 40, height: 669}` in landscape (book) and `{x: 0, y: 455.5, width: 669, height: 40}` upright (propped on a table). Hinge angle was about 2.23 rad for Partially Open and pi for Open.

Open items: not reproduced after four attempts, the Cards search dock once floated about 257 points above the bottom in the book posture; the deck-mode icon and the Cards tab use the same list symbol in the strip (see Risks).
