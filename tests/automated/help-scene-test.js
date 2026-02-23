/**
 * Quick test to verify HelpScene displays and navigation works
 */

const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1200, height: 800 });

    // Navigate to game
    await page.goto('http://localhost:5500/index.html');

    // Wait for animations to complete (HELP button is 4th, has 1600ms delay + 600ms animation = 2200ms)
    await page.waitForTimeout(3000);

    // Use JavaScript to click directly (bypassing animation issues)
    console.log('Clicking HELP button...');
    await page.evaluate(() => {
        const scene = window.battleshipsGame.game.scene.getScene('TitleScene');
        if (scene) {
            scene.handleButtonClick('help');
        }
    });
    await page.waitForTimeout(1000);

    // Take screenshot of help screen
    await page.screenshot({ path: 'tests/automated/screenshots/help-screen.png' });
    console.log('Screenshot saved: help-screen.png');

    // Click BACK button
    console.log('Clicking BACK button...');
    await page.click('text=BACK');
    await page.waitForTimeout(500);

    // Take screenshot of title screen (should be back)
    await page.screenshot({ path: 'tests/automated/screenshots/back-to-title.png' });
    console.log('Screenshot saved: back-to-title.png');
    console.log('\nTest complete!');

    await browser.close();
})();
