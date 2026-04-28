# Claude Code: Land the Apple-Light Redesign on `portfolio-site`

You are working in **YanpengQi7/portfolio-site** — Next.js 16 (App Router) + React 19 + Tailwind v4 + shadcn + AI SDK. Your job is to redesign the site to match the new Apple-Light direction defined in the reference HTML mockup. Treat the mockup as design truth — when in doubt, copy values from it pixel-for-pixel.

> **Reference file:** `Personal Site.html` (paste it into the repo at `/design-reference/Personal Site.html` if not already there). All token values, spacing, animations, and component structure below are extracted from it.

---

## 0. Ground rules

- **Match values exactly.** Hairlines are `0.5px`, not `1px`. Radii are `22px` and `28px`, not `rounded-2xl` defaults. Don't round to Tailwind's nearest scale unless the scale already matches.
- **One accent color only.** `#0071e3` (Apple Blue). Never use purple/blue gradients on UI surfaces. Mesh-blob backgrounds are the only place multi-hue color is allowed.
- **Single sans + mono.** System sans (`-apple-system, BlinkMacSystemFont, "SF Pro Display"…`) and `"SF Mono", ui-monospace, Menlo`. No Inter, no Geist, no custom Google Fonts on UI text. Serif (`"New York", ui-serif`) is allowed only inside the optional Editorial hero variant.
- **Less is more.** Delete: emoji section headers, decorative icons next to every list item, generated-visuals galleries, "fun stat" cards with no source. If a section feels empty, fix layout — don't add filler.
- **Light-first, dark equal.** Both themes must look final. Hairlines and shadows have separate dark-mode values (see tokens).
- **Don't add new dependencies** unless explicitly justified. Use what's already in `package.json`.

---

## 1. Design tokens — write these to `app/globals.css`

Replace the existing `:root` / `[data-theme]` blocks with this. Tailwind v4 reads CSS vars directly, so you can use them in `@theme` and arbitrary values.

```css
:root, [data-theme="light"] {
  /* Ink scale — pure neutrals, no blue tint */
  --ink:        #1d1d1f;   /* primary text */
  --ink-2:      #424245;   /* secondary text */
  --ink-3:      #6e6e73;   /* tertiary / captions */
  --ink-4:      #86868b;   /* muted */
  --rule:       rgba(0,0,0,0.08);   /* hairlines — 0.5px */
  --rule-strong:rgba(0,0,0,0.14);

  /* Surfaces */
  --bg:         #ffffff;
  --bg-section:#fbfbfd;    /* off-white panel */
  --bg-card:    #ffffff;
  --bg-elevated:rgba(255,255,255,0.72);  /* glass */

  /* Accent — exactly one */
  --accent:     #0071e3;
  --accent-hover:#0077ed;
  --accent-press:#006edb;
  --accent-tint:rgba(0,113,227,0.08);

  /* Shadows */
  --shadow-card:    0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04);
  --shadow-card-hover: 0 1px 2px rgba(0,0,0,0.06), 0 16px 40px rgba(0,0,0,0.08);
  --shadow-nav:     0 0.5px 0 rgba(0,0,0,0.08);

  /* Radii */
  --r-sm:  10px;
  --r-md:  14px;
  --r-lg:  22px;
  --r-xl:  28px;

  /* Type */
  --font-sans: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif;
  --font-mono: "SF Mono", ui-monospace, "Cascadia Code", Menlo, Consolas, monospace;
  --font-serif:"New York", ui-serif, Georgia, serif;
}

[data-theme="dark"] {
  --ink:        #f5f5f7;
  --ink-2:      #c7c7cc;
  --ink-3:      #8e8e93;
  --ink-4:      #6e6e73;
  --rule:       rgba(255,255,255,0.10);
  --rule-strong:rgba(255,255,255,0.18);

  --bg:         #000000;
  --bg-section:#0a0a0c;
  --bg-card:    #111113;
  --bg-elevated:rgba(20,20,22,0.72);

  --accent:     #2997ff;     /* lighter on dark */
  --accent-hover:#48a4ff;
  --accent-tint:rgba(41,151,255,0.12);

  --shadow-card:    0 1px 2px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.5);
  --shadow-card-hover: 0 1px 2px rgba(0,0,0,0.5), 0 16px 40px rgba(0,0,0,0.6);
  --shadow-nav:     0 0.5px 0 rgba(255,255,255,0.08);
}

html, body { background: var(--bg); color: var(--ink); font-family: var(--font-sans); }

/* Hairline utility — must be 0.5px */
.hairline-b { border-bottom: 0.5px solid var(--rule); }
.hairline-t { border-top: 0.5px solid var(--rule); }
.hairline   { border: 0.5px solid var(--rule); }
```

