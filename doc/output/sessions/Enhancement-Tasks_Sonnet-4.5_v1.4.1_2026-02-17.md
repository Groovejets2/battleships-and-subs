# Enhancement Tasks — Added 2026-02-17
**Added by:** JH (user)
**Assigned to phase:** Weeks 5–7 (see below)

---

## New Tasks Added to Backlog

### Week 5 additions (UX / Gameplay)

| # | Task | Notes |
|---|------|-------|
| 5A | **Game state save** | Persist in-progress game to `localStorage` when BACK is clicked or tab loses focus. On next `GameScene.create()`, offer "Resume game?" if a saved state exists. Keys: grid states, fleet positions, turn history, score. |
| 5B | **Exit confirmation dialog** | When player clicks BACK mid-game, show "Are you sure? Your game will be lost." with YES / CANCEL. Only skip prompt if game state save (5A) is also implemented. |

### Week 6 additions (Graphics overhaul)

Week 6 is now split into **6A Graphics** and **6B Audio** to manage scope.

#### 6A — Graphics (new tasks)

| # | Task | Notes |
|---|------|-------|
| 6A-1 | **Torpedo-shaped menu buttons** | Replace rectangle buttons in TitleScene with torpedo/sub-shaped Phaser Graphics objects. Keep coloured outline style; shape should taper at ends like a torpedo silhouette. |
| 6A-2 | **Improved menu/title screen** | Add naval elements — anchor, horizon line, ship silhouette, stars/moon or ocean sunrise. Make it feel like an arcade cabinet splash screen. |
| 6A-3 | **Game load / intro animation** | Sequence: periscope rises from bottom → targets crosshair → fires → title appears. ~3 seconds, skippable on tap. |
| 6A-4 | **High scores screen graphics** | Add medal/trophy icons (gold/silver/bronze for top 3), decorative naval border, maybe rank indicators (Admiral, Captain, etc.). |
| 6A-5 | **Ship & sub sprites on grid** | Replace solid-colour blocks with drawn sprites (top-down view): Carrier (5-long, wide hull), Nuclear Sub (3-long, rounded), Cruiser (3-long, angular), Attack Sub (2-long, slim), Destroyer (2-long). Colours from SHIP_TYPES config. |
| 6A-6 | **Combat graphics** | - **Bomb animation:** spinning bomb descends on enemy cell<br>- **Depth charge:** circular ripple effect for sub attacks<br>- **Hit flash:** red explosion burst, stays as red X marker<br>- **Miss splash:** white water splash, stays as white circle<br>- **Sunk overlay:** ship outline dims to dark red, X over each segment |

#### 6B — Audio (original Week 6)

| # | Task | Notes |
|---|------|-------|
| 6B-1 | Button click SFX | |
| 6B-2 | Hit explosion SFX | |
| 6B-3 | Miss water splash SFX | |
| 6B-4 | Ship sinking SFX | |
| 6B-5 | Background music (menu + battle) | |
| 6B-6 | Victory / defeat themes | |
| 6B-7 | Web Audio API / Phaser audio integration | Volume controls already in SettingsScene |

---

## Revised Phase 2 Schedule

| Week | Sprint | Key Deliverables |
|------|--------|-----------------|
| 5 | Special Abilities + UX | Nuclear Sub / Cruiser / Attack Sub abilities, cooldowns, ability UI, Hard AI, **game state save**, **exit confirmation** |
| 6A | Graphics Overhaul | Torpedo buttons, menu splash art, load animation, high score graphics, ship/sub sprites, combat animations |
| 6B | Audio System | SFX, background music, Phaser audio integration |
| 7 | Statistics & Progression | Career stats, enhanced leaderboard, in-game accuracy, player name |

---

## Technical Notes

### Game State Save (5A)

**Suggested localStorage key:** `battleships_game_state`

**Data to persist:**
```json
{
  "playerCellStates": [...],       // 10x10 grid
  "enemyCellStates":  [...],       // 10x10 grid
  "playerShipColors": [...],       // 10x10 colors
  "playerFleet":      {...},       // serialized segments + damage
  "enemyFleet":       {...},       // serialized segments + damage
  "turnManager":      {...},       // score, shots, hits, turns, currentTurn
  "aiManager":        {...},       // attackedSquares, activeHits, difficulty
  "savedAt":          "ISO date"
}
```

