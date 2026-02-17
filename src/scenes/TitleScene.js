/**
 * @fileoverview Professional title screen scene for Battleships and Subs.
 * Implements naval-themed UI with touch-friendly navigation.
 * @namespace TitleScene
 */

import { GAME_CONSTANTS } from '../config/gameConfig.js';

/**
 * Title screen scene class with professional naval styling
 * @class
 * @augments Phaser.Scene
 */
export class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScene' });
        this.buttons = [];
        this.animations = [];
        this.tagline = null;
        this.backgroundGraphics = null;
        this.waves = [];
    }

    preload() {
        // Load assets - you can add actual image loading here later
        // this.load.image('logo', 'assets/images/logo.png');
        // this.load.image('waves', 'assets/images/waves.png');
    }

    create() {
        const { width, height } = this.scale;

        // Clear old references (important when scene is restarted)
        this.buttons = [];
        this.waves = [];
        this.tagline = null;
        this.backgroundGraphics = null;

        // Create animated background
        this.createBackground();

        // Create game logo/title
        this.createTitle(width, height);

        // Create navigation buttons
        this.createButtons(width, height);

        // Add subtle animations
        this.createAnimations();

        // Setup input handling
        this.setupInput();
    }

    /**
     * Create animated naval background
     * @param {number} width - Optional width override (for resize events)
     * @param {number} height - Optional height override (for resize events)
     */
    createBackground(width, height) {
        // Use passed dimensions if available, otherwise use scale (for initial create)
        const w = width !== undefined ? width : this.scale.width;
        const h = height !== undefined ? height : this.scale.height;

        // Clear existing waves
        this.waves.forEach(wave => wave.destroy());
        this.waves = [];

        // Create or reuse background graphics
        if (!this.backgroundGraphics) {
            this.backgroundGraphics = this.add.graphics();
            this.backgroundGraphics.setDepth(-100);
        }

        // Clear and redraw background
        this.backgroundGraphics.clear();
        this.backgroundGraphics.fillGradientStyle(0x1e3c72, 0x1e3c72, 0x2a5298, 0x2a5298, 1);
        this.backgroundGraphics.fillRect(0, 0, w, h);

        // Animated wave lines - use passed dimensions
        for (let i = 0; i < 5; i++) {
            const wave = this.add.graphics();
            wave.setDepth(-99); // Wave lines just above background, but below UI
            wave.lineStyle(2, 0x4a90e2, 0.3);

            const y = (h / 6) * (i + 1);
            wave.beginPath();

            for (let x = 0; x <= w; x += 10) {
                const waveY = y + Math.sin((x + i * 50) * 0.01) * 10;
                if (x === 0) wave.moveTo(x, waveY);
                else wave.lineTo(x, waveY);
            }

            wave.strokePath();

            // Animate waves
            this.tweens.add({
                targets: wave,
                x: -50,
                duration: 3000 + (i * 500),
                repeat: -1,
                ease: 'Linear'
            });

            this.waves.push(wave);
        }
    }

    /**
     * Create game title with naval styling
     */
    createTitle(width, height) {
        // Main title
        const title = this.add.text(width / 2, height * 0.25, 'BATTLESHIPS', {
            fontSize: Math.min(width * 0.08, 48) + 'px',
            fontFamily: 'Arial Black',
            fill: '#ffffff',
            stroke: '#1e3c72',
            strokeThickness: 4,
            shadow: {
                offsetX: 3,
                offsetY: 3,
                color: '#000000',
                blur: 10,
                fill: true
            }
        }).setOrigin(0.5);

        // Subtitle
        const subtitle = this.add.text(width / 2, height * 0.32, '& SUBS', {
            fontSize: Math.min(width * 0.06, 36) + 'px',
            fontFamily: 'Arial Black',
            fill: '#4a90e2',
            stroke: '#1e3c72',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Version or tagline
        this.tagline = this.add.text(width / 2, height * 0.38, 'Navigate • Strategize • Dominate', {
            fontSize: Math.min(width * 0.025, 16) + 'px',
            fontFamily: 'Arial',
            fill: '#a0c4ff',
            fontStyle: 'italic'
        }).setOrigin(0.5);

        // Animate title entrance
        title.setAlpha(0);
        subtitle.setAlpha(0);
        
        this.tweens.add({
            targets: title,
            alpha: 1,
            y: title.y - 20,
            duration: 1000,
            ease: 'Back.easeOut'
        });
        
        this.tweens.add({
            targets: subtitle,
            alpha: 1,
            delay: 500,
            duration: 800,
            ease: 'Back.easeOut'
        });
    }

    /**
     * Create touch-friendly navigation buttons.
     * Button group is centred in the space below the tagline, with capped height
     * so they don't become oversized on tablet/large portrait screens.
     */
    createButtons(width, height) {
        const buttonConfig = [
            { text: 'START GAME', key: 'start', color: '#2ecc71' },
            { text: 'SETTINGS', key: 'settings', color: '#3498db' },
            { text: 'HIGH SCORES', key: 'scores', color: '#e74c3c' }
        ];

        const buttonWidth  = Math.min(Math.max(width * 0.6, 200), 400);
        // Cap height at 56px so buttons aren't oversized on large portrait screens
        const buttonHeight = Math.max(44, Math.min(56, height * 0.08));
        const spacing      = buttonHeight + 16;
        const startY       = height * 0.55;

        buttonConfig.forEach((config, index) => {
            const y = startY + (index * spacing);
            
            // Button background
            const button = this.add.rectangle(
                width / 2, y, buttonWidth, buttonHeight, 0x2c3e50
            );
            button.setStrokeStyle(3, config.color); // Fixed from setStroke
            button.setInteractive({ useHandCursor: true });
            
            // Button text
            const text = this.add.text(width / 2, y, config.text, {
                fontSize: Math.min(buttonHeight * 0.4, 20) + 'px',
                fontFamily: 'Arial',
                fill: '#ffffff',
                fontWeight: 'bold'
            }).setOrigin(0.5);

            // Button interactions
            button.on('pointerover', () => {
                button.setFillStyle(parseInt(config.color.replace('#', '0x')));
                this.tweens.add({
                    targets: [button, text],
                    scaleX: 1.05,
                    scaleY: 1.05,
                    duration: 150
                });
            });

            button.on('pointerout', () => {
                button.setFillStyle(0x2c3e50);
                this.tweens.add({
                    targets: [button, text],
                    scaleX: 1,
                    scaleY: 1,
                    duration: 150
                });
            });

            button.on('pointerdown', () => {
                this.handleButtonClick(config.key);
            });

            // Store references
            this.buttons.push({ button, text, config });
            
            // Animate button entrance
            button.setAlpha(0);
            text.setAlpha(0);
            
            this.tweens.add({
                targets: [button, text],
                alpha: 1,
                delay: 1000 + (index * 200),
                duration: 600,
                ease: 'Back.easeOut'
            });
        });
    }

    /**
     * Create subtle background animations
     */
    createAnimations() {
        // Floating particles effect (simple circles)
        for (let i = 0; i < 15; i++) {
            const particle = this.add.circle(
                Phaser.Math.Between(0, this.scale.width),
                Phaser.Math.Between(0, this.scale.height),
                Phaser.Math.Between(2, 4),
                0x4a90e2,
                0.3
            );

            this.tweens.add({
                targets: particle,
                y: particle.y - Phaser.Math.Between(100, 300),
                alpha: 0,
                duration: Phaser.Math.Between(3000, 8000),
                repeat: -1,
                delay: Phaser.Math.Between(0, 5000)
            });
        }
    }

    /**
     * Setup keyboard input handling
     */
    setupInput() {
        // Add keyboard shortcuts
        this.input.keyboard.on('keydown-ENTER', () => {
            this.handleButtonClick('start');
        });
        
        this.input.keyboard.on('keydown-ESC', () => {
            // Could add exit confirmation
        });
    }

    /**
     * Handle button click navigation
     */
    handleButtonClick(action) {
        // Add button press animation
        const button = this.buttons.find(b => b.config.key === action);
        if (button) {
            this.tweens.add({
                targets: [button.button, button.text],
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 100,
                yoyo: true
            });
        }

        // Navigate based on button
        switch (action) {
            case 'start':
                this.scene.start('GameScene');
                break;
            case 'settings':
                this.scene.start('SettingsScene');  // CHANGE FROM console.log
                break;
            case 'scores':
                this.scene.start('HighScoresScene');  // CHANGE FROM console.log
                break;
        }
    }

    /**
     * Handle dynamic resize - reposition elements without restart
     */
    handleResize(width, height) {
        // Recreate background to fill new dimensions (pass dimensions explicitly)
        this.createBackground(width, height);

        // Update title positions
        const titleObjects = this.children.list.filter(child =>
            child.type === 'Text' && (child.text === 'BATTLESHIPS' || child.text === '& SUBS')
        );

        if (titleObjects.length >= 2) {
            titleObjects[0].setPosition(width / 2, height * 0.25);
            titleObjects[0].setFontSize(Math.min(width * 0.08, 48) + 'px');
            titleObjects[1].setPosition(width / 2, height * 0.32);
            titleObjects[1].setFontSize(Math.min(width * 0.06, 36) + 'px');
        }

        // Update tagline position and size
        if (this.tagline) {
            this.tagline.setPosition(width / 2, height * 0.38);
            // Scale font size based on width, with narrower screens getting smaller text
            const fontSize = Math.min(width * 0.025, 16);
            this.tagline.setFontSize(fontSize + 'px');

            // On very narrow screens, use smaller multiplier to prevent overflow
            if (width < 400) {
                this.tagline.setFontSize(Math.min(width * 0.032, 12) + 'px');
            }
        }

        // Update button positions
        const buttonHeight = Math.max(44, height * 0.08);
        const buttonWidth = Math.min(width * 0.6, 300);
        const startY = height * 0.55;
        const spacing = buttonHeight + 20;

        this.buttons.forEach((buttonObj, index) => {
            const y = startY + (index * spacing);
            buttonObj.button.setPosition(width / 2, y);
            buttonObj.button.setSize(buttonWidth, buttonHeight);
            buttonObj.text.setPosition(width / 2, y);
            buttonObj.text.setFontSize(Math.min(buttonHeight * 0.4, 20) + 'px');
        });
    }
}