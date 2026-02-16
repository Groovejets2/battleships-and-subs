const { chromium } = require('playwright');

async function testHighScores() {
    const browser = await chromium.launch({
        headless: false,
        args: ['--disable-dev-shm-usage']
    });

    const testSizes = [
        { width: 375, height: 500, name: '375x500' },
        { width: 375, height: 550, name: '375x550' },
        { width: 375, height: 600, name: '375x600' },
        { width: 375, height: 667, name: '375x667' },
    ];

    for (const size of testSizes) {
        console.log(`\nTesting ${size.name}...`);

        const page = await browser.newPage({
            viewport: { width: size.width, height: size.height }
        });

        // Navigate to game
        await page.goto('http://localhost:8081', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        console.log('  Taking title screenshot...');
        await page.screenshot({ path: `test-screenshots/before-${size.name}.png` });

        // HIGH SCORES button is the third button, positioned around 80% down the screen
        const buttonX = size.width / 2;
        const buttonY = size.height * 0.82; // Lower third button

        console.log(`  Clicking at (${buttonX}, ${buttonY})...`);
        await page.mouse.click(buttonX, buttonY);

        // Wait for scene transition and animations
        await page.waitForTimeout(3000);

        console.log('  Taking high scores screenshot...');
        await page.screenshot({
            path: `test-screenshots/highscores-${size.name}.png`,
            fullPage: false
        });

        // Check metrics
        const metrics = await page.evaluate(() => {
            return {
                viewport: window.innerHeight,
                content: document.body.scrollHeight,
                overflow: document.body.scrollHeight > window.innerHeight
            };
        });

        const status = metrics.overflow ? 'OVERFLOW' : 'FITS';
        console.log(`  Viewport: ${metrics.viewport}px, Content: ${metrics.content}px - ${status}`);

        await page.close();
    }

    console.log('\n✅ Test complete!');
    await browser.close();
}

testHighScores().catch(console.error);
