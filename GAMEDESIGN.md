# Game Design Guide: The Craft Principle

## Benchmark game

**Tidy** (`/games/tidy`) is the reference point every future Typpy game should be weighed against. Not because it's the most feature-rich or the hardest — it's the opposite. It's the clearest expression of what a Typpy game should *feel* like when the pacing is right.

## The core idea

Most typing games borrow their tension from a clock: type fast or lose. That's a legitimate mode and Typpy keeps several (TypeFall, Type Rush, VowerSplit) — but it's not the only one, and it shouldn't be the default instinct for every new idea.

Tidy borrows its tension from somewhere else: **craft**.

Think of tidying an actual room, or sanding a piece of wood, or weeding a garden. There's no buzzer. You do it bit by bit. Progress is visible the whole time — the pile is smaller than it was a minute ago — and that visible progress is the reward, not a score popup. The satisfaction doesn't arrive all at once at the end; it accumulates with every small, correct action, and peaks when the last piece falls into place and the work is simply *done*.

That's the feeling to design for: **no rush, steady work, a real finish.**

## What this looks like mechanically (Tidy as the example)

- **No clock, no countdown.** Nothing punishes you for taking a breath between words. The only pressure is the one you bring yourself.
- **Visible, continuous progress.** The pile is always on screen. You can see exactly how much work is left without checking a score.
- **Work narrows toward the end, not away from it.** In Tidy, cleared words are replaced only with duplicates of words still on screen — so the vocabulary genuinely shrinks as you play. The room gets easier to finish the more you've already done, which is the opposite of most arcade games (where difficulty ramps *up*). That inversion is what makes the ending feel earned instead of arbitrary.
- **One real ending, not a loop.** The round empties completely. There's a pause (`breathe`, then `clarity`) before you choose the next one. The pause matters as much as the gameplay — it's the moment the craft metaphor pays off, the stepping-back-to-look-at-the-finished-table moment.
- **The player sets the scope.** Typing `30`–`500` to choose room size means the player decides how big a job they're taking on, the same way you'd decide whether you have time to tidy one shelf or the whole room.

## A short checklist for new "craft-paced" games

When a new game idea leans toward this slower, satisfying register rather than the arcade register, check it against Tidy:

1. Can the player stop and restart a word without being punished by a clock?
2. Is progress toward "done" visible at a glance, not just implied by a score number?
3. Does finishing feel like *completion* (an emptied board, a finished pile) rather than just "time ran out"?
4. Does the game get easier or clearer as the player nears the end, rewarding the work they've already put in?
5. Is there a deliberate pause at the end — a moment to notice the work is finished — before the next round starts?

If a new idea can't honestly answer "yes" to most of these, it probably belongs with the timed/arcade family instead (TypeFall, Type Rush, VowerSplit, ScrambleType) — and that's fine. Typpy's catalogue is allowed to hold both registers, as long as each game is honest about which one it is (see `PRODUCT.md` — "Be honest about pressure: label calm and timed modes plainly").

## Why this matters for the catalogue

ZenType and ZenType Reverse are calm in the sense of "untimed," but they don't have this craft arc — they're closer to a steady-state practice loop with no real ending. Tidy is the first game with a genuine *beginning, middle, and finish* built entirely around unhurried, cumulative work. That's a distinct register worth naming and protecting as the catalogue grows, so it doesn't quietly get arcade-ified by instinct ("let's add a timer," "let's add a combo multiplier") the way genre conventions tend to creep in.
