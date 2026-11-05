#!/usr/bin/env python3
"""Build src/data/folktale-ja-momotaro-words.json: the vocabulary of the Momotaro retelling, typed in romaji.

usage: python3 scripts/build-folktale-words.py   (run from the repo root; no -I, it imports the sibling romaji.py)
Rows are (display text, kana reading, English). Romaji spellings come from romaji.variants, as in Tidy 日本語.
Keep every word in the /folktales/ja/momotaro/ story text (conjugated or in kana is fine); words must be 3-14 romaji letters and unique.
"""
import json
from romaji import variants

WORDS = [
 ('桃太郎', 'ももたろう', 'Momotaro (Peach Boy)'), ('桃', 'もも', 'peach'),
 ('おじいさん', 'おじいさん', 'old man, grandfather'), ('おばあさん', 'おばあさん', 'old woman, grandmother'),
 ('昔々', 'むかしむかし', 'long, long ago'), ('村', 'むら', 'village'),
 ('山', 'やま', 'mountain'), ('川', 'かわ', 'river'), ('川上', 'かわかみ', 'upstream'),
 ('洗濯', 'せんたく', 'laundry, washing'), ('流れる', 'ながれる', 'to flow, to drift'),
 ('拾う', 'ひろう', 'to pick up'), ('持ち帰る', 'もちかえる', 'to carry home'),
 ('割れる', 'われる', 'to split, to crack'), ('元気', 'げんき', 'healthy, lively'),
 ('男の子', 'おとこのこ', 'boy'), ('名づける', 'なづける', 'to name'), ('育てる', 'そだてる', 'to raise, to bring up'),
 ('大切', 'たいせつ', 'important, precious'), ('強い', 'つよい', 'strong'),
 ('鬼', 'おに', 'ogre, demon'), ('鬼ヶ島', 'おにがしま', 'Ogre Island'), ('退治', 'たいじ', 'subduing, defeating'),
 ('きびだんご', 'きびだんご', 'millet dumpling'),
 ('旅', 'たび', 'journey, trip'), ('途中', 'とちゅう', 'on the way, midway'),
 ('犬', 'いぬ', 'dog'), ('猿', 'さる', 'monkey'), ('雉', 'きじ', 'pheasant'),
 ('仲間', 'なかま', 'companion, comrade'), ('船', 'ふね', 'boat, ship'), ('渡る', 'わたる', 'to cross'),
 ('力', 'ちから', 'strength, power'), ('戦う', 'たたかう', 'to fight'), ('降参', 'こうさん', 'surrender'),
 ('宝物', 'たからもの', 'treasure'), ('帰る', 'かえる', 'to return home'), ('大喜び', 'おおよろこび', 'great joy, delight'),
]

out, seen = [], set()
for w, r, m in WORDS:
    v = variants(r)
    assert v and 3 <= len(v[0]) <= 14, (w, r, v)
    assert v[0] not in seen, ('duplicate romaji', w, v[0])
    seen.add(v[0])
    out.append({'w': w, 'r': r, 'k': v, 'm': m})
json.dump(out, open('src/data/folktale-ja-momotaro-words.json', 'w'), ensure_ascii=False, separators=(',', ':'))
print(len(out), 'words;', ', '.join(o['k'][0] for o in out[:8]), '...')
