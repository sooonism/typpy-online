# Outreach drafts (E09)

Nothing here has been posted. Owner posts it, from their own account. Read each community's
self-promotion rules first (I could not check them); if a sub bans links, post without the link
and answer in comments. One post per week, not all at once. First-person, say it's yours, answer
every comment. Don't cross-post the same text.

The point of three hooks is to find out which positioning works. Every link carries
`utm_campaign=hook_<x>`; in GA4 compare `round_start` / `round_complete` per campaign
(Reports > Acquisition > Traffic acquisition, secondary dimension Session campaign).
**The measurement fix (E12) must be live first**, otherwise the games that aren't Tidy send no events.

| Hook | Claim | Where |
| --- | --- | --- |
| A calm | A typing game with no timer | Show HN, r/webgames, itch.io, Product Hunt |
| B skill | Practise typing romaji / pinyin / accents with real words | r/LearnJapanese, r/ChineseLanguage, r/Spanish |
| C words | Pick up a word or two while you type | r/languagelearning |

## A. Calm (hook_calm)

**Show HN: Tidy, a typing game with no timer**
Link: https://typpy.online/tidy/?utm_source=hn&utm_medium=social&utm_campaign=hook_calm

> Most typing games are speed tests. I wanted the opposite, so I made Tidy: a pile of words drops
> into a room and you clear it by typing them. No clock, no score, no game over. Typing a word
> removes every copy of it, whatever was resting on it tumbles (it uses Matter.js for the physics),
> and each cleared word is replaced by a copy of one still there, so the vocabulary narrows until
> the last word empties the room.
>
> It also comes in Spanish, Japanese (romaji), Chinese (pinyin) and Malay, with the English
> meaning shown when you clear a word. Free, no account, runs in the browser, progress is only in localStorage.
>
> I'd like to know whether "no pressure" is a feature or just boring. Feedback welcome.

**r/webgames** (title): `Tidy: a typing game with no timer, you just clear the room`
> Body: two sentences + link `https://typpy.online/games/tidy/?utm_source=reddit&utm_medium=social&utm_campaign=hook_calm`. Ask what would make it more satisfying (sound? rooms?).

**itch.io / Product Hunt:** tagline `Type to chill: a typing game with no timer`. First comment: the HN text above.

## B. Typing skill (hook_skill)

**r/LearnJapanese** (check the weekly "show your tools" thread rules first)
Title: `I made a free romaji typing game with the 3,000 most common words (kanji, kana and meaning shown)`
Link: https://typpy.online/learn-japanese/?utm_source=reddit&utm_medium=social&utm_campaign=hook_skill

> I wanted to get faster at typing romaji and see common words more often, so I built this. You
> type the romaji for a word (shi/si, chi/ti, tsu/tu all work) and it shows the kanji, the kana
> reading and an English gloss when you clear it. There's no timer or score. Words come from JMdict
> and lean toward news/formal writing, which I know isn't everyone's need. It doesn't teach kana
> one by one or kanji writing. What would make it more useful to you?

**r/ChineseLanguage**
Title: `Free pinyin typing game: 3,000 common words, hanzi + tones + meaning, no timer`
Link: https://typpy.online/learn-chinese/?utm_source=reddit&utm_medium=social&utm_campaign=hook_skill

> You type pinyin without tones (ü is `v`), and when you clear a word it shows the hanzi, the
> tone-marked pinyin and the English meaning. Simplified only. It doesn't show an IME candidate
> list, so it's a warm-up for pinyin spelling and vocab, not a replacement for practising with a
> real input method. Words come from the HSK vocabulary dataset and CC-CEDICT. Tell me what's missing.

**r/Spanish** or **r/learnspanish:** lead with the accents tool, which is useful on its own.
Title: `A free page to copy á é í ó ú ñ ü (and Windows/Mac shortcuts)`; link
https://typpy.online/type-accents/?utm_source=reddit&utm_medium=social&utm_campaign=hook_skill ,
and mention the typing game only in a reply if asked.

## C. A word or two (hook_words)

**r/languagelearning**
Title: `Experiment: learning a few words by typing them, no streaks, no timer. Does this work for anyone?`
Link: https://typpy.online/tidy/?utm_source=reddit&utm_medium=social&utm_campaign=hook_words

> I use an app for structure but the words that don't stick are the ones I never see in a
> relaxed setting. So I built a calm typing game: a room full of common words in Spanish/Japanese/
> Chinese/Malay, you type them to clear the room, and you get the meaning each time. It's an
> experiment, not a proven method, and it's no replacement for a course. Has anyone tried
> typing-based vocab practice (Qwerty Learner etc.)? Did it stick?

## Directories and listicles

- Already submitted (2026-10-28): SaaSHub, AlternativeTo. Check approval.
- Not yet: itch.io page, Product Hunt (after hook results), Indie Hackers post.
- Listicles: search "best relaxing typing games", "typing games without timer", "japanese typing practice". For each page in the top 10 that lists tools, send a short note: what Tidy is, one fact worth including (no timer, 5 languages), the URL. I haven't verified any contact addresses; do that per site.

## After two weeks

Read `round_complete` and sessions per `utm_campaign`. If one hook gets plays and the others get
nothing, that is the positioning, and `SEO.md` should be rewritten around it.
