# Native adaptive browsing and detail

## Snapshot
The safe-area corrections and interactive comps are present, uncommitted, alongside pre-existing Rules search work. The user approved native implementation. The current card expansion geometry caches full-window sizes; it cannot safely render in a narrower pane.

## Goal and scope
Implement persistent browsing left / detail right for Cards, Decklists and Rules, with compact navigation on narrow screens. Preserve queries and selection on resize, retain deck grid/list/text, support front/back and sideways card art, and keep current Rules search/navigation behavior. No dependency upgrades or publication.

## Execution and exit criteria
1. Add measured workspace and artwork-fit logic with regression tests. Exit: pane boundaries and rotated artwork fit at compact/wide widths.
2. Integrate Cards and Decklists with stable browser/detail ownership. Exit: search, selection, deck modes, flip, Back and resize work without reset.
3. Integrate persistent Rules navigation with existing reader. Exit: TOC/search selection drives right-hand reader while narrow mode remains usable.
4. Build, screenshot, inspect and test. Exit: passing relevant automated tests and native captures across compact/Pro Max/Duo; remaining limits recorded.

## Human-required steps
Physical-device verification and App Store submission remain release steps. Implementation and local simulator validation are authorized.

## Validation
Unit/component tests for fit geometry, compact/wide state retention, selection, back/flip and deck quantities. Existing full Jest suite and E2E command. Release build and native simulator screenshots for all tabs and deck modes; compare art positioning and safe areas on rotation.

## Risks and mitigation
Use actual content measurements instead of device identity. Keep both panes mounted to retain list scroll and reader state. Use intrinsic image dimensions and contain sizing for artwork. Preserve pre-existing Rules edits. Avoid claiming physical fold/hinge validation from a simulator rotation alone.

## Closure
Implemented native adaptive Cards, Decklists, and Rules. The browser retains search/selection across compact and wide layouts; deck grid/list/text and card inspection/flip are integrated. Artwork uses the existing FastImage cache, measured pane bounds, and rotation-aware contain geometry. Rules keeps its existing reader with a persistent TOC/search sidebar and measured compact-footer clearance.

Permanent guidance updated in README.md, docs/ARCHITECTURE.md, docs/TESTING.md, and docs/ADAPTIVE_LAYOUT.md. The old HTML comps remain a design reference.

Validation: 39 Jest suites / 229 tests pass; the dedicated E2E command passes 4 suites / 7 tests (included in the first count). Release simulator build succeeds. Native compact flows pass on iPhone 17 Pro Max and SE. Duo was exercised through Device Hub with open/closed and portrait/landscape transitions, selected deck/card retention, sideways artwork, Rules TOC/search, larger text, and light/dark appearance. Logs and captures are in local artifacts/layout-review/.

Follow-up release steps: physical-device verification and App Store delivery. Existing full-project TypeScript configuration issues remain documented in TESTING.md; no clean full-project typecheck is claimed. Nothing was committed or published by this task.

Final visual verification found stale navigator geometry during Duo rotation. The scene delegate now preserves React Native's window-frame notification on coordinate-space changes, in addition to attaching the launch window. This native regression is covered by the documented Device Hub rotate/fold check.

The scene callback alone did not resolve the offscreen tabs. Disabling the redundant navigator keyboard-hide translation fixed the reproduced dark/large-text rotation case; the native keyboard still covers the absolute bar while typing.

Search docks now retain navigation clearance independently of keyboard events; keyboard avoidance uses the actual header and dock insets. This fixes the reproduced search-input disappearance after a keyboard/rotation round trip. Shared native search fields preserve typing, clearing, and mode switching with minimum 44-point controls.

## Row-design correction — October 13
The user rejected replacing Holocron’s original list rows. Restored `CardListItem` and `DecklistListItem` throughout the live adaptive routes and removed the generic thumbnail row. Original style files and presenter crop offsets remain unchanged; row sizing measures the pane, and an optional press callback opens adaptive details. The restored rows were visually inspected in Pro Max screenshots, the native flow passed, the Release build succeeded, and all 230 tests passed. `docs/ADAPTIVE_LAYOUT.md` now explicitly protects this established design.

## Design-fidelity correction — October 13
The user rejected all unsolicited redesign. Restored the original single next-mode icon in the navigation header, original deck grid/list/text components and their interactions, compact inline card expansion/flip/collapse, and icon-only back controls. Removed the additional mode toolbar, gallery headings, word tabs, and visible flip buttons. Preserved the original 62-point bottom bar and centered 28-point icons explicitly; the navigator otherwise aligns hidden-label icons to the top. Original screen footers own blur backgrounds. Permanent adaptive-layout and architecture guidance now supersedes the rejected comps.

Correction validation: 39 suites / 229 tests pass, Release simulator build passes, source-only temporary TypeScript check passes, and compact native flows pass on Pro Max and SE. Final screenshots (`fidelity-pro-*`, `fidelity-se-*`, `fidelity-duo-grid.png`) were visually reviewed. Duo portrait/landscape retains the selected deck and original gallery. The final centering uses `PlatformPressable` justification and a 32-point icon frame; auto margins were rejected during screenshot inspection. Changes remain uncommitted.
