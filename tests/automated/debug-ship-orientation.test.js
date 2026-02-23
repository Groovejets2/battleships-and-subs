/**
 * Debug test to verify ship sprite orientation
 */

const { chromium } = require('playwright');

(async () => {
    console.log('Starting ship orientation debug test...\n');

    const browser = await chromium.launch({ headless: false }); // Non-headless to see what's happening
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1200, height: 800 });

    try {
        // Navigate to game
        await page.goto('http://localhost:5500');
        await page.waitForTimeout(500);

        // Click "NEW GAME" button
        const newGameButton = await page.locator('text=NEW GAME').first();
        await newGameButton.click();
        await page.waitForTimeout(1000);

        // Inject debug script to log ship orientation data
        const shipData = await page.evaluate(() => {
            const scene = window.battleshipsGame.game.scene.getScenes(true)[0];
            if (!scene || !scene.playerShipSprites) {
                return { error: 'Scene or ship sprites not found' };
            }

            return scene.playerShipSprites.map((shipObj, index) => {
                const { ship, shipType, orientation, sprite } = shipObj;
                return {
                    index,
                    shipType: shipType.name,
                    spriteKey: shipType.sprite,
                    orientation,
                    length: ship.length,
                    segments: ship.segments,
                    spriteTexture: sprite ? sprite.texture.key : 'NOT CREATED',
                    spriteAngle: sprite ? sprite.angle : 'N/A',
                    spriteWidth: sprite ? sprite.displayWidth : 'N/A',
                    spriteHeight: sprite ? sprite.displayHeight : 'N/A'
                };
            });
        });

        console.log('Ship Sprite Data:\n');
        shipData.forEach(ship => {
            console.log(`Ship ${ship.index}: ${ship.shipType} (${ship.length} cells)`);
            console.log(`  Orientation: ${ship.orientation}`);
            console.log(`  Sprite Key: ${ship.spriteKey}`);
            console.log(`  Actual Texture: ${ship.spriteTexture}`);
            console.log(`  Rotation Angle: ${ship.spriteAngle}°`);
            console.log(`  Display Size: ${ship.spriteWidth} × ${ship.spriteHeight}`);
            console.log(`  Segments:`, ship.segments);
            console.log('');
        });

        // Take screenshot for visual verification
        await page.screenshot({ path: 'tests/automated/screenshots/debug-ship-orientation.png', fullPage: false });
        console.log('Screenshot saved: debug-ship-orientation.png');

        // Wait to see the result
        await page.waitForTimeout(3000);

    } catch (error) {
        console.error('Test error:', error);
    } finally {
        await browser.close();
    }
})();
