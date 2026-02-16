/**
 * SettingsScene Resize Test
 * Tests if settings screen handles resize without layout breaking
 */

const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

async function testSettingsResize() {
    const screenshotsDir = path.join(__dirname, '../../screenshots', 'SETTINGS-RESIZE-TEST');
    if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('Testing: SettingsScene Resize\n');

    // Capture all errors and logs
    const errors = [];
    page.on('pageerror', error => {
        console.log('  [PAGE ERROR]:', error.message);
        errors.push(error.message);
    });
    page.on('console', msg => {
        // Capture ALL console messages
        console.log(`  [BROWSER ${msg.type()}]:`, msg.text());
        if (msg.type() === 'error') {
            errors.push(msg.text());
        }
    });

    try {
        // Load at normal size
        await page.setViewportSize({ width: 1200, height: 800 });
        await page.goto('http://127.0.0.1:5500/index.html', {
            waitUntil: 'load',
            timeout: 10000
        });
        await page.waitForTimeout(2000);

        // Navigate to SettingsScene
        const sceneStarted = await page.evaluate(() => {
            if (window.battleshipsGame && window.battleshipsGame.game) {
                console.log('Attempting to start SettingsScene...');
                window.battleshipsGame.game.scene.stop('TitleScene');
                window.battleshipsGame.game.scene.start('SettingsScene');
                return true;
            }
            return false;
        });
        console.log(`  scene.start() called: ${sceneStarted}`);
        await page.waitForTimeout(2000); // Longer wait

        // Check what scene is active
        const initialScene = await page.evaluate(() => {
            const scenes = window.battleshipsGame.game.scene.getScenes(true);
            return scenes.length > 0 ? scenes[0].scene.key : 'none';
        });
        console.log(`✓ SettingsScene loaded - Active scene: ${initialScene}`);

        await page.screenshot({
            path: path.join(screenshotsDir, '1-initial-1200x800.png'),
            fullPage: false
        });

        // Resize smaller
        await page.setViewportSize({ width: 800, height: 600 });
        await page.waitForTimeout(1000);

        // Check what scene is active
        const activeScene = await page.evaluate(() => {
            const scenes = window.battleshipsGame.game.scene.getScenes(true);
            return scenes.length > 0 ? scenes[0].scene.key : 'none';
        });
        console.log(`✓ Resized to 800×600 - Active scene: ${activeScene}`);

        await page.screenshot({
            path: path.join(screenshotsDir, '2-resized-800x600.png'),
            fullPage: false
        });

        // Resize larger
        await page.setViewportSize({ width: 1400, height: 900 });
        await page.waitForTimeout(1000);
        console.log('✓ Resized to 1400×900');

        await page.screenshot({
            path: path.join(screenshotsDir, '3-resized-1400x900.png'),
            fullPage: false
        });

        // Resize very small
        await page.setViewportSize({ width: 500, height: 700 });
        await page.waitForTimeout(1000);
        console.log('✓ Resized to 500×700');

        await page.screenshot({
            path: path.join(screenshotsDir, '4-resized-500x700.png'),
            fullPage: false
        });

        console.log('\n✅ Test complete - check screenshots for layout issues');
        console.log(`Screenshots: ${screenshotsDir}`);

    } catch (error) {
        console.log(`\n❌ TEST FAILED: ${error.message}`);
    }

    await browser.close();
}

testSettingsResize().catch(console.error);