Then in `@theme` (Tailwind v4):

```css
@theme {
  --color-ink: var(--ink);
  --color-ink-2: var(--ink-2);
  --color-ink-3: var(--ink-3);
  --color-ink-4: var(--ink-4);
  --color-accent: var(--accent);
  --color-rule: var(--rule);
  --color-bg: var(--bg);
  --color-bg-section: var(--bg-section);
  --color-bg-card: var(--bg-card);
  --radius-card: 22px;
  --radius-tile: 28px;
}
```

---

## 2. Type scale

| Use | Size | Weight | Letter-spacing | Line-height |
|---|---|---|---|---|
| Hero display | `clamp(56px, 8vw, 96px)` | 600 | -0.035em | 1.05 |
| Section title | `clamp(36px, 4.5vw, 56px)` | 600 | -0.025em | 1.1 |
| Tile title | `28px` | 600 | -0.02em | 1.15 |
| Body large | `19px` | 400 | -0.01em | 1.5 |
| Body | `16px` | 400 | -0.005em | 1.55 |
| Eyebrow | `12px` mono | 500 | 0.18em uppercase | 1 |
| Caption | `13px` | 400 | -0.005em | 1.4 |

Apply via Tailwind arbitrary values or write component-scoped classes. **Never use Inter or Geist.**

---

## 3. Page structure — `app/page.tsx` + `components/home-page-client.tsx`

The current `home-page-client.tsx` is 25KB — replace it wholesale with these sections in order, top to bottom. Each numbered item below is a section component; create them as separate files under `components/home/` and assemble in `home-page-client.tsx`.

### 3.1 `<LandingSplash />` — `components/home/landing-splash.tsx`

Full-screen overlay shown on first paint. Dismisses on click / Enter / Space / Esc / wheel.

- Fixed inset-0, z-9999, `bg-[var(--bg)]`.
- Three blurred mesh blobs (700×700, `filter: blur(110px)`, opacity .55): blue (top-left, accent), purple `#a855f7` (top-right), green `#34d399` (bottom-center, opacity .35). Each animated with a slow `transform: translate()` keyframe (14s / 18s / 22s, `ease-in-out infinite`).
- Grid overlay: `linear-gradient` on both axes, `64px 64px`, masked by `radial-gradient(ellipse 50% 50% at 50% 50%, black, transparent 75%)`, opacity .35.
- Center stack:
  1. `YQ` — `clamp(140px, 22vw, 280px)`, weight 700, tracking -0.06em, gradient text `linear-gradient(135deg, var(--accent), #a855f7 55%, #34d399)` with `background-size: 200% 200%` and 6s `yqShine` keyframe (background-position 0% → 100% → 0%). Each letter `Y` and `Q` has a separate `yqDrop` entrance (translateY(40px) + blur(8px) → none, 1.2s, second letter delay 0.12s).
  2. `YANPENG  QI` — mono, 11–14px, letter-spacing 0.6em, `--ink-3`.
  3. Role line — 15–19px, `--ink-2`, e.g. "Software Engineer · AI Builder".
  4. `——— CLICK TO ENTER ———` — mono 11px, tracking 0.3em uppercase, `--ink-3`. Two flanking 36px hairlines. 2.4s `enterPulse` opacity 1 ↔ 0.55. On `.splash:hover`, `enter-line` widens to 56px and turns accent.
- Dismiss: add `.gone` class → `opacity 0; transform: scale(1.06); visibility hidden` over 0.9s `cubic-bezier(.2,.8,.2,1)`. Then unmount after 1s.
- While mounted, `body` gets `overflow: hidden`. Use `useEffect` to add/remove the class.
- Persistence: **don't** show again in same session — store `sessionStorage.setItem('splash-seen', '1')` on dismiss, skip mount if set.
- `prefers-reduced-motion: reduce` → kill all animations, render static.

