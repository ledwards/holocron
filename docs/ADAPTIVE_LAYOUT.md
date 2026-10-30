# Adaptive layout and Duo design

## App identity

The App Store app is **SW:CCG Holocron**, ID **6473052017**, bundle ID **com.ledwards.holocron**. This repository owns that bundle. `holocron.old` is an older checkout of the same repository; `swu-holocron` uses `com.swuholocron.app` and is a different product.

Verified against [Apple's lookup](https://itunes.apple.com/lookup?id=6473052017) and [App Store listing](https://apps.apple.com/app/id6473052017).

## Layout ownership

- Preserve the original 62-point icon-only bottom bar. Icons are 28 points and explicitly vertically centered (the existing `PlatformPressable` receives `justifyContent: center`); React Navigation otherwise leaves its vertical UIKit items top-aligned when labels are hidden. The bar draws its own glass (`GlassSurface`), and the search docks sit directly on it. Verify gesture-area clearance on each device; do not add a second oversized blur panel.
- Screen wrappers protect horizontal safe areas. Rules has no navigation header, so its wrapper also protects the top safe area. Cards and Decklists get top protection from their headers.
- Cards and Decklists reserve `useHeaderHeight()` once at the workspace boundary. Detail scroll content reserves `useBottomTabBarHeight()` below content. Do not infer these values from notch detection.
- The search dock's outer keyboard-avoiding wrapper is absolutely positioned; its inner content stays in normal layout flow. Making both absolute gives the wrapper zero height and removes visible controls from the iOS accessibility hierarchy.
- `useSearchDockBottomPadding` always reserves navigation space. Keyboard avoidance accounts for the navigator header and that reserved space, leaving eight points above the keyboard without maintaining a second keyboard-visibility state. This prevents a hidden search input after rotation. Cards and Decklists share a normal-flow native `SearchField` with accessible mode/clear buttons. The native keyboard covers the fixed bottom tabs; the navigator does not run an additional hide translation.
- Decorative deck footers remain absolute and do not intercept touches.

## Native startup

Expo registers `main`, while existing native binaries request `holocron`. The JS entry registers both names against the same App component.

The iOS scene manifest declares one application scene. `HolocronSceneDelegate` in `AppDelegate.mm` attaches the window created by React Native 0.73 to its `UIWindowScene`; it does not create another React bridge. Multiple independent app windows are not enabled. The scene delegate also posts `RCTWindowFrameDidChangeNotification` on coordinate-space changes, preserving React Native 0.73’s window-metrics update during folding and rotation. Omitting that callback can leave the tab navigator positioned using stale dimensions.

This is needed for iOS 27 SDK builds: the previous native app terminated in `UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption` on the iOS 27.1 Duo simulator. See [Apple's scene migration guide](https://developer.apple.com/documentation/uikit/transitioning-to-the-uikit-scene-based-life-cycle).

## Duo comps

Open `docs/layout-comps/index.html` directly or serve the directory:

```bash
python3 -m http.server 8769 --bind 127.0.0.1 --directory docs/layout-comps
```

These are historical exploratory comps, not an approved redesign or the current native implementation. Their generic rows, labeled mode tabs, grouped gallery, and extra headings were rejected; do not copy them into the app. They cover:

- Decklists: persistent search/results on the left; selected deck grid, list, or text on the right. Tapping a deck card inspects it within detail and provides a return-to-deck control.
- Cards: search/results on the left; complete card artwork and metadata on the right.
- Rules: sections/search on the left; a bounded reading column on the right.
- Light/dark appearance, narrow phone layout, open Duo, portrait Duo, empty selection, and no results.

Sample decks come from the public `ledwards/swccg-data` deck dataset; card artwork loads from `res.starwarsccg.org`. Rules excerpts come from this repository's generated rulebook. The browser preview uses illustrative device frames, not exact OS chrome.

## Native adaptive panes

`AdaptiveWorkspace` measures its available width. At normal text size it uses two panes from 620 points, split evenly (the browser never narrower than 280 points; larger text raises that and the required width). On iPhone Duo open flat the even split puts the divide on the hinge, where the half-open fold puts it too, so opening, folding and closing never move the list: it keeps roughly the closed display's width and the detail unfolds beside it. A card opened inline on the closed display (`expandedCard` in `SearchableCardList`) becomes the detail when the phone opens, and the row folds back into the list. This applies to available space, not a hardcoded device name. Both panes stay mounted across width changes; compact Back returns to the existing query and list.

- Cards retain title/natural-language search and the original tap-to-expand/flip/collapse rows on phones. Wide layouts open selected artwork in the detail pane; tapping that artwork flips it.
- Decklists keep their browser visible on wide layouts. `AdaptiveDeckDetail` embeds the original grid/list/text components. Preserve the four-column edge-to-edge gallery, repeated copies, original expanding card interactions, and cropped list rows. Grid geometry measures its pane instead of caching window width. The original single next-mode icon belongs in the navigation header; no labeled tabs or additional toolbar.
- Rules uses the approved document-search design: on compact screens, search results replace the reader while searching; selecting a result returns to the complete document and dismisses the keyboard. Wide screens retain results beside the reader. Search and clear use a single field; contents and previous/next use icons. The slim in-flow match bar labels its count as matching pages (the reader navigation unit), while the result list counts occurrences. Query, reader component, and TOC collapse state survive width changes.
- `CardArtwork` uses the source image dimensions, `contain`, and a fitted layout frame for rotated site artwork. Rotation swaps the frame dimensions; it never relies on transformed pixels extending outside a portrait frame.
- The card inspector measures its heading before allocating artwork height, resets the visible face for a newly selected card, and flips when the artwork is tapped. Missing artwork has an explicit fallback.
- Existing footer blur treatments keep navigation readable. Theme colors remain context-driven.

The original deck view components are the live implementation inside `AdaptiveDeckDetail`. Do not replace them with a newly designed gallery or inspector.

Validation evidence is local in `artifacts/layout-review/`. Use the native `screenshots/adaptive-panes.yaml` compact-device flow and Device Hub for Duo's Open/Closed/Rotate controls. Device Hub can expose the inner display when Maestro targets the closed display. Physical-device release checks remain necessary; simulator fold/rotation checks do not substitute for hardware testing.

The navigator keyboard-hide animation is disabled: native keyboard coverage handles typing without a second translation that can remain offscreen after a Duo rotation. Keep this behavior protected alongside safe-area ownership.

## iPhone Duo: vertical controls and the fold

Plan and open items: `docs/plans/iphone-duo-controls-and-fold-plan.md`. Apple guidance: [Designing for iPhone Duo](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/designing-for-iphone-duo.md).

- **Vertical control strip.** iPhone Duo moves the system's status bar and bars into a strip on one edge (closed, and open in landscape). `controlPlacement` (`lib/duoLayout.ts`) reads that from the window's safe-area insets — a large inset on ONE side and little at the top — never from a device name; a regular iPhone in landscape has symmetric side insets and keeps the bottom bar. In that mode `TabNavigation` renders `ControlRail` on that edge: the focused screen's `headerLeft` (Back) and `headerRight` (deck mode) at the top, the same three tab icons at the bottom. Headers are hidden. The strip floats over the screens' edge and is fully transparent (no blur, tint or border; the icons carry a soft halo for legibility), as iPhone Duo's own strip is: screens run beneath it, and receive its width as a `PaneInsets` inset (`contexts/PaneInsetsContext`) instead of a safe-area edge; an app that sits beside the strip looks letterboxed. The status items iPhone Duo draws at the top of the strip reach about 160 points, so the screen's actions start below them (`stripStatusRoom`); iOS hides them at compact heights (closed, landscape). Confirmed on the iPhone Duo simulator (Xcode 27.1, iOS 27.1): the strip is a one-sided inset of 84 points beside a 34-point bottom inset, and the open display upright reports `top: 82` with no side inset. Measured values are in `duoLayout.test.ts`.
- **Bottom clearance.** Read it through `useBottomClearance` (the bottom bar, or only the home-indicator inset beside a strip), never `useBottomTabBarHeight` directly.
- **Fold.** `useFoldRegion` reads the native `HolocronFold` module (`ios/holocron/HolocronFold.m`; contract in the plan). It adds a `UIHingeInteraction` to the root view for change notifications and reads `reservedRegions(kind: .division)`. The hinge status decides whether the display is folded: a division region stays reported active when the device is fully open, so the module only reports one while the status is partially open. On the simulator the crease is 40 points wide, centred on the display. `usePaneFold` maps the fold into a measured pane. Cards and Decklists meet a vertical fold (browser ends at the fold, the fold stays empty) and stack around a horizontal one (detail above, browser below). Rules meets a vertical fold and keeps reading across a horizontal one, because continuous text does not move. A fold that leaves a side too small is ignored. Flat or closed, nothing changes.

## Glass, the search dock and the card detail

- **One glass.** `components/glass/GlassSurface` is the app's only glass material (a thin blur, a legibility tint, a hairline highlight on the exposed edge). The tab bar's background is set once, in `TabNavigation`'s `screenOptions`, so every tab has it; the control rail, the search docks and the Rules reader bar use the same component. A screen never draws glass under the tab bar for itself (`DecklistEmptyFooter` did, and Rules, which had nothing of its own, had a bar with no glass). `glassOwnership.test.ts` enforces this.
- **Search dock.** `components/glass/SearchDock` holds the Cards and Decklists search fields: a glass panel sitting directly on the tab bar (its spacer is exactly the bar's height), clear of the strip, riding above the keyboard (`useKeyboardLift` measures the dock in the window on every keyboard move, lifts only while the dock's own field has focus, and always returns to zero on hide or blur; it replaced `KeyboardAvoidingView`, which kept a stale offset after posture changes, and opening iPhone Duo sends keyboard frames with no keyboard shown). While its field has focus it widens over the detail pane (`useExpandingDock`, 180 ms ease-out, back on blur) when the panes sit side by side. It never widens across a fold, and on a compact width it is already full width. `AdaptiveWorkspace` supplies the room through `WorkspaceLayoutContext`.
- **Content under the chrome.** The header and the tab bar are glass and the iPhone Duo strip is transparent; chrome over nothing reads as an opaque bar. So `AdaptiveWorkspace` does not pad its panes below the header (except when stacked around a horizontal fold); it gives each pane `PaneInsets` (header height on top, the strip on the edge the pane touches), and lists and scroll views pad their content by them and scroll beneath (`contentContainerStyle` padding plus `scrollIndicatorInsets`). Rows run full-bleed and size their art and title within the clear part; fixed content (card detail, empty states, the deck grid's columns) stays inside the insets so nothing tappable is under the strip.
- **Rules reader bar.** `RulesReaderBar` is one floating glass capsule holding the page label and, while searching, the query with its match position and previous/next. The text scrolls beneath it and beneath the tab bar.
- **Card detail.** Only the card: no title or set/type text, rounded corners, and as large as the pane allows (10-point margin). The artwork keeps an accessibility label with the title.
- **Clearing the card search** closes the card detail.

## Preserve Holocron list rows

Card search and deck card lists use `CardListItem`; the deck browser uses `DecklistListItem`. These retain the original zoomed, right-aligned artwork crop, presenter-specific vertical offsets, translucent text backgrounds, side colors, typography, and quantity treatment. Adaptive navigation changes the press destination, not the row design. Measure the actual pane width for the existing geometry; never replace these rows with generic whole-card thumbnails.
