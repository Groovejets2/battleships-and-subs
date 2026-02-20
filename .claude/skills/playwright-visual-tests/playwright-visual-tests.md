# Playwright Visual Tests Skill

**Version:** 1.0.0
**Created:** 2026-02-20
**Project:** Battleships and Subs
**Purpose:** Execute and manage Playwright-based visual regression tests

---

## CRITICAL: Test Execution Method

### ⚠️ COMMON ERROR - DO NOT MAKE THIS MISTAKE

**WRONG:** ❌
```bash
npx playwright test
npx playwright test tests/automated/
```

**This will fail with:** `Error: No tests found` or browser launch errors

**Reason:** These are **standalone Node.js scripts** using Playwright library, NOT Playwright Test framework tests.

---

### ✅ CORRECT EXECUTION METHOD

**Run individual test:**
```bash
node tests/automated/title-scene-layout.test.js
```

**Run all tests (manual loop):**
```bash
for file in tests/automated/*.test.js; do node "$file"; done
```

**Windows PowerShell:**
```powershell
Get-ChildItem tests\automated\*.test.js | ForEach-Object { node $_.FullName }
```

---

## Test File Structure

### Location
```
tests/automated/
├── all-scenes-visual.test.js
├── game-scene-layout.test.js
├── highscores-scene-layout.test.js
├── pixel7-debug.test.js
├── resize-drag-test.test.js
├── scene-navigation-resize-test.test.js
├── settings-resize-test.test.js
└── title-scene-layout.test.js
```

### Test Pattern

Each test file:
1. Imports Playwright using `require('@playwright/test')`
2. Defines an async function (e.g., `testTitleScene()`)
3. Launches browser with `chromium.launch()`
4. Navigates to game on **port 5500** (VS Code Live Server)
5. Takes screenshots across multiple viewports
6. Calls the function at the end: `testTitleScene().catch(console.error)`

**Example structure:**
```javascript
const { chromium } = require('@playwright/test');

async function testTitleScene() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Test logic here
    await page.goto('http://127.0.0.1:5500/index.html');

    await browser.close();
}

testTitleScene().catch(console.error);
```

---

## Prerequisites

### 1. Chromium Browser Installed
```bash
npx playwright install chromium
```

### 2. Development Server Running on Port 5500

**Option A: VS Code Live Server Extension**
- Install "Live Server" extension in VS Code
- Right-click `index.html` → "Open with Live Server"
- Default port: 5500

**Option B: Manual HTTP Server (if tests use different port)**
- Check test files for `page.goto('http://127.0.0.1:XXXX/index.html')`
- Start server on that port:
  ```bash
  python -m http.server 5500
  ```

---

## Test Coverage

### 8 Test Files = 60+ Visual Scenarios

1. **title-scene-layout.test.js**
   - Tests: 11 viewports (mobile, tablet, desktop)
   - Screenshots: Title screen responsive layout

2. **game-scene-layout.test.js**
   - Tests: 11 viewports
   - Screenshots: Game screen with grids and UI

3. **highscores-scene-layout.test.js**
   - Tests: 24 viewports (most comprehensive)
   - Screenshots: High scores table across all devices

4. **settings-resize-test.test.js**
   - Tests: 4 resize steps
   - Screenshots: Settings screen at different sizes

5. **all-scenes-visual.test.js**
   - Tests: 4 viewports × 1 scene (Title)
   - Screenshots: Quick visual check

6. **scene-navigation-resize-test.test.js**
   - Tests: Scene transitions + resize
   - Verifies: No black screen bugs after navigation

7. **resize-drag-test.test.js**
   - Tests: All 4 scenes × 3 resize scenarios
   - Verifies: Portrait/landscape/rapid resize

8. **pixel7-debug.test.js**
   - Tests: Pixel 7 specific (portrait + landscape)
   - Debugging: Device-specific issues

---

## Screenshot Locations

Tests save screenshots to:
```
screenshots/
├── AUTOMATED-TESTS/          # Most tests
├── SETTINGS-RESIZE-TEST/     # settings-resize-test.test.js
├── NAVIGATION-RESIZE-TEST/   # scene-navigation-resize-test.test.js
├── RESIZE-TESTS/             # resize-drag-test.test.js
└── PIXEL7-DEBUG/             # pixel7-debug.test.js
```

