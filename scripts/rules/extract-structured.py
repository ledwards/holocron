#!/usr/bin/env python3
"""Source-preserving SWCCG extraction, adapted from Wayfinder's PyMuPDF span approach.

Text is never rewritten by a language model or word-repair regexes. Font flags,
line geometry, columns, and page provenance determine the native structure.
"""
import argparse
import base64
from collections import Counter
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import re
import unicodedata

SOURCE_URL = 'https://res.starwarsccg.org/rules/SWCCG_2023_AdvancedRulebook.pdf'
ROOT = Path(__file__).resolve().parents[2]
# Verified against the printed glyphs on pages 75 and 99, as Wayfinder does for SWU icons.
SYMBOLS = {'\uf0b8': ('◇', 'Diamond restriction'), '\uf04e': ('☠', 'Sacrifice'), '\uf0ac': ('✶', 'Maintain'), '\uf0c9': ('♻', 'Recycle')}
SYMBOL_IMAGES = {}
# These two unruled symbol legends need their spatial relationships intact.
# Coordinates are verified against this exact edition, never reused on another PDF.
SOURCE_FIGURES = {
    '0a6387698f1a7a23aef8765612c419e66d8edce0d3e5ede89c040d0f7dabdebd': {
        99: [
            {'bounds': (43, 119, 294, 246)},
            {'bounds': (320, 565, 572, 676), 'rowEnds': (606, 647), 'labelEnd': 405},
        ],
    },
}


def preserve_source_figures(items, page, regions):
    import fitz
    for region in regions:
        bounds = region['bounds']
        rect = fitz.Rect(bounds)
        included = [item for item in items if rect.contains(fitz.Rect(item['bbox']))]
        runs = []
        reading_order = included
        if 'rowEnds' in region:
            reading_order = sorted(included, key=lambda item: (
                sum(item['bbox'][1] >= end for end in region['rowEnds']),
                item['bbox'][0] >= region['labelEnd'], item['bbox'][1], item['bbox'][0]))
        for item in reading_order:
            append_runs(runs, item.get('runs', []), new_line=True)
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), clip=rect, alpha=False)
        figure = {'kind': 'image', 'bbox': bounds, 'runs': runs, 'image': {
            'uri': 'data:image/png;base64,' + base64.b64encode(pix.tobytes('png')).decode(),
            'width': rect.width, 'height': rect.height, 'page': page.number + 1,
        }}
        if not included:
            raise ValueError(f'Empty source figure on page {page.number + 1}')
        first = min(items.index(item) for item in included)
        items = [item for item in items if item not in included]
        items.insert(first, figure)
    return items


def normalize(text):
    return re.sub(r'\s+', ' ', unicodedata.normalize('NFKC', text))


def text_of(runs):
    return ''.join(run['text'] for run in runs)


def append_runs(target, runs, new_line=False):
    if new_line and target and (not target[-1]['text'].endswith((' ', '-')) or target[-1]['text'].endswith(' -')):
        target[-1]['text'] += ' '
    for run in runs:
        if target and {k: v for k, v in target[-1].items() if k != 'text'} == {k: v for k, v in run.items() if k != 'text'}:
            target[-1]['text'] += run['text']
        else:
            target.append(dict(run))


def line_runs(line):
    runs = []
    for span in line['spans']:
        raw = span['text']
        unknown = [c for c in raw if '\ue000' <= c <= '\uf8ff' and c not in SYMBOLS]
        if unknown:
            raise ValueError(f'Unmapped PDF glyphs: {unknown!r}')
        text = normalize(''.join(SYMBOLS[c][0] if c in SYMBOLS else c for c in raw))
        if not text:
            continue
        font = span.get('font', '').lower()
        flags = span.get('flags', 0)
        run = {'text': text}
        if raw.strip() in SYMBOL_IMAGES:
            run['symbol'] = {'uri': SYMBOL_IMAGES[raw.strip()], 'label': SYMBOLS[raw.strip()][1]}
        if flags & 16 or 'bold' in font:
            run['bold'] = True
        if flags & 2 or 'italic' in font or 'oblique' in font:
            run['italic'] = True
        append_runs(runs, [run])
    if runs:
        runs[0]['text'] = runs[0]['text'].lstrip()
        runs[-1]['text'] = runs[-1]['text'].rstrip()
    return [run for run in runs if run['text']]


