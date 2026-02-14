# Dynamic UI Resolution Analysis

**Version:** 1.0
**Date:** 2026-02-14
**Model:** Sonnet 4.5 (Kerry McGregor)
**Status:** Critical Issues Identified
**Created by:** Oak AI

---

## Executive Summary

Analysis of the Battleships & Subs codebase reveals **five critical architectural issues** preventing proper dynamic screen adaptation across mobile, tablet, and desktop devices. The application fails to respond correctly to orientation changes and viewport resizing due to hardcoded dimensions, inconsistent resize handlers, and improper Phaser scale configuration integration.

**Primary Root Cause:** Hardcoded 1100px height in `dimensions.js` combined with fragmented resize handling across scenes.

**Recommendation:** Fix existing responsive architecture rather than lock to fixed orientation. Phaser 3.90.0 fully supports dynamic orientation changes when configured correctly.

---

## Critical Issues Identified

### Issue 1: Hardcoded Fixed Height (CRITICAL)

**Location:** `src/utils/dimensions.js:15`

**Problem:**
```javascript
const fixedHeight = 1100; // Fixed height as per original logic
```

This hardcoded value completely breaks responsive design:
- Forces 1100px height regardless of device screen size
- Causes content overflow on mobile devices (typical height: 667-844px)
- Creates excessive white space on desktop (typical height: 1080-1440px)
- Prevents proper portrait/landscape adaptation

**Impact:** High - This single line prevents all responsive behaviour.

**Current Usage:** File exists but not imported by main.js (dormant bug).

**Fix Required:** Remove hardcoded height, use window.innerHeight or rely on Phaser.Scale.RESIZE mode.

---

### Issue 2: Inconsistent Resize Handlers

**Locations:**
- `src/scenes/GameScene.js:231-255` - Custom destroy/recreate logic
- `src/scenes/TitleScene.js:289-293` - Full scene restart
- `src/scenes/SettingsScene.js:288-290` - Full scene restart
- `src/scenes/HighScoresScene.js:366-368` - Full scene restart

**Problem:**

Each scene implements different resize strategies:

**GameScene** (lines 231-255):
- Destroys grid cells, graphics, labels
- Recreates layout with new dimensions
- Updates UI element positions
- Resource-intensive but maintains state

**Other Scenes** (TitleScene, Settings, HighScores):
- Call `this.scene.restart()`
- Loses all scene state
- Resets animations, user input
- Inefficient full recreation

**Impact:** Medium - Works but creates inconsistent user experience and performance issues.

**Fix Required:** Implement unified resize strategy using Phaser scale manager events.

---

### Issue 3: Phaser Scale Configuration Redundancy

**Location:** `src/main.js:26-40`

**Problem:**

```javascript
const config = {
    type: Phaser.AUTO,
    width: width,  // From calculateGameDimensions()
    height: height, // From calculateGameDimensions()
    scale: {
        mode: Phaser.Scale.RESIZE, // Auto-handles window dimensions
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};
```

**Conflict:**
- Manual width/height calculation conflicts with `Phaser.Scale.RESIZE` mode
- RESIZE mode automatically uses window dimensions
- calculateGameDimensions() is redundant
- Creates potential race conditions during initialisation

**Impact:** Low - Currently working but architecturally incorrect.

**Fix Required:** Remove manual dimension calculation, let RESIZE mode handle it.

---

### Issue 4: Orientation Change Handling

**Location:** `src/main.js:96-98`

**Problem:**

```javascript
window.addEventListener('orientationchange', () => {
    setTimeout(handleResize, 100); // Small delay for orientation change
});
```

**Issues:**
- 100ms delay arbitrary and may be insufficient
- Orientation change fires before viewport actually resizes
- Should use Phaser's built-in scale manager events instead
- May cause flicker or incorrect dimensions during transition

**Impact:** Medium - Causes delayed or incorrect resize on orientation change.

**Fix Required:** Use Phaser.Scale.Events.RESIZE instead of window orientationchange.

---

### Issue 5: Incomplete Resize Event Propagation

**Location:** `src/main.js:88-91`

**Problem:**

```javascript
const activeScene = this.game.scene.getScene('GameScene') ||
                     this.game.scene.getScene('TitleScene');
if (activeScene && activeScene.handleResize) {
    activeScene.handleResize(width, height);
}
```