---

## Expected Test Output

### Success Example
```
Starting TitleScene layout tests...

Testing iphone14-pro-max-portrait (430×932)
  ✓ Screenshot saved: iphone14-pro-max-portrait_title.png
Testing iphone14-pro-max-landscape (932×430)
  ✓ Screenshot saved: iphone14-pro-max-landscape_title.png
...

Screenshots saved to: D:\...\screenshots\AUTOMATED-TESTS

Test complete!
```

### Failure Example
```
❌ TEST FAILED: page.goto: Timeout 10000ms exceeded.
```

**Common causes:**
- Dev server not running on port 5500
- Port already in use
- Network/firewall blocking localhost

---

## Running Tests - Complete Workflow

### Step 1: Ensure Prerequisites
```bash
# Install Chromium if needed
npx playwright install chromium

# Start dev server (if not using VS Code Live Server)
# Check test files for required port (usually 5500)
python -m http.server 5500
```

### Step 2: Run Tests
```bash
# Run single test
node tests/automated/title-scene-layout.test.js

# Run all tests (Windows PowerShell)
Get-ChildItem tests\automated\*.test.js | ForEach-Object { node $_.FullName }

# Run all tests (Unix/Linux/Mac)
for file in tests/automated/*.test.js; do node "$file"; done
```

### Step 3: Review Screenshots
Check screenshot directories for visual regressions:
- Look for black screens
- Verify UI elements visible
- Check element positioning
- Confirm text readability

---

## Troubleshooting

### Problem: "Error: No tests found"
**Cause:** Used `npx playwright test` instead of `node`
**Fix:** Use `node tests/automated/FILENAME.test.js`

### Problem: "Target page, context or browser has been closed"
**Cause:** Browser launching immediately fails
**Fix:**
1. Reinstall Chromium: `npx playwright install chromium`
2. Check if dev server is running
3. Try headless mode: `chromium.launch({ headless: true })`

### Problem: "Timeout 10000ms exceeded"
**Cause:** Cannot connect to http://127.0.0.1:5500
**Fix:**
1. Start dev server on port 5500
2. Verify port in test file matches server port
3. Check firewall/antivirus blocking localhost

### Problem: "PermissionError: [WinError 10013]"
**Cause:** Port already in use
**Fix:**
1. Find process using port: `netstat -ano | findstr :5500`
2. Kill process or use different port
3. Update test file port if needed

---

## Best Practices

### 1. Always Run Before Committing
Run visual tests after making UI changes to catch regressions early.

### 2. Review Screenshots
Don't just check for passing tests - visually inspect screenshots for:
- Layout issues
- Overlapping elements
- Text truncation
- Color/styling problems

### 3. Test Across Viewports
Don't only test on your current screen size. Run all tests to catch:
- Mobile-specific issues
- Tablet layout problems
- Ultra-wide monitor edge cases

### 4. Keep Server Running
If running multiple tests, keep the dev server running on port 5500 to avoid startup delays.

### 5. Headless vs Headed
- **Headed** (`headless: false`): See browser while testing, useful for debugging
- **Headless** (`headless: true`): Faster, good for CI/CD

---

## Integration with Development Workflow

### When to Run Tests

**Always run before:**
- Creating a pull request
- Merging to main/develop
- Tagging a release

**Run after:**
- Adding new UI elements
- Changing scene layouts
- Modifying responsive behavior
- Updating Phaser version

### CI/CD Integration (Future)

To run in GitHub Actions or similar:
```yaml
- name: Install Playwright
  run: npx playwright install chromium

- name: Start dev server
  run: python -m http.server 5500 &

- name: Run visual tests
  run: |
    for file in tests/automated/*.test.js; do
      node "$file"
    done
```

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2026-02-20 | Initial skill creation - documented correct execution method | Claude/Kerry McGregor |

---

## Related Documentation

- `/doc/output/sessions/Session-State_Week5-Progress_2026-02-20.md` - Week 5 testing results
- Playwright docs: https://playwright.dev/
- Project README: `/README.md`

---

**REMEMBER:** These are Node.js scripts using Playwright library, NOT Playwright Test framework tests. Always run with `node`, never with `npx playwright test`.
