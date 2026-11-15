#!/usr/bin/env python3
"""Build public/words-and-ladders.txt: lowercase a-z dictionary for the Words and Ladders game.

Sources: macOS /usr/share/dict/words (Webster's 2nd) + a Hunspell en_US .dic (modern base words).
Inflections (plurals, -ed, -ing, -er, -est, -ly) are NOT listed; the game strips suffixes at check time.
Usage: build-ladder-words.py path/to/en_US.dic
"""
import re, sys
TWO = set("ab ad ae ag ah ai al am an ar as at aw ax ay ba be bi bo by de do ed ef eh el em en er es ex fa go ha he hi hm ho id if in is it jo ka la li lo ma me mi mm mo mu my na ne no nu od oe of oh oi om on op or os ow ox oy pa pe pi po qi re sh si so ta ti to uh um un up us ut we wo xi xu ya ye yo za".split())
words = set()
for line in open('/usr/share/dict/words'):
    words.add(line.strip())
for line in open(sys.argv[1], encoding='utf-8', errors='ignore').read().splitlines()[1:]:
    words.add(line.split('/')[0].strip())
ok = sorted(w for w in words if re.fullmatch(r'[a-z]{3,16}', w)) + sorted(TWO)
open('public/words-and-ladders.txt', 'w').write('\n'.join(ok) + '\n')
print(len(ok))
