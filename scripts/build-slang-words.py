#!/usr/bin/env python3
"""Build src/data/slang-ja-words.json: Japanese texting slang for the /slang/ja/ page and its Tidy game.

usage: python3 scripts/build-slang-words.py   (run from the repo root; no -I, it imports the sibling romaji.py)
Rows: (display, kana reading, English meaning, category, example sentence, example translation).
Only terms that appear across several learner guides and that we are confident about; slang ages, so
mark dated ones in the meaning. Romaji spellings come from romaji.variants, as in Tidy 日本語.
"""
import json
from romaji import variants

WORDS = [
 # replying
 ('りょ', 'りょ', 'got it (from 了解)', 'Replying', '明日10時ね。—りょ。', 'Tomorrow at 10, okay? — Got it.'),
 ('おけ', 'おけ', 'okay (from オッケー)', 'Replying', 'これでおけ？', 'Is this okay?'),
 ('それな', 'それな', 'so true, exactly', 'Replying', '今日めっちゃ暑い。—それな。', "It's so hot today. — Right?"),
 ('ムリ', 'むり', 'no way, I can\'t', 'Replying', 'ムリ、起きれない。', "No way, I can't get up."),
 ('とりま', 'とりま', 'for now, anyway', 'Replying', 'とりま集合しよ。', "Let's just meet up first."),
 ('ちな', 'ちな', 'by the way (ちなみに)', 'Replying', 'ちな、私も行く。', 'FYI, I\'m going too.'),
 ('てか', 'てか', 'I mean / by the way', 'Replying', 'てか、宿題やった？', 'By the way, did you do the homework?'),
 ('ちょい', 'ちょい', 'a little, a sec', 'Replying', 'ちょい待って。', 'Wait a sec.'),
 ('ワンチャン', 'わんちゃん', 'maybe, a slim chance', 'Replying', 'ワンチャンあるかも。', 'There might be a chance.'),
 ('秒で', 'びょうで', 'instantly, in a second', 'Replying', '秒で返信した。', 'I replied instantly.'),
 # greetings and thanks
 ('おは', 'おは', 'morning (おはよう)', 'Greetings', 'おは〜。', 'Morning~'),
 ('おつ', 'おつ', 'good work / see you (乙)', 'Greetings', '今日もおつ！', 'Good work today too!'),
 ('あざす', 'あざす', 'thanks (casual)', 'Greetings', '手伝ってくれてあざす。', 'Thanks for helping.'),
 ('よろ', 'よろ', 'please / thanks in advance', 'Greetings', '明日よろ！', 'Counting on you tomorrow!'),
 ('おなしゃす', 'おなしゃす', 'please (お願いします)', 'Greetings', '明日おなしゃす。', 'Please, for tomorrow.'),
 ('あけおめ', 'あけおめ', 'happy new year', 'Greetings', 'あけおめ！', 'Happy New Year!'),
 # laughing and reacting
 ('草', 'くさ', 'lol (grass, from w)', 'Reacting', 'それ草。', "That's hilarious."),
 ('ワロタ', 'わろた', 'I laughed (笑った)', 'Reacting', '今の動画ワロタ。', 'That video made me laugh.'),
 ('うける', 'うける', 'that\'s funny', 'Reacting', 'それうける。', "That's funny."),
 ('マジ', 'まじ', 'seriously, for real', 'Reacting', 'マジで？', 'Seriously?'),
 ('ガチ', 'がち', 'for real, hardcore', 'Reacting', 'ガチで疲れた。', "I'm seriously exhausted."),
 ('めっちゃ', 'めっちゃ', 'very, really', 'Reacting', 'めっちゃ眠い。', "I'm so sleepy."),
 ('やばい', 'やばい', 'wow: terrible or amazing', 'Reacting', 'このケーキやばい。', 'This cake is unreal.'),
 ('エグい', 'えぐい', 'insane, brutal', 'Reacting', 'この点数エグい。', 'This score is insane.'),
 ('詰んだ', 'つんだ', "I'm doomed", 'Reacting', '宿題終わってない。詰んだ。', "I haven't finished the homework. I'm doomed."),
 # feelings
 ('エモい', 'えもい', 'emotionally moving, nostalgic', 'Feelings', 'この曲、エモい。', 'This song hits the feels.'),
 ('ぴえん', 'ぴえん', 'sad, teary (peaked c. 2020)', 'Feelings', 'テスト落ちた、ぴえん。', 'Failed the test, boo-hoo.'),
 ('しんどい', 'しんどい', 'exhausting, overwhelming', 'Feelings', '今日は仕事がしんどい。', 'Work is draining today.'),
 ('だるい', 'だるい', 'sluggish, can\'t be bothered', 'Feelings', '朝からだるい。', "I've felt sluggish since morning."),
 ('尊い', 'とうとい', 'precious (fan talk)', 'Feelings', '推しが尊い。', 'My fave is so precious.'),
 # fandom and people
 ('推し', 'おし', 'the idol or character you back', 'Fans and people', '推しのライブに行く。', "I'm going to my fave's concert."),
 ('神', 'かみ', 'god-tier, amazing', 'Fans and people', 'このライブ神だった。', 'That concert was godlike.'),
 ('沼', 'ぬま', 'deep obsession (swamp)', 'Fans and people', 'ゲームの沼にはまった。', 'I fell down the game rabbit hole.'),
 ('陰キャ', 'いんきゃ', 'introvert type (can be rude)', 'Fans and people', '私は陰キャです。', "I'm the introvert type."),
 ('陽キャ', 'ようきゃ', 'extrovert type (can be rude)', 'Fans and people', '彼は陽キャだ。', "He's the outgoing type."),
 ('いつメン', 'いつめん', 'the usual group of friends', 'Fans and people', 'いつメンで遊ぶ。', "I'm hanging out with the usual crew."),
 ('リア充', 'りあじゅう', 'person with a full real life', 'Fans and people', '彼はリア充だ。', 'He has a full social life.'),
 # online
 ('バズる', 'ばずる', 'to go viral', 'Online', '動画がバズった。', 'The video went viral.'),
 ('ググる', 'ぐぐる', 'to google', 'Online', 'ググってみた。', 'I googled it.'),
 ('映え', 'ばえ', 'photogenic (instagrammable)', 'Online', 'この店、映える。', 'This place looks great in photos.'),
]

out, seen = [], set()
for w, r, m, c, x, xe in WORDS:
    v = variants(r)
    assert v and 3 <= len(v[0]) <= 14, (w, r, v)
    # romaji.variants spells っち as 'tch'; people also type 'cch' (Hepburn) and 'ttya'
    v += [x for b in list(v) if 'tch' in b for x in (b.replace('tch', 'cch'), b.replace('tcha', 'ttya'))]
    v = list(dict.fromkeys(v))
    assert v[0] not in seen, ('duplicate romaji', w, v[0])
    seen.add(v[0])
    out.append({'w': w, 'r': r, 'k': v, 'm': m, 'c': c, 'x': x, 'xe': xe})
json.dump(out, open('src/data/slang-ja-words.json', 'w'), ensure_ascii=False, separators=(',', ':'))
print(len(out), 'words;', ', '.join(f"{o['w']}={o['k'][0]}" for o in out))
