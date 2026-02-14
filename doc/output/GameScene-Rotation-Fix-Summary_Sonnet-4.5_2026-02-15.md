# GameScene Rotation & Scaling Fix Summary

**Date:** 2026-02-15
**Model:** Sonnet 4.5 (Kerry)
**Branch:** feature/week2-ship-placement-validation-from-develop

---

## Issues Fixed

### Issue 1: Landscape Mode Only Showing One Grid ✓ FIXED
**Problem:** In landscape orientation (915×412px), only "YOUR FLEET" grid visible, "ENEMY WATERS" completely missing
**Root Cause:** `shouldStack` calculation used fixed default CELL_SIZE (40px) instead of calculated cellSize, causing wrong layout mode selection

**Fix:** Calculate maximum cellSize for BOTH layout modes first, then decide which mode to use based on which gives better cell sizes (≥20px threshold)

### Issue 2: Rotation Shrinking Bug ✓ FIXED
**Problem:** Rotating portrait→landscape→portrait caused grids to progressively shrink and never scale back up
**Root Cause:** handleResize used 10% cellSize change threshold that prevented recreation on orientation changes

**Fix:** Added explicit orientation change detection - now always recreates grids when rotating between portrait and landscape

### Issue 3: Inconsistent Scaling ✓ FIXED
**Problem:** Reload fixed layout but rotation didn't - proved resize logic was flawed
**Root Cause:** Spacing values (TITLE_SPACE, MARGIN, GRID_SPACING) were modified locally but not applied consistently to positioning calculations

**Fix:** Introduced `finalTitleSpace`, `finalMargin`, `finalGridSpacing` variables used throughout positioning logic

---

## Code Changes

### File: src/scenes/GameScene.js

#### Change 1: Refactored calculateLayout() (Lines 91-159)

**Before:**
- Calculated `shouldStack` using default CELL_SIZE before knowing actual cellSize
- Modified spacing values locally without consistent application
- Used hardcoded 920px width threshold

**After:**
- Calculates maxCellSize for BOTH modes first
- Decides shouldStack based on whether side-by-side gives ≥20px cells
- Uses `finalTitleSpace`, `finalMargin`, `finalGridSpacing` consistently
- Additional check: portrait mode with width < 600px forces stacking

**New Logic:**
```javascript
// Calculate both modes' maximum cell sizes
const maxCellSizeSideBySide = Math.min(...);
const maxCellSizeStacked = Math.min(...);

// Decide based on which mode gives better results
const shouldStack = maxCellSizeSideBySide < 20 || (isPortrait && width < 600);
```

#### Change 2: Enhanced handleResize() (Lines 237-283)

**Before:**
- Used 10% cellSize change threshold to decide if recreation needed
- No orientation change detection
- Could skip recreation when rotation caused cumulative shrinking

**After:**
- Explicitly detects orientation changes (portrait ↔ landscape)
- ALWAYS recreates grids on orientation change
- Stores width/height in currentLayout for comparison
- Removed cellSize threshold check (now only checks layout mode changes)

**New Logic:**
```javascript
// Detect orientation change
const oldOrientation = this.currentLayout ?
    (this.currentLayout.width > this.currentLayout.height ? 'landscape' : 'portrait') : null;
const newOrientation = width > height ? 'landscape' : 'portrait';
const orientationChanged = oldOrientation && oldOrientation !== newOrientation;

// Always recreate on orientation change
const layoutChanged = !this.currentLayout ||
    this.currentLayout.shouldStack !== newLayout.shouldStack ||
    orientationChanged;
```

#### Change 3: Updated calculateLayout return (Line 159)

**Before:**
```javascript
return { playerX, playerY, enemyX, enemyY, cellSize, shouldStack };
```

**After:**
```javascript
return { playerX, playerY, enemyX, enemyY, cellSize, shouldStack, width, height };
```

**Reason:** Need width/height in layout object for orientation change detection

---

## Expected Behaviour After Fix

### Portrait Mode (412×915px)
- Grids stack vertically (YOUR FLEET above ENEMY WATERS)
- Tighter spacing (MARGIN=6, TITLE_SPACE=18, GRID_SPACING=10)
- Both grids fully visible without scrolling
- cellSize scales to fit available vertical space

### Landscape Mode (915×412px)
- Grids display side-by-side (YOUR FLEET left, ENEMY WATERS right)
- Standard spacing (MARGIN=20, TITLE_SPACE=30, GRID_SPACING=40)
- Both grids fully visible
- cellSize scales to fit available horizontal space

### Rotation Behaviour
- Portrait → Landscape: Grids rearrange from stacked to side-by-side, scale up
- Landscape → Portrait: Grids rearrange from side-by-side to stacked, scale to fit
- No progressive shrinking - proper recalculation each rotation
- Layout uses full available screen space in both orientations

---

## Testing Required

### Manual Test Steps

1. **Load in Portrait:**
   - Open GameScene in 412×915px portrait orientation
   - Verify both grids visible and stacked
   - Check proper vertical spacing

2. **Rotate to Landscape:**
   - Rotate to 915×412px landscape
   - **CRITICAL:** Verify BOTH grids now visible side-by-side
   - Check grids are properly sized (not too small)

3. **Rotate Back to Portrait:**
   - Rotate back to 412×915px portrait
   - **CRITICAL:** Verify grids return to stacked layout
   - **CRITICAL:** Verify grids are NOT shrunk (should match step 1 size)

4. **Multiple Rotations:**
   - Rotate portrait → landscape → portrait → landscape → portrait
   - Verify NO progressive shrinking occurs
   - Each orientation should look consistent

5. **Different Widths:**
   - Test at 375px, 412px, 600px, 768px, 915px, 1920px widths
   - Verify appropriate stack/side-by-side mode selection
   - Verify cellSize scales correctly

---

## Technical Details

### Layout Mode Decision Logic

**Stacking Mode (Vertical):**
- Triggered when: maxCellSizeSideBySide < 20px OR (portrait AND width < 600px)
- Uses: Tighter spacing to fit both grids vertically
- cellSize = min(40px, available_height / 20_rows)

**Side-by-Side Mode (Horizontal):**
- Triggered when: maxCellSizeSideBySide ≥ 20px AND NOT (portrait AND width < 600px)
- Uses: Standard spacing for comfortable layout
- cellSize = min(40px, available_width / 20_columns, available_height / 10_rows)

### Minimum Cell Size

- Set to 20px (down from 30px previously)
- Allows more aggressive scaling on very small screens
- 10×10 grid at 20px = 200×200px grid size

### Spacing Constants

**Standard (Side-by-Side):**
- MARGIN: 20px
- TITLE_SPACE: 30px
- GRID_SPACING: 40px

**Tighter (Stacked Portrait):**
- MARGIN: 6px
- TITLE_SPACE: 18px
- GRID_SPACING: 10px

---

## Known Limitations

1. **Very Small Screens:** Below 375×667px may still have tight fit
2. **Grid Recreation:** Orientation changes cause grid recreation (brief visual reset)
3. **No Animation:** Rotation causes instant layout change, no smooth transition

---

## Files Modified

1. `src/scenes/GameScene.js` - Lines 91-159 (calculateLayout), Lines 237-283 (handleResize)

---

## Next Steps

1. User tests rotation behaviour using Samsung Galaxy S20 Ultra emulation (412×915 / 915×412)
2. Verify no progressive shrinking over multiple rotations
3. Confirm both grids visible in landscape mode
4. If tests pass → commit changes
5. If issues remain → iterate based on new screenshots

---

**Status:** Code changes complete, awaiting user verification

