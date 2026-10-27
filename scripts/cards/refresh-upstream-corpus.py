#!/usr/bin/env python3
"""Pin a snapshot of the upstream card data for UpstreamCorpus.test.ts.

Downloads Dark.json, Light.json and sets.json from swccgpc/swccg-card-json,
keeps every row and every field the app's loader and Card model read, in the
exact upstream shapes (string stats, absent stats, "*", "(ALT)" rows, reused
gempIds), drops fields nothing reads (rulings, printings, errata notes, ...),
and writes one gzipped JSON file plus its provenance.

    python3 scripts/cards/refresh-upstream-corpus.py            # download latest
    python3 scripts/cards/refresh-upstream-corpus.py --from DIR # use local copies

After refreshing, run `npm run test:upstream` and review every changed count
in src/data/__fixtures__/upstream-query-counts.json before updating it with
`UPDATE_UPSTREAM_COUNTS=1 npm run test:upstream`.
"""
import argparse, datetime, gzip, json, os, urllib.request

BASE = 'https://raw.githubusercontent.com/swccgpc/swccg-card-json/main'
OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'src', 'data', '__fixtures__', 'upstream-cards.json.gz')

TOP = ['gempId', 'side', 'set', 'rarity', 'legacy', 'abbr', 'cancels', 'canceledBy', 'matching',
       'matchingWeapon', 'pulledBy', 'pulls', 'underlyingCardFor', 'counterpart', 'front', 'back']
FRONT = ['title', 'type', 'subType', 'ability', 'armor', 'darkSideIcons', 'deploy', 'destiny', 'ferocity',
         'forfeit', 'hyperspeed', 'landspeed', 'lightSideIcons', 'maneuver', 'parsec', 'politics', 'power',
         'characteristics', 'icons', 'gametext', 'lore', 'imageUrl', 'extraText', 'uniqueness']
BACK = ['imageUrl', 'gametext', 'extraText']


def load(name, source):
    if source:
        with open(os.path.join(source, name), encoding='utf8') as f:
            return json.load(f)
    with urllib.request.urlopen(f'{BASE}/{name}') as r:
        return json.load(r)


def keep(obj, fields):
    return {k: obj[k] for k in fields if k in obj}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--from', dest='source', help='directory holding Dark.json, Light.json, sets.json')
    args = parser.parse_args()

    corpus = {
        'source': BASE,
        'fetched': datetime.date.today().isoformat(),
        'sets': load('sets.json', args.source),
    }
    for side in ('Dark', 'Light'):
        rows = load(f'{side}.json', args.source)['cards']
        trimmed = []
        for row in rows:
            card = keep(row, TOP)
            card['front'] = keep(row['front'], FRONT)
            if 'back' in row:
                card['back'] = keep(row['back'], BACK)
            trimmed.append(card)
        corpus[side] = trimmed

    data = json.dumps(corpus, ensure_ascii=False, separators=(',', ':'), sort_keys=True).encode('utf8')
    with open(OUT, 'wb') as f:
        f.write(gzip.compress(data, 9, mtime=0))
    print(f"wrote {os.path.relpath(OUT)}: {len(corpus['Dark'])} dark + {len(corpus['Light'])} light rows, "
          f"{len(data)} bytes -> {os.path.getsize(OUT)} gzipped, fetched {corpus['fetched']}")


if __name__ == '__main__':
    main()
