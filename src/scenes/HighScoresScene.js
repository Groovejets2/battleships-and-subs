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
        this.maxScores = 10;
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
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x1e3c72, 0x1e3c72, 0x2a5298, 0x2a5298, 1);
        graphics.fillRect(0, 0, this.scale.width, this.scale.height);
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
     * Create scores table with headers and data
     */
    createScoresTable(width, height) {
        const startY = height * 0.22;
        const tableWidth = Math.min(width * 0.9, 600);

        // Calculate available height for table (leave space for BACK button at bottom)
        const buttonY = height * 0.94; // BACK button position
        const buttonHeight = 50;
        const buttonMargin = 20;
        const availableHeight = buttonY - buttonHeight - buttonMargin - startY;

        // Adjust row height to fit available space, with min/max limits
        const maxRowHeight = 45;
        const minRowHeight = 35;
        const calculatedRowHeight = availableHeight / (this.maxScores + 1.5); // +1.5 for header and padding
        const rowHeight = Math.max(minRowHeight, Math.min(maxRowHeight, calculatedRowHeight));

        // Table background
        const tableHeight = (this.maxScores + 1) * rowHeight + 20;
        const tableBg = this.add.rectangle(
            width / 2, startY + tableHeight / 2,
            tableWidth, tableHeight,
            0x1a1a2e, 0.7
        );
        tableBg.setStrokeStyle(2, 0x3498db);

        // Responsive column positions - 3 columns only (RANK, NAME, SCORE)
        const leftMargin = width / 2 - tableWidth / 2 + 30;
        const rankX = leftMargin;
        const nameX = leftMargin + (width < 500 ? 50 : 70);
        const scoreX = width / 2 + tableWidth / 2 - 30;

        // Column headers with responsive font size
        const headerFontSize = width < 400 ? '14px' : '16px';
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
            headerY + 20,
            scoreX + 10,
            headerY + 20
        );

        // Medal colors for top 3 positions
        const medalColors = {
            0: '#FFD700', // Gold
            1: '#C0C0C0', // Silver
            2: '#CD7F32'  // Bronze
        };

        // Score rows with responsive font sizes
        const rowFontSize = width < 400 ? '13px' : '14px';
        const rowStyle = {
            fontSize: rowFontSize,
            fontFamily: 'Arial',
            fill: '#ffffff'
        };

        if (this.highScores.length === 0) {
            // No scores yet - show message
            this.add.text(width / 2, startY + tableHeight / 2, 'No scores yet!\nBe the first to play!', {
                fontSize: '18px',
                fontFamily: 'Arial',
                fill: '#a0c4ff',
                align: 'center'
            }).setOrigin(0.5);
        } else {
            // Display scores
            this.highScores.forEach((score, index) => {
                const rowY = headerY + 40 + (index * rowHeight);

                // Determine rank color (gold/silver/bronze for top 3)
                const rankColor = medalColors[index] || '#ffffff';
                const isTopThree = index < 3;

                // Alternate row background
                if (index % 2 === 0) {
                    const rowBg = this.add.rectangle(
                        width / 2, rowY,
                        tableWidth - 40, rowHeight - 5,
                        0x0f3460, 0.3
                    );
                }

                // Rank number with color coding for top 3
                this.add.text(rankX, rowY, (index + 1).toString(), {
                    fontSize: isTopThree ? '18px' : rowFontSize,
                    fontFamily: 'Arial',
                    fill: rankColor,
                    fontWeight: isTopThree ? 'bold' : 'normal'
                }).setOrigin(0, 0.5);

                // Name
                this.add.text(
                    nameX, rowY,
                    score.name || 'Player',
                    rowStyle
                ).setOrigin(0, 0.5);

                // Score
                this.add.text(
                    scoreX, rowY,
                    score.score.toLocaleString(),
                    { ...rowStyle, fontWeight: 'bold', fill: '#2ecc71' }
                ).setOrigin(1, 0.5);
            });
        }
    }

    /**
     * Create back button (centered at bottom)
     */
    createBackButton(width, height) {
        const buttonY = height * 0.94;
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
     * Handle dynamic resize - restart scene for proper table recreation
     */
    handleResize(width, height) {
        // High scores table is complex with many elements
        // Scene restart ensures proper layout recalculation
        // Settings and scores are persisted in localStorage, so no data loss
        this.scene.restart();
    }
}