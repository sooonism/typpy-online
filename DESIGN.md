---
name: Typpy
description: Happy Typing. A warm, rounded game shelf with one signal red.
colors:
  brand-red: "#e60023"
  primary: "#b7001a"
  primary-deep: "#930012"
  background: "#fff8f7"
  surface-low: "#fff0ef"
  surface-container: "#ffe9e7"
  surface-high: "#ffe2df"
  outline-variant: "#e8bcb8"
  on-surface: "#2a1615"
  on-surface-variant: "#5e3f3c"
  olive-gray: "#62625b"
  warm-silver: "#91918c"
  header-cream: "#fcfcf9"
  tertiary-blue: "#005f90"
  error: "#ba1a1a"
  on-primary: "#ffffff"
typography:
  display:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "70px"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "normal"
  headline:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-1.2px"
  title:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "14px"
    fontWeight: 700
    lineHeight: 1.5
  body:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.4
  label:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.2em"
rounded:
  sm: "4px"
  lg: "8px"
  xl: "12px"
  card: "32px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  section: "80px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.full}"
    padding: "12px 24px"
  button-cta:
    backgroundColor: "{colors.brand-red}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.xl}"
    padding: "12px 24px"
  card-feature:
    backgroundColor: "{colors.surface-low}"
    rounded: "{rounded.card}"
    padding: "48px"
  chip-eyebrow:
    textColor: "{colors.primary}"
    rounded: "{rounded.full}"
    padding: "8px 16px"
  nav-link:
    textColor: "{colors.olive-gray}"
    typography: "{typography.title}"
  nav-link-active:
    textColor: "{colors.brand-red}"
---

# Design System: Typpy

## Overview

**Creative North Star: "The Warm Arcade"**

Typpy looks like a friendly shelf of small games in a warm room: cream and rose surfaces, one bright red, soft rounded cards, and big confident black-weight titles. Calm modes and timed modes share the same shelf, so the interface stays inviting rather than tense. The brand voice is warm and anti-pressure; the visuals never use panic cues outside the games themselves.

The interface is deliberately quiet around the typing area. Depth is tonal (rose-tinted surfaces and pale borders), not heavy shadow. Type is one family, Plus Jakarta Sans, doing all the work through weight and size.

**Key Characteristics:**
- One font, many weights: black display titles, medium UI labels.
- Rose-cream surface family; red is the only saturated hue in the chrome.
- Large radii on containers (32px), pills for chips and the main button.
- Tonal depth with a single pale border color.
- Material Symbols Outlined for icons.

## Colors

A warm neutral field with one signal red. Tokens come from `tailwind.config.cjs`; the Tailwind names are the source of truth.