**Resume flow:**
- `GameScene.create()` checks for saved state
- If found: show "Resume previous game?" overlay
- YES → `GameScene.restoreState(data)`, delete saved state
- NO → delete saved state, start fresh

**Save triggers:**
- BACK button click (before navigation)
- `window.beforeunload` event (tab close)
- `document.visibilitychange` to hidden (tab switch / phone lock)

### Torpedo Button Shape (6A-1)

Using Phaser Graphics (no external assets needed):
```javascript
// Torpedo shape: rounded rect with tapered ends using bezier curves
// Width: buttonWidth, Height: buttonHeight
// Left cap: convex curve tapering to point
// Body: rectangular
// Right cap: same as left
// Stroke colour from buttonConfig.color (arcade-style outline)
```

### Ship Sprites (6A-5)

All sprites can be **drawn programmatically** with Phaser Graphics (no image files needed):
- Top-down hull: rounded rectangle with colour fill
- Conning tower / bridge: smaller rect centered on hull
- Bow arrow indicator: small triangle at front
- Colours from `SHIP_TYPES[type].color` in gameConfig.js

---

### Week 5 additions (Navigation UX review)

| # | Task | Notes |
|---|------|-------|
| 5F | **Screen navigation button audit** | Review ALL BACK / navigation buttons across every scene (TitleScene, GameScene, SettingsScene, HighScoresScene, GameOverScene). Examine: hit target size (min 44px), position consistency, visual state (hover/press/disabled), graphic style. Currently rectangles — candidate for torpedo/sub shape. |
| 5G | **Navigation mechanics rethink** | Decide: should BACK always go to TitleScene, or be context-aware (e.g. GameScene BACK → "paused" state, not immediate exit)? Map the full navigation graph and identify any dead ends or inconsistencies. |
| 5H | **Cross-scene design consistency** | All scenes must share the same button style, font, colour palette, and spacing. Currently TitleScene and GameScene buttons look different. Establish a shared ButtonFactory utility or at minimum shared constants. |

---

### Week 5 additions (Settings overhaul)

Current `SettingsScene` has sliders with percentage text — not arcade-appropriate.

| # | Task | Notes |
|---|------|-------|
| 5C | **Remove percentage text** | Delete the `70%`, `80%`, `60%` text objects below each slider — they're cluttery and non-arcade |
| 5D | **Rationalise settings content** | Review what to keep vs remove. Classic arcade settings: Sound ON/OFF, Volume (notches 1-8), SFX ON/OFF, Music ON/OFF, Difficulty (Easy/Normal/Hard/Expert), Visual FX ON/OFF. Consider removing: separate Master/SFX/Music sliders (merge to simpler controls). Add: Difficulty selector (currently missing from Settings, set via separate flow). |
| 5E | **Rebuild settings screen layout** | Arcade aesthetic: white labels, toggle switches (styled as arcade buttons), volume shown as pip-dots or bar segments not a slider %, BACK button with torpedo styling. Align with Arcade-Design-Philosophy doc. |

**Current SettingsScene controls (for review):**
- Master Volume slider (0-100%) ← candidate to simplify
- Sound Effects volume slider ← merge into single toggle + volume?
- Music volume slider ← keep, but no % label
- Visual Effects toggle ← keep
- Animations toggle ← keep
- **Missing:** Difficulty selector ← add here

---

## Week 7 additions (Graphics Overhaul — expanded scope)

Week 7 is now the **full graphics overhaul week** (moved from Week 6 to give it proper space).

