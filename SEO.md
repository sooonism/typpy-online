# Typpy SEO + GA4: targets, log, learnings

**Source of truth for organic growth work.** Any agent picking this up: read this
whole file first, then follow the rules below. Update it in the same commit as the
change you make. Last updated: 2026-10-26 (research and experiment plan added). Modelled on `~/gitlab/tinyqr/SEO.md`.

## Rules for agents

1. **Log before you ship.** Add a row to the Experiment log (id, change, hypothesis,
   metric, check date) in the same commit as the change. Commit message: `SEO E##: ...`.
2. **Judge nothing in under 14 days.** Rankings lag; GSC data lags 2-3 days. Put the
   check date in the row and mark `pending` until then.
3. **Change one thing per page at a time** where possible, so a result is attributable.
4. **Measure with the same windows every time** (below). Never compare a 30-day GA4
   window to a 90-day one.
5. **Brand queries are not progress.** Brand queries are 84 of 89 impressions and the only click; targets are **non-brand**.
6. **Outward-facing actions need the owner's OK** (directory submissions, outreach,
   anything posted on another domain, server config). Deploy: see `DEPLOY.md`.
7. **Every page that should be measured must carry the GA4 tag** (all 37 built pages carry it as of 2026-10-26).

## Targets

Set 2026-10-26. "Fail below" means: if we miss this at the checkpoint, the approach is
not working and we re-plan instead of continuing.

Checkpoint A: **2026-11-30** (4 weeks). Checkpoint B: **2027-02-01** (about 13 weeks).
These are estimates, not forecasts. Baselines are tiny, so a handful of visits moves a
percentage a lot; read absolute numbers.

### GA4 (property `534556372`, tag `G-FKXKL01WVD`, trailing 30 days)

| Metric | Baseline 2026-10-26 | A target (fail below) | B target (fail below) |
| --- | --- | --- | --- |
| Sessions | 30 | 50 (35) | 150 (80) |
| Organic Search + AI Assistant sessions | 3 | 10 (5) | 40 (15) |
| `round_start` events | 2 | 10 (4) | 60 (20) |
| `round_complete` events | 2 | 8 (3) | 45 (15) |

27 of 30 sessions are Direct (likely owner). There is also a custom event literally named `ga4` (34 hits): probably a misfired tag, check before using event counts. Blog pages seen: `/blog/Tidy_Spanish_20261020`, `/games/tidy/`, `/games/vowelsplit/`, `/learn-japanese`.

### Search Console (`sc-domain:typpy.online`, trailing 28 days, via `gsc_pull.py --days 28`)

| Metric | Baseline (2026-09-25..10-23) | A target (fail below) | B target (fail below) |
| --- | --- | --- | --- |
| Non-brand clicks | 0 | 2 (1) | 15 (4) |
| Non-brand impressions | 5 | 60 (20) | 500 (150) |
| Non-brand queries at position <= 10 | 0 | 3 (1) | 15 (6) |
| Brand clicks (guard) | 1 | >= 1 | >= 1 |

Reference points (2026-09-25..10-23): all clicks 1, impressions 89, brand impressions 84, 5 queries. Non-brand = query does not match `typpy`.

## How to measure (weekly, Mondays)

From `~/gitlab/pi_agents/marketing-agents/kw-research/` (use `uv`; there is no system
Python there; see its `README.md`):

```bash
uv run --quiet --no-project --with google-api-python-client --with google-auth \
  python gsc_pull.py --days 28 --site typpy.online --by-page
uv run --quiet --no-project --with google-analytics-data \
  python ga4_pull.py --days 30 --site typpy.online
```

Outputs land in `gsc/` and `ga4/` there (`typpy_online-<date>.*`). Compute non-brand
numbers by excluding queries matching `typpy`. Record the weekly figures in the
**Weekly readings** table below. Per-keyword rank tracking is not set up for this site yet:
create `sites/typpy.json` (see `sites/tinyqr.json`) and run `kw_research.py --site typpy`
when keyword work starts. Bing Webmaster data has **not** been pulled; it needs a manual CSV export.

## Weekly readings

| Week of | Sessions (30d) | Organic (30d) | Non-brand clicks (28d) | Non-brand impr (28d) | Queries <=10 | Notes |
| 2026-10-26 | 30 | 2 (+1 AI) | 0 | 5 | 0 | Baseline. |

## Experiment log

Status: `pending` (waiting for check date), `worked`, `no effect`, `worse`, `inconclusive`.

