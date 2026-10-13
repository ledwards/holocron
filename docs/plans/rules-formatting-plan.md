# Rules PDF formatting preservation

## Snapshot
The bundled 2023 PDF matches the current official download by SHA-256. The legacy PDF.js extraction guesses traits from opaque font IDs, then parser/generator/view heuristics repair words and infer boundaries. Wayfinder iOS uses PyMuPDF spans for source styles and validates section boundaries against the PDF.

## Scope
Adapt span-aware extraction to SWCCG's two-column source. Preserve headings, bold/italic spans, paragraph/list boundaries, diagrams, page provenance, and search. Keep the approved Rules search/reader shell and all other app designs.

## Execution
1. Inspect representative source pages and Wayfinder's extractor; record fixtures and regression cases.
2. Extract structured blocks with explicit font traits and reading order. Generate native artifacts and index without legacy text-repair passes. Exit: content coverage and formatting checks pass.
3. Render source structure without display-time text repairs; preserve navigation and search. Exit: unit/integration checks pass.
4. Compare source and native screenshots, build and install on the connected phone. Exit: verified source examples and device launch.

## Human-required steps
None with the existing local Python/Xcode tooling and paired device. No publishing or account changes.

## Validation
Python extraction tests, full artifact page/text/style coverage, existing quality gate, Jest suites, type check, native screenshots on representative Rules content, signed iOS build.

## Risks
Column order, running headers, wrapped headings, bullet continuations, source glyphs, and embedded diagrams need source-based assertions. Preserve the legacy extractor for comparisons; do not rewrite rule wording with an LLM.

## References
- Local reference: `/Users/lee/Repos/ledwards/wayfinder-ios/tools/rules-extraction/extract_rules.py`
- Source: https://res.starwarsccg.org/rules/SWCCG_2023_AdvancedRulebook.pdf

## Closure — 2026-10-13
- Implemented the Wayfinder-inspired span pipeline and regenerated all 179 content pages: 1,888 searchable sections, 176 contents entries, and 31 source diagrams/figures. Preserved heading hierarchy, bold/italic text, bullets, and maintenance symbols; retained both page-99 symbol legends as searchable source figures.
- Fixed possessive search omissions exposed by smaller sections and inaccurate long-distance reader jumps exposed by the page-99 check. Removed an image minimum-height constraint that could clip wide figures.
- Permanent guidance updated in README.md, docs/ARCHITECTURE.md, docs/TESTING.md, and docs/RULES_EXTRACTION.md.
- Validation: 240 unit tests, 7 integration tests, 7 Python extraction tests, artifact quality gate, scoped TypeScript check, simulator and signed device Release builds. Native search/result/next-page/contents flow and page-99 search jump passed. Source/native comparisons cover hierarchy, italic definitions, diagrams, bullets, and symbol legends.
- Installed the signed build on Inara. Launch was denied because the phone is locked; open Holocron after unlocking for the physical-device walkthrough. No App Store submission or commit.
- Follow-up limits: this remains a reflowed native reader rather than a facsimile PDF; review font/geometry assumptions and source-figure regions when a new official PDF is published.
