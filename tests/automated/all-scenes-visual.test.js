/**
 * Visual testing script for Battleships & Subs
 * Takes screenshots at various viewport sizes for Kerry to review
 */

const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

async function runVisualTests() {
    // Create screenshots directory
    const screenshotsDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir);
    }

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();

    // Test viewports
    const viewports = [
        { name: 'mobile-portrait', width: 375, height: 667 },
        { name: 'mobile-landscape', width: 667, height: 375 },
        { name: 'tablet-portrait', width: 768, height: 1024 },
        { name: 'desktop', width: 1920, height: 1080 }
    ];

    // Scenes to test - we'll capture title scene for each viewport
    // Other scenes need manual verification since navigation requires working buttons
    const scenes = [
        { name: 'title', description: 'Title Screen' }
    ];

    console.log('Starting visual tests...\n');

    for (const viewport of viewports) {
        console.log(`Testing ${viewport.name} (${viewport.width}x${viewport.height})`);

        for (const scene of scenes) {
            const page = await context.newPage();
            await page.setViewportSize({ width: viewport.width, height: viewport.height });

            try {
                // Navigate to app
                await page.goto('http://localhost:5500', { waitUntil: 'load', timeout: 15000 });

                // Wait for Phaser to fully initialize and render
                await page.waitForTimeout(3000);

                // Take screenshot
                const filename = `${viewport.name}_${scene.name}.png`;
                const filepath = path.join(screenshotsDir, filename);
                await page.screenshot({ path: filepath, fullPage: false });

                console.log(`  ✓ ${scene.description} captured`);
            } catch (error) {
                // Try to take screenshot even on error
                try {
                    const filename = `${viewport.name}_${scene.name}_ERROR.png`;
                    const filepath = path.join(screenshotsDir, filename);
                    await page.screenshot({ path: filepath, fullPage: false });
                    console.log(`  ⚠ ${scene.name} error screenshot saved: ${error.message}`);
                } catch (screenshotError) {
                    console.log(`  ✗ ${scene.name} completely failed: ${error.message}`);
                }
            }

            await page.close();
        }

        console.log('');
    }

    await browser.close();
    console.log(`Screenshots saved to: ${screenshotsDir}`);
    console.log('\nVisual test complete!');
}

runVisualTests().catch(console.error);
