/**
 * @fileoverview HelpScene - Arcade-style help hub plus sub-pages.
 * Uses the same tiled wave background as the combat scene and matches the combat font treatment.
 */

import { createRoundedMenuButton } from '../utils/uiButtons.js';

const HELP_FONT_FAMILY = 'Copperplate, "Palatino Linotype", Georgia, serif';
const HELP_TEXT_FILL = '#f5f7fa';
const HELP_TEXT_STROKE = '#12181f';

function ensureHelpAssets(scene) {
    if (!scene.textures.exists('help-wave-tile')) {
        scene.load.image('help-wave-tile', 'src/images/battleships-and-subs-game-screen-01.jpg');
    }
    if (!scene.textures.exists('ship-icon-safe')) {
        scene.load.image('ship-icon-safe', 'src/images/Ship-Icon-01-Safe.png');
    }
    if (!scene.textures.exists('ship-icon-hit')) {
        scene.load.image('ship-icon-hit', 'src/images/Ship-Icon-02-Hit.png');
    }
}

function createHelpBackground(scene) {
    const { width, height } = scene.scale;
    scene.cameras.main.setBackgroundColor(0x09131f);

    const tile = scene.add.tileSprite(0, 0, width, height, 'help-wave-tile')
        .setOrigin(0, 0)
        .setDepth(-100);

    // Smaller tile scale makes the pattern feel farther away (matches GameScene).
    tile.setTileScale(0.5, 0.5);

    // Slight lift so copy stays readable without killing the ocean texture.
    scene.add.rectangle(width / 2, height / 2, width, height, 0xffffff, 0.08)
        .setDepth(-99);

    return tile;
}

function createHelpTitle(scene, titleText) {
    const { width, height } = scene.scale;
    const fontSize = Math.round(Math.min(width * 0.075, height * 0.085, 54));

    const title = scene.add.text(width / 2, height * 0.12, titleText, {
        fontSize: `${fontSize}px`,
        fontFamily: HELP_FONT_FAMILY,
        fill: HELP_TEXT_FILL,
        fontStyle: 'bold',
        stroke: HELP_TEXT_STROKE,
        strokeThickness: 5,
        shadow: {
            offsetX: 0,
            offsetY: 2,
            color: '#000000',
            blur: 10,
            fill: true
        }
    }).setOrigin(0.5).setDepth(10);

    title.setResolution(3);
    return title;
}

function createHelpBodyText(scene, x, y, wrapWidth, text) {
    const { height } = scene.scale;
    const fontSize = Math.round(Math.max(18, Math.min(26, height * 0.03)));
    const strokeThickness = Math.max(3, Math.round(fontSize * 0.18));

    const body = scene.add.text(x, y, text, {
        fontSize: `${fontSize}px`,
        fontFamily: HELP_FONT_FAMILY,
        fill: HELP_TEXT_FILL,
        stroke: HELP_TEXT_STROKE,
        strokeThickness,
        lineSpacing: Math.round(fontSize * 0.35),
        wordWrap: { width: wrapWidth, useAdvancedWrap: true }
    }).setOrigin(0, 0).setDepth(10);

    body.setResolution(3);
    return body;
}

function animateFlyInFromLeft(scene, targets, delay = 0) {
    const { width } = scene.scale;
    const list = Array.isArray(targets) ? targets : [targets];
    const original = list.map((target) => target.x);
    list.forEach((target, idx) => target.setX(original[idx] - width));

    scene.tweens.add({
        targets: list,
        x: (target, _key, _value, idx) => original[idx],
        delay,
        duration: 520,
        ease: 'Back.easeOut'
    });
}