def heading_level(line):
    spans = [s for s in line['spans'] if s['text'].strip()]
    text = normalize(''.join(s['text'] for s in spans)).strip()
    if not spans or not all((s.get('flags', 0) & 16) or 'bold' in s.get('font', '').lower() for s in spans):
        return 0
    size = max(s['size'] for s in spans)
    if size >= 20 or text == 'Introduction' or text.startswith('Advanced Rulebook '):
        return 1
    if size >= 11.5:
        return 2
    words = re.findall(r"[A-Za-z][A-Za-z'’-]*", text)
    significant = [w for w in words if w.lower() not in {'of', 'a', 'an', 'the', 'and', 'to', 'in', 'or', 'with', 'for', 'from', 'at', 'on', 'by', 'as', 'etc'}]
    title_case = bool(significant) and sum(w[0].isupper() for w in significant) / len(significant) >= 0.75
    if title_case and size >= 9 and len(text) < 160 and not re.search(r'[.!?;:]$', text) and not text.startswith(('•', '–')):
        return 3
    return 0


def page_items(page, page_number):
    items = []
    for block_id, block in enumerate(page.get_text('dict')['blocks']):
        if block['type'] == 1:
            x0, y0, x1, y1 = block['bbox']
            if x1-x0 >= 30 and y1-y0 >= 30:
                # Render the source rectangle so masks, labels and colors match the PDF.
                import fitz
                pix = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5), clip=fitz.Rect(block['bbox']), alpha=False)
                items.append({'kind': 'image', 'bbox': block['bbox'], 'image': {
                    'uri': 'data:image/png;base64,' + base64.b64encode(pix.tobytes('png')).decode(),
                    'width': x1-x0, 'height': y1-y0, 'page': page_number,
                }})
            continue
        if block['type'] != 0:
            continue
        for line in block['lines']:
            runs = line_runs(line)
            if not text_of(runs).strip():
                continue
            x0, y0, x1, y1 = line['bbox']
            # Running chapter labels above the content, and printed page/footer below.
            if (y0 < 36 and max(s['size'] for s in line['spans']) <= 10.5) or y0 > page.rect.height - 35:
                continue
            items.append({'kind': 'line', 'bbox': line['bbox'], 'runs': runs,
                          'level': heading_level(line), 'block': block_id,
                          'size': max(s['size'] for s in line['spans'])})
    middle = page.rect.width / 2
    left = [i for i in items if i['kind'] == 'line' and i['bbox'][2] < middle + 8]
    right = [i for i in items if i['kind'] == 'line' and i['bbox'][0] > middle]
    two_columns = len(left) >= 3 and len(right) >= 3
    if not two_columns:
        return sorted(items, key=lambda i: (round(i['bbox'][1], 1), i['bbox'][0]))
    # Full-width chapter titles form boundaries between column-reading bands.
    wide = [i for i in items if i['bbox'][0] < middle - 25 and i['bbox'][2] > middle + 25]
    wide.sort(key=lambda i: i['bbox'][1])
    remaining = [i for i in items if i not in wide]
    ordered = []
    def columns(band):
        return sorted(band, key=lambda i: (i['bbox'][0] >= middle, round(i['bbox'][1], 1), i['bbox'][0]))
    for boundary in wide:
        before = [i for i in remaining if i['bbox'][1] < boundary['bbox'][1]]
        ordered.extend(columns(before))
        remaining = [i for i in remaining if i not in before]
        ordered.append(boundary)
    ordered.extend(columns(remaining))
    return ordered


def blocks_from_items(items, page_number):
    blocks = []
    previous = None
    source_text = []
    for item in items:
        if item['kind'] == 'image':
            runs = item.get('runs', [])
            text = text_of(runs)
            source_text.append(text)
            blocks.append({'type': 'image', 'pageRef': page_number, 'textRuns': runs, 'text': text, 'image': item['image']})
            previous = None
            continue
        runs = item['runs']
        text = text_of(runs)
        source_text.append(text)
        level = item['level']
        bullet = bool(re.match(r'^[•●▪–]\s', text))
        kind = 'heading' if level else 'paragraph'
        last = blocks[-1] if blocks else None
        same_column = previous and abs(previous['bbox'][0] - item['bbox'][0]) < 30
        line_gap = item['bbox'][1] - previous['bbox'][1] if previous else 999
        continuing_heading = (level and last and last['type'] == 'heading'
                              and last.get('level') == level and previous
                              and previous['block'] == item['block'] and same_column)
        continuing_paragraph = (not level and not bullet and last and last['type'] == 'paragraph'
                                and same_column and 0 <= line_gap <= item['size'] * 1.45
                                and not (last.get('listItem') and item['bbox'][0] < previous['bbox'][0] - 3))
        if continuing_heading or continuing_paragraph:
            append_runs(last['textRuns'], runs, new_line=True)
            last['text'] = text_of(last['textRuns'])
        else:
            block = {'type': kind, 'textRuns': [dict(r) for r in runs], 'text': text, 'pageRef': page_number}
            if level:
                block['level'] = level
            if bullet:
                block['listItem'] = True
            blocks.append(block)
        previous = item
    # Every included character must survive; whitespace reflows, wording does not.
    canonical = lambda text: Counter(re.sub(r'\s', '', text))
    output_text = ''.join(b.get('text', '') for b in blocks)
    if canonical(''.join(source_text)) != canonical(output_text):
        raise ValueError(f'Text coverage mismatch on page {page_number}')
    return blocks


