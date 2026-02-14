/**
 * Direct GameScene testing with multiple viewports
 * Allows rapid iteration by directly loading GameScene and testing all sizes
 */

const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

async function testGameScene() {
    const screenshotsDir = path.join(__dirname, 'screenshots', 'AUTOMATED-TESTS');
    if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    const browser = await chromium.launch({ headless: false }); // Non-headless to see what's happening
    const context = await browser.newContext();

    // Test viewports - focusing on problem cases
    const viewports = [
        { name: 'iphone14-pro-max-portrait', width: 430, height: 932 },
        { name: 'iphone14-pro-max-landscape', width: 932, height: 430 },
        { name: 'galaxy-s20-ultra-portrait', width: 412, height: 915 },
        { name: 'galaxy-s20-ultra-landscape', width: 915, height: 412 },
        { name: 'iphone-se-portrait', width: 375, height: 667 },
        { name: 'iphone-se-landscape', width: 667, height: 375 },
        { name: 'ipad-portrait', width: 768, height: 1024 },
        { name: 'ipad-landscape', width: 1024, height: 768 },
        { name: 'desktop', width: 1920, height: 1080 }
    ];

    console.log('Starting GameScene direct tests...\n');

    for (const viewport of viewports) {
        console.log(`Testing ${viewport.name} (${viewport.width}×${viewport.height})`);

        const page = await context.newPage();

        // Capture browser console output
        page.on('console', msg => {
            if (msg.text().includes('Layout calc')) {
                console.log(`    ${msg.text()}`);
            }
        });

        await page.setViewportSize({ width: viewport.width, height: viewport.height });

        try {
            // Navigate to app
            await page.goto('http://127.0.0.1:5500/index.html', { waitUntil: 'load', timeout: 10000 });

            // Wait for Phaser to initialize
            await page.waitForTimeout(2000);

            // DIRECTLY start GameScene using Phaser API - no button clicking needed!
            try {
                const sceneStarted = await page.evaluate(() => {
                    // Access the global game instance and start GameScene directly
                    if (window.battleshipsGame && window.battleshipsGame.game) {
                        window.battleshipsGame.game.scene.start('GameScene');
                        return true;
                    }
                    return false;
                });

                if (!sceneStarted) {
                    console.log(`  ⚠ Could not access game instance`);
                }

                await page.waitForTimeout(1500); // Wait for scene to fully render

                // Take screenshot
                const filename = `${viewport.name}_game.png`;
                const filepath = path.join(screenshotsDir, filename);
                await page.screenshot({ path: filepath, fullPage: false });

                console.log(`  ✓ Screenshot saved: ${filename}`);
            } catch (e) {
                console.log(`  ⚠ Could not navigate to GameScene: ${e.message}`);
                // Take screenshot anyway to see what we got
                const filename = `${viewport.name}_failed.png`;
                const filepath = path.join(screenshotsDir, filename);
                await page.screenshot({ path: filepath, fullPage: false });
            }

        } catch (error) {
            console.log(`  ✗ Error: ${error.message}`);
        }

        await page.close();
    }

    await browser.close();
    console.log(`\nScreenshots saved to: ${screenshotsDir}`);
    console.log('\nTest complete!');
}

testGameScene().catch(console.error);
