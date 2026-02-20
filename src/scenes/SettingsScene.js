/**
 * @fileoverview Settings screen for Battleships and Subs.
 * Provides audio/visual controls with persistent storage.
 * @namespace SettingsScene
 */

import { GAME_CONSTANTS } from '../config/gameConfig.js';

/**
 * Settings scene class with audio and visual controls
 * @class
 * @augments Phaser.Scene
 */
export class SettingsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SettingsScene' });
        this.settings = {
            masterVolume: 5,    // Changed to 0-8 scale (arcade 8-notch)
            sfxVolume: 6,       // Changed to 0-8 scale
            musicVolume: 4,     // Changed to 0-8 scale
            visualEffects: true,
            animations: true,
            difficulty: 'NORMAL' // NEW: Easy/Normal/Hard
        };
        this.volumeControls = []; // Changed from sliders to pip-dot controls
        this.toggles = [];
        this.difficultyButtons = []; // NEW
        this.backgroundGraphics = null;

        // Store all UI element references for repositioning
        this.titleText = null;
        this.audioLabels = [];
        this.visualLabels = [];
        this.backButton = null;
        this.backText = null;
    }

    preload() {
        // Load settings from localStorage if available
        this.loadSettings();
    }

    create() {
        const { width, height } = this.scale;

        // Clear old references (important when scene is restarted)
        // Note: Don't set arrays to [] - just clear/destroy old elements
        // The create methods will populate fresh arrays
        if (this.backgroundGraphics) {
            this.backgroundGraphics.destroy();
            this.backgroundGraphics = null;
        }

        // Reset arrays for fresh population
        this.volumeControls = [];
        this.toggles = [];
        this.difficultyButtons = [];
        this.audioLabels = [];
        this.visualLabels = [];
        this.titleText = null;
        this.backButton = null;
        this.backText = null;

        // Create background
        this.createBackground();

        // Create title
        this.createTitle(width, height);

        // Create settings controls
        this.createAudioControls(width, height);
        this.createVisualControls(width, height);

        // Create back button
        this.createBackButton(width, height);

        // Setup input
        this.setupInput();
    }

    /**
     * Create gradient background matching title screen
     * @param {number} width - Optional width override (for resize events)
     * @param {number} height - Optional height override (for resize events)
     */
    createBackground(width, height) {
        // Use passed dimensions if available, otherwise use scale (for initial create)
        const w = width !== undefined ? width : this.scale.width;
        const h = height !== undefined ? height : this.scale.height;

        // Don't destroy during resize - just clear and redraw
        if (!this.backgroundGraphics) {
            this.backgroundGraphics = this.add.graphics();
            this.backgroundGraphics.setDepth(-100);
        }

        // Clear and redraw
        this.backgroundGraphics.clear();
        this.backgroundGraphics.fillGradientStyle(0x1e3c72, 0x1e3c72, 0x2a5298, 0x2a5298, 1);
        this.backgroundGraphics.fillRect(0, 0, w, h);
    }

    /**
     * Create settings title
     */
    createTitle(width, height) {
        this.titleText = this.add.text(width / 2, height * 0.05, 'SETTINGS', {
            fontSize: Math.min(width * 0.06, 42) + 'px',
            fontFamily: 'Arial Black',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
    }

    /**
     * Create arcade-style pip-dot volume controls (0-8 levels)
     */
    createAudioControls(width, height) {
        const startY = height * 0.20;
        const spacing = height * 0.11;
        const MAX_LEVEL = 8;
        const dotSize = Math.min(12, width * 0.015);
        const dotSpacing = dotSize * 2.5;

        const audioControls = [
            { label: 'MASTER', key: 'masterVolume', value: this.settings.masterVolume },
            { label: 'SFX', key: 'sfxVolume', value: this.settings.sfxVolume },
            { label: 'MUSIC', key: 'musicVolume', value: this.settings.musicVolume }
        ];

        audioControls.forEach((control, index) => {
            const y = startY + (index * spacing);

            // Label
            const label = this.add.text(width / 2, y - 24, control.label, {
                fontSize: '16px',
                fontFamily: 'Arial Black',
                fill: '#ffffff',
                fontWeight: 'bold'
            }).setOrigin(0.5);
            this.audioLabels.push(label);

            // Create 9 pip-dots (0-8 levels)
            const totalWidth = MAX_LEVEL * dotSpacing;
            const startX = width / 2 - totalWidth / 2;
            const dots = [];

            for (let i = 0; i <= MAX_LEVEL; i++) {
                const dotX = startX + (i * dotSpacing);
                const isFilled = i <= control.value;

                const dot = this.add.circle(
                    dotX, y,
                    dotSize,
                    isFilled ? 0x3498db : 0x2c3e50
                );
                dot.setStrokeStyle(2, isFilled ? 0x5dade2 : 0x1a1a2e);
                dot.setInteractive({ useHandCursor: true });

                // Click on dot to set level
                dot.on('pointerdown', () => {
                    this.setVolumeLevel(control.key, i, dots);
                });

                dots.push(dot);
            }

            // Store references
            this.volumeControls.push({ key: control.key, dots, label });
        });
    }

    /**
     * Set volume level and update pip-dots
     * @param {string} key - Settings key (masterVolume, sfxVolume, musicVolume)
     * @param {number} level - New level (0-8)
     * @param {Array} dots - Array of dot circles
     */
    setVolumeLevel(key, level, dots) {
        this.settings[key] = level;

        // Update dot colors
        dots.forEach((dot, index) => {
            const isFilled = index <= level;
            dot.setFillStyle(isFilled ? 0x3498db : 0x2c3e50);
            dot.setStrokeStyle(2, isFilled ? 0x5dade2 : 0x1a1a2e);
        });

        this.saveSettings();
    }

    /**
     * Create visual toggles and difficulty selector
     */
    createVisualControls(width, height) {
        const startY = height * 0.55;

        // Difficulty selector section
        this.add.text(width / 2, startY, 'DIFFICULTY', {
            fontSize: '16px',
            fontFamily: 'Arial Black',
            fill: '#ffffff'
        }).setOrigin(0.5);

        const difficultyY = startY + 35;
        const difficulties = ['EASY', 'NORMAL', 'HARD'];
        const buttonWidth = Math.min(width * 0.22, 90);
        const buttonHeight = 40;
        const buttonSpacing = buttonWidth + 12;
        const totalWidth = (difficulties.length * buttonWidth) + ((difficulties.length - 1) * 12);
        const startX = width / 2 - totalWidth / 2;

        difficulties.forEach((diff, index) => {
            const x = startX + (index * buttonSpacing) + (buttonWidth / 2);
            const isSelected = this.settings.difficulty === diff;

            const button = this.add.rectangle(
                x, difficultyY, buttonWidth, buttonHeight,
                isSelected ? 0x2ecc71 : 0x2c3e50
            );
            button.setStrokeStyle(3, isSelected ? 0x27ae60 : 0x3498db);
            button.setInteractive({ useHandCursor: true });

            const text = this.add.text(x, difficultyY, diff, {
                fontSize: '14px',
                fontFamily: 'Arial Black',
                fill: '#ffffff'
            }).setOrigin(0.5);

            button.on('pointerover', () => {
                if (this.settings.difficulty !== diff) {
                    button.setFillStyle(0x34495e);
                }
            });

            button.on('pointerout', () => {
                if (this.settings.difficulty !== diff) {
                    button.setFillStyle(0x2c3e50);
                }
            });

            button.on('pointerdown', () => {
                this.setDifficulty(diff);
            });

            this.difficultyButtons.push({ diff, button, text });
        });

        // Visual toggle switches (below difficulty)
        const toggleStartY = startY + 95;
        const toggleSpacing = height * 0.08;

        const visualControls = [
            { label: 'Visual Effects', key: 'visualEffects', value: this.settings.visualEffects },
            { label: 'Animations', key: 'animations', value: this.settings.animations }
        ];

        visualControls.forEach((control, index) => {
            const y = toggleStartY + (index * toggleSpacing);

            // Label
            const label = this.add.text(width / 2 - 80, y, control.label, {
                fontSize: '16px',
                fontFamily: 'Arial',
                fill: '#ffffff',
                fontWeight: 'bold'
            }).setOrigin(0, 0.5);
            this.visualLabels.push(label);

            // Toggle switch background
            const toggleBg = this.add.rectangle(
                width / 2 + 80, y, 60, 30,
                control.value ? 0x2ecc71 : 0x95a5a6
            ).setStrokeStyle(2, 0xffffff);
            toggleBg.setInteractive({ useHandCursor: true });

            // Toggle switch handle
            const toggleHandle = this.add.circle(
                width / 2 + 80 + (control.value ? 15 : -15), y,
                12, 0xffffff
            );

            // Toggle interaction
            toggleBg.on('pointerdown', () => {
                this.settings[control.key] = !this.settings[control.key];
                const newValue = this.settings[control.key];

                toggleBg.setFillStyle(newValue ? 0x2ecc71 : 0x95a5a6);

                this.tweens.add({
                    targets: toggleHandle,
                    x: width / 2 + 80 + (newValue ? 15 : -15),
                    duration: 200,
                    ease: 'Back.easeOut'
                });

                this.saveSettings();
            });

            this.toggles.push({ toggleBg, toggleHandle, key: control.key });
        });
    }

    /**
     * Set difficulty level and update button highlights
     * @param {string} difficulty - EASY, NORMAL, or HARD
     */
    setDifficulty(difficulty) {
        this.settings.difficulty = difficulty;

        // Update all button colors
        this.difficultyButtons.forEach(({ diff, button }) => {
            const isSelected = diff === difficulty;
            button.setFillStyle(isSelected ? 0x2ecc71 : 0x2c3e50);
            button.setStrokeStyle(3, isSelected ? 0x27ae60 : 0x3498db);
        });

        this.saveSettings();
    }

    /**
     * Create back button
     */
    createBackButton(width, height) {
        const buttonY = height * 0.88;
        const buttonWidth = Math.min(width * 0.4, 200);
        const buttonHeight = 50;

        this.backButton = this.add.rectangle(
            width / 2, buttonY, buttonWidth, buttonHeight, 0x2c3e50
        );
        this.backButton.setStrokeStyle(3, 0xe74c3c);
        this.backButton.setInteractive({ useHandCursor: true });

        this.backText = this.add.text(width / 2, buttonY, 'BACK', {
            fontSize: '20px',
            fontFamily: 'Arial',
            fill: '#ffffff',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        const button = this.backButton;
        const text = this.backText;

        button.on('pointerover', () => {
            button.setFillStyle(0xe74c3c);
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
            this.scene.start('TitleScene');
        });
    }

    /**
     * Setup keyboard shortcuts
     */
    setupInput() {
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start('TitleScene');
        });
    }

    /**
     * Load settings from localStorage
     */
    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('battleshipsSettings');
            if (savedSettings) {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            }
        } catch (error) {
            console.warn('Failed to load settings:', error);
        }
    }

    /**
     * Save settings to localStorage
     */
    saveSettings() {
        try {
            localStorage.setItem('battleshipsSettings', JSON.stringify(this.settings));
        } catch (error) {
            console.warn('Failed to save settings:', error);
        }
    }

    /**
     * Handle dynamic resize - recreate scene with saved settings
     */
    handleResize(width, height) {
        // Pip-dot controls and difficulty buttons are complex with many interactive elements
        // Scene restart ensures proper layout recalculation and interaction setup
        // Settings are persisted in localStorage, so no data loss
        this.scene.restart();
    }
}