| # | Task | Notes |
|---|------|-------|
| 7A | **Arcade metal piping framework** | Draw a persistent decorative frame across ALL scenes: industrial metal pipes, riveted panels, bolted corner pieces in the style of classic arcade cabinets (think Sonic/Mario arcade bezel). Rendered as Phaser Graphics on a fixed depth layer so it appears over the background but under game content. Pipes: horizontal top bar, vertical side bars, corner connectors. Colour: dark gunmetal grey with brass/copper accents and rivets. |
| 7B | **Bubble / periscope background animation** | Replace the current wave-line TitleScene animation with: rising bubbles (random size, speed, opacity) drifting upward like underwater depth. Add submarine periscope silhouette breaking the surface in background. Optionally apply to all scenes for consistency. |
| 7C | **Menu screen redesign** | Full naval themed title screen: underwater horizon scene, ocean surface with ship silhouette, depth indicators, sonar ping animation. "BATTLESHIPS & SUBS" title rendered like it's stencilled on a submarine hull. Replace current wave lines with immersive depth scene. |
| 7D | **All-screen visual polish pass** | After all graphics are implemented, do a full visual polish pass: check consistency of colours, fonts, spacing, pipe thickness, button styles across all 5 scenes. Nothing should look like placeholder or unfinished. |
| 7E | **Slick mechanics polish** | Audit every interaction for smoothness: no jank on clicks, no visual stutter on scene transition, no lingering old graphics after resize. Every click must give instant visual feedback. Principle: if it feels sticky or ugly, fix it. |

---

## Week 10: Code Quality Review

| # | Task | Notes |
|---|------|-------|
| 10A | **SOLID principles audit** | Review all classes: Single Responsibility (each class does one thing), Open/Closed (extend without modifying), Liskov (substitutable), Interface Segregation (no bloated interfaces), Dependency Inversion (depend on abstractions). Document violations and refactor. |
| 10B | **KISS audit** | Flag any function >30 lines, any class >200 lines, any logic that could be simplified. Target: a junior dev can read and understand any function in <2 minutes. |
| 10C | **DRY audit** | Find duplicated code patterns across scenes (especially button creation, grid rendering, UI layout). Extract to shared utilities. Candidate: ButtonFactory, UIHelpers. |
| 10D | **YAGNI audit** | Remove any code that was written "just in case" but serves no current feature. Check: unused event handlers, stale TODO comments, dead branches. |
| 10E | **SLAP audit** | Check Single Level of Abstraction per function. `create()` should call named methods, not contain raw logic. Every function should do things at the same level of abstraction. |
| 10F | **Documentation completeness** | Every public method must have JSDoc. Every file must have `@fileoverview`. Review all existing docs for accuracy (code may have changed since docs were written). |
| 10G | **End-of-phase documentation review** | At the end of each Phase (Phase 2 and Phase 3): review GAME_RULES.md, REQUIREMENTS.md, DELIVERY_PLAN.md. Update to reflect actual implementation, note deviations, capture learnings. |

---

## Week 9: Gameplay Tuning — Addictiveness Sessions

**Goal:** Play-test the game repeatedly and tweak parameters until the game feels compelling, fast-paced, and "one more game"-inducing. This is separate from bug-fixing QA.

| # | Task | Notes |
|---|------|-------|
| 9A | **Pacing review** | Is the game too slow? Too fast? AI too easy or brutally hard? Adjust AI delay (currently 700ms), bonus turn duration, number of ships. |
| 9B | **Score balance tuning** | Does the score feel rewarding? Tweak hit points, sunk bonuses, accuracy multiplier, efficiency thresholds. High score should feel achievable but difficult to max. |
| 9C | **AI difficulty calibration** | Play 20+ games on each difficulty. Easy should lose ~80% of time. Normal ~50%. Hard ~20%. Adjust targeting algorithms if needed. |
| 9D | **Session length review** | Target: 5-10 minutes per game. If games drag (>15 min), consider map tweaks or AI aggressiveness increase. |
| 9E | **"One more game" hooks** | - Score tantalizingly close to high score → near-miss psychology<br>- Show "You were X hits away from accuracy bonus!" on defeat screen<br>- Fast restart: ENTER key immediately restarts, no delay<br>- Near-sink moment: "The enemy has only 1 ship left!" announcement |
| 9F | **Difficulty progression feel** | Does unlocking Hard feel earned? Consider showing "Unlock Hard mode" at a score threshold rather than always available. |
| 9G | **Mobile touch feel** | Tap response must feel instant. Test latency on actual phone. Combat lock (prevents double-tap) must not feel laggy. |
| 9H | **Documentation of tuning decisions** | Record before/after values for any parameter changed. Rationale required for each change. |

---

## Week 10: Launch & Marketing

