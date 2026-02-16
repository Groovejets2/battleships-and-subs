/**
 * Window Resize/Drag Testing
 * Simulates window dragging by rapidly changing viewport sizes
 * Tests that backgrounds don't turn black during resize events
 */

const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

async function testResizeBehavior() {
    const screenshotsDir = path.join(__dirname, '../../screenshots', 'RESIZE-TESTS');
    if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();

    // Scenes to test
    const scenes = [
        { key: 'TitleScene', name: 'title' },
        { key: 'HighScoresScene', name: 'highscores' },
        { key: 'SettingsScene', name: 'settings' },
        { key: 'GameScene', name: 'game' }
    ];

    // Resize sequences - simulates dragging window between sizes
    const resizeSequences = [
        {
            name: 'portrait-to-landscape',
            steps: [
                { width: 412, height: 915, delay: 500 },  // Start portrait
                { width: 600, height: 800, delay: 300 },  // Intermediate
                { width: 800, height: 600, delay: 300 },  // Intermediate
                { width: 915, height: 412, delay: 500 }   // End landscape
            ]
        },
        {
            name: 'landscape-to-portrait',
            steps: [
                { width: 915, height: 412, delay: 500 },  // Start landscape
                { width: 800, height: 600, delay: 300 },  // Intermediate
                { width: 600, height: 800, delay: 300 },  // Intermediate
                { width: 412, height: 915, delay: 500 }   // End portrait
            ]
        },
        {
            name: 'rapid-resize-small-to-large',
            steps: [
                { width: 375, height: 667, delay: 200 },  // iPhone SE
                { width: 500, height: 800, delay: 200 },
                { width: 768, height: 1024, delay: 200 }, // iPad
                { width: 1024, height: 768, delay: 200 },
                { width: 1920, height: 1080, delay: 500 } // Desktop
            ]
        }
    ];

    console.log('Starting resize/drag behavior tests...\n');
    console.log('Testing for black screen bugs during window resize\n');

    for (const scene of scenes) {
        console.log(`\n=== Testing ${scene.key} ===`);

        for (const sequence of resizeSequences) {
            console.log(`  Testing: ${sequence.name}`);

            const page = await context.newPage();

            // Capture console errors
            const errors = [];
            page.on('pageerror', error => errors.push(error.message));
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    errors.push(msg.text());
                }
            });

            try {
                // Start at first size
                await page.setViewportSize({
                    width: sequence.steps[0].width,
                    height: sequence.steps[0].height
                });

                // Navigate to app
                await page.goto('http://127.0.0.1:5500/index.html', {
                    waitUntil: 'load',
                    timeout: 10000
                });

                // Wait for Phaser to initialize
                await page.waitForTimeout(2000);

                // Navigate to the scene we want to test
                await page.evaluate((sceneKey) => {
                    if (window.battleshipsGame && window.battleshipsGame.game) {
                        window.battleshipsGame.game.scene.start(sceneKey);
                    }
                }, scene.key);

                await page.waitForTimeout(1000);

                // Take screenshot at start
                const startFilename = `${scene.name}_${sequence.name}_start.png`;
                await page.screenshot({
                    path: path.join(screenshotsDir, startFilename),
                    fullPage: false
                });

                // Execute resize sequence
                for (let i = 1; i < sequence.steps.length; i++) {
                    const step = sequence.steps[i];
                    await page.setViewportSize({ width: step.width, height: step.height });
                    await page.waitForTimeout(step.delay);

                    // Take screenshot at intermediate steps
                    if (i === Math.floor(sequence.steps.length / 2)) {
                        const midFilename = `${scene.name}_${sequence.name}_mid.png`;
                        await page.screenshot({
                            path: path.join(screenshotsDir, midFilename),
                            fullPage: false
                        });
                    }
                }

                // Take screenshot at end
                const endFilename = `${scene.name}_${sequence.name}_end.png`;
                await page.screenshot({
                    path: path.join(screenshotsDir, endFilename),
                    fullPage: false
                });

                if (errors.length > 0) {
                    console.log(`    ⚠ Errors detected: ${errors.join(', ')}`);
                } else {
                    console.log(`    ✓ No errors - resize handled correctly`);
                }

            } catch (error) {
                console.log(`    ✗ Test failed: ${error.message}`);
                const errorFilename = `${scene.name}_${sequence.name}_ERROR.png`;
                try {
                    await page.screenshot({
                        path: path.join(screenshotsDir, errorFilename),
                        fullPage: false
                    });
                } catch (e) {
                    // Ignore screenshot errors
                }
            }

            await page.close();
        }
    }

    await browser.close();
    console.log(`\n\nScreenshots saved to: ${screenshotsDir}`);
    console.log('\nResize/drag test complete!');
    console.log('\nManually review screenshots to verify:');
    console.log('  - No black screens at any resize step');
    console.log('  - UI elements properly repositioned');
    console.log('  - Backgrounds fill entire viewport');
}

testResizeBehavior().catch(console.error);
