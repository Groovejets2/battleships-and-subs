/**
 * Quick single-screen test to check ship orientation
 */

const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1200, height: 800 });

    // Capture ALL console logs
    page.on('console', msg => {
        console.log('CONSOLE:', msg.text());
    });

    // Navigate directly to game
    await page.goto('http://localhost:5500/index.html');
    await page.waitForTimeout(1000);

    // Start game scene directly via JavaScript
    await page.evaluate(() => {
        const scene = window.battleshipsGame.game.scene.getScene('TitleScene');
        if (scene) {
            scene.scene.start('GameScene');
        }
    });
    await page.waitForTimeout(2000);

    // Get ship details
    const shipDetails = await page.evaluate(() => {
        const scene = window.battleshipsGame.game.scene.getScenes(true)[0];
        return scene.playerShipSprites.map(s => ({
            name: s.shipType.name,
            length: s.ship.length,
            orientation: s.orientation,
            angle: s.sprite ? s.sprite.angle : 'NO SPRITE',
            displayWidth: s.sprite ? s.sprite.displayWidth.toFixed(1) : 'N/A',
            displayHeight: s.sprite ? s.sprite.displayHeight.toFixed(1) : 'N/A',
            segments: s.ship.segments
        }));
    });

    console.log('\n=== SHIP DETAILS ===');
    shipDetails.forEach(s => {
        console.log(`${s.name} (${s.length} cells): orientation=${s.orientation}, angle=${s.angle}°`);
        console.log(`  Display size: ${s.displayWidth} × ${s.displayHeight}`);
        console.log(`  Segments:`, s.segments);
    });
    console.log('===================\n');

    // Take screenshot
    await page.screenshot({ path: 'tests/automated/screenshots/quick-ship-test.png' });
    console.log('Screenshot saved: quick-ship-test.png\n');

    await browser.close();
})();
