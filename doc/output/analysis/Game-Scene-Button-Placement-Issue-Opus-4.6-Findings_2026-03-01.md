

I'll investigate the GameScene layout, button placement, and responsive design issues thoroughly. Let me start by examining the key files.

Created 5 todos

Read [](file:///d%3A/DEV/JH/battleships-and-subs/src/scenes/GameScene.js#1-1), lines 1 to 100

Read [](file:///d%3A/DEV/JH/battleships-and-subs/src/config/gameConfig.js#1-1), lines 1 to 100

Read [](file:///d%3A/DEV/JH/battleships-and-subs/src/config/gameConfig.js#100-100), lines 100 to 146

Read [](file:///d%3A/DEV/JH/battleships-and-subs/src/scenes/GameScene.js#100-100), lines 100 to 300

Searched for files matching `**/dimensions*`, no matches

Read [](file:///d%3A/DEV/JH/battleships-and-subs/src/scenes/GameScene.js#300-300), lines 300 to 550

Read [](file:///d%3A/DEV/JH/battleships-and-subs/src/scenes/GameScene.js#550-550), lines 550 to 750

Now let me look at the resize handler and how buttons are repositioned:

Searched for regex `resize|handleResize` (`**/src/scenes/GameScene.js`), 14 results

Read [](file:///d%3A/DEV/JH/battleships-and-subs/src/scenes/GameScene.js#2089-2089), lines 2089 to 2183

Now let me look at the ship status panel (bottom area) and the Grid.js component to understand the full layout:

Read [](file:///d%3A/DEV/JH/battleships-and-subs/src/scenes/GameScene.js#744-744), lines 744 to 950

Read [](file:///d%3A/DEV/JH/battleships-and-subs/src/components/Grid.js)

Starting: *Review existing test resolutions* (4/5)

Now let me review the existing test resolutions and examine the test files:

Review test resolutions used

Searched for text `width|height|viewport|resolution|setViewportSize|screen` (`**/tests/automated/**`), 200 results

Searched for text `width|height|viewport|resolution|setViewportSize|screen` (`**/tests/ui/**`), 104 results

Searched for text `width|height|viewport|setViewportSize` (`**/tests/automated/all-scenes-visual.test.js`), 28 results

Searched for text `width|height|viewport|setViewportSize` (`**/tests/automated/game-scene-layout.test.js`), 46 results

Searched for text `width|height|viewport|setViewportSize` (`**/tests/automated/highscores-scene-layout.test.js`), 71 results

Searched for text `width|height|viewport|setViewportSize` (`**/tests/automated/help-scene-test.js`), 3 results

Searched for text `width|height|viewport|setViewportSize` (`**/tests/automated/pixel7-debug.test.js`), 8 results

Searched for text `width|height|viewport|setViewportSize` (`**/tests/automated/quick-ship-test.js`), 9 results

Searched for text `width|height|viewport|setViewportSize` (`**/tests/automated/debug-ship-orientation.test.js`), 9 results

Searched for regex `SONAR|NUKE|FIRE|sonar|nuke|fire|button` (`**/tests/automated/**`), 11 results

Searched for regex `SONAR|NUKE|FIRE|sonar|nuke|fire|button` (`**/tests/ui/**`), 12 results

Searched for text `width|height|viewport|setViewportSize` (`**/tests/settings-week5.test.js`), no results

Now let me carefully understand the exact button positioning math and identify the problem:

Read [](file:///d%3A/DEV/JH/battleships-and-subs/src/scenes/GameScene.js#438-438), lines 438 to 575

Now let me understand exactly what space is available between the grids. Let me trace through the math for a few key viewports:

Read [](file:///d%3A/DEV/JH/battleships-and-subs/src/scenes/GameScene.js#340-340), lines 340 to 420

Now I have a very clear picture. Let me do the math analysis and compile findings.

Starting: *Analyze layout issues & report* (5/5)

Let me also check the `GRID_SPACING` constant used in landscape mode — it's 100px, which is the gap between the two grids side-by-side:

Read [](file:///d%3A/DEV/JH/battleships-and-subs/src/scenes/GameScene.js#650-650), lines 650 to 745

Completed: *Analyze layout issues & report* (5/5)

Here are my findings:

---

## Investigation Report: GameScene Button Placement

### The 3 Buttons
- **SONAR** (44px tall) — cyan border
- **NUKE** (44px tall) — magenta border  
- **FIRE** (50px tall) — red border

They are stacked vertically: SONAR → NUKE → FIRE, with 12px gap between SONAR/NUKE and 14px gap between NUKE/FIRE. **Total vertical footprint: ~170px.**

### Root Cause of the Problem

Both `createAbilityButtons()` and `createFireButton()` share identical positioning logic that tries to place buttons "between the two grids." The problem is different in each mode:

#### **PORTRAIT (stacked grids) — THE MAIN PROBLEM**

The gap between grids is calculated as: `gridSpacing + titleH`. Looking at the adaptive spacing tiers:

| Available height | `gridSpacing` | `titleH` | **Total gap** | Buttons fit? |
|---|---|---|---|---|
| < 380px | 8px | 13px | **21px** | **NO** (need ~170px) |
| 380–460px | 12px | 15px | **27px** | **NO** |
| 460–700px | 18px | 18px | **36px** | **NO** |
| 700px+ | 30px | 24px | **54px** | **NO** |

**The gap between grids is 21–54px, but the 3 buttons need ~170px.** The buttons are centered at the midpoint of this tiny gap, so they overflow in both directions — overlapping the player grid's labels on top and the enemy grid's title/cells on the bottom.

The `labelSpace` (18–35px) sits below each grid (for A-J / 1-10 coordinate labels), and the `titleH` (13–24px) sits above each grid (for "YOUR FLEET" / "ENEMY WATERS" text). The buttons are placed right in between, guaranteed to overlap.

#### **LANDSCAPE (side-by-side grids)**

The gap between grids is `GRID_SPACING = 100px`. Buttons are 90–110px wide and placed centered horizontally. Width-wise they fit, but **vertically** the 3 buttons span ~170px centered at `playerY + gridWidth/2`. On small landscape screens (e.g. 667×375 iPhone SE landscape), the grid area is short, and the button stack can overflow below the grid bottom edge.

#### **Key insight: `createFireButton()` chains off `nukeBtn.y`**

The FIRE button positions itself relative to the NUKE button's Y position ([line 681](src/scenes/GameScene.js#L681)): `const fireY = nukeY + (buttonHeight / 2) + 14`. This means if SONAR/NUKE overflow, FIRE overflows even more. The three buttons form a rigid vertical stack with no adaptation to available space.

### Additional Issues Found

1. **No `gridSpacing` returned in landscape layout** — the layout return object doesn't include `gridSpacing` for landscape, so `GRID_SPACING` (100px) is baked into `calculateLayout` but not accessible to button code. The button code re-derives the gap from grid positions instead.

2. **Grid labels (A-J, 1-10) use hardcoded 18px font and 15px offset** in Grid.js — these don't scale with cell size, which could cause overlap on very small cells.

3. **`labelSpace` in portrait is the gap below the grid for labels**, but the actual Grid.js labels are placed at `yOffset + gridHeight + 15` — a fixed 15px regardless of `labelSpace`. So there's a mismatch between reserved space and actual label position.

### Test Coverage Gaps

**No test currently validates button positions.** The `game-scene-layout.test.js` only takes screenshots — no assertion checks for button overlap or off-screen placement.

**Missing critical test viewports:**
- Very small landscape phones (e.g. 667×375 iPhone SE landscape) — tests exist but don't check buttons
- Fold phones (e.g. Galaxy Z Flip: 412×690 folded)
- Short landscape tablets (e.g. 1024×600 budget Android tablets)

The existing 35 viewports are comprehensive for screenshots but have zero button-specific assertions.

### Proposed Fix Strategy

The fundamental problem is that **3 vertically-stacked buttons cannot fit in a 21–54px gap**. The fix needs to rethink where the buttons go rather than trying to squeeze them into the inter-grid gap. Options:

1. **Portrait: Move buttons to a horizontal row below the bottom grid** (above the ship status bar). This avoids the inter-grid gap entirely. Three buttons side-by-side at ~60px width each + gaps easily fit in 375px+ screen widths.

2. **Landscape: Keep buttons between grids** (100px gap is workable), but make them smaller and arrange horizontally if vertical space is tight.

3. **Adaptive layout**: In portrait, arrange horizontally; in landscape, arrange vertically between grids. Shrink button dimensions to always fit.

---

**Shall I proceed with implementing the fix?** My preferred approach is option 3 (fully adaptive) — portrait gets a horizontal button row below the enemy grid; landscape keeps the vertical stack between grids but with size clamping to prevent overflow. I'll also add proper bounds checking so buttons never overlap grids or go off-screen.