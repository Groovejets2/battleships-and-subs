/**
 * Visual check: Help layout in phone portrait.
 * Focus: Action Buttons (3 icons) + Fleet (safe/hit + ship line-up).
 */

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

(async () => {
    const browser = await chromium.launch();
    const outDir = path.join('test-results', 'help-check');
    ensureDir(outDir);

    const captureViewport = async (viewport, shots) => {
        const page = await browser.newPage();
        await page.setViewportSize(viewport);
        await page.goto('http://localhost:5500/index.html');
        await page.waitForFunction(() => {
            return Boolean(window.battleshipsGame && window.battleshipsGame.game);
        }, { timeout: 15000 });
        await page.waitForTimeout(1200);

        const go = async (sceneKey, fileName) => {
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
            await page.screenshot({ path: path.join(outDir, fileName), fullPage: true });
        };

        for (const shot of shots) {
            await go(shot.sceneKey, shot.fileName);
        }

        await page.close();
    };

    await captureViewport(
        { width: 390, height: 844 },
        [
            { sceneKey: 'HelpActionButtonsScene', fileName: 'help-action-buttons-phone-portrait.png' },
            { sceneKey: 'HelpFleetScene', fileName: 'help-fleet-phone-portrait.png' }
        ]
    );

    await captureViewport(
        { width: 655, height: 800 },
        [
            { sceneKey: 'HelpActionButtonsScene', fileName: 'help-action-buttons-desktop-tall.png' },
            { sceneKey: 'HelpFleetScene', fileName: 'help-fleet-desktop-tall.png' }
        ]
    );

    console.log('Help layout screenshots saved under:', outDir);

    await browser.close();
})();
