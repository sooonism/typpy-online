# Typpy SERP study — 2026-10-21

Method: live Google (google.com, hl=en, gl=us), page 1 only, read in Chrome. Single snapshot, logged-out-ish, no rank tracking; results vary by location/personalisation.

## Typpy's own footprint

| Query | Result |
|---|---|
| `typpy` | typpy.online #1, `/mission` #~5. Rest is Tippy.js (typo-adjacent), Finnish "typpy", a marina, a Minecraft pack. Weak brand competition. |
| `site:typpy.online` (p1 of 3) | Indexed: home, /games, /blog, /mission, /faq, /contact, /privacy, /disclaimer, 2 blog posts (2026-05-18). No `/games/<slug>` pages on p1 (p2-3 unchecked). |

Issues seen in the index:
- Home snippet reads "build real-world typing skills… speed, accuracy, focus" — serious-practice framing, not "relaxing / happy".
- `/games` snippet lists "Tidy" — it IS in `src/data/games.ts`; it's the new strategic game (no clock, mind-clearing), not stale.
- Blog post URL `/Touch_vs_SelfTaught_20260518` has no `/blog/` segment and mixed-case/underscore slugs; sibling post is under `/blog/Motor_Chunking_...`. Inconsistent.

## Keyword SERPs (typpy.online on page 1 for NONE of these)

| Query | Who wins page 1 / AI Overview |
|---|---|
| `relaxing typing games` | itch.io (A Relaxing Typing Game, tag page), TypeLit, cozytypes.com, Typing Zen (classroomzen), Typing.com, TypingGames.Zone, 10fastfingers, CozyTyper (Steam $4.99). AIO cites itch.io, TypeLit, CozyTyper, b-e-e-t-l-e, Nanotale. |
| `typing games` | Typing.com, TypingGames.Zone, TypeRacer, FreeTypingGame.Net, TypingClub, Arcademics, DigiPuzzle, Ratatype, Coolmath, kids sites. Head term dominated by education/kids/racing; not winnable now. |
| `cozy typing games` | cozytypes.com, TypeMochi, CozyTyper (Steam/itch), Reddit r/CozyGamers threads, itch.io tag page, CozyTyping (itch). AIO: CozyTyper, Typing Valley, Happy Cat Tavern, cozytypes, TypeMochi. PAA/related: "cozy typing games free/online/for adults", "aesthetic typing test". |
| `zen typing game` | typingzen.com, zentype.app, classroomzen Typing Zen, **ZenType on Steam**, ZType, Typing.com, typingbeast. AIO defines it as "no countdowns, leaderboards, or stress". |
| `typing game no timer` | official-typing-test.com (untimed), Typing.com, TypingGames.Zone, TypeBlast, Poki, TypingMaster, Ratatype. AIO lists untimed tests. |

## Takeaways

1. **Name collision:** "ZenType" is already taken by zentype.app and a Steam game, and "Typing Zen" by typingzen.com. Typpy's `ZenType` will not rank for its own game name; consider a distinct name or lean on "Typpy ZenType".
2. **Positioning gap, not content gap:** winners say plainly "no timer / cozy / pressure-free / type real books". Typpy's meta description says generic practice. Also `/mission` promises "no ticking clock" while TypeFall / Type Rush / ScrambleType are timed (open decision in PRODUCT.md) — Google/AIO will read the mismatch as a weak match for "no timer".
3. **Best entry cluster:** `cozy typing games` / `relaxing typing games` / `aesthetic typing`. Competitors are small indie/itch.io pages, beatable with a dedicated landing page + honest per-game labels (calm vs. timed).
4. **Skip head terms** (`typing games`, `typing test`) for now.
5. **AI Overview** never mentioned Typpy in any of the 5 queries — GEO follow-up: clear, quotable "what is Typpy / which games have no timer" copy on /games and /faq.

## Action taken (2026-10-21)

Updated `src/pages/index.astro` (no separate landing page — homepage already ranks for brand and features Tidy): new title/meta/H1 around "relaxing typing games, no timer", primary CTA = Play Tidy, a "No countdown vs. Against the clock" game split, and a 3-question FAQ for AI Overviews. Code check: only Tidy has no clock; ZenType / Reverse / TypeSpace run a count-up stopwatch for WPM, so copy says "no countdown" for them. Not yet built/deployed — see DEPLOY.md.

## Not done / next

- `site:typpy.online` pages 2–3 (are game pages indexed?).
- Search Console data (impressions/queries) to replace this snapshot.
- Re-run these queries in ~4 weeks after changes.
