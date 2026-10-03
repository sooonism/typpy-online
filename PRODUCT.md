# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Casual players taking a short break at the keyboard: writers, late-night coders, casual browsers (the audience named on the mission page). They want a pleasant, low-commitment typing game, not a training regimen. Reading visitors also arrive from search to the blog/news posts about typing.

## Product Purpose

Typpy ("Happy Typing") is a free, browser-based collection of typing games that build speed, accuracy and focus through play. Success is a visitor who starts a game within seconds, enjoys a short session, and comes back or tries another game.

## Positioning

Typing practice that is meant to feel good rather than like a treadmill. The collection covers both calm modes (ZenType, ZenType Reverse, TypeSpace) and timed arcade modes (TypeFall, Type Rush, VowerSplit, ScrambleType), and labels them honestly instead of claiming every game is pressure-free.

## Operating Context

Visitors play in the browser on desktop and mobile web, in short sessions. The site is ad-funded (Google AdSense), measured with GTM/GA4, and fed by search traffic to blog/news posts (`src/content/news`). Games are Svelte and React components inside an Astro site.

## Capabilities and Constraints

- Games live at `/games/<slug>`; the catalogue is `src/data/games.ts`. Current titles: VowerSplit, ZenType, TypeFall, Type Rush, ZenType Reverse, TypeSpace, ScrambleType.
- Static Astro site, Tailwind with a named token palette, Node >= 22.12.
- Ads and analytics scripts must keep working; layouts must leave room for them.
- **Open decision:** `/mission` copy promises "no ticking clock" while several games are timed. The user chose "both, honestly labeled", so the mission and marketing copy needs updating to match. Not yet done.
- Undecided: dark mode, accounts, leaderboards. None exist today.

## Brand Commitments

- Name "Typpy", motto "Happy Typing".
- Brand red `#e60023` and `/logo.svg` are fixed assets.
- Voice on the mission page: warm, human, anti-pressure.

## Evidence on Hand

- Seven playable games with a mix of screenshots (`public/games/*.png`; VowerSplit, TypeSpace and ScrambleType have none yet).
- Nine blog/news posts, with OG images in `public/og`.
- No testimonials, user counts, press or benchmarks exist. Do not fabricate them.

## Product Principles

- Play within seconds: the first screen leads to a game, not an explanation.
- Be honest about pressure: label calm and timed modes plainly.
- Keep the games the product; the interface should stay out of the typing.
- Ads and content support the free games and must not interrupt play.
- The brand red and logo are constant across every surface.

## Accessibility & Inclusion

No product-specific standard has been set. The audit measured the current site at roughly WCAG A with gaps (nav contrast, focus, reduced motion, live regions). WCAG 2.2 AA is the reasonable working target, pending the user's confirmation.
