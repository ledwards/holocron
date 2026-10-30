# Release Notes

## Unreleased
- iPhone Duo: the side strip is now see-through glass over the app, as Duo-ready apps do, instead of a solid panel beside it, and its Back and view buttons no longer hide under the clock.
- The header is see-through glass again: lists scroll up underneath it.
- The search box sits right on the tab bar, with no gap.
- Opened flat, the list and the detail split evenly across the hinge, and opening the phone from a card you were viewing opens straight onto that card.
- Fixed the decklist search box jumping to the top of the screen when opening the phone.
- Fixed a crash when closing the phone with a deck open, and decklist grids now line up within the space beside the strip.
- Clearer glass: content under the strip, header and tab bar stays recognisable.
- Fixed stray card rows that could show above the natural-language search help.
- The search box can no longer get stuck partway up the screen after the keyboard closes.
- Fixed a layout loop in card rows.

## 1.2.1
- iPhone Duo: navigation follows the side strip when closed, and the half-open posture splits the list and the detail across the fold.
- One glass bar for every screen, including Rules, whose page and search controls now float on glass too.
- The search box widens across the screen while you type.
- Card details show just the card, as large as it fits, with rounded corners.
- Clearing the search closes the card you had open.
- Card search no longer repeats rows or shows cards left over from an earlier search.
- Natural-language searches on set, side, type, rarity, icons, and similar fields return the matching cards again (for example `set c premiere`, `side = dark`, `icons c pilot`).
- Set abbreviations work as search values (`set c p` finds Premiere).
- Type searches without spaces: `setcpremiere`, `power>=6`, `sidedarkandtypecstarship`, `gtcbadfeeling`, and `darthvader` in title search all work.
- `>=`, `<=`, `power 6`, `side light`, `is imperial`, and `cancels c sense` now work as written, and words containing "and" (Commander, Hand, landspeed) no longer break a search.
- Number searches only match cards that have that stat: `power < 1` no longer lists every Effect and Interrupt, and `power != 6` no longer lists every card.
- Search for special stat values: `power = *`, `destiny = pi`, `destiny = 4.5`, `forfeit = x`. Cards with two destiny values, like "1 or 6", match either one.
- The search box keeps your capital letters as you type.

## 1.2.0
- Improved layout and navigation spacing across iPhone screen sizes.
- Browse lists and details side by side on supported wider screens.
- Read and search the rules with preserved formatting and diagrams.
- Tap an example card name to search immediately.
- Clearer loading feedback while card data starts up.

## 1.1.0
- Tournament decklists

## 1.0.1
- Navigation bar!

## 1.0.0
- Initial release
- Search for cards by name, set, type, side, etc.
- View card images
- Advanced search (partially functional)
- Dark/Light mode for iOS
- Fancy AI-generated app icon
- Fix bug with counting results of subqueries in advanced search