### 3.2 `<TopNav />` — `components/home/top-nav.tsx`

- Sticky top, `backdrop-filter: blur(20px) saturate(180%)`, `background: var(--bg-elevated)`, hairline-bottom.
- Height 48px. Container max-width 1200px.
- Left: **YQ logomark** — 28×28 rounded square, gradient `linear-gradient(135deg, var(--accent), #a855f7)`, white "YQ" text inside. Next to it: `Yanpeng Qi` in 14px medium.
- Center: nav links — `Work`, `Writing`, `CV`, `Chat`. 13px, `--ink-2`, hover → `--ink`.
- Right: ⌘K trigger button — pill with hairline border, `Search ⌘K` text, opens existing `<CommandPalette />`.
- Right edge: theme toggle (existing `<ThemeToggle />`).

### 3.3 `<Hero />` — `components/home/hero.tsx`

Three variants behind a prop `variant: 'keynote' | 'editorial' | 'desktop'`. Default to `'keynote'`. Expose via env or just hardcode for now.

**All variants share the background:**
- Three mesh blobs (smaller than splash — 500×500), low opacity (.25 light, .35 dark), slow drift.
- Grid overlay with radial mask, opacity .25.

**Keynote variant** (default):
- Centered. Eyebrow "YANPENG QI" mono uppercase. Display headline: `Software with a thinking layer.` Word `thinking` styled as `<span class="shimmer">` — gradient sweep animation (linear-gradient 110deg with bright band, `background-size: 200% 100%`, 6s `bgPos -100% → 200%` keyframe, `background-clip: text`, `color: transparent`).
- Sub-headline (19px, `--ink-2`, max-width 640px, centered): one sentence about what you build.
- Two CTAs: primary pill `View work` (accent fill, white text, 12px h-padding 22px, radius 980px) and ghost `Talk to my AI →` (text only, hover underline).

**Editorial variant**:
- Left-aligned. Use `--font-serif` for headline, italic. Smaller (clamp 48–72px). Ample top padding.

**Desktop variant**:
- Hero is a faux macOS window. Traffic lights top-left, mono content inside showing a fake `gh repo view yanpeng-qi/portfolio` output. The window has `--shadow-card-hover` and 22px radius.

### 3.4 `<StatsBar />` — `components/home/stats-bar.tsx`

4 columns, hairlines between, no boxes:
- `7+` Years building software
- `12` AI projects shipped
- `100M+` Requests served
- `1` Engineer, end-to-end

Layout: `grid-cols-2 md:grid-cols-4`, each cell `py-12 px-8`, `border-r border-[var(--rule)]` with `last:border-r-0`. Big number is `48px weight 600 letter-spacing -0.02em`. Label is `12px mono uppercase tracking-[0.18em] --ink-3`.

### 3.5 `<TileGrid />` — `components/home/tile-grid.tsx`

6-column grid (`grid-cols-6`), gap 16px. Each tile is an `<article>` with `border-radius: var(--r-xl)`, `var(--bg-card)`, hairline border, `--shadow-card`. Hover → `--shadow-card-hover`, translateY(-2px), 0.3s.

Tiles in order:

1. **Span-6, split layout** — Admitly hero tile. Left half (1.05fr): eyebrow "Featured", title "Admitly. Your AI study-abroad consultant.", body sub, CTA "Read case study →". Right half (1fr): live-looking RAG pipeline animation — a vertical stack of 4 nodes (`Query`, `Retrieve`, `Rerank`, `Answer`) with hairline connectors and dots that travel down on a 4s loop. Use a single SVG with `<animateMotion>` or CSS keyframes on absolutely-positioned dots.

2. **Span-3, accent tile** — "Production AI Core". Eyebrow "Specialty", title "Production AI Core.", sub "Retrieval, orchestration, reliability. The boring parts that make the magic real.", CTA "How I think about it →". Below CTA: a 4-row `core-stack` diagram. Each row is a hairline-bordered pill with `padding: 7px 12px`, `border-radius: 8px`, `background: rgba(255,255,255,.7)` light / `rgba(255,255,255,.04)` dark, `backdrop-filter: blur(8px)`. Left side: bold 11px label (`Eval`, `Route`, `Retrieve`, `Index`). Right side: 10px mono `--ink-3` detail (`LLM-as-judge · 92%`, `Haiku → Sonnet`, `BM25 + vec + RRF`, `chunked · cached`). Last row has `.base` class with reduced bg opacity. On row hover: `translateX(3px)` + `--shadow-card`.

