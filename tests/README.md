# Test Infrastructure

This directory contains automated and manual testing scripts for the Battleships and Subs game.

## Automated Tests (`automated/`)

### game-scene-layout.test.js
**Purpose:** Test GameScene responsive layout across multiple viewport sizes

**What it tests:**
- Grid positioning (side-by-side vs stacked)
- Cell size scaling
- Status text adaptive sizing
- UI element positioning (BACK button, titles, labels)
- Layout behavior across 11 viewports:
  - iPhone 14 Pro Max (portrait & landscape)
  - Galaxy S20 Ultra (portrait & landscape)
  - iPhone SE (portrait & landscape)
  - Mid-width portrait (500px & 600px) - for text overflow testing
  - iPad (portrait & landscape)
  - Desktop (1920×1080)

**How to run:**
```bash
node tests/automated/game-scene-layout.test.js
```

**Output:** Screenshots in `screenshots/AUTOMATED-TESTS/`

**Speed:** ~30 seconds for all 11 viewports

**Why this test exists:** Enables rapid iteration on responsive layout fixes without manual testing. User feedback: "I think you need to be able to load and see / test the screen yourself. Me telling you all the time is what causes the bad code I think."

---

### all-scenes-visual.test.js
**Purpose:** Visual regression testing for all game scenes (Title, Game, Settings, High Scores)

**What it tests:**
- Scene loading and rendering
- Button visibility and positioning
- Text element presence
- Layout across 4 viewports:
  - Mobile portrait (375×667)
  - Mobile landscape (667×375)
  - Tablet portrait (768×1024)
  - Desktop (1920×1080)

**How to run:**
```bash
node tests/automated/all-scenes-visual.test.js
```

**Output:** Screenshots in `screenshots/`

**Speed:** ~45 seconds for all scenes × 4 viewports

**Status:** Currently has timeout issues - needs investigation

---

## Test Strategy

### Automated Testing Priorities
1. **GameScene layout** (highest priority) - most complex responsive logic
2. **All scenes visual** (medium priority) - catch regressions across all scenes
3. **Unit tests** (planned for Week 8) - FleetManager, Ship, gridValidation

### Manual Testing Checklist
- [ ] Chrome DevTools device rotation
- [ ] Manual browser resize (drag smaller → bigger → smaller → square → landscape)
- [ ] Touch interactions on real mobile devices
- [ ] Keyboard shortcuts (ESC, R)
- [ ] localStorage persistence

---

## Adding New Tests

When adding new test scripts:

1. Place in `tests/automated/` directory
2. Use descriptive naming: `<feature>-<aspect>.test.js`
3. Document in this README
4. Include viewport sizes being tested
5. Specify screenshot output directory

---

## Dependencies

- **Playwright** (installed via npm)
- **HTTP Server** (Python or Node.js) running on port 5500

---

**Last Updated:** 2026-02-15
**Current Test Count:** 2 automated scripts
**Total Viewports Covered:** 11 (GameScene) + 4 (All Scenes) = 15