**Issues:**
- Only checks GameScene and TitleScene
- Ignores SettingsScene and HighScoresScene
- Scenes without handleResize() method are silently skipped
- No fallback for unknown scenes

**Impact:** Medium - Settings and HighScores scenes don't receive resize events from main.js.

**Fix Required:** Get currently active scene dynamically, call handleResize if exists.

---

## Technical Architecture Review

### Current Phaser Scale Setup

**Configuration (main.js:38-40):**
```javascript
scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
}
```

**Analysis:**
- `Phaser.Scale.RESIZE` - Correct choice for responsive design
- Auto-resizes game canvas to match window dimensions
- Fires RESIZE events on window size changes
- Should eliminate need for manual window event listeners

**Missing:**
- No scale manager event listeners configured
- Not using Phaser's built-in responsive features
- Manual resize logic duplicates Phaser functionality

---

### Scene Resize Pattern Analysis

**GameScene Pattern (Destroy/Recreate):**

Pros:
- Guarantees correct positioning
- Clears stale graphics objects
- Recalculates all layout values

Cons:
- Resource-intensive (creates/destroys many objects)
- Potential memory leaks if destruction incomplete
- Slight flicker during resize
- Loses transient UI state

**Other Scenes Pattern (Restart):**

Pros:
- Simple implementation
- Guaranteed clean slate

Cons:
- Loses all scene state
- Resets animations mid-playthrough
- User loses progress/context
- Extremely inefficient

---

## Root Cause Summary

**Primary Cause:**
Fragmented resize handling without central coordination. Each scene independently attempts to handle resizing without using Phaser's built-in scale management system.

**Contributing Factors:**
1. No centralised resize coordinator
2. Manual window event listeners instead of Phaser events
3. Hardcoded dimension values (dimensions.js)
4. Lack of unified resize strategy across scenes
5. Redundant dimension calculations competing with Phaser.Scale.RESIZE

---

## Recommendation: Dynamic Orientation Support

### Can Phaser Handle Live Orientation Changes?

**Answer: Yes, absolutely.**

Phaser 3.90.0 includes robust scale management designed specifically for responsive games across devices and orientations.

**Evidence:**
- `Phaser.Scale.RESIZE` mode handles viewport changes automatically
- `Phaser.Scale.Events.RESIZE` event fires on any dimension change
- Scale manager calculates optimal canvas size and positioning
- Supports smooth transitions between portrait/landscape

### Why Fix Rather Than Lock Orientation?

**Reasons to maintain dynamic orientation:**

1. **User Experience:** Players expect apps to adapt to device rotation
2. **Accessibility:** Some users prefer specific orientations for comfort
3. **Market Standard:** Modern games support both orientations
4. **Future-Proofing:** Tablets, foldable devices, multi-window environments
5. **Technical Feasibility:** Phaser fully supports it when configured correctly

**Effort Required:** Low - Fix existing architecture rather than rebuild.

---

## Proposed Solution Architecture

### Phase 1: Core Scale Manager Integration

**Remove manual window listeners** (main.js:73-98):
- Delete window.addEventListener('resize')
- Delete window.addEventListener('orientationchange')
- Use Phaser.Scale.Events instead

**Implement scale manager listener** (main.js):
```javascript
this.game.scale.on(Phaser.Scale.Events.RESIZE, (gameSize, baseSize, displaySize, resolution) => {
    const currentScene = this.game.scene.getScenes(true)[0]; // Get active scene
    if (currentScene && typeof currentScene.handleResize === 'function') {
        currentScene.handleResize(gameSize.width, gameSize.height);
    }
});
```

**Remove redundant dimension calculation** (main.js:29, 63-67):
- Delete calculateGameDimensions() calls
- Let Phaser.Scale.RESIZE determine canvas size

---

### Phase 2: Unified Scene Resize Pattern

**Implement base resize strategy:**

Option A: Reposition existing elements (recommended)
- Update positions without destroy/recreate
- Faster, smoother, maintains state
- Requires careful element tracking

Option B: Smart recreation
- Only recreate elements that need dimension recalculation
- Hybrid approach for complex layouts
- Balance between performance and simplicity

