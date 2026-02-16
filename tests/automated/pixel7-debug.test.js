/**
 * Debug test for Pixel 7 specifically
 * Tests if Pixel 7 has any specific issues
 */

const { chromium } = require('@playwright/test');
const path = require('path');

async function testPixel7() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Pixel 7 dimensions (actual device specs)
    const pixel7 = { width: 412, height: 915 };

    console.log('Testing Pixel 7 (412×915)...\n');

    // Capture all console output
    page.on('console', msg => {
        console.log(`  [Browser ${msg.type()}]:`, msg.text());
    });

    page.on('pageerror', error => {
        console.log(`  [ERROR]:`, error.message);
    });

    try {
        // Set Pixel 7 viewport
        await page.setViewportSize(pixel7);
        console.log('✓ Viewport set to Pixel 7 dimensions');

        // Navigate to app
        await page.goto('http://127.0.0.1:5500/index.html', {
            waitUntil: 'load',
            timeout: 10000
        });
        console.log('✓ Page loaded');

        // Wait for Phaser to initialize
        await page.waitForTimeout(2000);
        console.log('✓ Phaser initialized');

        // Check if game loaded
        const gameLoaded = await page.evaluate(() => {
            return !!(window.battleshipsGame && window.battleshipsGame.game);
        });
        console.log(`✓ Game instance: ${gameLoaded ? 'Found' : 'NOT FOUND'}`);

        // Navigate to HighScoresScene
        await page.evaluate(() => {
            if (window.battleshipsGame && window.battleshipsGame.game) {
                window.battleshipsGame.game.scene.start('HighScoresScene');
            }
        });
        await page.waitForTimeout(1500);
        console.log('✓ Navigated to HighScoresScene');

        // Take screenshot
        const screenshotsDir = path.join(__dirname, '../../screenshots', 'PIXEL7-DEBUG');
        const fs = require('fs');
        if (!fs.existsSync(screenshotsDir)) {
            fs.mkdirSync(screenshotsDir, { recursive: true });
        }

        const filename = path.join(screenshotsDir, 'pixel7-portrait.png');
        await page.screenshot({ path: filename, fullPage: false });
        console.log(`✓ Screenshot saved: ${filename}`);

        // Test landscape
        console.log('\nTesting landscape orientation...');
        await page.setViewportSize({ width: 915, height: 412 });
        await page.waitForTimeout(1000);

        const filenameLandscape = path.join(screenshotsDir, 'pixel7-landscape.png');
        await page.screenshot({ path: filenameLandscape, fullPage: false });
        console.log(`✓ Screenshot saved: ${filenameLandscape}`);

        console.log('\n✅ Pixel 7 test PASSED - no errors detected');

    } catch (error) {
        console.log(`\n❌ Pixel 7 test FAILED: ${error.message}`);
        console.log('Stack:', error.stack);
    }

    await browser.close();
}

testPixel7().catch(console.error);
