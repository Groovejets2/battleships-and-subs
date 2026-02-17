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

## Questions / Decisions Needed

1. **Torpedo buttons:** Full torpedo silhouette or just rounded-pill shape (simpler)?
2. **Ship sprites:** Programmatic Phaser Graphics or actual PNG sprite assets?
3. **Game state save:** Auto-save silently, or show "Game saved" toast when BACK pressed?
4. **Load animation:** Always show on fresh game start, or only on first visit?

---
**Document created:** 2026-02-17
**Status:** Backlog — ready for Week 5 sprint planning