**Standard handleResize() signature:**
```javascript
handleResize(width, height) {
    // 1. Recalculate layout dimensions
    // 2. Update element positions
    // 3. Refresh UI element sizes/scales
    // 4. Do NOT restart scene
}
```

---

### Phase 3: Scene-Specific Implementations

**GameScene:**
- Keep grid destroy/recreate logic (complex layout requires it)
- Optimise: Cache grid configuration, only recreate if cell size changes
- Update UI positions without recreation

**TitleScene:**
- Replace scene.restart() with element repositioning
- Recalculate button positions based on new width/height
- Update background graphics size

**SettingsScene:**
- Replace scene.restart() with slider/toggle repositioning
- Maintain slider values during resize
- Recalculate positions only

**HighScoresScene:**
- Replace scene.restart() with table repositioning
- Maintain loaded scores
- Recalculate table dimensions and row positions

---

### Phase 4: Remove Dead Code

**Delete dimensions.js:**
- File not used by main.js
- Hardcoded height causes confusion
- Violates YAGNI principle

**Clean gameConfig.js:**
- Remove calculateGameDimensions() function (lines 89-110)
- Keep GAME_CONSTANTS for grid/UI sizing
- Remove redundant gameConfig export (not used)

---

## Testing Strategy

### Manual Testing Approach

**Desktop Browser (Chrome/Safari):**
1. Launch game at 1920x1080
2. Resize window to 1024x768
3. Resize to 375x667 (mobile simulation)
4. Verify grids remain visible, UI elements reposition
5. Check all scenes (Title, Game, Settings, Scores)

**Chrome DevTools Device Simulation:**
1. Open DevTools > Device Toolbar (Ctrl+Shift+M)
2. Test devices:
   - iPhone 13 (390x844, portrait/landscape)
   - iPad Pro (1024x1366, portrait/landscape)
   - Galaxy S21 (360x800, portrait/landscape)
3. Verify touch targets (minimum 44px)
4. Check text readability at small sizes

**Physical Device Testing:**
1. iPhone 13 - Safari iOS
2. Android phone - Chrome Android
3. Chromebook - Chrome OS

**Orientation Change Testing:**
1. Start in portrait
2. Rotate to landscape mid-game
3. Verify grid recreation completes
4. Check UI repositioning correctness
5. Rotate back to portrait
6. Verify state preservation where applicable

---

### Automated Testing with Playwright

**Setup:**
```bash
npm install -D @playwright/test
```

**Test Suite Structure:**
```
tests/
├── responsive/
│   ├── orientation.spec.js
│   ├── viewport-resize.spec.js
│   └── scene-transitions.spec.js
└── playwright.config.js
```

**Sample Test (orientation.spec.js):**
```javascript
test('GameScene adapts to orientation change', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.setViewportSize({ width: 390, height: 844 }); // Portrait

    await page.click('text=START GAME');
    await page.waitForTimeout(500);

    // Verify portrait layout
    const playerGrid = await page.locator('canvas').boundingBox();
    expect(playerGrid).toBeTruthy();

    // Rotate to landscape
    await page.setViewportSize({ width: 844, height: 390 });
    await page.waitForTimeout(500);

    // Verify landscape layout
    const gridAfterRotate = await page.locator('canvas').boundingBox();
    expect(gridAfterRotate).toBeTruthy();
    expect(gridAfterRotate.width).toBeGreaterThan(player Grid.width);
});
```

**Coverage Goals:**
- Viewport sizes: 375px to 1920px width
- Orientations: portrait and landscape
- All four scenes: Title, Game, Settings, HighScores
- Scene transitions during resize events

---

## Browser Automation Recommendation

**Automated Iteration Testing:**

Problem: Manual browser refresh and inspection is slow for rapid iteration.

**Solution: Playwright in Watch Mode**

**Setup (package.json):**
```json
{
  "scripts": {
    "test:watch": "playwright test --ui",
    "test:responsive": "playwright test tests/responsive --headed",
    "serve": "python3 -m http.server 8080"
  }
}
```

**Workflow:**
1. Run `npm run serve` (start local server)
2. Run `npm run test:watch` in second terminal
3. Make code changes
4. Playwright automatically reruns tests
5. View results in real-time UI