function createArcadeButtonVisual(scene, x, y, r, baseColor, rimColor, iconType) {
    const container = scene.add.container(x, y).setDepth(20);

    const rim = scene.add.graphics();
    rim.fillStyle(rimColor, 0.55);
    rim.fillCircle(0, 0, r + 3);
    container.add(rim);

    const bg = scene.add.graphics();
    bg.fillStyle(baseColor, 1);
    bg.fillCircle(0, 0, r);
    container.add(bg);

    const highlight = scene.add.graphics();
    highlight.fillStyle(0xffffff, 0.18);
    highlight.fillEllipse(-r * 0.25, -r * 0.25, r * 1.1, r * 0.75);
    container.add(highlight);

    const icon = scene.add.graphics();
    icon.lineStyle(Math.max(2, Math.round(r * 0.12)), 0xffffff, 0.92);
    icon.fillStyle(0xffffff, 0.92);

    if (iconType === 'fire') {
        // Target reticle.
        icon.strokeCircle(0, 0, r * 0.38);
        icon.lineBetween(-r * 0.52, 0, -r * 0.18, 0);
        icon.lineBetween(r * 0.18, 0, r * 0.52, 0);
        icon.lineBetween(0, -r * 0.52, 0, -r * 0.18);
        icon.lineBetween(0, r * 0.18, 0, r * 0.52);
        icon.fillCircle(0, 0, Math.max(2, r * 0.06));
    } else if (iconType === 'sonar') {
        // Sonar waves.
        icon.strokeCircle(0, 0, r * 0.18);
        icon.strokeCircle(0, 0, r * 0.36);
        icon.strokeCircle(0, 0, r * 0.54);
        icon.lineBetween(-r * 0.52, 0, r * 0.52, 0);
    } else if (iconType === 'nuke') {
        // Simplified radiation symbol.
        icon.strokeCircle(0, 0, r * 0.56);
        icon.fillCircle(0, 0, r * 0.10);
        const wedgeR = r * 0.44;
        for (let i = 0; i < 3; i++) {
            const angle = (Math.PI * 2 / 3) * i - Math.PI / 2;
            const a1 = angle - 0.45;
            const a2 = angle + 0.45;
            icon.beginPath();
            icon.moveTo(0, 0);
            icon.arc(0, 0, wedgeR, a1, a2, false);
            icon.closePath();
            icon.fillPath();
        }
        icon.fillStyle(baseColor, 1);
        icon.fillCircle(0, 0, r * 0.25);
    }

    container.add(icon);
    return container;
}

export class HelpScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HelpScene' });
        this.returnScene = 'TitleScene';
        this.backgroundTile = null;
    }

    init(data) {
        this.returnScene = data?.from || 'TitleScene';
    }

    preload() {
        ensureHelpAssets(this);
    }

    create() {
        const { width, height } = this.scale;
        this.backgroundTile = createHelpBackground(this);

        createHelpTitle(this, 'HELP');

        const isLandscape = width > height;
        const buttonWidth = Math.min(width * 0.56, 320);
        const buttonHeight = Math.round(Math.max(40, Math.min(52, height * 0.065)));
        const startY = isLandscape ? height * 0.30 : height * 0.28;
        const spacing = Math.round(buttonHeight + Math.max(14, height * 0.02));

        const buttonSpecs = [
            { label: 'OBJECTIVE', key: 'HelpObjectiveScene' },
            { label: 'YOUR FLEET', key: 'HelpFleetScene' },
            { label: 'GAMEPLAY', key: 'HelpGameplayScene' },
            { label: 'ACTION BUTTONS', key: 'HelpActionButtonsScene' },
            { label: 'CONTROLS', key: 'HelpControlsScene' }
        ];

        buttonSpecs.forEach((spec, index) => {
            const y = startY + index * spacing;
            const btn = createRoundedMenuButton(this, {
                x: width / 2,
                y,
                width: buttonWidth,
                height: buttonHeight,
                label: spec.label,
                fontSize: Math.round(Math.min(buttonHeight * 0.34, 16)),
                onClick: () => this.scene.start(spec.key, { from: this.returnScene })
            });

            btn.container.setAlpha(1);
            animateFlyInFromLeft(this, btn.container, 240 + index * 90);
        });

        const backBtn = createRoundedMenuButton(this, {
            x: width / 2,
            y: height - Math.max(40, Math.round(height * 0.06)),
            width: Math.min(width * 0.46, 240),
            height: buttonHeight,
            label: 'BACK',
            fontSize: Math.round(Math.min(buttonHeight * 0.34, 16)),
            onClick: () => this.scene.start(this.returnScene)
        });
        backBtn.container.setAlpha(1);
        animateFlyInFromLeft(this, backBtn.container, 240 + buttonSpecs.length * 90);

        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start(this.returnScene);
        });
    }

    handleResize() {
        this.scene.restart({ from: this.returnScene });
    }
}

class HelpBaseSectionScene extends Phaser.Scene {
    constructor(config) {
        super(config);
        this.returnScene = 'TitleScene';
        this.backgroundTile = null;
    }

    init(data) {
        this.returnScene = data?.from || 'TitleScene';
    }

    preload() {
        ensureHelpAssets(this);
    }

    createSectionLayout(sectionTitle, bodyText, extrasFn) {
        const { width, height } = this.scale;

        this.backgroundTile = createHelpBackground(this);
        createHelpTitle(this, sectionTitle);

        const contentWidth = Math.min(width * 0.86, 900);
        const leftNudge = Math.round(Math.min(200, width * 0.11)); // about two inches on desktop, scales down on mobile
        const contentX = Math.round((width - contentWidth) / 2) + leftNudge;
        const contentY = Math.round(height * 0.22);

        const body = createHelpBodyText(this, contentX, contentY, contentWidth - leftNudge, bodyText);
        animateFlyInFromLeft(this, body, 200);

        if (extrasFn) {
            extrasFn({ contentX, contentY, contentWidth, body });
        }

        const buttonHeight = Math.round(Math.max(44, Math.min(60, height * 0.075)));
        const backBtn = createRoundedMenuButton(this, {
            x: width / 2,
            y: height - Math.max(40, Math.round(height * 0.06)),
            width: Math.min(width * 0.46, 240),
            height: buttonHeight,
            label: 'BACK',
            fontSize: Math.round(Math.min(buttonHeight * 0.34, 16)),
            onClick: () => this.scene.start('HelpScene', { from: this.returnScene })
        });

        animateFlyInFromLeft(this, backBtn.container, 260);

        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start('HelpScene', { from: this.returnScene });
        });
    }

    handleResize() {
        this.scene.restart({ from: this.returnScene });
    }
}