| ID | Date shipped | Change | Hypothesis | Metric | Check on | Status |
| E01 | 2026-10-26 | `/games/zentype/`: title "Zen Typing Test — Calm, Untimed Typing Practice", description, H1 intro, 5-question FAQ + FAQPage schema; home-page anchor now "zen typing test, no timer" | Only recurring non-brand impressions are "zen typing" (pos 73), "typing zen" (74), "zen typing test" (77), all landing on this page; the cluster ("zen typing game/test/practice", "relaxing/cozy/chill typing game") has weak competition (CalmType, itch.io games) | Impressions and position for those queries; clicks on the page | 2026-11-09 | pending; deployed 2026-10-26 |
| E07 | 2026-10-26 | `round_start` / `round_complete` (with `game`, `language`) now fire on all 11 games via `src/lib/track.js`; before only the four Tidy games had them | Conversion events were missing on 7 games, so zentype traffic could never convert in GA4 | Event counts by `game` | 2026-11-09 | pending; deployed 2026-10-26. GA4 custom dimensions `game` and `language` registered 2026-10-26, so per-game data starts from then (no backfill); `ga4_pull.py` writes it to `games` |
| E02 | 2026-10-26 | Japanese cluster: `/learn-japanese/` retitled "Japanese Typing Practice (Romaji): 3,000 Common Words", query-first description, H1, direct-answer line, 3 new FAQ entries (romaji typing, "is it a typing test", kana); `/games/tidy-ja/` retitled "Japanese Typing Game (Romaji)"; sitewide footer anchor "learn japanese" now "japanese typing practice" | Autocomplete shows many "japanese typing practice / romaji typing test / game" variants and the SERP bar is low; our pages led with "learn vocabulary", which does not match how people search | Impressions, position and clicks for "japanese typing practice", "romaji typing practice/game", "japanese typing game" on these two pages (baseline 0 impressions) | 2026-11-09 | pending; deployed 2026-10-26. Changes span two pages plus the footer anchor, so attribute by page in GSC |
| E06 | 2026-10-26 | `public/poll.js`: one-question poll ("what brings you here?": practise typing / learn vocabulary / relax / class or school), shown once per browser 1.5 s after the first `round_complete` on any game; sends GA4 `poll_answer` with `answer` = `practice` / `vocab` / `relax` / `class` and sets user property `segment` to the same value (lets any report be filtered by segment); dismiss stores `skipped`. Loaded from `Layout.astro` and the four Tidy pages | We do not know who the visitors are; the answer tells which segment (typists, vocab learners, relaxers, classes) to build for | `poll_answer` counts by `answer` (needs custom dimensions: Event `answer`, User `segment`); response rate = answers / `round_complete` | 2026-11-23 (needs enough rounds) | pending; deployed 2026-10-26, dimensions `answer` (Event) and `segment` (User) registered 2026-10-26 |
| E03 | 2026-10-26 | Spanish cluster: `/learn-spanish/` retitled "Spanish Typing Practice: 3,000 Common Words, No Accents Needed", query-first description, H1, direct-answer line, 3 new FAQ entries (is it a typing test, practise without accents, how to type accents/ñ); sitewide footer anchor now "spanish typing practice". `/games/tidy-es/` left unchanged: it is written in Spanish for Spanish-speaking players | Autocomplete suggests "spanish typing test without accents", "spanish typing practice/game", "type spanish accents online"; Tidy already accepts accent-free typing, which is a real differentiator | Impressions, position and clicks for "spanish typing practice", "spanish typing game", "spanish typing without accents" on `/learn-spanish/` (baseline 0) | 2026-11-09 | pending; deployed 2026-10-26 |
| E04 | 2026-10-26 | Malay cluster: `/learn-malay/` retitled "Malay Typing Game: Bahasa Melayu Typing Practice, 3,000 Words", query-first description, H1, direct-answer line, 2 new FAQ entries ("Is this a Malay typing test (ujian menaip)?" answers no; "Is there a Malay typing game for learners?"); sitewide footer anchor now "malay typing game". `/games/tidy-ms/` left unchanged (already in Malay) | Autocomplete shows "malay typing game/test", "typing game malaysia", "ujian menaip"; search found no dedicated Malay typing game; "ujian menaip" is exam intent, so the page says plainly that it is not that | Impressions, position and clicks for "malay typing game", "bahasa melayu typing", "malay typing practice" on `/learn-malay/` (baseline 0) | 2026-11-09 | pending; deployed 2026-10-26 |
| E05 | 2026-10-26 (not deployed) | New utility page `/type-accents/` ("Type Accents Online: Spanish, French & German Characters"): click-to-copy character buttons that fill a text box, Windows (US-International) and Mac shortcuts per language, 3-question FAQ + FAQPage schema, link to Tidy en español and `/learn-spanish/`; added to the sitewide footer; sends GA4 `accent_insert` { character } on each click | Autocomplete: "type spanish accents online", "type spanish characters online", "typing french characters with english keyboard"; a utility page answers the query directly and links to Tidy | Organic landings on `/type-accents/`; GA4 `accent_insert` count; clicks from `/type-accents/` to `/games/tidy-es/` (baseline 0) | 14 days after deploy | pending deploy |
| E08, E09 | planned | See "Experiment plan" below | | | | not started |

## What works (with evidence)

- Nothing yet. The only non-brand impressions are "hybrid typing" (pos 41.5), "zen typing", "typing zen", "zen typing test" (pos 73-77): the game's "zen" mode is the one angle Google already associates with the site.

## What does not work / data caveats

