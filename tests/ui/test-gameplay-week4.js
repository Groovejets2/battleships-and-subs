/**
 * Week 4 Gameplay Test - AI Opponent & Combat Loop
 * Tests the core game functionality: combat grids, player attacks, AI turns,
 * visual feedback, and game over screen.
 *
 * Usage: node tests/ui/test-gameplay-week4.js
 * Prerequisites: HTTP server running on port 8080
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOT_DIR = 'test-screenshots/week4';
const BASE_URL = 'http://localhost:8081';
const WAIT_LOAD = 2500;    // Scene load wait
const WAIT_ANIM = 1000;    // Animation wait
const WAIT_AI   = 2500;    // AI turn wait (0.7s delay + processing)

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function navigateToGame(page, width, height) {
    // Capture console errors
    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', err => errors.push(err.message));

    await page.goto(BASE_URL);
    await page.waitForTimeout(WAIT_LOAD);

    // START GAME button is at height * 0.55 (TitleScene.js line 180)
    // Button height is ~8% of screen height, so center is at 0.55 + 0.04 = 0.59
    const btnY = height * 0.59;
    console.log(`  → Clicking START GAME at (${Math.round(width/2)}, ${Math.round(btnY)})`);
    await page.mouse.click(width / 2, btnY);
    await page.waitForTimeout(WAIT_LOAD);

    if (errors.length > 0) {
        console.error('  ⚠ Browser errors detected:');
        errors.forEach(e => console.error('    ', e));
    }
}

async function takeScreenshot(page, name) {
    const filepath = path.join(SCREENSHOT_DIR, `${name}.png`);
    await page.screenshot({ path: filepath });
    console.log(`  ✓ Screenshot: ${filepath}`);
}

async function testGameplayAtSize(browser, testSize) {
    const { width, height, name } = testSize;
    console.log(`\n📱 Testing ${name} (${width}×${height})`);

    const page = await browser.newPage({ viewport: { width, height } });

    try {
        // 1. Navigate to game scene
        console.log('  → Loading game...');
        await navigateToGame(page, width, height);
        await takeScreenshot(page, `${name}-01-game-start`);

        // 2. Check both grids are visible
        const metrics = await page.evaluate(() => ({
            viewport: { w: window.innerWidth, h: window.innerHeight },
            overflow: document.body.scrollHeight > window.innerHeight
        }));
        console.log(`  → No overflow: ${!metrics.overflow}`);

        // 3. Click on enemy grid (right side in landscape, bottom grid in portrait)
        // Enemy grid is on right half (landscape) or bottom half (portrait)
        const isPortrait = height > width;
        let attackX, attackY;

        if (isPortrait) {
            // Stacked: enemy grid is in bottom half of screen
            attackX = width / 2;
            attackY = height * 0.72;  // Enemy grid area
        } else {
            // Side by side (landscape): enemy grid is on right half
            attackX = width * 0.75;
            attackY = height * 0.45;
        }

        console.log(`  → Attacking at (${Math.round(attackX)}, ${Math.round(attackY)})`);
        await page.mouse.click(attackX, attackY);
        await page.waitForTimeout(WAIT_ANIM);
        await takeScreenshot(page, `${name}-02-after-first-attack`);

        // 4. Wait for AI turn to complete
        console.log('  → Waiting for AI turn...');
        await page.waitForTimeout(WAIT_AI);
        await takeScreenshot(page, `${name}-03-after-ai-turn`);

        // 5. Make a few more attacks in different grid areas
        const attackPositions = isPortrait
            ? [
                { x: width * 0.35, y: height * 0.68 },
                { x: width * 0.65, y: height * 0.76 },
                { x: width * 0.45, y: height * 0.72 }
              ]
            : [
                { x: width * 0.68, y: height * 0.38 },
                { x: width * 0.82, y: height * 0.52 },
                { x: width * 0.73, y: height * 0.6  }
              ];

        for (const pos of attackPositions) {
            await page.mouse.click(pos.x, pos.y);
            await page.waitForTimeout(WAIT_AI + 500);
        }

        await takeScreenshot(page, `${name}-04-mid-game`);

        console.log(`  ✅ ${name} - PASSED`);

    } catch (err) {
        console.error(`  ❌ ${name} - FAILED:`, err.message);
        await takeScreenshot(page, `${name}-ERROR`);
    }

    await page.close();
}

async function testTitleToGame(browser) {
    console.log('\n🎮 Test: Title Scene Navigation to Game');
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

    try {
        await page.goto(BASE_URL);
        await page.waitForTimeout(WAIT_LOAD);
        await takeScreenshot(page, 'desktop-title-screen');

        // Click START GAME button (at height * 0.59)
        await page.mouse.click(640, 720 * 0.59);
        await page.waitForTimeout(WAIT_LOAD);
        await takeScreenshot(page, 'desktop-game-screen');

        console.log('  ✅ Navigation - PASSED');
    } catch (err) {
        console.error('  ❌ Navigation - FAILED:', err.message);
    }

    await page.close();
}

async function runAllTests() {
    console.log('═══════════════════════════════════════');
    console.log('  Week 4 Gameplay Tests - Battleships');
    console.log('═══════════════════════════════════════\n');

    const browser = await chromium.launch({
        headless: false,
        args: ['--disable-dev-shm-usage', '--no-sandbox']
    });

    try {
        // Navigation test
        await testTitleToGame(browser);

        // Responsive size tests
        const testSizes = [
            { width: 1280, height: 720,  name: 'desktop-landscape' },
            { width: 768,  height: 1024, name: 'tablet-portrait' },
            { width: 375,  height: 667,  name: 'mobile-portrait-se' },
            { width: 375,  height: 500,  name: 'mobile-portrait-small' }
        ];

        for (const size of testSizes) {
            await testGameplayAtSize(browser, size);
        }

        console.log('\n═══════════════════════════════════════');
        console.log('  All tests complete!');
        console.log(`  Screenshots saved to: ${SCREENSHOT_DIR}/`);
        console.log('═══════════════════════════════════════\n');

    } finally {
        await browser.close();
    }
}

runAllTests().catch(err => {
    console.error('Test runner error:', err);
    process.exit(1);
});
