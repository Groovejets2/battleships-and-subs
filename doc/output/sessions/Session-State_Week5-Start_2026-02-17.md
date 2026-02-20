# Session State Snapshot — Week 5 Start
**Agent:** Kerry McGregor (Sonnet 4.5)
**Date:** 2026-02-17
**Branch:** feature/week5-enhanced-features-from-develop (HEAD: 37c1d5a)
**Base:** develop (1212c60)
**Latest Release:** v1.4.1 (on main)

---

## Git State

| Branch | HEAD commit | Remote |
|--------|-------------|--------|
| main   | b2dc515 (Release v1.4.1) | origin/main ✓ |
| develop | 1212c60 (Session state + CLAUDE.md resume) | origin/develop ✓ |
| **feature/week5-enhanced-features-from-develop** | **37c1d5a (Graphics research)** | **origin ✓ CURRENT** |

**Clean working tree** — ready for Week 5 UX development.

---

## Completed This Session

### Pre-Sprint Graphics Research ✅ COMPLETE (commit 37c1d5a)

**Graphics Strategy Document Created:** `/doc/output/Graphics-Strategy.md`
- Evaluated 4 CC0 asset packs (OpenGameArt, Kenney.nl, CraftPix)
- **Decision:** OpenGameArt Sea Warfare Set selected as primary ship sprite source
- Pillar 1 test: PASS (arcade-grade aesthetic matches $5 App Store standard)
- AI generation backup plan documented (PixelLab, Sprite AI)
- Week 6A implementation checklist ready

**Ship Sprites Downloaded:** `/assets/ships/`
- All 5 required ships: Battleship, Carrier, Cruiser, Destroyer, Submarine
- CC0 public domain (commercial use, no attribution required)
- Pixel art arcade aesthetic (matches Space Invaders Extreme / Pac-Man CE)
- Hulls + weapons separated (animation-ready)
- Bonus assets: PatrolBoat, Rescue Ship, Plane

**Housekeeping:**
- `/assets/credits.txt` created (CC0 attribution best practice)
- `test-screenshots/` added to `.gitignore`

---

## Next: Week 5 UX Polish (3 Tasks Starting Now)

### Task 1: Floating HIT/MISS Text + Slow Animations
**File:** `src/scenes/GameScene.js`

**Current State:**
- Sunk announcement shows but fades too fast (2000ms total)
- No floating HIT/MISS text over attacked grid cells

**Changes Required:**
1. Add `showCombatText(message, color, x, y)` method
2. Slow sunk announcement: hold 1800ms, fade 1800ms (total ~3.6s visible)
3. Call combat text on player attack and AI attack:
   - HIT: red text, float up 40px, fade out
   - MISS: white text, float up 40px, fade out
4. Position text over attacked grid cell coordinates

**Acceptance:**
- Player sees "HIT!" or "MISS" appear over every attacked cell
- Text holds ~900ms before fading over ~1400ms
- Sunk announcement visible long enough to read (~3.6s total)

---

### Task 2: Unify Header Titles Across Scenes
**Files:**
- `src/scenes/GameScene.js`
- `src/scenes/SettingsScene.js`
- `src/scenes/HighScoresScene.js`

**Current State:**
- GameScene: no scene header title
- SettingsScene: has header title
- HighScoresScene: has header title, style nearly matches Settings

**Changes Required:**
1. Add scene header title to GameScene ("BATTLE IN PROGRESS" or "COMBAT")
2. Standardize across all 3 scenes:
   - Font: Arial Black
   - Size: responsive formula (same calc across all scenes)
   - Color: #FFFFFF (white)
   - Stroke: #000000 4px
   - Position: centered, y = height * 0.05 (consistent)

**Acceptance:**
- All 3 scenes have identical header title styling
- Titles resize correctly on rotation and scale

---

### Task 3: TitleScene Title Upgrade + Main Menu Graphic
**File:** `src/scenes/TitleScene.js`

**Current State:**
- Title: Arial Black 48px max, wave animation
- Tagline: "Navigate • Strategise • Dominate" (correct spelling already)

**Changes Required:**
1. Increase title max size: 48px → 64px
2. Heavier stroke: current → 6px
3. Add glow shadow effect (shadow blur 8px, color #00FFFF or naval blue)
4. Add decorative separator lines flanking the tagline
5. **DECISION NEEDED:** Source a free/CC0 battleship main menu graphic?
   - Option A: Use Display.png from Sea Warfare Set as header graphic
   - Option B: Search for CC0 naval background (submarine silhouette, ocean horizon)
   - Option C: Programmatic Phaser Graphics (anchor icon, periscope, horizon line)

**Acceptance:**
- Title is larger, bolder, more prominent
- Tagline has decorative separators (e.g., "—— Navigate • Strategise • Dominate ——")
- Visual polish matches arcade cabinet aesthetic
- Decision made on main menu graphic (implement if suitable asset found)

---

## Current Architecture (Unchanged from v1.4.1)

No source code changes yet this session. All v1.4.1 code intact:

```
src/
├── main.js
├── managers/
│   ├── AIManager.js              ← Easy/Normal/Hard AI
│   └── TurnManager.js            ← Turn state + score
├── scenes/
│   ├── TitleScene.js             ← TO MODIFY (Task 3)
│   ├── GameScene.js              ← TO MODIFY (Task 1 + Task 2)
│   ├── SettingsScene.js          ← TO MODIFY (Task 2)
│   └── HighScoresScene.js        ← TO MODIFY (Task 2)
```

---

## Pending Tasks (After 3 Above)

- Week 5: Addictiveness mechanics (Sonar Ping, Row Nuke, Chain Bonus)
- Week 5: Settings overhaul (remove %, arcade-style, difficulty selector)
- Week 5: Exit confirmation + game state save
- Week 5: Ship placement (manual, rotation, preview, auto-place)
- Week 5: Turn countdown timer
- Week 5: Special abilities (Nuclear Sub, Cruiser, Attack Sub)
- Week 5: Navigation audit (cross-scene consistency)

---

## How to Resume Next Session

1. Say: **"Read the CLAUDE.md"**
2. Kerry reads CLAUDE.md → reads latest session state (this file)
3. Run: `git status` and `git log --oneline -3`
4. Report: current branch, HEAD commit, next pending task
5. Wait for go-ahead

---

**Session active — proceeding with Week 5 UX tasks autonomously.**