| # | Task | Notes |
|---|------|-------|
| 10A | **Production deployment** | GitHub Pages + custom domain (if applicable), Netlify fallback |
| 10B | **App store submission** | PWA wrapping for iOS/Android app stores via PWABuilder or Capacitor |
| 10C | **Social media launch** | Twitter/X, Reddit (r/webgames, r/gamedev, r/indiegaming), LinkedIn, Facebook groups |
| 10D | **Game directories** | Submit to: itch.io, Newgrounds, GameJolt, CrazyGames, Poki, HTML5Games.com |
| 10E | **Gaming communities** | Post on: r/battleship, r/boardgames, board game forums, naval history communities |
| 10F | **Press / influencer outreach** | Short press kit (screenshots, description, trailer GIF), reach out to indie game YouTubers / TikTok gaming channels |
| 10G | **SEO & discoverability** | Add meta tags, Open Graph, game description, keywords. Consider a short promo trailer video. |
| 10H | **Monetisation options** | Consider: donation link (Ko-fi/Patreon), optional "buy premium themes" IAP if PWA, no ads on first launch |

---

## Questions / Decisions Needed

1. **Torpedo buttons:** Full torpedo silhouette or just rounded-pill shape (simpler)?
2. ~~**Ship sprites:** Programmatic Phaser Graphics or actual PNG sprite assets?~~ **DECIDED — see below**
3. **Game state save:** Auto-save silently, or show "Game saved" toast when BACK pressed?
4. **Load animation:** Always show on fresh game start, or only on first visit?
5. **Settings:** Single volume toggle (ON/OFF) or segmented volume bar (1-8 notches)?
6. **Settings:** Add difficulty selector here or keep in a pre-game flow?
7. **Marketing:** Monetise (donations/IAP) or fully free?

---

## Decisions Made (2026-02-17, Session 2)

### Graphics Asset Strategy — DECIDED
No manual artwork. Hybrid approach:

| Asset Type | Approach | Tool |
|-----------|----------|------|
| Ship sprites (top-down) | Kenney.nl CC0 first; AI-generated if style mismatch | kenney.nl / Midjourney / Adobe Firefly |
| Combat effects (explosions, splashes, ripples) | Programmatic Phaser Graphics | Code |
| Background art (ocean, silhouettes, sky) | AI-generated PNG | Midjourney / Adobe Firefly |
| UI chrome (pipes, rivets, buttons, borders) | Programmatic Phaser Graphics | Code |
| Icons (medals, rank badges, ability icons) | Kenney.nl CC0 first | kenney.nl |

**Art Day plan (Week 7):**
1. Audit kenney.nl naval/top-down packs (1-2 hrs) — free, CC0, immediately usable
2. If suitable: download, prep, integrate into Phaser
3. If not suitable: generate ship sprites via AI tool, clean up, export as 128×128 or 256×256 PNG
4. All assets must be consistent in style and resolution

### Addictiveness Innovations — DECIDED (3 mechanics selected)
Inspired by Space Invaders Extreme: add earned power mechanics that make every game feel different and reward skill.

| Mechanic | Trigger | Effect |
|---------|---------|--------|
| **Sonar Ping** | Once per game (pre-charged) | Reveals ship/no-ship in a 3×3 zone — no exact positions |
| **Depth Charge Row Nuke** | Earned by sinking 2 enemy ships consecutively | Player selects any row — all 10 cells attacked simultaneously |
| **Chain Bonus** | 3+ consecutive hits in a row | Score multiplier activates + visual combo flash |

These ADD to the existing special abilities (Nuclear Sub radar, Cruiser sonar, Attack Sub stealth) — they are player-earned power mechanics, not ship abilities.
Implementation target: **Week 5**.

---

## Week 0 / Pre-Sprint Planning (NEW — do before Week 5 coding)

| # | Task | Notes |
|---|------|-------|
| 0A | **Project Vision document** | Create `/doc/output/Project-Vision.md` — mission statement, 3 core pillars, graphics strategy, addictiveness mechanics summary. Required reading for all agents. Add reference in CLAUDE.md. |
| 0B | **Sprites/graphics workflow research** | Before Week 7 coding begins: (1) Audit kenney.nl for top-down naval ships and UI icons, (2) Evaluate style fit with current game aesthetic, (3) Document decision + links in `/doc/output/Graphics-Strategy.md`. If Kenney doesn't fit: identify AI tool workflow (Midjourney/Firefly). |

