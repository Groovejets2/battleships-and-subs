# Manual Test Plan - Responsive Design Fixes v2

**Date:** 2026-02-14
**Tester:** Kerry McGregor (via user verification)
**Build:** feature/week2-ship-placement-validation-from-develop

---

## Test Summary

**Automated Testing:** ✓ Complete (Title scene only)
**Manual Testing:** Required for GameScene, SettingsScene, HighScoresScene

---

## Automated Test Results

### Title Scene - Tagline Overflow Fix
**Status:** ✓ PASS (all viewports)

| Viewport | Resolution | Result | Screenshot |
|----------|-----------|---------|------------|
| Mobile Portrait | 375×667 | ✓ PASS | mobile-portrait_title.png |
| Mobile Landscape | 667×375 | ✓ PASS | mobile-landscape_title.png |
| Tablet Portrait | 768×1024 | ✓ PASS | tablet-portrait_title.png |
| Desktop | 1920×1080 | ✓ PASS | desktop_title.png |

**Fix Details:**
- Tagline "Navigate • Strategize • Dominate" now scales responsively
- No overflow on narrow screens
- Font size: `Math.min(width * 0.025, 16)px`
- Special case for width < 400px: `Math.min(width * 0.032, 12)px`
- Code location: `src/scenes/TitleScene.js:304-314`

---

## Manual Test Checklist

### Test 1: GameScene Grid Stacking (CRITICAL)

**Objective:** Verify grids stack vertically on mobile and scale to fit viewport

**Steps:**
1. Open app in Live Server (VS Code)
2. Click "START GAME" to enter GameScene
3. Resize browser window to mobile portrait (narrow, tall)
4. Resize to mobile landscape (wide, short)
5. Resize to desktop (wide, tall)

**Expected Results:**
- **Mobile Portrait (height > width, narrow):**
  - Grids stack vertically (YOUR FLEET above ENEMY WATERS)
  - Both grids visible without scrolling
  - Cells scale down to fit available space
  - No grids cut off at bottom

- **Mobile Landscape (width > height, short):**
  - Grids stack vertically OR side-by-side depending on available width
  - Both grids fully visible
  - Appropriate cell sizing

- **Desktop (wide screen):**
  - Grids display side-by-side
  - Proper cell sizing (not too small)
  - Centered layout

**Pass Criteria:**
- ✓ No grid overflow off bottom of screen
- ✓ Both grids always visible
- ✓ Grids stack when viewport too narrow for side-by-side
- ✓ Grid cells scale appropriately to available space

**Fix Applied:**
- verticalPadding calculation moved AFTER stacked mode spacing adjustments
- Code location: `src/scenes/GameScene.js:99-106`

---

### Test 2: SettingsScene Responsive Scaling

**Objective:** Verify settings controls reposition without scene restart flicker

**Steps:**
1. Navigate to Settings scene
2. Resize browser window (various sizes)
3. Observe slider and toggle positions

**Expected Results:**
- Sliders reposition smoothly (no flicker)
- Toggles remain aligned
- Back button repositions correctly
- No visual artifacts during resize

**Pass Criteria:**
- ✓ No scene restart flicker
- ✓ All controls visible and properly positioned
- ✓ Smooth repositioning during resize

---

### Test 3: HighScoresScene Table Display

**Objective:** Verify high scores table displays correctly (restart behaviour acceptable)

**Steps:**
1. Navigate to High Scores scene
2. Resize browser window

**Expected Results:**
- Table may restart (brief flicker acceptable as per user agreement)
- Table scales to fit viewport after restart
- All score entries visible
- Proper alignment

**Pass Criteria:**
- ✓ Table visible and readable at all sizes
- ✓ No content overflow
- ✓ (Flicker during resize is acceptable trade-off)

**Note:** User approved scene.restart() approach due to table complexity

---

## How to Report Results

### Option 1: Screenshots
Take screenshots at key viewport sizes (mobile portrait, mobile landscape, desktop) and save to `screenshots/manual/` folder

### Option 2: Written Feedback
Document any issues found:
- Which scene?
- Which viewport size/orientation?
- What's wrong? (overflow, misalignment, etc.)
- Screenshot if possible

---

## Known Limitations

1. **Playwright automated testing** cannot navigate between scenes (button clicking fails)
2. **GameScene** is most critical - previous user feedback: "grids stack but stay same size and overflow bottom"
3. **HighScoresScene** uses scene.restart() - will flicker on resize (acceptable)

---

## Fix Summary

| Scene | Issue | Fix | Status |
|-------|-------|-----|--------|
| TitleScene | Tagline overflow | Responsive font sizing | ✓ VERIFIED |
| GameScene | Grid overflow when stacked | verticalPadding calc order | ⏳ MANUAL TEST |
| SettingsScene | Scene restart flicker | Element repositioning | ⏳ MANUAL TEST |
| HighScoresScene | Table scaling | scene.restart() | ✓ ACCEPTED |

---

## Next Steps After Testing

1. If all tests pass → Commit changes to git
2. If issues found → Iterate fixes based on feedback
3. Update Claude.md with test results

