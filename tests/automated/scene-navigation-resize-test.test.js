/**
 * Scene Navigation + Resize Test
 * Tests the specific bug: Visit scene → Return to title → Drag window → Black screen
 */

const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

async function testSceneNavigationResize() {
    const screenshotsDir = path.join(__dirname, '../../screenshots', 'NAVIGATION-RESIZE-TEST');
    if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('Testing: Scene Navigation + Resize Bug\n');
    console.log('Bug scenario:');
    console.log('1. Load game → Title screen');
    console.log('2. Navigate to submenu (Game/Settings/HighScores)');
    console.log('3. Return to Title screen');
    console.log('4. Drag window → Should NOT show black screen\n');

    // Capture console errors
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
        }
    });

    try {
        // Step 1: Load game at normal size
        await page.setViewportSize({ width: 1200, height: 800 });
        await page.goto('http://127.0.0.1:5500/index.html', {
            waitUntil: 'load',
            timeout: 10000
        });
        await page.waitForTimeout(2000);
        console.log('✓ Step 1: Game loaded → TitleScene');

        await page.screenshot({
            path: path.join(screenshotsDir, '1-title-initial.png'),
            fullPage: false
        });

        // Step 2: Navigate to HighScoresScene
        await page.evaluate(() => {
            if (window.battleshipsGame && window.battleshipsGame.game) {
                window.battleshipsGame.game.scene.start('HighScoresScene');
            }
        });
        await page.waitForTimeout(1500);
        console.log('✓ Step 2: Navigated to HighScoresScene');

        await page.screenshot({
            path: path.join(screenshotsDir, '2-highscores.png'),
            fullPage: false
        });

        // Step 3: Return to TitleScene
        await page.evaluate(() => {
            if (window.battleshipsGame && window.battleshipsGame.game) {
                window.battleshipsGame.game.scene.start('TitleScene');
            }
        });
        await page.waitForTimeout(1500);
        console.log('✓ Step 3: Returned to TitleScene');

        await page.screenshot({
            path: path.join(screenshotsDir, '3-title-after-return.png'),
            fullPage: false
        });

        // Step 4: DRAG WINDOW (simulate by resizing)
        console.log('✓ Step 4: Dragging window (resizing)...');

        // Make window smaller
        await page.setViewportSize({ width: 900, height: 600 });
        await page.waitForTimeout(500);
        console.log('  → Resized to 900×600');

        await page.screenshot({
            path: path.join(screenshotsDir, '4a-after-resize-smaller.png'),
            fullPage: false
        });

        // Make window larger
        await page.setViewportSize({ width: 1400, height: 900 });
        await page.waitForTimeout(500);
        console.log('  → Resized to 1400×900');

        await page.screenshot({
            path: path.join(screenshotsDir, '4b-after-resize-larger.png'),
            fullPage: false
        });

        // Make window smaller again (more aggressive)
        await page.setViewportSize({ width: 600, height: 400 });
        await page.waitForTimeout(500);
        console.log('  → Resized to 600×400');

        await page.screenshot({
            path: path.join(screenshotsDir, '4c-after-resize-very-small.png'),
            fullPage: false
        });

        // Test with different scene too (SettingsScene)
        console.log('\n✓ Step 5: Testing with SettingsScene...');
        await page.setViewportSize({ width: 1200, height: 800 });
        await page.evaluate(() => {
            if (window.battleshipsGame && window.battleshipsGame.game) {
                window.battleshipsGame.game.scene.start('SettingsScene');
            }
        });
        await page.waitForTimeout(1500);

        await page.screenshot({
            path: path.join(screenshotsDir, '5-settings.png'),
            fullPage: false
        });

        // Return to title
        await page.evaluate(() => {
            if (window.battleshipsGame && window.battleshipsGame.game) {
                window.battleshipsGame.game.scene.start('TitleScene');
            }
        });
        await page.waitForTimeout(1500);

        // Resize again
        await page.setViewportSize({ width: 800, height: 500 });
        await page.waitForTimeout(500);

        await page.screenshot({
            path: path.join(screenshotsDir, '6-title-after-settings-resized.png'),
            fullPage: false
        });

        // Check results
        console.log('\n=== TEST RESULTS ===');
        if (errors.length > 0) {
            console.log('❌ FAILED - JavaScript errors detected:');
            errors.forEach(err => console.log(`  - ${err}`));
        } else {
            console.log('✅ PASSED - No JavaScript errors detected');
            console.log('✅ All screenshots captured successfully');
            console.log('\nManually verify screenshots show no black screens:');
            console.log(`  ${screenshotsDir}`);
        }

    } catch (error) {
        console.log(`\n❌ TEST FAILED: ${error.message}`);
        console.log('Stack:', error.stack);
    }

    await browser.close();
    console.log('\nTest complete!');
}

testSceneNavigationResize().catch(console.error);