3. **Span-3** — "Full-stack with depth". Eyebrow "Background", title, sub about Java/TS/Python, CTA "See CV →". Below: `lang-grid` — 3-column grid, 6 cells, `gap: 4px`, each cell `aspect-ratio: 2/1`, `border-radius: 8px`, hairline border, `--bg-section` background, centered content. Cells: `Java / Spring · JVM`, `TS / Next.js · Edge`, `Py / FastAPI · ML`, `SQL / pgvector`, `K8s / AWS · Bedrock`, `MCP / Tools · Agents`. Bold label is 12px, sub is 9px mono `--ink-3`. Hover: `translateY(-2px)` + bg becomes `color-mix(in srgb, var(--accent) 8%, var(--bg-section))`.

4. **Span-2** — Dark tile. `bg: #1d1d1f`, light text. "AI Chat. Try it.", small preview of two chat bubbles, CTA opens `/chat`.

5. **Span-2** — "Writing". Eyebrow, title, latest 2 post titles as a hairline-separated list.

6. **Span-2** — "Open source". GitHub octicon (or just text), repo count, total stars, CTA to `/repositories`.

### 3.6 `<ProjectCards />` — `components/home/project-cards.tsx`

Section header: eyebrow "Featured Projects", section-title "Things I've built with AI at the core."

Below: `<ProjectCard />` from `components/project-card.tsx` — keep it but restyle:
- Card: 28px radius, hairline, `--shadow-card`, hover `--shadow-card-hover` + translateY(-2px).
- Layout: image top (16:10), 32px padding body. Title 24px weight 600, sub 16px `--ink-2`, tag pills hairline-bordered 11px mono uppercase tracking-[0.12em].
- Map over `featured` prop from `app/page.tsx`.

### 3.7 `<AIChat />` — `components/home/ai-chat.tsx`

Side-by-side: left text (eyebrow "Try it now", title "Ask my AI anything about my work.", sub, CTA `Open chat →` to `/chat`), right a fake chat block with 3 bubbles showing a real-looking exchange. Use `--bg-section` for the chat block, hairline, 22px radius.

### 3.8 `<Continuity />` — `components/home/continuity.tsx`

Three device frames overlapping slightly: laptop (left, largest), iPad (center), iPhone (right, smallest). All show different views of the same project case study. Use simple CSS bezels (rounded rects with hairline + shadow); don't import a heavy library.

### 3.9 `<Footer />` — `components/home/footer.tsx`

Hairline-top. Three columns: brand (YQ logomark + tagline), nav (same as TopNav links + social), legal/contact (email, location, copyright). 13px text. `--bg-section` background.

---

## 4. Cursor effects — `components/cursor-fx.tsx`

Mount in `layout.tsx` after `{children}`. Two SVG-less divs absolutely positioned, follow the cursor with separate lerp speeds.

- **Glow follower**: 220×220, `border-radius: 50%`, `filter: blur(60px)`, `mix-blend-mode: screen` (dark) / `multiply` (light), `background: radial-gradient(circle, var(--accent) 0%, transparent 70%)`. Lerps with factor 0.08 (laggy/trail).
- **Ring follower**: 28×28, hairline border, `border-radius: 50%`. Lerps with factor 0.18 (snappier). Hovering an element with `[data-cursor-grow]` (apply to all `a`, `button`, `.tile`, `.project-card`) → ring scales to 1.75× and fills with accent.

Use `requestAnimationFrame`. Hide on `(pointer: coarse)` (touch devices). Respect `prefers-reduced-motion: reduce`.

Also expose card spotlight: any `.tile`, `.project-card`, `.device`, `.chat-block` listens to `mousemove` and sets CSS vars `--mx` and `--my` on itself; CSS uses them in a `radial-gradient` pseudo-element that fades on `:hover`.

---

## 5. Theme toggle behavior

