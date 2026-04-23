/**
 * Visual validation for Help screens on real portrait mobile device presets.
 */

const fs = require('fs');
const path = require('path');
const { chromium, devices } = require('playwright');

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

async function bootPage(browser, deviceConfig) {
    const context = await browser.newContext({
        ...deviceConfig
    });
    const page = await context.newPage();
    await page.goto('http://localhost:5500/index.html');
    await page.waitForFunction(() => Boolean(window.battleshipsGame && window.battleshipsGame.game), { timeout: 15000 });
    await page.waitForTimeout(1200);
    return { context, page };
}

async function openHelpScene(page, sceneKey) {
    await page.evaluate((key) => {
        const game = window.battleshipsGame?.game;
        if (!game) return;
        const active = game.scene.getScenes(true);
        if (active && active.length > 0) {
            active.forEach((scene) => game.scene.stop(scene.scene.key));
        }
        game.scene.start(key, { from: 'TitleScene' });
    }, sceneKey);

    await page.waitForFunction((key) => {
        const game = window.battleshipsGame?.game;
        const active = game?.scene?.getScenes(true);
        return Boolean(active && active[0] && active[0].scene && active[0].scene.key === key);
    }, sceneKey, { timeout: 15000 });

    await page.waitForTimeout(700);
}

(async () => {
    const browser = await chromium.launch();
    const outDir = path.join('test-results', 'help-check', 'mobile-devices');
    ensureDir(outDir);

    const requestedDevices = ['iPhone SE', 'iPhone 12', 'Pixel 5'];
    const selectedDevices = requestedDevices
        .map((name) => ({ name, config: devices[name] }))
        .filter((entry) => Boolean(entry.config));

    if (selectedDevices.length === 0) {
        throw new Error('No requested Playwright device presets were available.');
    }

    for (const device of selectedDevices) {
        const safeName = device.name.toLowerCase().replace(/\s+/g, '-');
        const { context, page } = await bootPage(browser, device.config);

        await openHelpScene(page, 'HelpActionButtonsScene');
        await page.screenshot({ path: path.join(outDir, `${safeName}-action-buttons.png`), fullPage: true });

        await openHelpScene(page, 'HelpFleetScene');
        await page.screenshot({ path: path.join(outDir, `${safeName}-fleet.png`), fullPage: true });

        await context.close();
    }

    console.log('Help mobile device screenshots saved under:', outDir);
    await browser.close();
})();
