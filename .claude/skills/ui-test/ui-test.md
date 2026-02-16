# UI Test Skill - Playwright/Chromium Automated Testing

**Version:** 1.0.0
**Created:** 2026-02-17
**Purpose:** Automated UI testing for Phaser games using Playwright

## Description

This skill enables automated visual testing of Phaser canvas-based games using Playwright and Chromium. It handles the unique challenges of testing canvas games where traditional DOM selectors don't work.

## When to Use

- Testing responsive design across multiple screen sizes
- Verifying UI layout changes after refactoring
- Testing scene transitions and interactions
- Capturing visual regression screenshots
- Validating no content overflow on small screens

## Prerequisites

- Playwright installed: `npm install @playwright/test`
- Local HTTP server running (port 8080 or 8081)
- Test screenshots directory: `test-screenshots/`

## Usage

Create test scripts in `tests/` directory (NOT in project root).

### Basic Test Template

```javascript
const { chromium } = require('playwright');

async function testScene() {
    const browser = await chromium.launch({
        headless: false,
        args: ['--disable-dev-shm-usage']
    });

    const testSizes = [
        { width: 375, height: 667, name: 'mobile-portrait' },
        { width: 768, height: 1024, name: 'tablet-portrait' },
        { width: 1920, height: 1080, name: 'desktop' }
    ];

    for (const size of testSizes) {
        const page = await browser.newPage({
            viewport: { width: size.width, height: size.height }
        });

        await page.goto('http://localhost:8080');
        await page.waitForTimeout(2000);

        // Use coordinates for Phaser canvas clicks
        await page.mouse.click(size.width / 2, size.height * 0.75);
        await page.waitForTimeout(1500);

        await page.screenshot({
            path: `test-screenshots/${size.name}.png`
        });

        await page.close();
    }

    await browser.close();
}

testScene().catch(console.error);
```

## Phaser-Specific Techniques

### 1. Click by Coordinates (Not Selectors)

Phaser uses canvas rendering, so text selectors don't work:

```javascript
// ❌ Won't work
await page.click('text=HIGH SCORES');

// ✅ Use coordinates instead
const buttonX = width / 2;  // Center horizontally
const buttonY = height * 0.82;  // Lower third
await page.mouse.click(buttonX, buttonY);
```

### 2. Check for Overflow

```javascript
const metrics = await page.evaluate(() => ({
    viewport: window.innerHeight,
    content: document.body.scrollHeight,
    overflow: document.body.scrollHeight > window.innerHeight
}));
```

### 3. Wait for Scene Transitions

```javascript
await page.waitForTimeout(2000);  // Scene load
await page.mouse.click(x, y);
await page.waitForTimeout(1500);  // Transition animation
```

## Common Test Scenarios

### Responsive Design Testing

Test multiple portrait sizes to verify scaling:

```javascript
const portraitSizes = [
    { width: 375, height: 500 },   // Very small
    { width: 375, height: 667 },   // iPhone SE
    { width: 414, height: 896 }    // iPhone 11
];
```

### Scene Navigation Testing

```javascript
// Title → High Scores
await page.goto('http://localhost:8080');
await page.mouse.click(width/2, height*0.82);  // Click HIGH SCORES
await page.screenshot({ path: 'highscores.png' });
```

## File Organization

```
battleships-and-subs/
├── tests/
│   └── ui/
│       ├── test-responsive.js
│       ├── test-highscores.js
│       └── test-settings.js
├── test-screenshots/
│   ├── highscores-375x500.png
│   └── ...
└── .claude/skills/ui-test/
    └── ui-test.md
```

## Running Tests

```bash
# Start local server
python -m http.server 8080

# Run test (in separate terminal)
node tests/ui/test-highscores.js
```

## Troubleshooting

### Issue: Button clicks don't work

**Solution:** Calculate button position based on viewport size. Buttons are usually:
- Centered horizontally: `width / 2`
- Positioned by percentage: `height * 0.75` (for third button)

### Issue: Screenshots show wrong scene

**Solution:** Increase wait times:
```javascript
await page.waitForTimeout(3000);  // Longer wait
```

### Issue: Port 8080 already in use

**Solution:** Use different port:
```javascript
await page.goto('http://localhost:8081');
```

## Best Practices

1. ✅ Store test scripts in `tests/ui/` directory
2. ✅ Save screenshots to `test-screenshots/`
3. ✅ Use descriptive filenames: `highscores-375x500.png`
4. ✅ Test minimum supported size (375×667)
5. ✅ Verify no overflow with metrics check
6. ❌ Don't put test files in project root
7. ❌ Don't use text selectors for canvas games

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-17 | Initial skill creation |

---

**Author:** Kerry McGregor (Claude Code - Sonnet 4.5)
**Project:** Battleships and Subs