def build_artifact(pdf_path):
    import fitz
    pdf = fitz.open(pdf_path)
    # Keep the source maintenance icons, not look-alike emoji. The source uses
    # single-glyph spans on a transparent/white area of its maintenance legend.
    SYMBOL_IMAGES.clear()
    for page in pdf:
        for block in page.get_text('dict')['blocks']:
            if block['type'] != 0:
                continue
            for line in block['lines']:
                for span in line['spans']:
                    glyph = span['text'].strip()
                    if glyph in SYMBOLS and glyph != '\uf0b8' and glyph not in SYMBOL_IMAGES:
                        pix = page.get_pixmap(matrix=fitz.Matrix(4, 4), clip=fitz.Rect(span['bbox']), alpha=True)
                        SYMBOL_IMAGES[glyph] = 'data:image/png;base64,' + base64.b64encode(pix.tobytes('png')).decode()
    now = datetime.now(timezone.utc).isoformat()
    document = {'version': now[:10].replace('-', '.'), 'sourceUrl': SOURCE_URL,
                'sourceSha256': hashlib.sha256(Path(pdf_path).read_bytes()).hexdigest(),
                'generatedAt': now, 'extractionFormat': 'pdf-spans-v1', 'sections': [], 'toc': []}
    anchors = Counter()
    current = None
    started = False
    report = []
    for number, page in enumerate(pdf, 1):
        items = page_items(page, number)
        regions = SOURCE_FIGURES.get(document['sourceSha256'], {}).get(number, [])
        items = preserve_source_figures(items, page, regions)
        # Printed contents are replaced by native TOC; actual content starts at Introduction.
        if not started:
            started = any(i['kind'] == 'line' and i['level'] == 1 and text_of(i['runs']).strip() == 'Introduction' for i in items)
        if not started:
            continue
        blocks = blocks_from_items(items, number)
        for block in blocks:
            if block['type'] == 'heading':
                title = block['text'].strip()
                base = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-') or 'section'
                anchors[base] += 1
                anchor = base if anchors[base] == 1 else f'{base}-{anchors[base]}'
                current = {'id': anchor, 'anchor': anchor, 'title': title, 'level': block['level'], 'pageRef': number, 'blocks': []}
                document['sections'].append(current)
                if block['level'] <= 2:
                    document['toc'].append({'title': title, 'anchor': anchor, 'level': block['level'], 'order': len(document['toc'])})
            if current is None:
                raise ValueError('Body encountered before Introduction')
            current['blocks'].append(block)
        report.append({'page': number, 'blocks': len(blocks),
                       'characters': sum(len(b.get('text', '')) for b in blocks),
                       'images': sum(b['type'] == 'image' for b in blocks)})
    if not started or len(report) < 170:
        raise ValueError('Incomplete document: Introduction or expected content pages missing')
    return document, report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--pdf', type=Path, default=ROOT/'scripts/rules/input/SWCCG_2023_AdvancedRulebook.pdf')
    parser.add_argument('--out', type=Path, default=ROOT/'scripts/rules/input/structured.document.json')
    parser.add_argument('--report', type=Path, default=ROOT/'scripts/rules/input/structured.report.json')
    args = parser.parse_args()
    document, report = build_artifact(args.pdf)
    for path, value in [(args.out, document), (args.report, report)]:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(value, ensure_ascii=False, indent=2)+'\n')
    print(f'Extracted {len(document["sections"])} sections, {len(document["toc"])} TOC entries, {len(report)} content pages, {sum(p["images"] for p in report)} diagrams/images')

if __name__ == '__main__':
    main()
