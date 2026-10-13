# Source-preserving rules extraction

## Source and reference
The official SWCCG Advanced Rulebook 2023 PDF is downloaded from https://res.starwarsccg.org/rules/SWCCG_2023_AdvancedRulebook.pdf. Its SHA-256 is stored with generated artifacts. The initial migration was based on the existing PDF; it is a formatting/extraction improvement, not a new rules edition or an import of later forum rulings.

Reference implementation: `wayfinder-ios/tools/rules-extraction/extract_rules.py`, particularly `extract_styled_lines_by_page`, explicit icon mapping, and source-based artifact tests. Holocron uses the same PyMuPDF text-span approach, with SWCCG-specific column and typography rules rather than SWU's numbered-section heuristics.

## Pipeline
Install the build-time dependency with `python3 -m pip install -r scripts/rules/requirements.txt`. Run `rules:download`, `rules:extract`, then `rules:generate` through npm.

- `extract-structured.py` reads actual font names/flags and source line geometry. It strips running headers/footers, reads the left column before the right, joins wrapped lines, and separates headings and bullet paragraphs. Included text is checked character-for-character (ignoring whitespace) per page before output. It does not guess missing words or rewrite rules.
- The native TOC replaces the printed contents pages. All content pages, 8–186, are retained with original page references. Level 1/2 headings populate the native TOC; smaller terms and card headings remain searchable sections with level 3 typography.
- Images are cropped directly from their source rectangles. Maintenance symbols use source glyph images and accessible names; the diamond restriction glyph maps to the ordinary diamond character. Unknown private-use glyphs stop extraction. The two unruled symbol legends on page 99 are retained as source figures with searchable, accessible text; their verified crop regions are keyed to the PDF SHA-256 and must be reviewed for another edition.
- `rules:generate` writes the document, metadata, and search index from the structured intermediate. Canonical block text is indexed as a whole, so a font change inside a word cannot split that word or duplicate token positions.
- The native reader recognizes `extractionFormat: pdf-spans-v1`, uses the extracted hierarchy/emphasis, and bypasses legacy display-time word and bullet repairs. Existing card/reference interactions remain available.

## Validation and limitations
Run the extraction tests, Jest rules tests, and quality gate. Compare source pages 9 (headings, italics, diagram), 10 (bullets and wrapped headings), and 99 (maintenance symbols) with native screenshots. Verify search/navigation with `screenshots/rules-reader.yaml` and source formatting with `screenshots/rules-formatting.yaml`.

This is a reflowed native document, not a facsimile PDF viewer: page columns become a reading sequence, and app typography adapts to the screen. Page provenance, wording, emphasis, and diagrams remain attached to the source. Background shading and decorative rules are not reproduced. Later PDFs may change font metrics or page margins, so extraction and artifact checks must be reviewed when updating the edition.

Legacy extraction and cleanup tools remain for comparison; do not apply `rules:phase3:text` or legacy generators to `pdf-spans-v1` data. The normal pipeline deliberately bypasses those repair heuristics.
