#!/usr/bin/env python3
"""Build src/data/tidy-zh-words.json from complete-hsk-vocabulary (drkameleon, MIT; meanings from CC-CEDICT, CC BY-SA 4.0).

usage: python3 scripts/build-zh-words.py path/to/complete.json
Takes the 3000 most frequent simplified entries typeable as 3-14 toneless pinyin letters, one per spelling.
Output rows: {w: hanzi, r: tone-marked pinyin, k: accepted spellings (first is canonical; ü typed as v, u also accepted), m: English gloss}
"""
import re, sys, json

N = 3000
data = json.load(open(sys.argv[1], encoding='utf-8'))
data.sort(key=lambda e: e['frequency'])

TONES = {'ā':'a','á':'a','ǎ':'a','à':'a','ē':'e','é':'e','ě':'e','è':'e','ī':'i','í':'i','ǐ':'i','ì':'i',
         'ō':'o','ó':'o','ǒ':'o','ò':'o','ū':'u','ú':'u','ǔ':'u','ù':'u','ǖ':'v','ǘ':'v','ǚ':'v','ǜ':'v','ü':'v'}
SKIP_POS = {'u', 'y', 'e', 'o', 'k', 'h', 'nr', 'ns', 'nt', 'nz', 'Mg', 'Rg'}   # particles, interjections, affixes, proper nouns
SKIP_M = re.compile(r'surname|variant of|see |abbr\. for|classifier|erhua|used in|Taiwan pr\.', re.I)

def gloss(ms):
    out = ''
    for g in ms:
        g = re.sub(r'\s*\(.*?\)', '', g).strip(' ;')
        if not g or SKIP_M.search(g): continue
        cand = (out + ', ' + g) if out else g
        if len(cand) > 32: break
        out = cand
        if len(out) > 20: break
    return out

PREFER = {'和': 'hé'}   # the 'with/and' reading, not the rarer huò
rows, seen = [], set()
for e in data:
    if set(e['pos']) & SKIP_POS: continue
    # polyphonic characters list several readings; the one with the most senses is the everyday one (说 shuō, not shuì)
    forms = [f for f in e['forms'] if f['transcriptions']['pinyin'].islower() and not re.search(r'variant of|surname', f['meanings'][0], re.I)]
    if not forms: continue
    f = max(forms, key=lambda f: len(f['meanings']))
    if e['simplified'] in PREFER: f = next((x for x in forms if x['transcriptions']['pinyin'] == PREFER[e['simplified']]), f)
    py = f['transcriptions']['pinyin']
    if not py.islower() or not re.fullmatch(r"[a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü' ]+", py): continue
    key = ''.join(TONES.get(c, c) for c in py.replace(' ', '').replace("'", ''))
    if not 3 <= len(key) <= 14 or key in seen: continue
    m = gloss(f['meanings'])
    if not m: continue
    seen.add(key)
    rows.append({'w': e['simplified'], 'r': py, 'k': [key], 'm': m})
    if len(rows) == N: break

# the standard IME shortcut types ü as v; also accept plain u (lu/nu) when that spelling isn't another word's
for r in rows:
    alt = r['k'][0].replace('v', 'u')
    if alt != r['k'][0] and alt not in seen:
        r['k'].append(alt)
json.dump(rows, open('src/data/tidy-zh-words.json', 'w'), ensure_ascii=False, separators=(',', ':'))
print(len(rows), 'last freq rank', e['frequency'])
