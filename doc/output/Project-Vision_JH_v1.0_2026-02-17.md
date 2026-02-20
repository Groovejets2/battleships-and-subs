# Project Vision — Battleships & Subs
**Version:** 1.0
**Created:** 2026-02-17
**Authors:** JH (product owner) + Kerry McGregor (Sonnet 4.5, lead agent)
**Status:** APPROVED — required reading for all AI agents

---

## Mission Statement

> *A lean, professional arcade game that makes a classic mechanic feel fresh, fast, and impossible to put down — built to a standard that earns a place alongside commercial mobile games.*

This is not a prototype. This is not a learning project. Every decision — code, design, sound, graphics — must be made as if this is shipping to an app store and being judged next to paid games.

---

## Three Core Pillars (Non-Negotiable)

### Pillar 1: Arcade-Grade Aesthetic
Every screen must look like it belongs on a quality arcade cabinet or premium mobile title.

**Test:** "Would this screen look credible in a $5 App Store game listing?"

- If no: fix it before moving on
- Old-school arcade cabinet feel — metal pipes, bold fonts, naval atmosphere
- No placeholder graphics, no unstyled buttons, no inconsistent fonts
- Reference standard: *Space Invaders Extreme*, *Pac-Man Championship Edition*, classic Namco/Capcom cabinet art

### Pillar 2: Addictive Loop
The player must always have a reason to start one more game.

**Mechanisms:**
- Near-miss high score psychology (show distance from top score on defeat)
- Earned power mechanics (Sonar Ping, Row Nuke, Chain Bonus) — see mechanics below
- "The enemy has only 1 ship left!" tension announcements
- Fast restart — ENTER key, no delay, no confirmation
- Escalating AI difficulty unlock at score thresholds
- "You were X hits away from accuracy bonus!" defeat screen hook

### Pillar 3: Clean Code, Clean Ship
A junior developer must be able to read any function in under 2 minutes.

**Standards applied at all times:**
- **SOLID** — Single Responsibility, Open/Closed, Liskov, Interface Segregation, Dependency Inversion
- **KISS** — no function >30 lines, no class >200 lines without justification
- **DRY** — ButtonFactory, UIHelpers, shared constants — no copy-paste across scenes
- **YAGNI** — remove anything written "just in case"
- **SLAP** — `create()` calls named methods; never raw logic in top-level lifecycle methods

**Formally reviewed at end of Phase 2 (Week 7) and Phase 3 (Week 10).**

---

## Graphics Asset Strategy

**Rule: No manual artwork.** Either Kenney.nl CC0 packs, AI-generated assets, or programmatic Phaser Graphics.

| Asset Type | Approach | Primary Tool |
|-----------|----------|-------------|
| Ship sprites (top-down) | Kenney.nl CC0 first; AI-generated if style mismatch | kenney.nl / Midjourney / Adobe Firefly |
| Combat effects (explosions, splashes, ripples) | Programmatic — Phaser Graphics | Code |
| Background art (ocean, silhouettes, night sky) | AI-generated PNG | Midjourney / Adobe Firefly |
| UI chrome (pipes, rivets, panel borders, buttons) | Programmatic — Phaser Graphics | Code |
| Icons (medals, rank badges, ability indicators) | Kenney.nl CC0 first | kenney.nl |
| Coordinate labels and grid overlays | Programmatic — Phaser Graphics / Text | Code |

### Art Day (Week 7 — before graphics coding begins)
1. Audit [kenney.nl](https://kenney.nl/assets) — search "top-down ships", "boardgame", "icons" (1-2 hrs)
2. Evaluate: does the style match the naval arcade aesthetic?
3. **If yes:** download, licence-check (CC0 = free commercial use), add to `/assets/`
4. **If no:** generate ship sprites via AI tool (Midjourney recommended), clean up, export 128×128 or 256×256 PNG with transparency
5. Document all sources in `/doc/output/Graphics-Strategy.md`

All assets must be consistent in art style. Mixed styles look unprofessional and will fail Pillar 1.

---

## Addictiveness Innovation Mechanics

Inspired by *Space Invaders Extreme* — same core mechanic, radical new feel through earned power and combo systems.

These are **player-earned power mechanics** (not ship special abilities, which are separate):

| Mechanic | Trigger | Effect | Design Goal |
|---------|---------|--------|-------------|
| **Sonar Ping** | Once per game, pre-charged | Reveals ship/no-ship in a 3×3 zone (no exact positions) | Strategic intel — earned, not given |
| **Depth Charge Row Nuke** | Earned by sinking 2 enemy ships consecutively | Player selects any row — all 10 cells attacked simultaneously | High drama moment, big visual payoff |
| **Chain Bonus** | 3+ consecutive hits in a row | Score multiplier activates + visual combo flash | Rhythm/skill reward, "on a roll" feeling |

**Important distinctions:**
- These are NOT the ship special abilities (Nuclear Sub radar, Cruiser sonar, Attack Sub stealth)
- These are meta-game mechanics earned through play performance
- They should feel exciting and visual — big sound cues, screen flash, strong UI feedback

**Implementation:** Week 5

---

## Quality Gate (End of Each Phase)

Before proceeding to the next phase, ALL of the following must be true:

1. **Play test** — complete a full game end-to-end on desktop and mobile (portrait and landscape)
2. **Visual audit** — every screen passes the "commercial mobile game" test (Pillar 1)
3. **Code review** — SOLID/KISS/DRY/YAGNI/SLAP audit completed, violations fixed
4. **Document review** — GAME_RULES.md, REQUIREMENTS.md, DELIVERY_PLAN.md updated to reflect what was actually built
5. **No regressions** — all existing Playwright tests pass

**Phase gate dates:**
- Phase 2 gate: end of Week 7
- Phase 3 gate: end of Week 10 (pre-launch sign-off)

---

## Team & AI-First Mandate

**Project Manager:** Jon (JH) — vision, priorities, approvals, play testing, feedback
**Lead Developer:** Kerry McGregor (Claude Sonnet 4.5) — all coding, testing, git, documentation
**Architectural Consultant:** Tony Stark (Claude Opus 4.5) — deep analysis, strategic decisions

### AI-First Rule

> AI is the default and preferred solution for every problem on this project. Manual human effort is a last resort.

- All code is written by AI (Kerry McGregor)
- All tests and automated tasks are run by AI
- All documentation is authored by AI
- All git operations are performed by AI
- When any new problem arises: **first ask "can AI solve this?"**
- Jon's role: Product Manager — not code author

---

## What We Are NOT Building

To enforce YAGNI and keep scope manageable:

- No backend server or multiplayer (v1.0)
- No user accounts or cloud saves (localStorage only)
- No in-game chat
- No counter-moves / defensive mechanics (deferred to v2.0)
- No real-time elements (turn-based only in v1.0)
- No paid assets requiring licensing fees

---

## Reference Points

Games that set the standard this project aspires to match:

| Game | What to steal |
|------|--------------|
| Space Invaders Extreme (PSP) | Combo mechanics, visual feedback intensity, rhythm scoring |
| Pac-Man CE | Speed escalation, near-miss tension, clean HD arcade aesthetic |
| Classic Namco/Capcom arcade cabinets | Metal bezel aesthetic, colour palette, bold fonts |
| Battleship (Hasbro 1990 NES) | Core mechanic simplicity, fleet composition |

---

**Last updated:** 2026-02-17
**Next review:** End of Phase 2 (Week 7)
**Location:** `/doc/output/Project-Vision_JH_v1.0_2026-02-17.md`