export class HelpObjectiveScene extends HelpBaseSectionScene {
    constructor() {
        super({ key: 'HelpObjectiveScene' });
    }

    create() {
        this.createSectionLayout(
            'OBJECTIVE',
            [
                'Sink all 5 enemy ships before they sink yours.',
                '',
                '- Hits earn you another shot (keep attacking).',
                '- Misses pass the turn to the enemy.',
                '- Sink ships to unlock stronger action buttons.'
            ].join('\n')
        );
    }
}

export class HelpFleetScene extends HelpBaseSectionScene {
    constructor() {
        super({ key: 'HelpFleetScene' });
    }

    create() {
        this.createSectionLayout(
            'YOUR FLEET',
            [
                'You command 5 ships:',
                '',
                '- Carrier (5 cells)',
                '- Nuclear Sub (3 cells) - Sonar ability',
                '- Cruiser (3 cells) - Row Nuke ability',
                '- Attack Sub (2 cells)',
                '- Destroyer (2 cells)',
                '',
                'Ship status icons:',
                '- Safe ship icon means the ship is still operational.',
                '- Hit ship icon means the ship has taken damage.'
            ].join('\n'),
            ({ contentX, contentWidth, body }) => {
                const iconY = body.y + body.height + 18;
                const safe = this.add.image(contentX + 28, iconY, 'ship-icon-safe')
                    .setOrigin(0, 0.5)
                    .setDepth(10);
                const hit = this.add.image(contentX + 28, iconY + 44, 'ship-icon-hit')
                    .setOrigin(0, 0.5)
                    .setDepth(10);

                // Keep these roughly the same visual size as the Action Buttons icons.
                const { height } = this.scale;
                const r = Math.round(Math.min(30, Math.max(20, height * 0.03)));
                const iconSize = Math.round(r * 2.15);
                safe.setDisplaySize(iconSize, iconSize);
                hit.setDisplaySize(iconSize, iconSize);
                hit.setY(iconY + iconSize + 14);

                const labelStyle = {
                    fontSize: '18px',
                    fontFamily: HELP_FONT_FAMILY,
                    fill: HELP_TEXT_FILL,
                    stroke: HELP_TEXT_STROKE,
                    strokeThickness: 3
                };
                const safeLabel = this.add.text(contentX + 92, iconY, 'SAFE', labelStyle)
                    .setOrigin(0, 0.5)
                    .setDepth(10);
                const hitLabel = this.add.text(contentX + 92, hit.y, 'HIT', labelStyle)
                    .setOrigin(0, 0.5)
                    .setDepth(10);
                safeLabel.setResolution(3);
                hitLabel.setResolution(3);

                animateFlyInFromLeft(this, [safe, hit, safeLabel, hitLabel], 260);

                // Simple placement preview (schematic) so players immediately "get" orientation and scale.
                const { width } = this.scale;
                const previewSize = Math.round(Math.min(220, Math.max(160, width * 0.18)));
                const previewX = contentX + contentWidth - previewSize - 10;
                const previewY = Math.min(height * 0.72, iconY + 16);
                const cell = previewSize / 10;

                const frame = this.add.graphics().setDepth(9);
                frame.fillStyle(0x04090e, 0.34);
                frame.fillRoundedRect(previewX - 12, previewY - 14, previewSize + 24, previewSize + 28, 16);
                frame.lineStyle(2, 0xcdd4da, 0.65);
                frame.strokeRoundedRect(previewX - 12, previewY - 14, previewSize + 24, previewSize + 28, 16);

                const grid = this.add.graphics().setDepth(10);
                grid.fillStyle(0x0b3d2d, 0.18);
                grid.fillRect(previewX, previewY, previewSize, previewSize);
                grid.lineStyle(1, 0xe8edf2, 0.25);
                for (let i = 0; i <= 10; i++) {
                    const p = Math.round(previewX + i * cell);
                    const q = Math.round(previewY + i * cell);
                    grid.lineBetween(p, previewY, p, previewY + previewSize);
                    grid.lineBetween(previewX, q, previewX + previewSize, q);
                }

                const ship = this.add.graphics().setDepth(11);
                ship.fillStyle(0x1e252b, 0.78);
                ship.lineStyle(2, 0xf5f7fa, 0.6);
                const placeShip = (gx, gy, len, horizontal) => {
                    const x = previewX + gx * cell;
                    const y = previewY + gy * cell;
                    const w = horizontal ? len * cell : cell;
                    const h = horizontal ? cell : len * cell;
                    ship.fillRoundedRect(x + 2, y + 2, w - 4, h - 4, 6);
                    ship.strokeRoundedRect(x + 2, y + 2, w - 4, h - 4, 6);
                };

                // Example fleet (not tied to game state): carrier, cruiser, destroyer, 2 subs.
                placeShip(1, 1, 5, true);
                placeShip(6, 3, 3, false);
                placeShip(2, 6, 3, true);
                placeShip(8, 7, 2, false);
                placeShip(4, 8, 2, true);

                const previewLabel = this.add.text(previewX + previewSize / 2, previewY - 18, 'PLACEMENT EXAMPLE', {
                    fontSize: '16px',
                    fontFamily: HELP_FONT_FAMILY,
                    fill: HELP_TEXT_FILL,
                    stroke: HELP_TEXT_STROKE,
                    strokeThickness: 3
                }).setOrigin(0.5).setDepth(12);
                previewLabel.setResolution(3);

                animateFlyInFromLeft(this, [frame, grid, ship, previewLabel], 320);
            }
        );
    }
}

