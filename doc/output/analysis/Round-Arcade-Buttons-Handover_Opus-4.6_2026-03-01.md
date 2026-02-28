# Round Arcade Buttons — Handover to Sonnet 4.6

**Author:** Tony Stark (Opus 4.6)  
**Date:** 2026-03-01  
**Status:** Implementation complete, needs visual review + HelpScene update

---

## What Was Done

Replaced 3 rectangular buttons (SONAR 44px, NUKE 44px, FIRE 50px) that were vertically stacked in a 21–54px gap (guaranteed overlap) with **round arcade-cabinet-style buttons** drawn via Phaser Graphics API.

### Files Modified

**`src/scenes/GameScene.js`** — single file, all changes:

1. **Removed methods:** `createAbilityButtons()`, old `destroyAbilityButtons()`, old `createFireButton()`, old `updateFireButton()`, old `destroyFireButton()`
2. **Added methods:** `createArcadeButtons()`, `destroyArcadeButtons()`
3. **Updated methods:** `destroyAbilityButtons()` and `destroyFireButton()` now delegate to `destroyArcadeButtons()`
4. **Updated methods:** `updateAbilityButtons()` and `updateFireButton()` rewritten for new structure
5. **Updated callers:** `enterSonarMode()`, `executeSonarPing()`, `enterNukeMode()`, `executeRowNuke()` — changed from `setFillStyle()` to `setScale(1.2)` for activation highlight
6. **Updated `createUI()`** — calls `createArcadeButtons()` instead of separate ability+fire methods
7. **Updated `handleResize()`** — calls `destroyArcadeButtons()` + `createArcadeButtons()`

### Button Design

| Button | Base Color | Rim Color | Icon |
|--------|-----------|-----------|------|
| FIRE | `0xcc0000` (red) | `0xff3333` | Crosshair (circle + cross lines) |
| SONAR | `0x0055aa` (blue) | `0x00aaff` | Sonar arcs (center dot + 3 concentric arcs) |
| NUKE | `0xdd6600` (orange) | `0xff9933` | Radiation trefoil (3 blades + center dot) |

Each button: outer rim glow → filled circle → glossy ellipse highlight → vector icon → invisible circular hit area.

### Layout Strategy

- **Portrait (stacked grids):** 3 buttons in a **horizontal row** below enemy grid labels, above ship status bar. Radius 14–26px.
- **Landscape (side-by-side):** 3 buttons **vertically stacked** between the two grids. Radius 14–30px.
- Button order: FIRE, SONAR, NUKE (left-to-right in portrait, top-to-bottom in landscape).

### Data Structure

```javascript
this.abilityButtons = {
    sonarBtn: sonarContainer,  // backward compat (Container object)
    sonarText: null,           // no longer used
    nukeBtn: nukeContainer,
    nukeText: null,
    _fire: { container, bg, icon, hitArea, baseColor, rimColor },
    _sonar: { container, bg, icon, hitArea, baseColor, rimColor },
    _nuke: { container, bg, icon, hitArea, baseColor, rimColor }
};

this.fireButton = {
    button: fireContainer,
    text: null,
    _ref: fireRef
};
```

---

## IMMEDIATE TASK FOR SONNET 4.6

### Known Layout Issues (Must Fix)

**Small portrait phones (buttons in negative/zero space):**
- **iPhone SE 375×667** — `enemyBottom` (647px) exceeds `shipBarTop` (637px). Buttons have NEGATIVE space (-10px). They overlap or disappear.
- **Galaxy S20 412×915** — similar issue, very tight. Buttons may overlap ship status bar.
- **iPhone 14 Pro Max 430×932** — likely borderline, check screenshot.

**Large landscape (buttons squished):**
- **Desktop 1920×1080** and **iPad landscape 1024×768** — the `GRID_SPACING` is only 100px. With `r = min(30, gap*0.28) = 28`, three buttons vertically with spacing `2.8*r = 78` means the stack spans ~134px. On shorter landscape screens the buttons appear squished between the grids.

**Root cause in portrait:** The `createArcadeButtons()` method calculates `enemyBottom = enemyY + gridWidth + labelSpace + 4` and `shipBarTop = height - 30`. When grids consume nearly all vertical space, there's no room left below the enemy grid for buttons.

**Root cause in landscape:** The vertical spacing between 3 buttons (`r * 2.8`) can exceed the grid height when grids are small, pushing buttons outside the grid area.

### Fix Approach

The fix is in `createArcadeButtons()` in `src/scenes/GameScene.js` (~line 465). Adjust the positioning math:

1. **Portrait fix:** If `enemyBottom >= shipBarTop`, fall back to placing buttons in the inter-grid gap (which is 18–54px). With round buttons at radius 8–12px, three circles side-by-side CAN fit in this gap. OR reduce `labelSpace`/`BOTTOM_UI` in `calculateLayout()` to guarantee room.

2. **Landscape fix:** Clamp the vertical spacing so buttons never exceed the grid height. Use `Math.min(r * 2.8, gridWidth * 0.35)` for spacing.

3. **All viewports must have buttons fully visible, not overlapping grids or status bar.**

### How to Test

1. Ensure dev server runs: `npx http-server -p 5500 -c-1`
2. Run: `node tests/automated/game-scene-layout.test.js`
3. Review screenshots in `tests/automated/screenshots/AUTOMATED-TESTS/`
4. Check ALL 11 viewports — buttons must be visible, non-overlapping in every one
5. Pay special attention to: iPhone SE portrait, Galaxy S20 portrait, desktop landscape

### Update HelpScene

**`src/scenes/HelpScene.js`** lines ~46-63 — update `SPECIAL ABILITIES` and `CONTROLS` sections to describe round buttons:

```
'ARCADE BUTTONS',
'• 🔴 FIRE (red) - Confirm attack on selected cell',
'• 🔵 SONAR (blue) - Reveal 3×3 zone (one use)',
'• 🟠 NUKE (orange) - Attack entire row (sink 3 ships to earn)',
'• Chain bonus - Multiple hits in a row = score multiplier',
'',
'CONTROLS',
'• Click/Tap enemy grid cells to target',
'• Hover a cell then press FIRE to attack',
'• SONAR and NUKE activate special attack modes'
```

---

## Key Code Location Reference

| What | File | Line (approx) |
|------|------|---------------|
| `createArcadeButtons()` | GameScene.js | ~465 |
| `destroyArcadeButtons()` | GameScene.js | ~645 |
| `updateAbilityButtons()` | GameScene.js | ~665 |
| `updateFireButton()` | GameScene.js | ~675 |
| `enterSonarMode()` | GameScene.js | ~1135 |
| `enterNukeMode()` | GameScene.js | ~1225 |
| `handleResize()` | GameScene.js | ~2070 |
| Help text | HelpScene.js | ~46-63 |
| Layout test | tests/automated/game-scene-layout.test.js | entire file |

---

## Test Results

All 11 viewports ran without errors:
- iphone14-pro-max portrait/landscape (430×932, 932×430)
- galaxy-s20-ultra portrait/landscape (412×915, 915×412)
- iphone-se portrait/landscape (375×667, 667×375)
- mid-width portrait 500×800, 600×900
- iPad portrait/landscape (768×1024, 1024×768)
- Desktop 1920×1080

No JavaScript errors in any viewport. Screenshots saved for visual review.
