/**
 * @fileoverview High Scores screen for Battleships and Subs.
 * Displays leaderboard with persistent storage.
 * @namespace HighScoresScene
 */

import { GAME_CONSTANTS } from '../config/gameConfig.js';

/**
 * High Scores scene class with leaderboard display
 * @class
 * @augments Phaser.Scene
 */
export class HighScoresScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HighScoresScene' });
        this.highScores = [];
        this.maxScores = 5; // Old-school arcade style - top 5 only
        this.backgroundGraphics = null;
    }

    preload() {
        // Load high scores from localStorage
        this.loadHighScores();
    }

    create() {
        const { width, height } = this.scale;

        // Create background
        this.createBackground();

        // Create title
        this.createTitle(width, height);

        // Create scores table
        this.createScoresTable(width, height);

        // Create back button
        this.createBackButton(width, height);

        // Setup input
        this.setupInput();
    }

    /**
     * Create gradient background matching other scenes
     */
    createBackground() {
        // Clear existing background if it exists
        if (this.backgroundGraphics) {
            this.backgroundGraphics.destroy();
        }

        this.backgroundGraphics = this.add.graphics();
        this.backgroundGraphics.setDepth(-100); // Keep background behind all elements
        this.backgroundGraphics.fillGradientStyle(0x1e3c72, 0x1e3c72, 0x2a5298, 0x2a5298, 1);
        this.backgroundGraphics.fillRect(0, 0, this.scale.width, this.scale.height);
    }

    /**
     * Create high scores title
     */
    createTitle(width, height) {
        this.add.text(width / 2, height * 0.08, 'HIGH SCORES', {
            fontSize: Math.min(width * 0.06, 42) + 'px',
            fontFamily: 'Arial Black',
            fill: '#ffffff',
            stroke: '#1e3c72',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(width / 2, height * 0.13, 'Top Commanders', {
            fontSize: '16px',
            fontFamily: 'Arial',
            fill: '#a0c4ff',
            fontStyle: 'italic'
        }).setOrigin(0.5);
    }

    /**
     * Create arcade-style scores table - top 5 only
     */
    createScoresTable(width, height) {
        const startY = height * 0.22;
        const tableWidth = Math.min(width * 0.85, 550); // Smaller table

        // Arcade-style: compact table for 5 scores only
        const rowHeight = width < 400 ? 50 : 55;
        const tableHeight = (this.maxScores + 1) * rowHeight + 30;

        // Table background
        const tableBg = this.add.rectangle(
            width / 2, startY + tableHeight / 2,
            tableWidth, tableHeight,
            0x1a1a2e, 0.7
        );
        tableBg.setStrokeStyle(2, 0x3498db);

        // 4-column layout: RANK, NAME, MEDAL, SCORE
        const leftMargin = width / 2 - tableWidth / 2 + 25;
        const rankX = leftMargin;
        const nameX = leftMargin + (width < 400 ? 45 : 60);
        const medalX = width / 2 + tableWidth / 2 - (width < 400 ? 110 : 140); // Medal before score
        const scoreX = width / 2 + tableWidth / 2 - 25;

        // Column headers with bigger font
        const headerFontSize = width < 400 ? '15px' : '18px';
        const headerStyle = {
            fontSize: headerFontSize,
            fontFamily: 'Arial',
            fill: '#3498db',
            fontWeight: 'bold'
        };

        this.add.text(rankX, startY + 15, 'RANK', headerStyle).setOrigin(0, 0.5);
        this.add.text(nameX, startY + 15, 'NAME', headerStyle).setOrigin(0, 0.5);
        this.add.text(scoreX, startY + 15, 'SCORE', headerStyle).setOrigin(1, 0.5);

        // Header divider
        const headerY = startY + 15;
        const divider = this.add.graphics();
        divider.lineStyle(1, 0x3498db, 0.5);
        divider.lineBetween(
            leftMargin - 10,
            headerY + 25,
            scoreX + 10,
            headerY + 25
        );

        // Medal colors for top 3 positions
        const medalColors = {
            0: 0xFFD700, // Gold
            1: 0xC0C0C0, // Silver
            2: 0xCD7F32  // Bronze
        };

        // Bigger font sizes - arcade style
        const rowFontSize = width < 400 ? '15px' : '18px';
        const scoreFontSize = width < 400 ? '16px' : '20px'; // Bigger scores!

        if (this.highScores.length === 0) {
            // No scores yet - show message
            this.add.text(width / 2, startY + tableHeight / 2, 'No scores yet!\nBe the first to play!', {
                fontSize: '20px',
                fontFamily: 'Arial',
                fill: '#a0c4ff',
                align: 'center'
            }).setOrigin(0.5);
        } else {
            // Display scores with fly-in animation (arcade style!)
            this.highScores.forEach((score, index) => {
                const rowY = headerY + 55 + (index * rowHeight);

                // All text is WHITE (no colored rank numbers)
                const rowStyle = {
                    fontSize: rowFontSize,
                    fontFamily: 'Arial',
                    fill: '#ffffff',
                    fontWeight: 'normal'
                };

                // Alternate row background
                if (index % 2 === 0) {
                    const rowBg = this.add.rectangle(
                        width / 2, rowY,
                        tableWidth - 30, rowHeight - 8,
                        0x0f3460, 0.3
                    );
                }

                // Rank number (white text)
                const rankText = this.add.text(rankX, rowY, (index + 1).toString(), {
                    ...rowStyle,
                    fontSize: rowFontSize
                }).setOrigin(0, 0.5);

                // Name (white text)
                const nameText = this.add.text(
                    nameX, rowY,
                    score.name || 'Player',
                    rowStyle
                ).setOrigin(0, 0.5);

                // Medal (small colored circle for top 3)
                let medal = null;
                if (index < 3) {
                    const medalSize = width < 400 ? 12 : 16;
                    medal = this.add.circle(medalX, rowY, medalSize, medalColors[index]);
                }

                // Score (white text, bigger font)
                const scoreText = this.add.text(
                    scoreX, rowY,
                    score.score.toLocaleString(),
                    {
                        fontSize: scoreFontSize,
                        fontFamily: 'Arial',
                        fill: '#ffffff',
                        fontWeight: 'bold'
                    }
                ).setOrigin(1, 0.5);

                // Arcade-style fly-in animation (left to right!)
                const animDelay = 500 + (index * 150); // Stagger each row
                const animDuration = 400;

                // Start all elements off-screen to the left
                rankText.setX(rankText.x - width);
                nameText.setX(nameText.x - width);
                if (medal) medal.setX(medal.x - width);
                scoreText.setX(scoreText.x - width);

                // Animate flying in from left
                this.tweens.add({
                    targets: rankText,
                    x: rankX,
                    delay: animDelay,
                    duration: animDuration,
                    ease: 'Back.easeOut'
                });

                this.tweens.add({
                    targets: nameText,
                    x: nameX,
                    delay: animDelay + 50,
                    duration: animDuration,
                    ease: 'Back.easeOut'
                });

                if (medal) {
                    this.tweens.add({
                        targets: medal,
                        x: medalX,
                        delay: animDelay + 100,
                        duration: animDuration,
                        ease: 'Back.easeOut'
                    });
                }

                this.tweens.add({
                    targets: scoreText,
                    x: scoreX,
                    delay: animDelay + 150,
                    duration: animDuration,
                    ease: 'Back.easeOut'
                });
            });
        }
    }

    /**
     * Create back button (fixed distance below table - arcade style!)
     */
    createBackButton(width, height) {
        const startY = height * 0.22;
        const rowHeight = width < 400 ? 50 : 55;
        const tableHeight = (this.maxScores + 1) * rowHeight + 30;
        const tableBottom = startY + tableHeight;

        // Fixed spacing below table (like arcade cabinets!)
        const spacing = width < 400 ? 25 : 35; // ~0.5cm on most screens
        const buttonY = tableBottom + spacing + 25; // +25 for half button height

        const buttonWidth = Math.min(width * 0.4, 200);
        const buttonHeight = 50;

        const button = this.add.rectangle(
            width / 2, buttonY, buttonWidth, buttonHeight, 0x2c3e50
        );
        button.setStrokeStyle(3, 0xe74c3c);
        button.setInteractive({ useHandCursor: true });

        const text = this.add.text(width / 2, buttonY, 'BACK', {
            fontSize: '18px',
            fontFamily: 'Arial',
            fill: '#ffffff',
            fontWeight: 'bold'
        }).setOrigin(0.5);

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
     * Load high scores from localStorage
     */
    loadHighScores() {
        try {
            const saved = localStorage.getItem('battleshipsHighScores');
            if (saved) {
                this.highScores = JSON.parse(saved);
            } else {
                // Initialize with sample data for testing
                this.initializeSampleScores();
            }
        } catch (error) {
            console.warn('Failed to load high scores:', error);
            this.initializeSampleScores();
        }
    }

    /**
     * Initialize with sample high scores (for testing)
     */
    initializeSampleScores() {
        this.highScores = [
            { name: 'Admiral Nelson', score: 15000, date: new Date('2025-10-01').toISOString(), accuracy: 95 },
            { name: 'Captain Ahab', score: 12500, date: new Date('2025-09-28').toISOString(), accuracy: 88 },
            { name: 'Lt. Commander', score: 10200, date: new Date('2025-09-25').toISOString(), accuracy: 82 },
            { name: 'Ensign Jones', score: 8900, date: new Date('2025-09-20').toISOString(), accuracy: 75 },
            { name: 'Sailor Mike', score: 7500, date: new Date('2025-09-15').toISOString(), accuracy: 70 }
        ];
        this.saveHighScores();
    }

    /**
     * Save high scores to localStorage
     */
    saveHighScores() {
        try {
            localStorage.setItem('battleshipsHighScores', JSON.stringify(this.highScores));
        } catch (error) {
            console.warn('Failed to save high scores:', error);
        }
    }

    /**
     * Add a new high score (called from GameScene on victory)
     * @param {object} scoreData - Object containing score information
     */
    addHighScore(scoreData) {
        this.highScores.push(scoreData);
        this.highScores.sort((a, b) => b.score - a.score);
        this.highScores = this.highScores.slice(0, this.maxScores);
        this.saveHighScores();
    }

    /**
     * Clear all high scores
     */
    clearHighScores() {
        this.highScores = [];
        localStorage.removeItem('battleshipsHighScores');
    }

    /**
     * Format date for display
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const year = date.getFullYear().toString().slice(-2);
        return `${month}/${day}/${year}`;
    }

    /**
     * Handle dynamic resize - recreate background to prevent black screen
     */
    handleResize(width, height) {
        // Recreate background to fill new dimensions (prevents black screen bug)
        this.createBackground();

        // High scores table is complex with many animated elements
        // Scene restart ensures proper layout recalculation and animation replay
        // Settings and scores are persisted in localStorage, so no data loss
        this.scene.restart();
    }
}