- Demand is essentially zero for the brand and near-zero for anything else; 30 sessions/month.
- Typing-test head terms are dominated by established sites; do not chase "typing test".
- The `ga4` custom event name looks like a bug. It is not in `src`, `public` or `dist` (grepped 2026-10-26), so it is probably not from our code (browser extension or a tool used while testing); check in GA4 DebugView.

## Market research (2026-10-26)

Method and limits: Google autocomplete (shows that a query exists, not its volume), competitor HTML and sitemaps, web search. No real SERP or volume data; the search tool is not a results page. Competitor pricing is from older announcements.

**How competitors get found**
- Monkeytype, Keybr, TypeRacer: brand and word of mouth; almost no SEO (no H1, no schema).
- 10FastFingers: programmatic `/typing-test/<language>` pages (about 15 languages, about 1,200 words each, titles like "Spanish Typing Test (Español) - Check Your Typing Speed", about 42 hreflang locales). This is the pattern to beat for "X typing test".
- Typing.com, Ratatype, TypingClub: school curricula plus big blogs.
- Niche tools are found through launches, not Google: Qwerty Learner (23.5k GitHub stars, Chinese speakers learning English words by typing), AgileFingers (type your own flashcards), a free Japanese romaji practice app by JLPT level (Product Hunt), Tokyo Rail Typing (Product Hunt).
- Low bar on "japanese typing practice": Coto Academy's page is about 120 words.

**Demand seen in autocomplete** (existence, not volume)
- Japanese: "japanese typing practice" + game / hiragana / beginners / app / free; "romaji typing test / practice / game"; "hiragana typing game".
- Korean: "korean typing practice" + beginner / game / app / free; "hangul typing practice game".
- Spanish: "spanish typing test / practice / game", "spanish typing test without accents", "type spanish accents online".
- French and German: "french typing practice", "german typing practice". Pinyin: "chinese pinyin typing practice".
- Malay: "ujian menaip" (likely the exam-style test, a different intent), "malay typing test", "typing game malaysia". No dedicated Malay typing test turned up in search.
- Relaxing: "relaxing typing games", "cozy typing game", "chill typing games", "zen typing game / test / practice".
- "vocabulary typing game" / "learn vocabulary by typing": autocomplete returned little. Few people name the category, so own it through language-specific pages.

**Segment hypotheses:** (1) Japanese learners, (2) Spanish learners, (3) relaxing-game players, (4) Malaysian users, (5) Chinese speakers learning English words (stretch: needs a Chinese site).

## Monetisation plan

1. **Now to Checkpoint A (2026-11-30): no ads.** 30 sessions a month earns nothing, and ads only slow the pages.
2. **AdSense:** Google sets no traffic minimum; the usual rejection is thin content, and community answers say games-only sites get extra scrutiny (unofficial). Typpy has a blog, three learn pages, FAQ, about and privacy. Apply once there are a few hundred sessions a month. Put ads on content pages and the end-of-round screen, never mid-typing.
3. **Google H5 Games Ads:** interstitial and rewarded ads at natural breaks (round end). Check whether it is still beta.
4. **Revenue reality (assumption):** at about $2-6 per 1,000 page views, 2,400 monthly page views earn about $5-15; about 20,000 sessions a month gets near $100. AdSense covers a domain, not a site, for a long time.
5. **Paywall:** precedents are ad-free tiers (Typing.com, TypeQuicker Pro $4/month, TypingBee $24.99/year). Candidate premium: ad-free, custom word lists, saved progress, "review my mistakes". Do not build first. Run a fake-door test ("custom word lists, tell me when ready") and count clicks. `llms.txt` currently says no paywalls or accounts; update it if this goes ahead.

## Experiment plan (log each as an E## row when it ships)

| ID | Change | Segment | Success signal |
| E01 | Done in code, see log | Relaxing | see log |
| E02 | Done in code, see log | Japanese | see log |
| E03 | Done in code, see log | Spanish | see log |
| E04 | Done in code, see log | Malaysian | see log |
| E05 | Done in code, see log | Spanish, French, German | see log |
| E06 | Done in code, see log | All | see log |
| E07 | Done in code, see log | All | see log |
| E08 | "Which language next?" vote (Korean, French, German, Chinese) | New-language demand | Votes per option |
| E09 | **Needs owner OK.** Share on r/learnjapanese, r/languagelearning, r/typing, Product Hunt, itch.io with UTM-tagged links | All | Round completion rate per source |

Sequence: week 1 E07, E06 and the measurement fixes (internal-traffic filter, `ga4` event); weeks 1-3 E01-E04; weeks 3-4 E05, E08; E09 after approval. At Checkpoint A read the poll and votes, pick one language to focus on, and decide on applying for AdSense.

## Reference

- Site source: `src/` (Astro + Svelte), built to `dist/`, sitemap via `prebuild` script. Deploy and server config: `DEPLOY.md`.
- Data and tooling: `~/gitlab/pi_agents/marketing-agents/kw-research/`. GA4 `G-FKXKL01WVD`, property `534556372`.
- Product docs: `PRODUCT.md`, `DESIGN.md`, `GAMEDESIGN.md`.
