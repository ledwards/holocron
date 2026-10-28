# iPhone Duo web screenshots

Renders Holocron's real components in Chromium at iPhone Duo sizes, in every pose: closed (portrait and landscape), open flat, open upright, half folded like a book, and propped on a table. Used to review the iPhone Duo layout from a machine without Xcode.

```bash
scripts/duo-web-shots/run.sh                      # → artifacts/duo-web-shots/
BEFORE_REF=067f127 scripts/duo-web-shots/run.sh   # plus before/after pairs against that commit
REAL_ART=1 scripts/duo-web-shots/run.sh           # fetch card art instead of marking it
```

Needs Node, Python 3 with Pillow, and Playwright's Chromium (`require('playwright')`).

What is real: every component, row, gallery, reader and the navigation, with the pinned upstream card catalogue (`src/data/__fixtures__/upstream-cards.json.gz`) and the public decklists.

What is stood in for (`shims/`, web only): file storage (serves that data), FastImage (plain Image), blur (the app's translucent fallback colour), and safe-area insets plus the fold (supplied per scene in `shoot.js`). Screen sizes are Apple's published pixels divided by three, and the closed and landscape insets assume a 54-point strip on the trailing edge. Fonts are Inter, standing in for San Francisco.

Card art comes from res.starwarsccg.org. Without `REAL_ART`, or where that host is unreachable, each image is drawn as a labelled frame so its size and position still show.

These are not iOS screenshots. Confirm on the iPhone Duo simulator (Xcode 27.1, Device Hub) before release, in particular that iPhone Duo reports its control strip as a one-sided safe-area inset.