export class HelpGameplayScene extends HelpBaseSectionScene {
    constructor() {
        super({ key: 'HelpGameplayScene' });
    }

    create() {
        this.createSectionLayout(
            'GAMEPLAY',
            [
                'Target the enemy board to attack.',
                '',
                '- Select a cell to aim.',
                '- HIT gives you a bonus turn.',
                '- MISS switches turn to the enemy.',
                '- Sinking ships increases your score and can unlock action buttons.'
            ].join('\n')
        );
    }
}

export class HelpActionButtonsScene extends HelpBaseSectionScene {
    constructor() {
        super({ key: 'HelpActionButtonsScene' });
    }

    create() {
        this.createSectionLayout(
            'ACTION BUTTONS',
            [
                'Arcade buttons give you special actions:',
                '',
                '- FIRE (Red) confirms your selected attack.',
                '- SONAR (Blue) reveals a nearby zone (limited use).',
                '- NUKE (Orange) attacks an entire row (earned by sinking ships).',
                '',
                'When an action button is ready or activated, it will pulse with an arcade-style burst.'
            ].join('\n'),
            ({ contentX, body }) => {
                const { width, height } = this.scale;
                const r = Math.round(Math.min(34, Math.max(22, height * 0.032)));
                const baseY = Math.min(height * 0.72, body.y + body.height + 70);
                const spacing = Math.round(r * 2.8);
                const centerX = width / 2;
                const x0 = centerX - spacing;
                const x1 = centerX;
                const x2 = centerX + spacing;

                const fire = createArcadeButtonVisual(this, x0, baseY, r, 0xb81d1d, 0xff8b8b, 'fire');
                const sonar = createArcadeButtonVisual(this, x1, baseY, r, 0x1b5bd6, 0x9cc4ff, 'sonar');
                const nuke = createArcadeButtonVisual(this, x2, baseY, r, 0xc56a15, 0xffd1a1, 'nuke');

                const labelStyle = {
                    fontSize: '16px',
                    fontFamily: HELP_FONT_FAMILY,
                    fill: HELP_TEXT_FILL,
                    stroke: HELP_TEXT_STROKE,
                    strokeThickness: 3
                };

                const fireLabel = this.add.text(fire.x, baseY + r + 18, 'FIRE', labelStyle).setOrigin(0.5).setDepth(21);
                const sonarLabel = this.add.text(sonar.x, baseY + r + 18, 'SONAR', labelStyle).setOrigin(0.5).setDepth(21);
                const nukeLabel = this.add.text(nuke.x, baseY + r + 18, 'NUKE', labelStyle).setOrigin(0.5).setDepth(21);
                fireLabel.setResolution(3);
                sonarLabel.setResolution(3);
                nukeLabel.setResolution(3);

                animateFlyInFromLeft(this, [fire, sonar, nuke, fireLabel, sonarLabel, nukeLabel], 280);
            }
        );
    }
}

export class HelpControlsScene extends HelpBaseSectionScene {
    constructor() {
        super({ key: 'HelpControlsScene' });
    }

    create() {
        this.createSectionLayout(
            'CONTROLS',
            [
                'Mouse and touch:',
                '- Tap or click a cell to select a target.',
                '- Press FIRE to confirm the shot.',
                '',
                'Keyboard:',
                '- ESC returns to the previous menu.'
            ].join('\n')
        );
    }
}
