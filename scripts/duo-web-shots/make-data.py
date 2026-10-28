#!/usr/bin/env python3
"""Write the data the file-storage stand-in serves: the pinned upstream card
catalogue from the repo, plus the public decklists (downloaded; empty if the
download fails)."""
import gzip, json, sys, urllib.request

app = sys.argv[1]
corpus = json.loads(gzip.decompress(open(f'{app}/src/data/__fixtures__/upstream-cards.json.gz', 'rb').read()))
out = f'{app}/shots/data'
json.dump({'cards': corpus['Dark']}, open(f'{out}/Dark.json', 'w'))
json.dump({'cards': corpus['Light']}, open(f'{out}/Light.json', 'w'))
json.dump(corpus['sets'], open(f'{out}/sets.json', 'w'))
try:
    with urllib.request.urlopen('https://raw.githubusercontent.com/ledwards/swccg-data/main/public/decklists.json', timeout=60) as r:
        decks = json.load(r)
except Exception as error:  # the Decklists scenes will be empty, and say so
    print(f'decklists unavailable: {error}', file=sys.stderr)
    decks = {'decklists': []}
json.dump(decks, open(f'{out}/decklists.json', 'w'))
print(f"data: {len(corpus['Dark'])} dark, {len(corpus['Light'])} light, {len(decks['decklists'])} decklists")