**Benefits:**
- See visual feedback of layout changes
- Catch regressions immediately
- Test multiple viewports simultaneously
- Generate screenshots for comparison

---

## Development Environment Recommendation

### VS Code Setup (Recommended)

**Extensions:**
- Live Server (ritwickdey.liveserver) - Auto-reload on file changes
- Debugger for Chrome - Breakpoint debugging in browser
- Playwright Test for VSCode - Integrated test runner

**Workflow:**
1. Open project in VS Code
2. Right-click index.html > "Open with Live Server"
3. Browser opens at http://localhost:5500
4. Auto-reloads on file save
5. No manual server management required

**Advantages over command-line server:**
- Automatic reload on save
- Integrated debugging
- Port conflict handling
- Better CORS support

---

### Direct Launch Feasibility

**Question:** Can we launch without local server?

**Answer:** No, not recommended.

**Reason:**
- ES6 modules require HTTP server (CORS restrictions)
- File:// protocol blocks module imports
- Modern browsers enforce strict security for local files
- localStorage may not persist correctly

**Minimum Requirement:** Local HTTP server (Live Server, Python http.server, Node http-server, etc.)

---

## Cost Optimisation Analysis

### Model Selection for Implementation

**Sonnet 4.5 (Current Model):**
- Unlimited usage under Claude Code Pro
- Highly capable for all identified fixes
- Fast iteration cycles
- Zero incremental cost

**Opus 4.5:**
- Not available in current Claude Code Pro plan
- Would cost 5x more if accessible
- Unnecessary for these issues

**Haiku:**
- Available but less capable
- Suitable only for simple refactoring
- Not recommended for architectural fixes

**Recommendation:** Continue with Sonnet 4.5 for all implementation work.

---

### Token Budget Estimate

**Analysis Phase (Complete):** ~70k tokens

**Implementation Phase (Estimated):**
- Fix main.js scale integration: 20k tokens
- Refactor scene resize handlers: 40k tokens (10k per scene)
- Remove dead code: 10k tokens
- Testing and iteration: 30k tokens
- Documentation updates: 10k tokens

**Total Estimated:** 110k tokens

**Claude Code Pro Impact:** Zero additional cost (unlimited Sonnet).

---

## Interface Recommendation

### Browser vs Command-Line Claude Code

**Command-Line Interface (Current):**

Pros:
- Direct file system access
- Fast tool execution
- Git integration
- Terminal commands available

Cons:
- No visual preview
- Manual browser refresh required for testing
- Text-only feedback

**Browser Interface (claude.ai):**

Pros:
- Visual diff previews
- Inline code highlighting
- Conversation UI

Cons:
- Manual file copy/paste required
- No direct git operations
- Slower iteration

**Recommendation:** Continue with command-line Claude Code for this project.

**Rationale:**
- Git workflow integration essential
- Direct file manipulation faster
- Testing requires separate browser anyway
- Playwright automation provides visual feedback

---

## Configuration Review

### Claude.md Changes Required

**Current Line Count:** 313 lines (under 400 limit)

**Additions Needed:**
1. Reference to this analysis document
2. Update "Current Blocker" status
3. Add resize architecture decision to Design Decisions Log
4. Update Known Issues section

**Estimated Final Line Count:** ~330 lines (still under limit)

---

### Core File Changes Required

**Files to Modify:**
1. `src/main.js` - Scale manager integration
2. `src/scenes/GameScene.js` - Optimise resize handler
3. `src/scenes/TitleScene.js` - Replace scene.restart()
4. `src/scenes/SettingsScene.js` - Replace scene.restart()
5. `src/scenes/HighScoresScene.js` - Replace scene.restart()

**Files to Delete:**
1. `src/utils/dimensions.js` - Dead code with hardcoded height

**Files to Create:**
1. `tests/responsive/orientation.spec.js` - Playwright tests
2. `tests/responsive/viewport-resize.spec.js`
3. `tests/responsive/scene-transitions.spec.js`
4. `playwright.config.js` - Test configuration

**Estimated LOC Changes:**
- Added: ~300 lines (tests + refactored resize logic)
- Removed: ~150 lines (dead code + inefficient patterns)
- Modified: ~200 lines (scale integration + repositioning)

