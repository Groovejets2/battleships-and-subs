# Testing Strategy

**Version:** 1.0
**Date:** 2026-02-14
**Model:** Sonnet 4.5 (Kerry McGregor)
**Status:** Ready for Implementation
**Created by:** Oak AI

---

## Overview

This document specifies the testing strategy for Battleships & Subs, targeting **30-40% automated test coverage** with comprehensive manual testing across browsers and devices.

**Testing Philosophy:**
- Automated tests for regression prevention
- Manual testing for user experience validation
- Zero-cost tooling (Playwright, Jest, Chrome DevTools)
- Continuous testing during development

---

## Test Coverage Goals

### Automated Testing (30-40% Coverage)

**Unit Tests (Jest):** 20% coverage
- Combat mechanics (hit/miss/sunk logic)
- Fleet placement validation
- Ship damage tracking
- AI decision algorithms

**Integration Tests (Playwright):** 15-20% coverage
- Responsive design (orientation changes, viewport resizing)
- Scene transitions
- Settings persistence
- High scores functionality

**Total Automated:** 35-40% of codebase

---

### Manual Testing (60-70% Coverage)

**User Experience:**
- Gameplay flow (setup → combat → victory/defeat)
- UI responsiveness and touch targets
- Audio quality and timing
- Visual effects and animations

**Cross-Browser:**
- Chrome (desktop and mobile)
- Safari (desktop and iOS)

**Cross-Device:**
- Desktop (1920x1080, 1024x768)
- iPhone 13 (390x844)
- Android phones (360x800, 412x915)
- Chromebooks (1366x768)

---

## Testing Tools

### Automated Testing Stack

**Playwright** (Free, Open Source)
- **Purpose:** Browser automation, responsive testing
- **Coverage:** Viewport resizing, orientation changes, UI interactions
- **Setup:** `npm install -D @playwright/test`
- **Run:** `npx playwright test`

**Jest** (Free, Open Source)
- **Purpose:** Unit testing JavaScript functions
- **Coverage:** Game logic, validation algorithms
- **Setup:** `npm install -D jest`
- **Run:** `npm test`

**GitHub Actions** (Free Tier)
- **Purpose:** CI/CD pipeline
- **Coverage:** Auto-run tests on every commit
- **Setup:** `.github/workflows/test.yml`

---

### Manual Testing Tools

**Chrome DevTools Device Simulation** (Free, Built-in)
- **Purpose:** Simulate mobile devices, test responsive design
- **Usage:** F12 → Toggle Device Toolbar (Ctrl+Shift+M)
- **Devices to Test:**
  - iPhone 13 (390x844)
  - iPad Pro (1024x1366)
  - Galaxy S21 (360x800)
- **Orientations:** Portrait and landscape

**BrowserStack** (Optional, Free Tier)
- **Purpose:** Real device testing
- **Usage:** Limited free minutes for real iOS/Android devices
- **Recommendation:** Use only for final pre-release validation

**Physical Devices** (Owned)
- iPhone 13
- Various Android phones
- Acer and Lenovo Chromebooks

---

## Test Specification

### Unit Tests (Jest)

**Location:** `src/**/*.test.js` (co-located with source files)

**Test Suite Structure:**

```javascript
// src/models/Ship.test.js
describe('Ship Model', () => {
    test('should create ship with correct length', () => {});
    test('should track hits correctly', () => {});
    test('should report sunk when all positions hit', () => {});
    test('should calculate remaining health', () => {});
});

// src/managers/FleetManager.test.js
describe('Fleet Manager', () => {
    test('should validate ship placement within bounds', () => {});
    test('should prevent overlapping ships', () => {});
    test('should enforce 1-square spacing rule', () => {});
    test('should detect hit on occupied square', () => {});
    test('should detect miss on empty square', () => {});
});

// src/utils/gridValidation.test.js
describe('Grid Validation', () => {
    test('should validate coordinates in range', () => {});
    test('should check adjacency including diagonals', () => {});
    test('should detect out-of-bounds placement', () => {});
});
```

**Coverage Target:** All game logic functions (combat, validation, AI)

---

### Integration Tests (Playwright)

**Location:** `tests/` directory

**Test Suite Structure:**

```
tests/
├── responsive/
│   ├── orientation.spec.js
│   ├── viewport-resize.spec.js
│   └── scene-transitions.spec.js
├── gameplay/
│   ├── ship-placement.spec.js
│   ├── combat.spec.js
│   └── victory-conditions.spec.js
└── persistence/
    ├── settings.spec.js
    └── high-scores.spec.js
```

**Sample Test (orientation.spec.js):**

