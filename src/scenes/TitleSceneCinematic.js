import { applyTextQuality } from '../utils/textQuality.js';

/**
 * @fileoverview Cinematic title screen scene for Battleships and Subs.
 * Builds a military-styled hero composition with rounded navigation buttons.
 * @namespace TitleScene
 */

/**
 * Title screen scene class with naval-themed illustration and touch-friendly navigation.
 * @class
 * @augments Phaser.Scene
 */
export class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScene' });
        this.buttons = [];
        this.waves = [];
        this.heroElements = [];
        this.titleElements = [];
        this.tagline = null;
    }

    preload() {
        if (!this.textures.exists('title-background-art-landscape')) {
            this.load.image('title-background-art-landscape', 'src/images/battleships-and-subs-title-screen-01.png');
        }
        if (!this.textures.exists('title-background-art-portrait')) {
            // Portrait-specific artwork can replace this file later without code changes.
            this.load.image('title-background-art-portrait', 'src/images/battleships-and-subs-title-screen-01.png');
        }
    }

    create() {
        const { width, height } = this.scale;

        this.buttons = [];
        this.waves = [];
        this.heroElements = [];
        this.titleElements = [];
        this.tagline = null;

        this.createBackground(width, height);
        this.createHeroScene(width, height);
        this.createTitle(width, height);
        this.createButtons(width, height);
        this.createAtmosphere(width, height);
        this.setupInput();
    }

    /**
     * Create a layered sea-and-sky background with richer wave motion.
     * @param {number} width
     * @param {number} height
     */
    createBackground(width, height) {
        this.cameras.main.setBackgroundColor(0x09131f);

        const isPortrait = height > width;
        const backgroundKey = isPortrait ? 'title-background-art-portrait' : 'title-background-art-landscape';
        const bg = this.add.image(width / 2, height / 2, backgroundKey).setOrigin(0.5).setDepth(-100);
        const scale = Math.max(width / bg.width, height / bg.height);
        const displayWidth = bg.width * scale;
        const displayHeight = bg.height * scale;
        const focalPoint = isPortrait
            ? { x: 0.5, y: 0.44 }
            : { x: 0.5, y: 0.46 };
        bg.setScale(scale);
        bg.setPosition(
            (width / 2) + ((0.5 - focalPoint.x) * displayWidth),
            (height / 2) + ((0.5 - focalPoint.y) * displayHeight)
        );

        const topShade = this.add.graphics().setDepth(-99);
        topShade.fillGradientStyle(0x071018, 0x071018, 0x0b1620, 0x0b1620, 0.5);
        topShade.fillRect(0, 0, width, height * 0.28);

        const vignette = this.add.graphics().setDepth(-98);
        vignette.fillStyle(0x02070b, 0.16);
        vignette.fillEllipse(width * 0.03, height * 0.52, width * 0.24, height * 1.1);
        vignette.fillEllipse(width * 0.97, height * 0.52, width * 0.24, height * 1.1);

        const lowerFade = this.add.graphics().setDepth(-97);
        lowerFade.fillStyle(0x05090d, 0.14);
        lowerFade.fillEllipse(width * 0.5, height * 0.92, width * 1.15, height * 0.36);

        const titleGlow = this.add.graphics().setDepth(-96);
        titleGlow.fillStyle(0xffffff, 0.05);
        titleGlow.fillEllipse(width * 0.5, height * 0.17, width * 0.42, height * 0.11);

    }

    /**
     * Draw the main military hero composition.
     * @param {number} width
     * @param {number} height
     */
    createHeroScene(width, height) {
        const lightSweep = this.add.graphics().setDepth(-35);
        lightSweep.fillStyle(0xffffff, 0.06);
        lightSweep.fillTriangle(
            width * 0.56, height * 0.52,
            width * 0.82, height * 0.72,
            width * 0.66, height * 0.86
        );
        this.heroElements.push(lightSweep);

        this.tweens.add({
            targets: lightSweep,
            alpha: 0.14,
            duration: 2400,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.InOut'
        });
    }

    /**
     * Create title text and framing copy.
     * @param {number} width
     * @param {number} height
     */
    createTitle(width, height) {
        const eyebrow = this.add.text(width / 2, height * 0.09, 'TACTICAL NAVAL COMMAND', {
            fontSize: Math.min(width * 0.018, 18) + 'px',
            fontFamily: 'Arial',
            fill: '#d8dde2',
            fontStyle: 'bold',
            letterSpacing: 3,
            shadow: {
                offsetX: 0,
                offsetY: 2,
                color: '#06090d',
                blur: 10,
                fill: true,
                alpha: 0.8
            }
        }).setOrigin(0.5).setDepth(15);

        const title = this.add.text(width / 2, height * 0.16, 'BATTLESHIPS', {
            fontSize: Math.min(width * 0.075, 68) + 'px',
            fontFamily: 'Arial Black',
            fill: '#f6f8fa',
            stroke: '#1a2128',
            strokeThickness: 7,
            shadow: {
                offsetX: 0,
                offsetY: 4,
                color: '#87939e',
                blur: 12,
                fill: true,
                alpha: 0.7
            }
        }).setOrigin(0.5).setDepth(16);

        const subtitle = this.add.text(width / 2, height * 0.235, '& SUBS', {
            fontSize: Math.min(width * 0.052, 38) + 'px',
            fontFamily: 'Arial Black',
            fill: '#c5ced6',
            stroke: '#202830',
            strokeThickness: 4,
            letterSpacing: 2
        }).setOrigin(0.5).setDepth(16);

        this.tagline = this.add.text(width / 2, height * 0.295, 'Navigate / Strategise / Dominate', {
            fontSize: Math.min(width * 0.024, 18) + 'px',
            fontFamily: 'Arial',
            fontWeight: '900',
            fill: '#eef2f5',
            fontStyle: 'italic',
            shadow: {
                offsetX: 0,
                offsetY: 12,
                color: '#000102',
                blur: 64,
                fill: true,
                alpha: 1
            }
        }).setOrigin(0.5).setDepth(16);
        applyTextQuality([eyebrow, title, subtitle, this.tagline], 5);

        const separator = this.add.graphics().setDepth(15);
        separator.lineStyle(2, 0xdde3e8, 0.6);
        separator.lineBetween(width * 0.24, height * 0.295, width * 0.39, height * 0.295);
        separator.lineBetween(width * 0.61, height * 0.295, width * 0.76, height * 0.295);

        this.titleElements = [eyebrow, title, subtitle, this.tagline, separator];

        title.setAlpha(0);
        subtitle.setAlpha(0);
        eyebrow.setAlpha(0);
        this.tagline.setAlpha(0);
        separator.setAlpha(0);

        this.tweens.add({
            targets: [eyebrow, title],
            alpha: 1,
            y: '-=10',
            duration: 800,
            ease: 'Back.Out'
        });

        this.tweens.add({
            targets: [subtitle, this.tagline, separator],
            alpha: 1,
            duration: 700,
            delay: 200,
            ease: 'Sine.Out'
        });
    }

    /**
     * Create rounded menu buttons with a steel military treatment.
     * @param {number} width
     * @param {number} height
     */
    createButtons(width, height) {
        const buttonConfig = [
            { text: 'START GAME', key: 'start', accent: 0xcdd4da },
            { text: 'SETTINGS', key: 'settings', accent: 0xaab4bd },
            { text: 'HIGH SCORES', key: 'scores', accent: 0xe3e8ed },
            { text: 'HELP', key: 'help', accent: 0x959fa8 }
        ];

        const buttonWidth = Math.min(Math.max(width * 0.28, 210), 300);
        const buttonHeight = Math.max(46, Math.min(58, height * 0.075));
        const spacing = buttonHeight + 16;
        const startY = Math.max(height * 0.58, height - (buttonConfig.length * spacing) - 32);
        const buttonX = width * 0.5;
        const platePaddingX = 34;
        const platePaddingY = 28;
        const stackHeight = ((buttonConfig.length - 1) * spacing) + buttonHeight;
        const plateTop = startY - (buttonHeight / 2) - platePaddingY;
        const plateLeft = buttonX - (buttonWidth / 2) - platePaddingX;
        const plateWidth = buttonWidth + (platePaddingX * 2);
        const plateHeight = stackHeight + (platePaddingY * 2);

        const menuPlateTexture = this.ensureMenuPlateTexture(plateWidth, plateHeight);
        const menuPlate = this.add.image(plateLeft + (plateWidth / 2), plateTop + (plateHeight / 2), menuPlateTexture)
            .setOrigin(0.5)
            .setDepth(21);
        menuPlate.setDisplaySize(plateWidth, plateHeight);

        buttonConfig.forEach((config, index) => {
            const y = startY + (index * spacing);
            const well = this.add.graphics().setDepth(22);
            const wellLeft = buttonX - (buttonWidth / 2) - 6;
            const wellTop = y - (buttonHeight / 2) - 4;
            const wellWidth = buttonWidth + 12;
            const wellHeight = buttonHeight + 8;
            well.fillStyle(0x1a2026, 0.84);
            well.fillRoundedRect(wellLeft, wellTop, wellWidth, wellHeight, 16);
            well.fillStyle(0x000000, 0.22);
            well.fillRoundedRect(wellLeft + 2, wellTop + (wellHeight * 0.52), wellWidth - 4, wellHeight * 0.38, 14);
            well.fillStyle(0xffffff, 0.08);
            well.fillRoundedRect(wellLeft + 2, wellTop + 2, wellWidth - 4, wellHeight * 0.18, 14);
            well.lineStyle(2, 0xf3f7fa, 0.16);
            well.strokeRoundedRect(wellLeft, wellTop, wellWidth, wellHeight, 16);
            well.lineStyle(2, 0x06090d, 0.55);
            well.strokeRoundedRect(wellLeft + 3, wellTop + 3, wellWidth - 6, wellHeight - 6, 14);

            const button = this.createRoundedButton(buttonX, y, buttonWidth, buttonHeight, config);
            button.container.setAlpha(0);
            button.text.setAlpha(0);

            this.tweens.add({
                targets: [well, button.container, button.text],
                alpha: 1,
                delay: 450 + (index * 130),
                duration: 450,
                ease: 'Sine.Out'
            });

            this.buttons.push({ ...button, well });
        });
    }

    /**
     * Draw one rounded button and wire interaction states.
     * @param {number} x
     * @param {number} y
     * @param {number} width
     * @param {number} height
     * @param {object} config
     * @returns {object}
     */
    createRoundedButton(x, y, width, height, config) {
        const container = this.add.container(x, y).setDepth(25);
        const shadow = this.add.graphics();
        shadow.fillStyle(0x04070a, 0.35);
        shadow.fillRoundedRect(-width / 2 + 4, -height / 2 + 6, width, height, 18);

        const normalTexture = this.ensureButtonTexture(
            `${config.key}-normal`,
            width,
            height,
            0x4c5761,
            config.accent,
            0x141b22
        );
        const hoverTexture = this.ensureButtonTexture(
            `${config.key}-hover`,
            width,
            height,
            0x66727c,
            0xf3f6f9,
            0x1e252b
        );
        const pressedTexture = this.ensureButtonTexture(
            `${config.key}-pressed`,
            width,
            height,
            0x343c44,
            0x9ba5ad,
            0x0e1318
        );
        const panel = this.add.image(0, 0, normalTexture);
        panel.setDisplaySize(width, height);

        const text = this.add.text(0, 0, config.text, {
            fontSize: Math.min(height * 0.38, 20) + 'px',
            fontFamily: 'Arial Black',
            fill: '#f8fbfe',
            fontWeight: '900',
            letterSpacing: 1,
            stroke: '#0f151b',
            strokeThickness: 3,
            shadow: {
                offsetX: 0,
                offsetY: 1,
                color: '#000000',
                blur: 3,
                fill: true,
                alpha: 0.8
            }
        }).setOrigin(0.5);
        text.setResolution(3);

        const hitArea = this.add.zone(0, 0, width, height).setInteractive({ useHandCursor: true });
        container.add([shadow, panel, text, hitArea]);

        let hovered = false;
        let pressed = false;
        let clickPending = false;

        const applyState = (state) => {
            let textureKey = normalTexture;
            let targetY = 0;
            let targetScale = 1;
            let shadowAlpha = 0.45;
            let shadowOffset = 8;

            if (state === 'pressed') {
                textureKey = pressedTexture;
                targetY = 2;
                targetScale = 0.985;
                shadowAlpha = 0.26;
                shadowOffset = 4;
            } else if (state === 'hover') {
                textureKey = hoverTexture;
                targetY = -1;
                targetScale = 1.02;
                shadowAlpha = 0.34;
                shadowOffset = 6;
            }

            panel.setTexture(textureKey);
            shadow.clear();
            shadow.fillStyle(0x020406, shadowAlpha);
            shadow.fillRoundedRect(-width / 2 + 6, -height / 2 + shadowOffset, width, height, 18);

            this.tweens.add({
                targets: container,
                y: y + targetY,
                scaleX: targetScale,
                scaleY: targetScale,
                duration: 120,
                ease: 'Sine.Out'
            });
        };

        hitArea.on('pointerover', () => {
            hovered = true;
            if (!pressed) {
                applyState('hover');
            }
        });

        hitArea.on('pointerout', () => {
            hovered = false;
            if (!pressed) {
                applyState('normal');
            }
        });

        hitArea.on('pointerdown', () => {
            pressed = true;
            clickPending = true;
            applyState('pressed');
        });

        hitArea.on('pointerup', () => {
            if (!pressed) {
                return;
            }

            pressed = false;
            applyState(hovered ? 'hover' : 'normal');

            if (clickPending) {
                clickPending = false;
                this.time.delayedCall(90, () => this.handleButtonClick(config.key));
            }
        });

        hitArea.on('pointerupoutside', () => {
            pressed = false;
            clickPending = false;
            applyState(hovered ? 'hover' : 'normal');
        });

        return { container, panel, text, config };
    }

    /**
     * Build a high-resolution textured metal console plate behind the menu buttons.
     * @param {number} width
     * @param {number} height
     * @returns {string}
     */
    ensureMenuPlateTexture(width, height) {
        const textureKey = `title-menu-plate-${Math.round(width)}x${Math.round(height)}`;
        if (this.textures.exists(textureKey)) {
            return textureKey;
        }

        const scale = 6;
        const texWidth = Math.round(width * scale);
        const texHeight = Math.round(height * scale);
        const radius = 28 * scale;
        let seed = 0;
        const seedSource = `menu-plate:${width}:${height}`;
        for (let i = 0; i < seedSource.length; i += 1) {
            seed = ((seed << 5) - seed + seedSource.charCodeAt(i)) >>> 0;
        }
        const rand = () => {
            seed = (1103515245 * seed + 12345) >>> 0;
            return seed / 0x100000000;
        };

        const graphics = this.make.graphics({ x: 0, y: 0, add: false });

        graphics.fillStyle(0x969ea5, 1);
        graphics.fillRoundedRect(0, 0, texWidth, texHeight, radius);

        graphics.fillStyle(0x66707a, 1);
        graphics.fillRoundedRect(2 * scale, 2 * scale, texWidth - (4 * scale), texHeight - (4 * scale), radius - (2 * scale));

        graphics.fillGradientStyle(0xa0a8af, 0x88929a, 0x58616a, 0x3e454d, 0.96);
        graphics.fillRoundedRect(4 * scale, 4 * scale, texWidth - (8 * scale), texHeight - (8 * scale), radius - (3 * scale));

        graphics.fillStyle(0xffffff, 0.16);
        graphics.fillRoundedRect(6 * scale, 6 * scale, texWidth - (12 * scale), texHeight * 0.14, radius - (4 * scale));

        graphics.fillStyle(0x000000, 0.16);
        graphics.fillRoundedRect(6 * scale, texHeight * 0.58, texWidth - (12 * scale), texHeight * 0.34, radius - (4 * scale));

        graphics.fillStyle(0xffffff, 0.05);
        graphics.fillRoundedRect(
            texWidth * 0.08,
            texHeight * 0.16,
            texWidth * 0.84,
            texHeight * 0.1,
            12 * scale
        );

        graphics.fillStyle(0x7c848b, 0.05);
        graphics.fillRoundedRect(
            texWidth * 0.06,
            texHeight * 0.76,
            texWidth * 0.88,
            texHeight * 0.1,
            12 * scale
        );

        graphics.lineStyle(4 * scale, 0xffffff, 0.16);
        graphics.strokeRoundedRect(0, 0, texWidth, texHeight, radius);
        graphics.lineStyle(3 * scale, 0x7b838a, 0.42);
        graphics.strokeRoundedRect(2 * scale, 2 * scale, texWidth - (4 * scale), texHeight - (4 * scale), radius - (2 * scale));
        graphics.lineStyle(2 * scale, 0xffffff, 0.12);
        graphics.strokeRoundedRect(6 * scale, 6 * scale, texWidth - (12 * scale), texHeight - (12 * scale), radius - (4 * scale));

        graphics.lineStyle(1 * scale, 0xffffff, 0.06);
        graphics.lineBetween(texWidth * 0.08, texHeight * 0.24, texWidth * 0.92, texHeight * 0.18);
        graphics.lineStyle(1 * scale, 0x000000, 0.14);
        graphics.lineBetween(texWidth * 0.08, texHeight * 0.82, texWidth * 0.92, texHeight * 0.86);

        for (let i = 0; i < 30; i += 1) {
            const y = texHeight * (0.12 + rand() * 0.76);
            const x1 = texWidth * (0.06 + rand() * 0.82);
            const len = texWidth * (0.04 + rand() * 0.12);
            const slope = (rand() - 0.5) * 6 * scale;
            graphics.lineStyle(Math.max(1, Math.round(scale * 0.28)), 0xffffff, 0.015 + (rand() * 0.035));
            graphics.lineBetween(x1, y, x1 + len, y + slope);
            graphics.lineStyle(Math.max(1, Math.round(scale * 0.24)), 0x000000, 0.018 + (rand() * 0.028));
            graphics.lineBetween(x1 + (0.4 * scale), y + (0.3 * scale), x1 + len + (0.4 * scale), y + slope + (0.2 * scale));
        }

        for (let i = 0; i < 12; i += 1) {
            const cx = texWidth * (0.08 + rand() * 0.84);
            const cy = texHeight * (0.14 + rand() * 0.7);
            const r = Math.max(2 * scale, scale * (0.5 + rand() * 1.1));
            graphics.fillStyle(0xffffff, 0.025 + rand() * 0.02);
            graphics.fillCircle(cx, cy, r);
            graphics.fillStyle(0x000000, 0.05 + rand() * 0.035);
            graphics.fillCircle(cx + (0.45 * scale), cy + (0.45 * scale), r * 0.72);
        }

        graphics.generateTexture(textureKey, texWidth, texHeight);
        graphics.destroy();

        return textureKey;
    }

    /**
     * Build a high-resolution texture for a rounded metallic button.
     * @param {string} stateKey
     * @param {number} width
     * @param {number} height
     * @param {number} fill
     * @param {number} accent
     * @param {number} inset
     * @returns {string}
     */
    ensureButtonTexture(stateKey, width, height, fill, accent, inset) {
        const textureKey = `title-button-${stateKey}-${Math.round(width)}x${Math.round(height)}`;
        if (this.textures.exists(textureKey)) {
            return textureKey;
        }

        const scale = 6;
        const texWidth = Math.round(width * scale);
        const texHeight = Math.round(height * scale);
        const radius = 18 * scale;
        const innerInset = 5 * scale;
        let seed = 0;
        const seedSource = `${stateKey}:${width}:${height}`;
        for (let i = 0; i < seedSource.length; i += 1) {
            seed = ((seed << 5) - seed + seedSource.charCodeAt(i)) >>> 0;
        }
        const rand = () => {
            seed = (1664525 * seed + 1013904223) >>> 0;
            return seed / 0x100000000;
        };

        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0x1b2127, 1);
        graphics.fillRoundedRect(0, 0, texWidth, texHeight, radius);
        graphics.fillStyle(fill, 1);
        graphics.fillRoundedRect(2 * scale, 2 * scale, texWidth - (4 * scale), texHeight - (4 * scale), radius - (2 * scale));
        graphics.fillStyle(0xffffff, 0.11);
        graphics.fillRoundedRect(0, 0, texWidth, texHeight * 0.22, radius);
        graphics.fillStyle(0xb7c0c7, 0.05);
        graphics.fillRoundedRect(
            texWidth * 0.08,
            texHeight * 0.12,
            texWidth * 0.84,
            texHeight * 0.14,
            12 * scale
        );
        graphics.fillStyle(0x000000, 0.2);
        graphics.fillRoundedRect(
            0,
            texHeight * 0.56,
            texWidth,
            texHeight * 0.44,
            radius
        );
        graphics.fillStyle(0x000000, 0.14);
        graphics.fillRoundedRect(
            0,
            texHeight * 0.72,
            texWidth,
            texHeight * 0.28,
            radius
        );
        graphics.fillStyle(0xffffff, 0.05);
        graphics.fillRoundedRect(
            texWidth * 0.1,
            texHeight * 0.42,
            texWidth * 0.8,
            texHeight * 0.1,
            10 * scale
        );
        graphics.fillStyle(0x000000, 0.08);
        graphics.fillRoundedRect(
            texWidth * 0.07,
            texHeight * 0.28,
            texWidth * 0.86,
            texHeight * 0.08,
            8 * scale
        );
        graphics.lineStyle(3 * scale, accent, 0.84);
        graphics.strokeRoundedRect(0, 0, texWidth, texHeight, radius);
        graphics.lineStyle(2 * scale, inset, 0.78);
        graphics.strokeRoundedRect(
            innerInset,
            innerInset,
            texWidth - (innerInset * 2),
            texHeight - (innerInset * 2),
            radius - (innerInset * 0.7)
        );
        graphics.lineStyle(1 * scale, 0xffffff, 0.1);
        graphics.strokeRoundedRect(
            innerInset * 1.2,
            innerInset * 1.1,
            texWidth - (innerInset * 2.4),
            texHeight - (innerInset * 2.2),
            radius - (innerInset * 0.95)
        );
        graphics.lineStyle(1 * scale, 0xffffff, 0.035);
        graphics.lineBetween(texWidth * 0.09, texHeight * 0.2, texWidth * 0.91, texHeight * 0.16);
        graphics.lineStyle(1 * scale, 0x7c858d, 0.06);
        graphics.lineBetween(texWidth * 0.08, texHeight * 0.8, texWidth * 0.92, texHeight * 0.84);

        for (let i = 0; i < 18; i += 1) {
            const y = texHeight * (0.14 + rand() * 0.7);
            const x1 = texWidth * (0.06 + rand() * 0.8);
            const len = texWidth * (0.03 + rand() * 0.14);
            const slope = (rand() - 0.5) * 7 * scale;
            graphics.lineStyle(Math.max(1, Math.round(scale * 0.32)), 0xffffff, 0.02 + (rand() * 0.045));
            graphics.lineBetween(x1, y, x1 + len, y + slope);
            graphics.lineStyle(Math.max(1, Math.round(scale * 0.28)), 0x000000, 0.015 + (rand() * 0.035));
            graphics.lineBetween(x1 + (0.6 * scale), y + (0.4 * scale), x1 + len + (0.6 * scale), y + slope + (0.25 * scale));
        }

        for (let i = 0; i < 12; i += 1) {
            const cx = texWidth * (0.1 + rand() * 0.8);
            const cy = texHeight * (0.16 + rand() * 0.68);
            const r = Math.max(1.5 * scale, scale * (0.5 + rand() * 1.0));
            graphics.fillStyle(0xffffff, 0.015 + rand() * 0.016);
            graphics.fillCircle(cx, cy, r);
            graphics.fillStyle(0x808991, 0.03 + rand() * 0.02);
            graphics.fillCircle(cx - (0.5 * scale), cy - (0.5 * scale), r * 0.72);
        }
        graphics.generateTexture(textureKey, texWidth, texHeight);
        graphics.destroy();

        return textureKey;
    }

    /**
     * Add subtle bubbles and atmospheric movement.
     * @param {number} width
     * @param {number} height
     */
    createAtmosphere(width, height) {
        for (let i = 0; i < 14; i++) {
            const bubble = this.add.circle(
                Phaser.Math.Between(20, width - 20),
                Phaser.Math.Between(height * 0.48, height - 10),
                Phaser.Math.Between(2, 5),
                0xf5f7fa,
                Phaser.Math.FloatBetween(0.12, 0.26)
            ).setDepth(-20);

            this.tweens.add({
                targets: bubble,
                y: bubble.y - Phaser.Math.Between(80, 220),
                x: bubble.x + Phaser.Math.Between(-16, 16),
                alpha: 0,
                duration: Phaser.Math.Between(3200, 6800),
                delay: Phaser.Math.Between(0, 3200),
                repeat: -1,
                ease: 'Sine.Out'
            });
        }
    }

    /**
     * Setup keyboard input handling.
     */
    setupInput() {
        this.input.keyboard.on('keydown-ENTER', () => {
            this.handleButtonClick('start');
        });
    }

    /**
     * Handle button click navigation.
     * @param {string} action
     */
    handleButtonClick(action) {
        const button = this.buttons.find(item => item.config.key === action);
        if (button) {
            this.tweens.add({
                targets: button.container,
                scaleX: 0.96,
                scaleY: 0.96,
                duration: 100,
                yoyo: true
            });
        }

        switch (action) {
            case 'start':
                this.scene.start('GameScene');
                break;
            case 'settings':
                this.scene.start('SettingsScene');
                break;
            case 'scores':
                this.scene.start('HighScoresScene');
                break;
            case 'help':
                this.scene.start('HelpScene', { from: 'TitleScene' });
                break;
        }
    }

    /**
     * Rebuild the title screen on resize to keep the hero composition balanced.
     */
    handleResize() {
        this.scene.restart();
    }
}