**Net Change:** +350 lines (primarily test coverage)

---

## Implementation Priority

### Critical Path (Must Fix)

1. **Remove hardcoded height** (dimensions.js) - 5 minutes
2. **Integrate Phaser scale events** (main.js) - 15 minutes
3. **Fix GameScene resize** (optimise grid recreation) - 30 minutes
4. **Replace scene.restart()** (3 scenes) - 45 minutes

**Total Critical Path:** ~95 minutes of focused coding

---

### Enhancement Path (Should Fix)

1. **Implement Playwright tests** - 2 hours
2. **Add VS Code configuration** - 15 minutes
3. **Create resize documentation** - 30 minutes
4. **Optimise grid recreation logic** - 1 hour

**Total Enhancement:** ~4 hours

---

### Optional Path (Nice to Have)

1. **Add orientation lock option** (settings toggle) - 1 hour
2. **Implement resize debouncing** (performance optimisation) - 30 minutes
3. **Add visual resize indicators** (UX improvement) - 1 hour

**Total Optional:** ~2.5 hours

---

## Risk Assessment

### Implementation Risks

**Risk 1: Grid Recreation Performance**
- Severity: Medium
- Likelihood: Medium
- Mitigation: Implement object pooling, only recreate on size threshold change

**Risk 2: State Loss During Resize**
- Severity: Low
- Likelihood: Low (with proper implementation)
- Mitigation: Preserve game state separately from visual elements

**Risk 3: Browser Compatibility**
- Severity: Low
- Likelihood: Low
- Mitigation: Phaser handles cross-browser differences, test on Chrome/Safari

**Risk 4: Regression Introduction**
- Severity: Medium
- Likelihood: Medium
- Mitigation: Comprehensive Playwright test suite before deployment

---

## Success Criteria

### Functional Requirements

- [ ] Game launches without console errors
- [ ] All scenes render correctly at 375x667 (mobile portrait)
- [ ] All scenes render correctly at 844x390 (mobile landscape)
- [ ] All scenes render correctly at 1920x1080 (desktop)
- [ ] Smooth transition between orientations without flicker
- [ ] Grid remains fully visible and interactive after resize
- [ ] UI elements reposition without overlap or cutoff
- [ ] Settings persist through orientation changes
- [ ] High scores remain displayed during resize

### Performance Requirements

- [ ] Resize completes within 500ms
- [ ] No memory leaks after 10 resize cycles
- [ ] Frame rate remains above 30fps during resize animation
- [ ] Touch targets remain minimum 44px on mobile

### Quality Requirements

- [ ] Zero hardcoded dimension values
- [ ] All scenes use unified resize pattern
- [ ] Playwright tests achieve 80% coverage of resize scenarios
- [ ] Code passes DRY, SOLID, KISS principles review

---

## Next Steps

**Immediate Actions:**

1. Present this analysis to project owner (JH)
2. Obtain approval for proposed solution architecture
3. Proceed with Critical Path implementation
4. Set up Playwright testing framework
5. Implement fixes with test-driven approach

**Timeline Estimate:**

- Analysis presentation: Immediate
- Approval and planning: 30 minutes
- Critical path implementation: 2 hours
- Testing and verification: 2 hours
- Documentation and commit: 1 hour

**Total Delivery Time:** ~5-6 hours of focused work

---

## Conclusion

The Battleships & Subs responsive design failures stem from architectural inconsistencies rather than Phaser framework limitations. All identified issues are fixable without major refactoring.

**Key Findings:**
- Phaser 3.90.0 fully supports dynamic orientation changes
- Hardcoded dimensions.js height is primary blocker
- Scene resize handlers lack consistency
- Manual window listeners conflict with Phaser scale manager

**Recommended Approach:**
- Fix existing responsive architecture
- Integrate Phaser's built-in scale management
- Implement unified resize pattern across scenes
- Add Playwright test coverage for regression prevention

**Estimated Effort:** 5-6 hours for full resolution including testing.

**Cost Impact:** Zero incremental cost under Claude Code Pro (unlimited Sonnet 4.5).

---

**Document Status:** Complete
**Next Action:** Await approval to proceed with implementation

---

End of Dynamic UI Resolution Analysis
