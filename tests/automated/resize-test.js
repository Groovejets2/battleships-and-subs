/**
 * Test resize behavior - desktop landscape → portrait → back to landscape
 */

const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    console.log('1. Starting at desktop landscape (1920×1080)');
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('http://localhost:5500/index.html');
    await page.waitForTimeout(2000);

    // Start game
    await page.evaluate(() => {
        const scene = window.battleshipsGame.game.scene.getScene('TitleScene');
        if (scene) scene.scene.start('GameScene');
    });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'tests/automated/screenshots/resize-1-desktop-landscape.png' });
    console.log('   Screenshot: resize-1-desktop-landscape.png');

    console.log('2. Resize to small portrait (375×667)');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/automated/screenshots/resize-2-small-portrait.png' });
    console.log('   Screenshot: resize-2-small-portrait.png');

    console.log('3. Resize back to desktop landscape (1920×1080)');
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/automated/screenshots/resize-3-back-to-landscape.png' });
    console.log('   Screenshot: resize-3-back-to-landscape.png');

    console.log('\nTest complete - check screenshots for button positions');

    await page.waitForTimeout(5000); // Keep open to see
    await browser.close();
})();
