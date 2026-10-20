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

KANA = {
 'あ':'a','い':'i','う':'u','え':'e','お':'o','か':'ka','き':'ki','く':'ku','け':'ke','こ':'ko',
 'さ':'sa','し':'shi','す':'su','せ':'se','そ':'so','た':'ta','ち':'chi','つ':'tsu','て':'te','と':'to',
 'な':'na','に':'ni','ぬ':'nu','ね':'ne','の':'no','は':'ha','ひ':'hi','ふ':'fu','へ':'he','ほ':'ho',
 'ま':'ma','み':'mi','む':'mu','め':'me','も':'mo','や':'ya','ゆ':'yu','よ':'yo',
 'ら':'ra','り':'ri','る':'ru','れ':'re','ろ':'ro','わ':'wa','を':'wo','ん':'n',
 'が':'ga','ぎ':'gi','ぐ':'gu','げ':'ge','ご':'go','ざ':'za','じ':'ji','ず':'zu','ぜ':'ze','ぞ':'zo',
 'だ':'da','ぢ':'ji','づ':'zu','で':'de','ど':'do','ば':'ba','び':'bi','ぶ':'bu','べ':'be','ぼ':'bo',
 'ぱ':'pa','ぴ':'pi','ぷ':'pu','ぺ':'pe','ぽ':'po','ぁ':'a','ぃ':'i','ぅ':'u','ぇ':'e','ぉ':'o','ゔ':'vu',
}
COMBO = {'ゃ':'ya','ゅ':'yu','ょ':'yo'}
def kata2hira(s): return ''.join(chr(ord(c)-0x60) if 'ァ' <= c <= 'ヶ' else c for c in s)

def to_romaji(k):
    """kana -> canonical Hepburn-ish romaji, or None if it holds anything we can't type."""
    k = kata2hira(k); out = []; i = 0; sokuon = False
    while i < len(k):
        c = k[i]
        if c == 'っ': sokuon = True; i += 1; continue
        if c == 'ー': out.append(out[-1][-1] if out else ''); i += 1; continue
        if c not in KANA: return None
        r = KANA[c]
        if i+1 < len(k) and k[i+1] in COMBO:
            y = COMBO[k[i+1]]
            r = (r[:-1] if r.endswith('i') and r not in ('i',) else r)
            if c in 'しじちぢ': r = r[:-1] if r.endswith('i') else r; r = r.replace('sh','sh').replace('ch','ch'); r = r + y[1:]
            else: r = KANA[c][:-1] + y
            i += 1
        if sokuon:
            r = ('t' + r) if r.startswith('ch') else (r[0] + r); sokuon = False
        out.append(r); i += 1
    if sokuon: return None
    s = ''.join(out)
    # n before a vowel/y needs n'-style disambiguation: use nn
    return re.sub(r'n(?=[aiueoy])', 'nn', s) if False else s

def variants(kana):
    """Accepted spellings: shi/si, chi/ti, tsu/tu, fu/hu, ji/zi, sh+V/sy+V, ch+V/ty+V, j+V/zy+V, n/nn."""
    base = to_romaji(kana)
    if base is None: return None
    # split on moras roughly by regex alternatives
    toks = re.findall(r'shi|sh[aueo]|chi|ch[aueo]|tsu|ji|j[aueo]|fu|[kgsztdnhbpmr]y[aueo]|nn?(?![aiueoy])|n|[a-z]', base)
    alts = {'shi':['shi','si'],'chi':['chi','ti'],'tsu':['tsu','tu'],'fu':['fu','hu'],'ji':['ji','zi']}
    opts = []
    for t in toks:
        if t in alts: opts.append(alts[t])
        elif re.fullmatch(r'sh[aueo]', t): opts.append([t, 'sy'+t[2]])
        elif re.fullmatch(r'ch[aueo]', t): opts.append([t, 'ty'+t[2]])
        elif re.fullmatch(r'j[aueo]', t): opts.append([t, 'zy'+t[1]])
        else: opts.append([t])
    out = []
    for combo in itertools.islice(itertools.product(*opts), 64):
        s = ''.join(combo)
        if s == base: continue
        out.append(s)
    return [base] + sorted(set(out), key=lambda s: (len(s), s))[:7]

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