---

## Week 5 additions (UX Polish — Session 2)

| # | Task | Notes |
|---|------|-------|
| 5I | **Slow down combat text animations** | Hit/miss floating text currently fades too fast — player misses what it said. Increase hold time before fade. Add explicit floating "HIT!" and "MISS" text (currently only sunk announcements show). Sunk announcement: hold ~1.8s, fade ~1.8s. HIT/MISS: hold ~0.9s, fade ~1.4s. |
| 5J | **Unify header title text across all scenes** | GameScene, SettingsScene, and HighScoresScene headers must use identical font family, weight, size formula, and stroke style. Currently SettingsScene and HighScoresScene match; GameScene has no scene header. Add a minimal scene header to GameScene (small, non-intrusive) or ensure status text matches the style. |
| 5K | **TitleScene title styling upgrade** | Make "BATTLESHIPS & SUBS" look like a premium arcade game title: larger max font size (64px), heavier stroke (6px), glow shadow. Keep exact text and tagline "Navigate • Strategise • Dominate" (note British spelling "Strategise"). Add subtle decorative separator lines flanking the tagline. |
| 5L | **Addictiveness innovation mechanics** | Implement Sonar Ping, Depth Charge Row Nuke, and Chain Bonus (see Decisions Made above). UI: show earned mechanic as a button/icon when available. Integrate scoring: Row Nuke hits worth standard hit points, Chain Bonus multiplies score for duration. |

---

## Week 6A addition (Grid Visual Fix)

| # | Task | Notes |
|---|------|-------|
| 6A-7 | **Fix boring/plain game grids** | Current grids are flat coloured cells — looks like a spreadsheet. Options: (1) Ocean texture overlay on empty enemy cells — dark blue gradient with subtle wave pattern, (2) Depth shading — player grid green-tinted, enemy grid blue-tinted with depth effect, (3) Styled coordinate labels (A-J / 1-10) — larger, bolder, matches naval aesthetic. Priority: implement at same time as ship sprites (6A-5) so everything looks cohesive. |

---

## Revised Full Phase Schedule (updated 2026-02-17)

| Phase | Week | Sprint | Key Deliverables |
|-------|------|--------|-----------------|
| Pre-Sprint | 0 | Planning & Vision | Project Vision doc, graphics research, Kenney.nl audit |
| Phase 2 | 5 | UX Polish + Abilities | HIT/MISS text, header unification, title styling, settings overhaul, nav audit, game state save, exit confirm, ship placement, countdown timer, special abilities, addictiveness mechanics (Sonar Ping, Row Nuke, Chain Bonus) |
| Phase 2 | 6A | Graphics | Fix boring grids, torpedo buttons, menu splash art, load animation, high score graphics, ship/sub sprites (Kenney or AI), combat markers |
| Phase 2 | 6B | Audio | Military/warship UI sounds (sonar ping, radar, depth charge, radio crackle), SFX, background music, Web Audio API |
| Phase 2 | 7 | Full Graphics Overhaul | Arcade metal piping (all scenes), bubble/periscope animation, menu redesign, all-screen polish pass, slick mechanics audit |
| Phase 3 | 8 | Statistics + QA | Career stats, enhanced leaderboard, player name, in-game accuracy, unit tests >60%, cross-browser/device testing |
| Phase 3 | 9 | Gameplay Tuning | Pacing, score balance, AI calibration, addictiveness hooks, mobile touch feel |
| Phase 3 | 10 | Code Quality + Phase Review | SOLID/KISS/DRY/YAGNI/SLAP audit, documentation review (GAME_RULES, REQUIREMENTS, DELIVERY_PLAN) |
| Phase 3 | 11 | Deploy + Marketing | Production deploy, app store submission, itch.io, Reddit, social media, press kit |

---
**Document created:** 2026-02-17
**Last updated:** 2026-02-17 (Session 2 — addictiveness mechanics, graphics strategy, UX polish tasks, revised schedule)
**Status:** Backlog — ready for Week 0 pre-sprint and then Week 5
