#!/usr/bin/env python3
"""Build src/data/tidy-ja-words.json from JMdict_e (EDRDG, CC BY-SA 4.0).

usage: python3 scripts/build-ja-words.py path/to/JMdict_e
Takes the 3000 most common entries: everyday-tagged (ichi1/spec1) first, then by nf frequency tags (nf01 = top 500 ...),
keeps words typeable in 3-14 romaji letters, one per romaji spelling.
"""
import re, sys, json, itertools
import xml.etree.ElementTree as ET

N = 3000
raw = open(sys.argv[1], encoding='utf-8').read()
raw = re.sub(r'<!DOCTYPE.*?\]>', '', raw, flags=re.S)
raw = re.sub(r'&[a-zA-Z0-9-]+;', lambda m: m.group(0).strip('&;'), raw)  # entity -> its name, only used in <pos>/<misc>
root = ET.fromstring(raw)

from romaji import variants

def gloss(sense):
    gs = [g.text for g in sense.findall('gloss') if g.text and not g.get('g_type') == 'lit']
    gs = [re.sub(r'\s*\(.*?\)', '', g).strip() for g in gs]
    gs = [g for g in gs if g]
    out = ''
    for g in gs[:3]:
        cand = (out + ', ' + g) if out else g
        if len(cand) > 32: break
        out = cand
    return out

rows = []
for e in root.findall('entry'):
    nf = 99; common = False
    for tag in e.iter():
        if tag.tag in ('re_pri', 'ke_pri') and tag.text:
            if tag.text.startswith('nf'): nf = min(nf, int(tag.text[2:]))
            if tag.text in ('ichi1', 'spec1'): common = True
    if nf == 99: continue
    k = e.find('k_ele/keb'); r = e.find('r_ele/reb')
    if r is None: continue
    sense = e.find('sense')
    pos = [p.text for p in sense.findall('pos')]
    if any(p and p.startswith(('prt', 'suf', 'pref', 'ctr', 'aux', 'n-suf')) for p in pos): continue   # particles/affixes make poor flashcards
    v = variants(r.text)
    if not v or not (3 <= len(v[0]) <= 14): continue
    m = gloss(sense)
    if not m: continue
    rows.append(((0 if common else 1, nf), e.find('ent_seq').text, k.text if k is not None else r.text, r.text, v, m))

rows.sort(key=lambda x: (x[0], int(x[1])))
seen, out = set(), []
for nf, _, w, r, v, m in rows:
    if v[0] in seen: continue
    seen.add(v[0]); out.append({'w': w, 'r': r, 'k': v, 'm': m})
    if len(out) == N: break
json.dump(out, open('src/data/tidy-ja-words.json', 'w'), ensure_ascii=False, separators=(',', ':'))
print(len(rows), len(out), 'last rank', rows[-1][0])