### Primary
- **Signal Red** (`brand-red`, #e60023): the logo, active nav link and underline, the main CTA, selection highlight.
- **Deep Berry** (`primary`, #b7001a): the filled "Play" button and eyebrow text. A slightly darker red that holds white text at 4.78:1 or better.
- **Berry Shadow** (`primary-deep`, #930012): pressed and hover fill for primary.

### Secondary
- **Harbor Blue** (`tertiary-blue`, #005f90): occasional accent in game UI and gradient corners. Not part of the page chrome.

### Neutral
- **Rose Cream** (`background`, #fff8f7): page background.
- **Blush Wash** (`surface-low` #fff0ef, `surface-container` #ffe9e7, `surface-high` #ffe2df): card and tile steps, lightest to deepest.
- **Pink Hairline** (`outline-variant`, #e8bcb8): borders on cards and chips.
- **Cocoa Ink** (`on-surface`, #2a1615): headings and body.
- **Rosewood Text** (`on-surface-variant`, #5e3f3c): supporting copy, 8.4:1 on blush.
- **Olive Gray** (`olive-gray`, #62625b): inactive nav and muted labels, 5.86:1 on cream.
- **Warm Silver** (`warm-silver`, #91918c): decorative only. It measures 3.08:1 on the header cream, so never use it for text.
- **Header Cream** (`header-cream`, #fcfcf9): header and mobile-menu background.
- **Error Brick** (`error`, #ba1a1a): mistakes and danger states inside games.

### Named Rules
**The Signal Red Rule.** Red marks one thing at a time: the logo, the current location, or the next action. If more than two red elements compete in a viewport, demote the extras to Rosewood.

**The Warm Silver Rule.** `#91918c` is never text. Use Olive Gray for any muted words.

## Typography

**Display Font:** Plus Jakarta Sans (with sans-serif)
**Body Font:** Plus Jakarta Sans (with sans-serif)

**Character:** A rounded, friendly geometric sans. Personality comes from weight contrast: 800–900 titles against 400–500 body.

### Hierarchy
- **Display** (600–900, 70px token, but pages use 36–60px `text-4xl`–`text-6xl`, line-height 0.95–1.1): hero and page titles. Tight leading, `tracking-tight`.
- **Headline** (700, 28px, 1.2, -1.2px): section headings.
- **Title** (700, 14px, 1.5): nav links, card titles, button labels.
- **Body** (400, 16px, 1.4; supporting copy `text-lg` to `text-xl` with `leading-relaxed`): keep paragraphs to about 65–75ch.
- **Label** (500, 12px, 0.2em tracking, uppercase): eyebrow chips and badges.
- **Typing text**: monospace at 1.1rem on mobile and 1.75rem from the `sm` breakpoint, line-height 1.6, inside games.

### Named Rules
**The One Family Rule.** Only Plus Jakarta Sans for UI. Monospace is allowed solely for the typing area.

## Layout

Centered containers: `max-w-7xl` for the header and footer, `max-w-6xl`/`max-w-5xl` for page content, with `px-6 md:px-12` side padding. Vertical rhythm uses the 8px base (`unit`) with 80px (`section`) between major blocks. Cards stack to a single column on mobile; the featured game goes side by side at `lg` (38/62 split). The header is sticky at 64px; navigation collapses to a hamburger below `md`.

## Elevation & Depth

Tonal layering first: each surface sits one step deeper in the blush family and is outlined with the pink hairline. Shadows are rare, used only on the CTA (`shadow-md`) and in-game feedback. Hover lifts are small (`-translate-y-0.5`). Gradients exist as soft radial glows behind hero cards (red at 12% top right).

### Named Rules
**The Tint-Not-Shadow Rule.** Separate surfaces with a surface step and a hairline, not with a bigger shadow.

## Shapes

Generous and friendly. Containers use 32px corners, tiles and CTAs 12px, small controls 4–8px, and chips, the primary Play button and icon buttons are fully round (9999px). Borders are 1px pink hairline; thick colored side borders are not part of the language.

## Components

### Buttons
- **Shape:** pill for the primary Play button (9999px); 12px for the in-card CTA.
- **Primary:** Deep Berry fill, white bold text, 12px 24px padding.
- **CTA:** Signal Red fill with white text and `shadow-md`, with a 2px upward lift on hover.
- **Hover / Focus:** hover currently only dims opacity. A visible focus ring is required but not yet global; see the audit.

### Chips
- **Style:** pill with `white/80` fill, pink hairline border, Deep Berry label text in uppercase 12px with 0.2em tracking, usually with a Material Symbol.

### Cards / Containers
- **Corner Style:** 32px for hero and featured cards; 12px for game tiles.
- **Background:** Blush Wash with an optional red radial glow; game tiles add a blue glow in the lower left.
- **Border:** 1px pink hairline.
- **Internal Padding:** 32px on mobile, 48–56px on large screens.

### Navigation
- **Style:** Title-size medium weight links, Olive Gray at rest, Signal Red text with a 2px red bottom border when active (`aria-current="page"`). The mobile menu drops from the header on Header Cream with the same active color.

### Footer
- Rose Cream surface, pink hairline top border, logo left, copyright and links in 12px Rosewood text.

### Game tile / featured card
- A rounded blush gradient tile with an uppercase 0.24em eyebrow, a black-weight title (3xl–6xl) and a short description.

## Do's and Don'ts

### Do:
- **Do** use `tailwind.config.cjs` color tokens instead of raw hex.
- **Do** use Olive Gray (#62625b) for any muted text.
- **Do** keep red to the logo, the current location and the next action.
- **Do** round containers at 32px and chips and primary buttons fully.
- **Do** give every interactive element a visible `:focus-visible` ring.
- **Do** honour `prefers-reduced-motion` in all game and hover animation.

### Don't:
- **Don't** use gradient text (`bg-clip-text`) on titles; use solid Cocoa Ink or Signal Red.
- **Don't** use thick colored side borders (`border-l-4`) on callouts or cards.
- **Don't** use bounce or elastic easing; use ease-out curves.
- **Don't** set text in Warm Silver (#91918c).
- **Don't** add yellow or orange page gradients (the current `.home` background); they sit outside the palette.
- **Don't** import the font again per game; the layout already loads Plus Jakarta Sans.
