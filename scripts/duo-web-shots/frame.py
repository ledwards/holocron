#!/usr/bin/env python3
"""Frame raw screenshots with a caption and fold markers, and build an overview
plus before/after pairs when a 'before' folder exists.

    frame.py RAW_DIR OUT_DIR [BEFORE_DIR]
"""
import os, sys
from PIL import Image, ImageDraw, ImageFont

RAW, OUT = sys.argv[1], sys.argv[2]
BEFORE = sys.argv[3] if len(sys.argv) > 3 else None
os.makedirs(OUT, exist_ok=True)

def font(names, size):
    for path in names:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()
INTER = '/usr/share/fonts/opentype/inter/'
TITLE = font([INTER + 'Inter-SemiBold.otf', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'], 30)
BODY = font([INTER + 'Inter-Regular.otf', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'], 22)
SCALE = 2  # shoot.js captures at deviceScaleFactor 2

# name: (pose, what it shows, fold (axis, start, size) in points or None)
SHOTS = {
    '01-closed-cards-search': ('Closed', 'Card search: tabs move to the trailing strip; the list gets the full height', None),
    '02-closed-deck-gallery': ('Closed', 'Deck gallery: Back and deck mode at the top of the strip, tabs at the bottom', None),
    '03-closed-rules': ('Closed', 'Rules reader beside the strip', None),
    '04-closed-landscape-cards': ('Closed, landscape', 'Same strip on the same edge', None),
    '05-open-decks': ('Open flat', 'Deck list beside the four-column gallery; deck mode in the strip', None),
    '06-open-cards': ('Open flat', 'Results beside the selected card', None),
    '07-open-rules': ('Open flat', 'Contents beside the reader', None),
    '08-open-upright-rules': ('Open, upright', 'The bottom bar returns (Apple keeps horizontal bars here)', None),
    '09-open-upright-decks': ('Open, upright', 'Header and bottom bar as on other iPhones', None),
    '10-book-cards': ('Half folded like a book', 'Results end at the fold; the card starts after it', ('v', 433, 24)),
    '11-book-decks': ('Half folded like a book', 'Deck list on one side, gallery on the other', ('v', 433, 24)),
    '12-book-rules': ('Half folded like a book', 'Contents on one side, reader on the other', ('v', 433, 24)),
    '13-table-cards': ('Propped on a table', 'Card above the fold, search and results below', ('h', 433, 24)),
    '14-table-decks': ('Propped on a table', 'Gallery above the fold, deck list below', ('h', 433, 24)),
}
BEFORE_NOTES = {
    '01-closed-cards-search': 'Header on top, bottom bar, and an empty strip where Duo puts its own',
    '02-closed-deck-gallery': "Header and bottom bar take the gallery's space; empty strip on the edge",
    '04-closed-landscape-cards': 'Bottom bar and header in a short landscape window',
    '10-book-cards': 'The card sits on the fold',
    '13-table-cards': 'The card straddles the fold',
}

def framed(path, pose, detail, fold, tag=None):
    shot = Image.open(path).convert('RGB')
    w, h = shot.size
    mask = Image.new('L', (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, w - 1, h - 1], radius=72, fill=255)
    pad, bezel, caption = 40, 18, 120
    img = Image.new('RGB', (w + 2 * (pad + bezel), h + 2 * (pad + bezel) + caption), (236, 238, 240))
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle([pad, pad, pad + w + 2 * bezel, pad + h + 2 * bezel], radius=86, fill=(22, 24, 26))
    img.paste(shot, (pad + bezel, pad + bezel), mask)
    if fold:  # orange ticks outside the screen mark where the fold is
        axis, start, size = fold
        orange = (255, 149, 0)
        if axis == 'v':
            x0 = pad + bezel + start * SCALE
            for y in (pad - 22, pad + h + 2 * bezel + 4):
                draw.rectangle([x0, y, x0 + size * SCALE, y + 18], fill=orange)
        else:
            y0 = pad + bezel + start * SCALE
            for x in (pad - 22, pad + w + 2 * bezel + 4):
                draw.rectangle([x, y0, x + 18, y0 + size * SCALE], fill=orange)
    top = pad + h + 2 * bezel + 26
    draw.text((pad, top), pose + (f'  ·  {tag}' if tag else ''), fill=(20, 20, 20), font=TITLE)
    draw.text((pad, top + 44), detail, fill=(70, 74, 78), font=BODY)
    return img

made = []
for name, (pose, detail, fold) in SHOTS.items():
    path = f'{RAW}/{name}.png'
    if os.path.exists(path):
        framed(path, pose, detail, fold).save(f'{OUT}/{name}.png')
        made.append(f'{OUT}/{name}.png')

if BEFORE:
    for name, note in BEFORE_NOTES.items():
        if os.path.exists(f'{BEFORE}/{name}.png') and os.path.exists(f'{RAW}/{name}.png'):
            pose, detail, fold = SHOTS[name]
            a = framed(f'{BEFORE}/{name}.png', pose, note, fold, 'Today')
            b = framed(f'{RAW}/{name}.png', pose, detail, fold, 'With this change')
            pair = Image.new('RGB', (a.width + b.width + 20, max(a.height, b.height)), (236, 238, 240))
            pair.paste(a, (0, 0))
            pair.paste(b, (a.width + 20, 0))
            pair.save(f'{OUT}/before-after-{name}.png')

thumbs = []
for path in made:
    im = Image.open(path)
    im.thumbnail((760, 760))
    thumbs.append(im)
if thumbs:
    cols = 4
    cw, ch = max(t.width for t in thumbs) + 20, max(t.height for t in thumbs) + 20
    sheet = Image.new('RGB', (cols * cw, -(-len(thumbs) // cols) * ch), (236, 238, 240))
    for i, im in enumerate(thumbs):
        sheet.paste(im, ((i % cols) * cw + 10, (i // cols) * ch + 10))
    sheet.save(f'{OUT}/00-overview.png')
print(f'framed {len(made)} screenshots into {OUT}')