```javascript
const { test, expect } = require('@playwright/test');

test.describe('Responsive Design - Orientation Changes', () => {
    test('GameScene adapts from portrait to landscape', async ({ page }) => {
        await page.goto('http://localhost:8080');

        // Start in portrait
        await page.setViewportSize({ width: 390, height: 844 });
        await page.click('text=START GAME');
        await page.waitForTimeout(500);

        // Verify portrait layout (grids stacked)
        const canvas = await page.locator('canvas');
        expect(canvas).toBeVisible();

        // Rotate to landscape
        await page.setViewportSize({ width: 844, height: 390 });
        await page.waitForTimeout(500);

        // Verify landscape layout (grids side-by-side)
        const canvasAfter = await page.locator('canvas');
        expect(canvasAfter).toBeVisible();
    });

    test('TitleScene buttons remain accessible after rotation', async ({ page }) => {
        await page.goto('http://localhost:8080');
        await page.setViewportSize({ width: 390, height: 844 });

        // Verify buttons visible in portrait
        await expect(page.locator('text=START GAME')).toBeVisible();

        // Rotate
        await page.setViewportSize({ width: 844, height: 390 });

        // Verify buttons still visible
        await expect(page.locator('text=START GAME')).toBeVisible();
    });
});

test.describe('Responsive Design - Viewport Resizing', () => {
    const viewports = [
        { width: 375, height: 667, name: 'iPhone SE' },
        { width: 390, height: 844, name: 'iPhone 13' },
        { width: 412, height: 915, name: 'Galaxy S21' },
        { width: 1024, height: 768, name: 'iPad Landscape' },
        { width: 1920, height: 1080, name: 'Desktop FHD' }
    ];

    viewports.forEach(viewport => {
        test(`GameScene renders correctly at ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            await page.goto('http://localhost:8080');
            await page.click('text=START GAME');

            // Verify canvas exists and is sized appropriately
            const canvas = await page.locator('canvas');
            expect(canvas).toBeVisible();

            const box = await canvas.boundingBox();
            expect(box.width).toBeLessThanOrEqual(viewport.width);
            expect(box.height).toBeLessThanOrEqual(viewport.height);
        });
    });
});
```

---

## Manual Testing Checklist

### Pre-Release Testing Checklist

**Responsive Design:**
- [ ] Desktop 1920x1080 - all scenes render correctly
- [ ] Desktop 1024x768 - all scenes render correctly
- [ ] iPad 1024x1366 portrait - grids stack, UI accessible
- [ ] iPad 1366x1024 landscape - grids side-by-side
- [ ] iPhone 13 390x844 portrait - grids stack, touch targets ≥44px
- [ ] iPhone 13 844x390 landscape - grids side-by-side
- [ ] Android 360x800 portrait - content fits without cutoff
- [ ] Chromebook 1366x768 - optimal layout
- [ ] Orientation change portrait→landscape smooth transition
- [ ] Orientation change landscape→portrait smooth transition
- [ ] Browser window resize live updates layout

**Gameplay Flow:**
- [ ] Title screen loads without errors
- [ ] Start Game transitions to GameScene
- [ ] Settings opens and allows changes
- [ ] High Scores displays correctly
- [ ] Ship placement validates spacing rules
- [ ] All 5 ships can be placed legally
- [ ] Invalid placements show error feedback
- [ ] Attack registers hits correctly
- [ ] Attack registers misses correctly
- [ ] Ship sinks when all positions hit
- [ ] Victory condition triggers correctly
- [ ] Defeat condition triggers correctly
- [ ] Game can be restarted after completion

**AI Behaviour:**
- [ ] AI makes legal moves
- [ ] AI difficulty Easy - random shots
- [ ] AI difficulty Normal - hunt after hit
- [ ] AI difficulty Hard - strategic targeting
- [ ] AI turn timing feels natural (not instant)

**Settings & Persistence:**
- [ ] Master volume slider works
- [ ] SFX volume slider works
- [ ] Music volume slider works
- [ ] Visual effects toggle works
- [ ] Settings persist after page reload
- [ ] High scores persist after page reload
- [ ] High scores sort correctly

**Audio:**
- [ ] Background music loops correctly
- [ ] Hit sound plays on successful attack
- [ ] Miss sound plays on failed attack
- [ ] Explosion sound plays on ship sunk
- [ ] UI click sounds play
- [ ] Audio settings affect volume correctly
- [ ] No audio glitches or stuttering

**Performance:**
- [ ] Page load < 3 seconds
- [ ] Frame rate stable (30+ fps on mobile, 60fps on desktop)
- [ ] No memory leaks after 10+ game rounds
- [ ] Battery usage acceptable on mobile
- [ ] Touch inputs responsive (<100ms delay)

**Cross-Browser:**
- [ ] Chrome desktop - fully functional
- [ ] Chrome Android - fully functional
- [ ] Safari desktop - fully functional
- [ ] Safari iOS - fully functional

**Error Handling:**
- [ ] No console errors on page load
- [ ] No console errors during gameplay
- [ ] Graceful handling of localStorage quota exceeded
- [ ] Graceful handling of missing audio files

---

## Test Automation Setup

### Playwright Configuration

**File:** `playwright.config.js`

```javascript
module.exports = {
    testDir: './tests',
    timeout: 30000,
    retries: 2,
    use: {
        baseURL: 'http://localhost:8080',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
            },
        },
        {
            name: 'mobile-chrome',
            use: {
                ...devices['Pixel 5'],
            },
        },
        {
            name: 'mobile-safari',
            use: {
                ...devices['iPhone 13'],
            },
        },
        {
            name: 'tablet',
            use: {
                ...devices['iPad Pro'],
            },
        },
    ],
    webServer: {
        command: 'python3 -m http.server 8080',
        port: 8080,
        reuseExistingServer: true,
    },
};
```

---

### Jest Configuration

**File:** `jest.config.js`

```javascript
module.exports = {
    testEnvironment: 'jsdom',
    testMatch: ['**/*.test.js'],
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/**/*.test.js',
        '!src/main.js',
    ],
    coverageThreshold: {
        global: {
            statements: 30,
            branches: 25,
            functions: 30,
            lines: 30,
        },
    },
};
```

---

### GitHub Actions CI/CD

**File:** `.github/workflows/test.yml`

```yaml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Install dependencies
      run: npm install

    - name: Run unit tests
      run: npm test

    - name: Install Playwright
      run: npx playwright install --with-deps

    - name: Run Playwright tests
      run: npx playwright test

    - name: Upload test results
      if: failure()
      uses: actions/upload-artifact@v3
      with:
        name: test-results
        path: test-results/
