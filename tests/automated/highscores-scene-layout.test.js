/**
 * HighScoresScene responsive layout testing
 * Tests leaderboard display across multiple viewports
 */

const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

async function testHighScoresScene() {
    const screenshotsDir = path.join(__dirname, '../../screenshots', 'AUTOMATED-TESTS');
    if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();

    // Test viewports - comprehensive mobile, tablet, and desktop coverage
    const viewports = [
        { name: 'iphone14-pro-max-portrait', width: 430, height: 932 },
        { name: 'iphone14-pro-max-landscape', width: 932, height: 430 },
        { name: 'galaxy-s20-ultra-portrait', width: 412, height: 915 },
        { name: 'galaxy-s20-ultra-landscape', width: 915, height: 412 },
        { name: 'iphone-se-portrait', width: 375, height: 667 },
        { name: 'iphone-se-landscape', width: 667, height: 375 },
        { name: 'mid-width-portrait-500', width: 500, height: 800 },
        { name: 'mid-width-portrait-600', width: 600, height: 900 },
        { name: 'ipad-portrait', width: 768, height: 1024 },
        { name: 'ipad-landscape', width: 1024, height: 768 },
        { name: 'desktop', width: 1920, height: 1080 }
    ];

    console.log('Starting HighScoresScene layout tests...\n');

    for (const viewport of viewports) {
        console.log(`Testing ${viewport.name} (${viewport.width}×${viewport.height})`);

        const page = await context.newPage();

        // Capture browser console output
        page.on('console', msg => {
            if (msg.text().includes('Layout') || msg.text().includes('resize')) {
                console.log(`    ${msg.text()}`);
            }
        });

        await page.setViewportSize({ width: viewport.width, height: viewport.height });

        try {
            // Navigate to app
            await page.goto('http://127.0.0.1:5500/index.html', { waitUntil: 'load', timeout: 10000 });

            // Wait for Phaser to initialize
            await page.waitForTimeout(2000);

            // Directly start HighScoresScene using Phaser API
            try {
                const sceneStarted = await page.evaluate(() => {
                    if (window.battleshipsGame && window.battleshipsGame.game) {
                        window.battleshipsGame.game.scene.start('HighScoresScene');
                        return true;
                    }
                    return false;
                });

                if (!sceneStarted) {
                    console.log(`  ⚠ Could not access game instance`);
                }

                await page.waitForTimeout(1500); // Wait for scene to fully render

                // Take screenshot
                const filename = `${viewport.name}_highscores.png`;
                const filepath = path.join(screenshotsDir, filename);
                await page.screenshot({ path: filepath, fullPage: false });

                console.log(`  ✓ Screenshot saved: ${filename}`);
            } catch (e) {
                console.log(`  ⚠ Could not navigate to HighScoresScene: ${e.message}`);
                const filename = `${viewport.name}_highscores_failed.png`;
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

testHighScoresScene().catch(console.error);
