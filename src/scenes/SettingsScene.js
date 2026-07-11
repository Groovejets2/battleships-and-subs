/**
 * @fileoverview Settings screen for Battleships and Subs.
 * Provides audio/visual controls with persistent storage.
 * @namespace SettingsScene
 */

import { GAME_CONSTANTS } from '../config/gameConfig.js';
import { createRoundedMenuButton } from '../utils/uiButtons.js';
import { applyTextQuality } from '../utils/textQuality.js';

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
        this.backgroundTile = null;
        this.backgroundOverlay = null;
        this.consolePanel = null;
        this.sectionPanels = [];

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

        // Match Help/Game tiled wave background
        if (!this.textures.exists('help-wave-tile')) {
            this.load.image('help-wave-tile', 'src/images/battleships-and-subs-game-screen-01.jpg');
        }
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
        if (this.backgroundTile) {
            this.backgroundTile.destroy();
            this.backgroundTile = null;
        }
        if (this.backgroundOverlay) {
            this.backgroundOverlay.destroy();
            this.backgroundOverlay = null;
        }
        if (this.consolePanel) {
            this.consolePanel.destroy();
            this.consolePanel = null;
        }
        this.sectionPanels.forEach((panel) => panel.destroy());
        this.sectionPanels = [];

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

        // Create console shell
        this.createConsoleShell(width, height);

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

        this.cameras.main.setBackgroundColor(0x09131f);

        if (!this.backgroundTile || !this.backgroundTile.active) {
            this.backgroundTile = this.add.tileSprite(0, 0, w, h, 'help-wave-tile')
                .setOrigin(0, 0)
                .setDepth(-100);
            // Match GameScene/HelpScene scale so the pattern reads consistently.
            this.backgroundTile.setTileScale(0.5, 0.5);
        } else {
            this.backgroundTile.setPosition(0, 0);
            this.backgroundTile.setSize(w, h);
        }

        if (!this.backgroundOverlay || !this.backgroundOverlay.active) {
            this.backgroundOverlay = this.add.rectangle(w / 2, h / 2, w, h, 0xffffff, 0.08)
                .setDepth(-99);
        } else {
            this.backgroundOverlay.setPosition(w / 2, h / 2);
            this.backgroundOverlay.setSize(w, h);
        }
    }

    /**
     * Create the main control console shell.
     * @param {number} width
     * @param {number} height
     */
    createConsoleShell(width, height) {
        const panelWidth = Math.min(width * 0.84, 880);
        const panelHeight = Math.min(height * 0.8, 650);
        const panelX = width / 2;
        const panelTop = height > width
            ? Math.max(height * 0.07, 88)
            : Math.max(height * 0.12, 86);
        const panelY = panelTop + (panelHeight / 2);

        const consolePanel = this.add.graphics().setDepth(-20);
        consolePanel.fillStyle(0x04070a, 0.48);
        consolePanel.fillRoundedRect(panelX - (panelWidth / 2) - 8, panelY - (panelHeight / 2) + 8, panelWidth + 16, panelHeight, 26);
        consolePanel.fillStyle(0x1a2026, 0.88);
        consolePanel.fillRoundedRect(panelX - (panelWidth / 2), panelY - (panelHeight / 2), panelWidth, panelHeight, 24);
        consolePanel.fillGradientStyle(0x3f4a54, 0x2f3942, 0x172029, 0x0b1117, 1);
        consolePanel.fillRoundedRect(panelX - (panelWidth / 2) + 4, panelY - (panelHeight / 2) + 4, panelWidth - 8, panelHeight - 8, 22);
        consolePanel.fillStyle(0xffffff, 0.08);
        consolePanel.fillRoundedRect(panelX - (panelWidth / 2) + 10, panelY - (panelHeight / 2) + 10, panelWidth - 20, 42, 18);
        consolePanel.fillStyle(0x000000, 0.22);
        consolePanel.fillRoundedRect(panelX - (panelWidth / 2) + 10, panelY + (panelHeight / 2) - 58, panelWidth - 20, 48, 18);
        consolePanel.lineStyle(4, 0xf3f7fa, 0.22);
        consolePanel.strokeRoundedRect(panelX - (panelWidth / 2), panelY - (panelHeight / 2), panelWidth, panelHeight, 24);
        consolePanel.lineStyle(3, 0x06090d, 0.7);
        consolePanel.strokeRoundedRect(panelX - (panelWidth / 2) + 4, panelY - (panelHeight / 2) + 4, panelWidth - 8, panelHeight - 8, 22);
        consolePanel.lineStyle(2, 0xcdd4da, 0.24);
        consolePanel.strokeRoundedRect(panelX - (panelWidth / 2) + 10, panelY - (panelHeight / 2) + 10, panelWidth - 20, panelHeight - 20, 18);

        this.consolePanel = consolePanel;
    }

    /**
     * Create settings title (fixed position following arcade design principles)
     */
    createTitle(width, height) {
        // Fixed y position (40px from top on all screens)
        const titleY = 38;
        this.titleText = this.add.text(width / 2, titleY, 'SETTINGS', {
            fontSize: Math.min(width * 0.062, 46) + 'px',
            fontFamily: 'Arial Black',
            fill: '#f7fbfe',
            stroke: '#0e141a',
            strokeThickness: 5,
            shadow: {
                offsetX: 0,
                offsetY: 2,
                color: '#05080b',
                blur: 10,
                fill: true,
                alpha: 0.85
            }
        }).setOrigin(0.5);
        applyTextQuality(this.titleText, 8);
    }

    /**
     * Create arcade-style pip-dot volume controls (0-8 levels)
     * Uses fixed spacing from title (arcade design principle)
     */
    createAudioControls(width, height) {
        const compact = width < 430 && height < 760;
        const startY = compact ? 108 : 122;
        const spacing = compact ? 64 : 92;
        const MAX_LEVEL = 8;
        const rowWidth = Math.min(width * (compact ? 0.78 : 0.74), 640);
        const rowHeight = compact ? 48 : 60;
        const rowCenterX = width / 2;
        const dotSize = Math.max(5, Math.min(compact ? 7 : 9, width * 0.01));
        const dotSpacing = dotSize * (compact ? 2.45 : 2.75);

        const audioControls = [
            { label: compact ? 'VOLUME' : 'MASTER VOLUME', key: 'masterVolume', value: this.settings.masterVolume },
            { label: 'SFX', key: 'sfxVolume', value: this.settings.sfxVolume },
            { label: 'MUSIC', key: 'musicVolume', value: this.settings.musicVolume }
        ];

        audioControls.forEach((control, index) => {
            const y = startY + (index * spacing);
            const rowPanel = this.add.graphics().setDepth(-10);
            const rowTop = y - (rowHeight / 2);
            rowPanel.fillStyle(0x04070a, 0.36);
            rowPanel.fillRoundedRect(rowCenterX - (rowWidth / 2) - 4, rowTop + 5, rowWidth + 8, rowHeight, 18);
            rowPanel.fillStyle(0x1a2026, 0.86);
            rowPanel.fillRoundedRect(rowCenterX - (rowWidth / 2), rowTop, rowWidth, rowHeight, 16);
            rowPanel.fillGradientStyle(0x4c5761, 0x3e4953, 0x202a33, 0x111820, 1);
            rowPanel.fillRoundedRect(rowCenterX - (rowWidth / 2) + 2, rowTop + 2, rowWidth - 4, rowHeight - 4, 15);
            rowPanel.fillStyle(0xffffff, 0.1);
            rowPanel.fillRoundedRect(rowCenterX - (rowWidth / 2) + 8, rowTop + 2, rowWidth - 16, 10, 12);
            rowPanel.fillStyle(0x000000, 0.2);
            rowPanel.fillRoundedRect(rowCenterX - (rowWidth / 2) + 8, y + (compact ? 4 : 6), rowWidth - 16, 10, 12);
            rowPanel.lineStyle(3, 0xf3f7fa, 0.2);
            rowPanel.strokeRoundedRect(rowCenterX - (rowWidth / 2), rowTop, rowWidth, rowHeight, 16);
            rowPanel.lineStyle(2, 0x06090d, 0.62);
            rowPanel.strokeRoundedRect(rowCenterX - (rowWidth / 2) + 3, rowTop + 3, rowWidth - 6, rowHeight - 6, 14);
            this.sectionPanels.push(rowPanel);

            // Label
            const label = this.add.text(rowCenterX - (rowWidth / 2) + 24, y - 1, control.label, {
                fontSize: compact ? '14px' : '17px',
                fontFamily: 'Arial Black',
                fill: '#f8fbfe',
                fontWeight: '900',
                letterSpacing: 1,
                stroke: '#0f151b',
                strokeThickness: 3
            }).setOrigin(0, 0.5);
            applyTextQuality(label, 8);
            this.audioLabels.push(label);

            // Create 9 pip-dots (0-8 levels)
            const totalWidth = MAX_LEVEL * dotSpacing;
            const startX = rowCenterX + (rowWidth / 2) - totalWidth - (compact ? 16 : 26);
            const dots = [];

            for (let i = 0; i <= MAX_LEVEL; i++) {
                const dotX = startX + (i * dotSpacing);
                const isFilled = i <= control.value;

                const dot = this.add.circle(dotX, y, dotSize + 1.5, 0x1b2127, 0.45);
                dot.setStrokeStyle(1, 0xffffff, 0.18);
                const dotCore = this.add.circle(
                    dotX, y,
                    dotSize,
                    isFilled ? 0xf8fbfe : 0x6d7882
                );
                dotCore.setStrokeStyle(1, isFilled ? 0xffffff : 0x5f6871, isFilled ? 0.9 : 0.75);
                dot.setInteractive({ useHandCursor: true });
                dotCore.setInteractive({ useHandCursor: true });

                // Click on dot to set level
                const handler = () => {
                    this.setVolumeLevel(control.key, i, dots);
                };
                dot.on('pointerdown', handler);
                dotCore.on('pointerdown', handler);

                dots.push({ shell: dot, core: dotCore });
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
            dot.shell.setFillStyle(0x1b2127, 0.45);
            dot.shell.setStrokeStyle(1, 0xffffff, 0.18);
            dot.core.setFillStyle(isFilled ? 0xf8fbfe : 0x6d7882);
            dot.core.setStrokeStyle(1, isFilled ? 0xffffff : 0x5f6871, isFilled ? 0.9 : 0.75);
        });

        this.saveSettings();
    }

    /**
     * Create visual toggles and difficulty selector
     * Uses fixed spacing from audio controls (arcade design principle)
     */
    createVisualControls(width, height) {
        const compact = width < 430 && height < 760;
        const startY = compact ? 286 : 380;
        const sectionWidth = Math.min(width * (compact ? 0.78 : 0.76), 640);
        const sectionLeft = width / 2 - (sectionWidth / 2);
        const difficultyHeight = compact ? 70 : 84;

        const difficultyFrame = this.add.graphics().setDepth(-10);
        difficultyFrame.fillStyle(0x04070a, 0.36);
        difficultyFrame.fillRoundedRect(sectionLeft - 6, startY - 24, sectionWidth + 12, difficultyHeight, 18);
        difficultyFrame.fillStyle(0x1a2026, 0.86);
        difficultyFrame.fillRoundedRect(sectionLeft, startY - 20, sectionWidth, difficultyHeight - 8, 16);
        difficultyFrame.fillGradientStyle(0x4c5761, 0x3e4953, 0x202a33, 0x111820, 1);
        difficultyFrame.fillRoundedRect(sectionLeft + 2, startY - 18, sectionWidth - 4, difficultyHeight - 12, 14);
        difficultyFrame.lineStyle(3, 0xf3f7fa, 0.2);
        difficultyFrame.strokeRoundedRect(sectionLeft, startY - 20, sectionWidth, difficultyHeight - 8, 16);
        difficultyFrame.lineStyle(2, 0x06090d, 0.62);
        difficultyFrame.strokeRoundedRect(sectionLeft + 3, startY - 17, sectionWidth - 6, difficultyHeight - 14, 14);
        this.sectionPanels.push(difficultyFrame);

        // Difficulty selector section
        this.add.text(width / 2, startY, 'DIFFICULTY', {
            fontSize: compact ? '14px' : '16px',
            fontFamily: 'Arial Black',
            fill: '#f8fbfe',
            stroke: '#0f151b',
            strokeThickness: 3,
            letterSpacing: 1
        }).setOrigin(0.5);

        const difficultyY = startY + (compact ? 24 : 28);
        const difficulties = ['EASY', 'NORMAL', 'HARD'];
        const buttonWidth = Math.min(width * (compact ? 0.17 : 0.18), 110);
        const buttonHeight = compact ? 28 : 34;
        const buttonGap = compact ? 9 : 14;
        const buttonSpacing = buttonWidth + buttonGap;
        const totalWidth = (difficulties.length * buttonWidth) + ((difficulties.length - 1) * buttonGap);
        const startX = width / 2 - totalWidth / 2;

        difficulties.forEach((diff, index) => {
            const x = startX + (index * buttonSpacing) + (buttonWidth / 2);
            const isSelected = this.settings.difficulty === diff;
            const button = createRoundedMenuButton(this, {
                x,
                y: difficultyY,
                width: buttonWidth,
                height: buttonHeight,
                label: diff,
                fontSize: compact ? 11 : 14,
                fill: 0x4c5761,
                hoverFill: 0x66727c,
                accent: isSelected ? 0xf3f6f9 : 0xaab4bd,
                inset: 0x141b22,
                hoverAccent: 0xf3f6f9,
                hoverInset: 0x1e252b,
                textFill: '#f8fbfe',
                depth: 28,
                onClick: () => this.setDifficulty(diff)
            });

            button.container.setScale(isSelected ? 1.04 : 1);
            button.panel.setTint(isSelected ? 0xffffff : 0xd8dee3);
            button.text.setColor('#f8fbfe');
            applyTextQuality(button.text, 8);

            this.difficultyButtons.push({ diff, ...button });
        });

        // Visual toggle switches (below difficulty)
        const toggleStartY = startY + (compact ? 86 : 108);
        const toggleSpacing = compact ? 52 : 64;
        const toggleFrameHeight = compact ? 112 : 150;
        const toggleFrame = this.add.graphics().setDepth(-10);
        toggleFrame.fillStyle(0x04070a, 0.36);
        toggleFrame.fillRoundedRect(sectionLeft - 6, toggleStartY - 26, sectionWidth + 12, toggleFrameHeight, 18);
        toggleFrame.fillStyle(0x1a2026, 0.86);
        toggleFrame.fillRoundedRect(sectionLeft, toggleStartY - 22, sectionWidth, toggleFrameHeight - 8, 16);
        toggleFrame.fillGradientStyle(0x4c5761, 0x3e4953, 0x202a33, 0x111820, 1);
        toggleFrame.fillRoundedRect(sectionLeft + 2, toggleStartY - 20, sectionWidth - 4, toggleFrameHeight - 12, 14);
        toggleFrame.lineStyle(3, 0xf3f7fa, 0.2);
        toggleFrame.strokeRoundedRect(sectionLeft, toggleStartY - 22, sectionWidth, toggleFrameHeight - 8, 16);
        toggleFrame.lineStyle(2, 0x06090d, 0.62);
        toggleFrame.strokeRoundedRect(sectionLeft + 3, toggleStartY - 19, sectionWidth - 6, toggleFrameHeight - 14, 14);
        this.sectionPanels.push(toggleFrame);

        const visualControls = [
            { label: 'Visual Effects', key: 'visualEffects', value: this.settings.visualEffects },
            { label: 'Animations', key: 'animations', value: this.settings.animations }
        ];

        visualControls.forEach((control, index) => {
            const y = toggleStartY + (index * toggleSpacing);
            const labelX = sectionLeft + 26;

            const label = this.add.text(labelX, y, control.label, {
                fontSize: compact ? '13px' : '16px',
                fontFamily: 'Arial Black',
                fill: '#f8fbfe',
                fontWeight: '900',
                letterSpacing: 1,
                stroke: '#0f151b',
                strokeThickness: 3
            }).setOrigin(0, 0.5);
            applyTextQuality(label, 8);
            this.visualLabels.push(label);

            const toggleX = sectionLeft + sectionWidth - (compact ? 64 : 92);
            const toggleBg = this.add.graphics().setDepth(28);
            const drawToggle = (enabled) => {
                toggleBg.clear();
                toggleBg.fillStyle(0x4d565d, 1);
                const toggleWidth = compact ? 62 : 84;
                const toggleHeight = compact ? 24 : 28;
                const handleOffset = compact ? 12 : 16;
                const handleRadius = compact ? 10 : 12;
                toggleBg.fillRoundedRect(toggleX - toggleWidth / 2, y - toggleHeight / 2, toggleWidth, toggleHeight, toggleHeight / 2);
                toggleBg.fillGradientStyle(0x66727c, 0x4c5761, 0x202a33, 0x141b22, 1);
                toggleBg.fillRoundedRect(toggleX - (toggleWidth / 2) + 2, y - (toggleHeight / 2) + 2, toggleWidth - 4, toggleHeight - 4, (toggleHeight - 4) / 2);
                toggleBg.lineStyle(2, 0xffffff, 0.22);
                toggleBg.strokeRoundedRect(toggleX - toggleWidth / 2, y - toggleHeight / 2, toggleWidth, toggleHeight, toggleHeight / 2);
                toggleBg.lineStyle(2, 0x5f6871, 0.42);
                toggleBg.strokeRoundedRect(toggleX - (toggleWidth / 2) + 2, y - (toggleHeight / 2) + 2, toggleWidth - 4, toggleHeight - 4, (toggleHeight - 4) / 2);
                toggleBg.fillStyle(enabled ? 0xf8fbfe : 0x6d7882, 1);
                toggleBg.fillCircle(toggleX + (enabled ? handleOffset : -handleOffset), y, handleRadius);
                toggleBg.lineStyle(2, enabled ? 0xffffff : 0x5f6871, 0.9);
                toggleBg.strokeCircle(toggleX + (enabled ? handleOffset : -handleOffset), y, handleRadius);
            };
            drawToggle(control.value);
            toggleBg.setInteractive(new Phaser.Geom.Rectangle(toggleX - (compact ? 34 : 44), y - 16, compact ? 68 : 88, 32), Phaser.Geom.Rectangle.Contains);
            toggleBg.useHandCursor = true;

            // Toggle interaction
            toggleBg.on('pointerdown', () => {
                this.settings[control.key] = !this.settings[control.key];
                const newValue = this.settings[control.key];
                drawToggle(newValue);
                this.saveSettings();
            });

            this.toggles.push({ toggleBg, key: control.key, drawToggle });
        });

    }

    /**
     * Set difficulty level and update button highlights
     * @param {string} difficulty - EASY, NORMAL, or HARD
     */
    setDifficulty(difficulty) {
        this.settings.difficulty = difficulty;

        // Update all button colors
        this.difficultyButtons.forEach(({ diff, container, panel, text }) => {
            const isSelected = diff === difficulty;
            container.setScale(isSelected ? 1.04 : 1);
            if (panel && typeof panel.clearTint === 'function') {
                panel.clearTint();
                panel.setTint(isSelected ? 0xffffff : 0xd8dee3);
            }
            if (text) text.setColor('#f8fbfe');
        });

        this.saveSettings();
    }

    /**
     * Create back button (fixed spacing from last element - arcade design principle)
     */
    createBackButton(width, height) {
        const compact = width < 430 && height < 760;
        const calculatedY = compact ? height - 46 : Math.min(height - 85, 650);
        const buttonY = Math.min(calculatedY, height - (compact ? 44 : 80));
        const buttonWidth = Math.min(width * (compact ? 0.38 : 0.4), 200);
        const buttonHeight = compact ? 38 : 50;

        const button = createRoundedMenuButton(this, {
            x: width / 2,
            y: buttonY,
            width: buttonWidth,
            height: buttonHeight,
            label: 'BACK',
            fontSize: compact ? 16 : 20,
            fill: 0x4c5761,
            hoverFill: 0x66727c,
            accent: 0xcdd4da,
            inset: 0x141b22,
            hoverAccent: 0xf3f6f9,
            hoverInset: 0x1e252b,
            textFill: '#f8fbfe',
            onClick: () => this.scene.start('TitleScene')
        });

        this.backButton = button.container;
        this.backText = button.text;
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