```

---

## Testing Workflow

### During Development

**Test-Driven Development (TDD):**
1. Write failing test for new feature
2. Implement feature until test passes
3. Refactor code while keeping tests green
4. Repeat

**Continuous Testing:**
- Run unit tests after each file change: `npm test --watch`
- Run Playwright tests after each scene modification
- Check browser console for errors during manual testing

---

### Pre-Commit Checklist

- [ ] All unit tests passing
- [ ] No console errors in browser
- [ ] Manual smoke test on primary device
- [ ] Code follows style guidelines
- [ ] JSDoc comments added

---

### Pre-Release Checklist

- [ ] Full automated test suite passing
- [ ] Manual testing checklist 100% complete
- [ ] Cross-browser testing complete
- [ ] Cross-device testing complete
- [ ] Performance benchmarks met
- [ ] No P0 or P1 bugs outstanding
- [ ] User acceptance testing by JH passed

---

## Bug Tracking

### Priority Levels

**P0 - Critical:**
- Game-breaking bugs
- Data loss issues
- Security vulnerabilities
- **SLA:** Fix immediately

**P1 - High:**
- Major functionality broken
- Significant UX issues
- Performance problems
- **SLA:** Fix within 24 hours

**P2 - Medium:**
- Minor functionality issues
- Visual glitches
- Edge case bugs
- **SLA:** Fix before release

**P3 - Low:**
- Nice-to-have improvements
- Minor polish items
- **SLA:** Backlog for v1.1

---

### Bug Report Template

```markdown
## Bug Report

**Title:** [Brief description]

**Priority:** P0 / P1 / P2 / P3

**Environment:**
- Browser: Chrome 120.0
- Device: iPhone 13
- OS: iOS 17.2
- Viewport: 390x844 portrait

**Steps to Reproduce:**
1. Navigate to...
2. Click on...
3. Observe...

**Expected Behaviour:**
[What should happen]

**Actual Behaviour:**
[What actually happens]

**Screenshots/Video:**
[Attach if applicable]

**Console Errors:**
[Paste any errors from browser console]

**Frequency:**
Always / Sometimes / Rare

**Workaround:**
[If known]
```

---

## Test Metrics

### Success Criteria

**Automated Tests:**
- Unit test coverage: ≥30%
- Integration test coverage: ≥15%
- All tests passing before release
- No flaky tests (>95% pass rate)

**Manual Tests:**
- 100% of checklist items validated
- Zero P0 bugs
- Zero P1 bugs
- <5 P2 bugs acceptable for v1.0

**Performance:**
- Load time <3s on 4G connection
- Frame rate ≥30fps on iPhone 13
- Frame rate ≥60fps on desktop
- Memory usage <100MB after 30 minutes

**Quality:**
- Zero console errors on supported browsers
- All touch targets ≥44px
- All text readable at minimum viewport
- No layout breaks at any supported viewport size

---

## Conclusion

This testing strategy balances **automation efficiency** with **manual validation**, achieving 30-40% test coverage target with zero-cost tooling.

**Key Approaches:**
- Playwright for responsive design regression prevention
- Jest for game logic unit testing
- Comprehensive manual checklist for UX validation
- Physical device testing for real-world verification

**Timeline Integration:**
- Playwright setup: 2 hours (Day 1)
- Unit test creation: Concurrent with feature development
- Manual testing: Daily smoke tests, comprehensive pre-release
- Total testing time: ~12 hours across project

**Next Action:** Set up Playwright framework after responsive design fixes implemented

---

**Document Status:** Complete
**Ready for Implementation:** Yes

---

End of Testing Strategy
