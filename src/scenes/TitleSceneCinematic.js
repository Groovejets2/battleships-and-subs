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
        const bg = this.add.image(width / 2, height / 2, backgroundKey).setDepth(-100);
        const scale = Math.max(width / bg.width, height / bg.height);
        bg.setScale(scale);

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
            letterSpacing: 3
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
                fill: true
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
            fontSize: Math.min(width * 0.02, 16) + 'px',
            fontFamily: 'Arial',
            fill: '#eef2f5',
            fontStyle: 'italic'
        }).setOrigin(0.5).setDepth(16);

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

        const menuPlate = this.add.graphics().setDepth(21);
        menuPlate.fillStyle(0x081019, 0.28);
        menuPlate.fillRoundedRect(plateLeft, plateTop, plateWidth, plateHeight, 26);
        menuPlate.lineStyle(2, 0xc5d0d7, 0.2);
        menuPlate.strokeRoundedRect(plateLeft, plateTop, plateWidth, plateHeight, 26);

        buttonConfig.forEach((config, index) => {
            const y = startY + (index * spacing);
            const button = this.createRoundedButton(buttonX, y, buttonWidth, buttonHeight, config);
            button.container.setAlpha(0);
            button.text.setAlpha(0);

            this.tweens.add({
                targets: [button.container, button.text],
                alpha: 1,
                delay: 450 + (index * 130),
                duration: 450,
                ease: 'Sine.Out'
            });

            this.buttons.push(button);
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
            0x3e4953,
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
        const panel = this.add.image(0, 0, normalTexture);
        panel.setDisplaySize(width, height);

        const text = this.add.text(0, 0, config.text, {
            fontSize: Math.min(height * 0.38, 20) + 'px',
            fontFamily: 'Arial Black',
            fill: '#f5f7fa',
            fontWeight: 'bold',
            letterSpacing: 1
        }).setOrigin(0.5);
        text.setResolution(3);

        const hitArea = this.add.zone(0, 0, width, height).setInteractive({ useHandCursor: true });
        container.add([shadow, panel, text, hitArea]);

        hitArea.on('pointerover', () => {
            panel.setTexture(hoverTexture);
            this.tweens.add({
                targets: container,
                scaleX: 1.03,
                scaleY: 1.03,
                duration: 140,
                ease: 'Sine.Out'
            });
        });

        hitArea.on('pointerout', () => {
            panel.setTexture(normalTexture);
            this.tweens.add({
                targets: container,
                scaleX: 1,
                scaleY: 1,
                duration: 140,
                ease: 'Sine.Out'
            });
        });

        hitArea.on('pointerdown', () => this.handleButtonClick(config.key));

        return { container, panel, text, config };
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

        const scale = 3;
        const texWidth = Math.round(width * scale);
        const texHeight = Math.round(height * scale);
        const radius = 18 * scale;
        const innerInset = 5 * scale;

        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(fill, 1);
        graphics.fillRoundedRect(0, 0, texWidth, texHeight, radius);
        graphics.lineStyle(3 * scale, accent, 0.98);
        graphics.strokeRoundedRect(0, 0, texWidth, texHeight, radius);
        graphics.lineStyle(2 * scale, inset, 0.92);
        graphics.strokeRoundedRect(
            innerInset,
            innerInset,
            texWidth - (innerInset * 2),
            texHeight - (innerInset * 2),
            radius - (innerInset * 0.7)
        );
        graphics.fillStyle(0xffffff, 0.12);
        graphics.fillRoundedRect(
            texWidth * 0.08,
            texHeight * 0.12,
            texWidth * 0.84,
            texHeight * 0.28,
            12 * scale
        );
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