Existing `theme-toggle.tsx` writes `data-theme` on `<html>`. Verify that:
- It writes to `localStorage.theme`.
- `theme-init-script.tsx` reads it on first paint to prevent flash.
- Default is `system` (use `prefers-color-scheme`).

Add a third "auto" state if not present; the toggle should cycle Light → Dark → Auto.

---

## 6. Animations — total list

Only these are allowed sitewide:

1. **Splash entrance** (yqDrop, splashIn).
2. **Splash dismiss** (opacity + scale 1.06, 0.9s).
3. **Hero blob drift** (sbf1/2/3, 14–22s).
4. **Hero shimmer text** (6s gradient sweep on `.shimmer`).
5. **YQ gradient shine** (yqShine, 6s on splash logo).
6. **Section fade-up** (`opacity 0 → 1, translateY 20px → 0`, 0.6s, on IntersectionObserver). Apply to section-title and first child of each section.
7. **Card lift** (translateY -2px + shadow upgrade, 0.3s, on hover).
8. **Cursor follower** (rAF lerp, every frame).
9. **Card spotlight** (radial-gradient follow, no animation — just CSS var update).

**Delete** any other motion. No spring-physics carousels, no parallax scrolling, no marquee, no auto-playing video backgrounds.

---

## 7. Things to delete from the current site

Search and remove:

- Any "Generated Visuals" / image gallery sections.
- Any purple-blue gradient on UI surfaces (cards, buttons, nav). Gradients only allowed on splash YQ text and mesh-blob backgrounds.
- Emoji in section headings (✨ 🚀 etc).
- Decorative icons next to bullet points where the bullet itself is enough.
- The `shader-hero-bg.tsx` (ogl-based) if it's currently used — replace with CSS mesh blobs above. Remove `ogl` from `package.json` if unused.
- `home-page-client.tsx` content — replace as described in §3.

---

## 8. Copywriting rules

- One claim per line. No "I'm passionate about leveraging cutting-edge…" boilerplate.
- Specific over vague: "100M+ requests served" beats "scaled production systems".
- No exclamation marks. No em-dash overuse.
- Tile sub-copy max 14 words.
- CTA verbs: `View`, `Read`, `Open`, `See`, `Talk to`. Not "Learn more", not "Click here".

---

## 9. Suggested PR sequence

Make these as separate commits/PRs in order — each should be independently runnable:

1. `chore: design tokens` — `app/globals.css` rewrite per §1.
2. `feat: landing splash` — `components/home/landing-splash.tsx` + sessionStorage gating.
3. `refactor: top nav` — replace existing nav with §3.2 spec; keep CommandPalette wiring.
4. `feat: hero (keynote)` — default variant only, drop in mesh blobs.
5. `feat: stats bar + tile grid` — §3.4 + §3.5, with the core-stack and lang-grid sub-components.
6. `refactor: project cards` — restyle existing component per §3.6.
7. `feat: ai chat preview, continuity, footer` — §3.7–3.9.
8. `feat: cursor fx` — `components/cursor-fx.tsx`, mount in layout.
9. `feat: hero variants editorial + desktop` — gated by prop, not yet exposed.
10. `chore: cleanup` — delete unused files, remove `ogl` from deps, lint pass.

Run `pnpm lint` and `pnpm build` after every PR. Verify both light and dark themes look final before merging each one.

---

## 10. Acceptance checklist

Before merging the last PR:

- [ ] First paint shows splash; clicking dismisses smoothly to home.
- [ ] Splash does not re-show on internal navigation (sessionStorage).
- [ ] Light and dark both pass — no muddy ink, no invisible hairlines.
- [ ] All hairlines are 0.5px and visible on retina.
- [ ] No emoji on the home page.
- [ ] No purple/blue gradients anywhere except splash YQ text and mesh blobs.
- [ ] ⌘K palette opens and works.
- [ ] Cursor effects hidden on touch devices.
- [ ] `prefers-reduced-motion` kills all motion.
- [ ] Lighthouse ≥ 95 on Performance, ≥ 100 on Accessibility.
- [ ] No console errors / warnings.

---

## Reference

The HTML mockup at `/design-reference/Personal Site.html` is the source of truth for all token values, spacing, and animation timings. When this prompt and the HTML disagree, **trust the HTML**.
