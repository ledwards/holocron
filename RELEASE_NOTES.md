# Release Notes

## Unreleased
- Card search no longer repeats rows or shows cards left over from an earlier search.
- Natural-language searches on set, side, type, rarity, icons, and similar fields return the matching cards again (for example `set c premiere`, `side = dark`, `icons c pilot`).
- Set abbreviations work as search values (`set c p` finds Premiere).
- Type searches without spaces: `setcpremiere`, `power>=6`, `sidedarkandtypecstarship`, `gtcbadfeeling`, and `darthvader` in title search all work.
- `>=`, `<=`, `power 6`, `side light`, `is imperial`, and `cancels c sense` now work as written, and words containing "and" (Commander, Hand, landspeed) no longer break a search.

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
