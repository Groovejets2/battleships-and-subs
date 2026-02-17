/**
 * @fileoverview GameOverScene - Victory and defeat screens with score display.
 * Follows Arcade-Design-Philosophy: white text, big fonts, bold arcade aesthetic.
 * @namespace GameOverScene
 */

import { GAME_CONSTANTS } from '../config/gameConfig.js';

/**
 * Game over scene showing victory or defeat with final stats and options.
 * @class
 * @augments Phaser.Scene
 */
export class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
        this.gameData = null;
        this.uiElements = {};
    }

    /**
     * Receives game data from GameScene via scene.start()
     * @param {object} data - Game result data
     */
    init(data) {
        this.gameData = data || {};
    }

    create() {
        const { width, height } = this.scale;
        this.cameras.main.setBackgroundColor(GAME_CONSTANTS.COLORS.BACKGROUND);

        const isVictory = this.gameData.winner === 'PLAYER';

        this.createBackground(width, height, isVictory);
        this.createTitle(width, height, isVictory);
        this.createScoreDisplay(width, height, isVictory);
        this.createStatsPanel(width, height);
        this.createActionButtons(width, height, isVictory);
        this.setupInput();
    }

    /**
     * Create animated background overlay.
     * @param {number} width
     * @param {number} height
     * @param {boolean} isVictory
     */
    createBackground(width, height, isVictory) {
        // Semi-transparent dark overlay for readability
        this.add.rectangle(width / 2, height / 2, width, height,
            isVictory ? 0x001a00 : 0x1a0000, 0.85
        );

        // Border effect
        const borderColor = isVictory ? 0x00ff44 : 0xff2200;
        const border = this.add.rectangle(width / 2, height / 2, width - 20, height - 20);
        border.setStrokeStyle(3, borderColor, 0.8);
        border.setFillStyle(0x000000, 0);
    }

    /**
     * Create the large VICTORY / DEFEAT title with animation.
     * @param {number} width
     * @param {number} height
     * @param {boolean} isVictory
     */
    createTitle(width, height, isVictory) {
        const titleText   = isVictory ? 'VICTORY!' : 'DEFEAT';
        const titleColor  = isVictory ? '#00ff44' : '#ff2200';
        const titleSize   = Math.min(72, Math.max(36, width * 0.1));

        const title = this.add.text(width / 2, height * 0.13, titleText, {
            fontSize: titleSize + 'px',
            fontFamily: 'Arial',
            fill: titleColor,
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: Math.max(3, titleSize * 0.06)
        }).setOrigin(0.5).setAlpha(0);

        // Entrance animation
        this.tweens.add({
            targets: title,
            alpha: 1,
            scaleX: { from: 0.5, to: 1 },
            scaleY: { from: 0.5, to: 1 },
            duration: 600,
            ease: 'Back.Out'
        });

        // Subtle pulse after entrance
        this.time.delayedCall(700, () => {
            this.tweens.add({
                targets: title,
                scaleX: 1.04,
                scaleY: 1.04,
                yoyo: true,
                repeat: -1,
                duration: 1200,
                ease: 'Sine.InOut'
            });
        });

        this.uiElements.title = title;
    }

    /**
     * Create large score display.
     * @param {number} width
     * @param {number} height
     * @param {boolean} isVictory
     */
    createScoreDisplay(width, height, isVictory) {
        if (!isVictory) return; // No score for defeat

        const score = this.gameData.total || 0;
        const scoreSize = Math.min(44, Math.max(22, width * 0.06));

        this.add.text(width / 2, height * 0.25, 'FINAL SCORE', {
            fontSize: Math.max(14, scoreSize * 0.5) + 'px',
            fontFamily: 'Arial',
            fill: '#aaaaaa',
            fontWeight: 'bold',
            letterSpacing: 3
        }).setOrigin(0.5);

        const scoreText = this.add.text(width / 2, height * 0.33, score.toString(), {
            fontSize: scoreSize + 'px',
            fontFamily: 'Arial',
            fill: '#ffff00',
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: scoreText,
            alpha: 1,
            duration: 400,
            delay: 400
        });

        this.uiElements.scoreText = scoreText;
    }

    /**
     * Create stats panel showing accuracy, turns, ships lost.
     * @param {number} width
     * @param {number} height
     */
    createStatsPanel(width, height) {
        const isVictory = this.gameData.winner === 'PLAYER';
        const panelY = isVictory ? height * 0.44 : height * 0.25;

        const data = this.gameData;
        const statsFontSize = Math.max(11, Math.min(15, width * 0.022)) + 'px';
        const labelColor  = '#aaaaaa';
        const valueColor  = '#ffffff';

        const stats = [];

        if (isVictory) {
            stats.push(
                { label: 'ACCURACY',     value: `${data.accuracy || 0}%` },
                { label: 'TURNS',        value: data.turns || 0 },
                { label: 'HITS',         value: `${data.hits || 0} / ${data.shots || 0} shots` },
                { label: 'SHIPS LOST',   value: `${data.playerShipsLost || 0} of 5` },
                { label: 'ACCURACY BONUS',    value: `+${data.accuracyBonus || 0}` },
                { label: 'EFFICIENCY BONUS',  value: `+${data.efficiencyBonus || 0}` },
                { label: 'DIFFICULTY',   value: data.difficulty || 'NORMAL' }
            );
        } else {
            // Defeat screen
            stats.push(
                { label: 'TURNS SURVIVED',   value: data.turns || 0 },
                { label: 'HITS DEALT',       value: data.hits || 0 },
                { label: 'ACCURACY',         value: `${data.accuracy || 0}%` },
                { label: 'ENEMY SHIPS LEFT', value: `${data.enemyShipsRemaining || 0} of 5` },
                { label: 'DIFFICULTY',       value: data.difficulty || 'NORMAL' }
            );
        }

        const lineHeight = Math.max(22, Math.min(28, height * 0.04));
        const panelHeight = stats.length * lineHeight;
        const startY = Math.min(panelY, height * 0.85 - panelHeight);

        // Panel background
        const bgHeight = panelHeight + 24;
        const bgWidth = Math.min(300, width * 0.7);
        this.add.rectangle(width / 2, startY + panelHeight / 2, bgWidth, bgHeight,
            0x000000, 0.4
        ).setStrokeStyle(1, 0x444444, 0.8);

        stats.forEach((stat, i) => {
            const y = startY + i * lineHeight;

            this.add.text(width / 2 - bgWidth * 0.45, y, stat.label + ':', {
                fontSize: statsFontSize,
                fontFamily: 'Arial',
                fill: labelColor
            });

            this.add.text(width / 2 + bgWidth * 0.45, y, String(stat.value), {
                fontSize: statsFontSize,
                fontFamily: 'Arial',
                fill: valueColor,
                fontWeight: 'bold'
            }).setOrigin(1, 0);
        });
    }

    /**
     * Create action buttons (Play Again, Save Score, Main Menu).
     * @param {number} width
     * @param {number} height
     * @param {boolean} isVictory
     */
    createActionButtons(width, height, isVictory) {
        const btnY     = height * 0.86;
        const btnW     = Math.min(150, width * 0.35);
        const btnH     = Math.max(36, Math.min(46, height * 0.06));
        const btnFontSize = Math.max(12, Math.min(16, width * 0.022)) + 'px';

        const buttons = [];

        if (isVictory) {
            // Save Score | Play Again | Main Menu
            buttons.push(
                { label: 'SAVE SCORE', color: 0x005500, hoverColor: 0x00aa00, action: () => this.saveScore() },
                { label: 'PLAY AGAIN', color: 0x003366, hoverColor: 0x0066cc, action: () => this.playAgain() },
                { label: 'MAIN MENU',  color: 0x440000, hoverColor: 0x880000, action: () => this.mainMenu() }
            );
        } else {
            // Retry | Main Menu
            buttons.push(
                { label: 'TRY AGAIN', color: 0x003366, hoverColor: 0x0066cc, action: () => this.playAgain() },
                { label: 'MAIN MENU', color: 0x440000, hoverColor: 0x880000, action: () => this.mainMenu() }
            );
        }

        const totalW = buttons.length * (btnW + 16) - 16;
        const startX = width / 2 - totalW / 2 + btnW / 2;

        buttons.forEach((btn, i) => {
            const x = startX + i * (btnW + 16);

            const rect = this.add.rectangle(x, btnY, btnW, btnH, btn.color)
                .setStrokeStyle(2, 0xffffff, 0.6)
                .setInteractive({ useHandCursor: true });

            const text = this.add.text(x, btnY, btn.label, {
                fontSize: btnFontSize,
                fontFamily: 'Arial',
                fill: '#ffffff',
                fontWeight: 'bold'
            }).setOrigin(0.5);

            rect.on('pointerover', () => {
                rect.setFillStyle(btn.hoverColor);
                this.tweens.add({ targets: [rect, text], scaleX: 1.05, scaleY: 1.05, duration: 100 });
            });
            rect.on('pointerout', () => {
                rect.setFillStyle(btn.color);
                this.tweens.add({ targets: [rect, text], scaleX: 1, scaleY: 1, duration: 100 });
            });
            rect.on('pointerdown', btn.action);
        });
    }

    // ─── Actions ─────────────────────────────────────────────────────────────────

    /**
     * Save the score to localStorage high scores table.
     */
    saveScore() {
        if (this.gameData.winner !== 'PLAYER') return;

        try {
            const scores = JSON.parse(localStorage.getItem('battleships_highscores') || '[]');
            const newEntry = {
                score:    this.gameData.total || 0,
                accuracy: this.gameData.accuracy || 0,
                turns:    this.gameData.turns || 0,
                date:     new Date().toLocaleDateString()
            };

            scores.push(newEntry);
            scores.sort((a, b) => b.score - a.score);
            const topScores = scores.slice(0, 5);
            localStorage.setItem('battleships_highscores', JSON.stringify(topScores));

            this.showToast('Score saved!');
            console.log('GameOverScene: Score saved:', newEntry);
        } catch (e) {
            console.error('GameOverScene: Failed to save score:', e);
        }
    }

    /**
     * Start a new game.
     */
    playAgain() {
        this.scene.start('GameScene');
    }

    /**
     * Return to main menu.
     */
    mainMenu() {
        this.scene.start('TitleScene');
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────────

    /**
     * Show a brief toast notification.
     * @param {string} message
     */
    showToast(message) {
        const { width, height } = this.scale;

        const toast = this.add.text(width / 2, height * 0.78, message, {
            fontSize: '14px',
            fontFamily: 'Arial',
            fill: '#00ff88',
            fontWeight: 'bold',
            backgroundColor: '#000000',
            padding: { x: 12, y: 6 }
        }).setOrigin(0.5).setDepth(200);

        this.tweens.add({
            targets: toast,
            alpha: 0,
            duration: 1500,
            delay: 1000,
            onComplete: () => toast.destroy()
        });
    }

    /**
     * Set up keyboard shortcuts.
     */
    setupInput() {
        this.input.keyboard.on('keydown-ENTER', () => this.playAgain());
        this.input.keyboard.on('keydown-ESC',   () => this.mainMenu());
    }

    /**
     * Handle resize.
     * @param {number} width
     * @param {number} height
     */
    handleResize(width, height) {
        // Full scene recreation is cleanest for this scene
        this.scene.restart();
    }
}
