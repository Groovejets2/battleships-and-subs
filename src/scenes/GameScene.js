/**
 * @fileoverview Defines the main game scene for Battleships and Subs.
 * Handles asset loading, game object creation, and game state updates.
 * @namespace GameScene
 */

import { createGrid } from '../components/Grid.js';
import { calculateDimensions } from '../utils/dimensions.js';

/**
 * Main game scene class.
 * Manages the core game loop, including asset loading, initial setup, and ongoing updates.
 * @class
 * @augments Phaser.Scene
 */
export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        /**
         * The player's game grid.
         * @type {object}
         */
        this.playerGrid = null;
        /**
         * The enemy's game grid.
         * @type {object}
         */
        this.enemyGrid = null;
        /**
         * The current game state.
         * @type {string}
         */
        this.gameState = 'SETUP';
        /**
         * The current player turn.
         * @type {string}
         */
        this.currentPlayer = 'PLAYER';
    }

    /**
     * Preloads assets required for the scene.
     * This method is called by Phaser before the scene is created.
     * @method
     */
    preload() {
        // Load assets here (e.g., images, sounds)
        // Example: this.load.image('ship', 'assets/images/ship.png');
    }

    /**
     * Creates game objects and initializes the scene.
     * This method is called by Phaser once assets are loaded.
     * @method
     */
    create() {
        // Game constants (KISS principle - keep simple constants here for now)
        const gridSize = 10;
        const cellSize = 40;
        const gridWidth = gridSize * cellSize;
        const gridHeight = gridSize * cellSize;
        const gridSpacing = 100; // Space between grids

        // Determine if layout should be stacked based on window size (SOC principle - layout logic kept together)
        const shouldStack = this.scale.width < gridWidth * 2 + gridSpacing;

        let playerGridX, playerGridY, enemyGridX, enemyGridY;

        if (shouldStack) {
            // Stacked layout calculations
            const labelSpace = 50;
            const titleSpace = 70;
            const bottomMargin = 30;

            const totalHeight = (gridHeight * 2) + gridSpacing + (labelSpace * 2) + (titleSpace * 2) + bottomMargin;
            const availableHeight = this.sys.game.config.height - 40; // Use actual config height
            const scale = availableHeight < totalHeight ? availableHeight / totalHeight : 1;

            const scaledGridHeight = gridHeight * scale;
            const scaledGridSpacing = gridSpacing * scale;
            const scaledLabelSpace = labelSpace * scale;
            const scaledTitleSpace = titleSpace * scale;

            const xOffset = (this.sys.game.config.width - gridWidth * scale) / 2; // Use actual config width
            const startY = 20;

            playerGridX = xOffset;
            playerGridY = startY + scaledTitleSpace;
            enemyGridX = xOffset;
            enemyGridY = startY + scaledTitleSpace + scaledGridHeight + scaledLabelSpace + scaledGridSpacing + scaledTitleSpace;
        } else {
            // Side-by-side layout calculations
            const labelSpace = 30;
            const titleSpace = 50;
            const totalWidth = (gridWidth * 2) + gridSpacing + (labelSpace * 2);
            const startX = Math.max(20, (this.sys.game.config.width - totalWidth) / 2); // Use actual config width
            const yOffset = Math.max(20, (this.sys.game.config.height - gridHeight - titleSpace - 30) / 2); // Use actual config height

            playerGridX = startX + labelSpace;
            playerGridY = yOffset + titleSpace;
            enemyGridX = startX + labelSpace + gridWidth + gridSpacing;
            enemyGridY = yOffset + titleSpace;
        }

        // Log positions for debugging purposes (DYC - Don't Repeat Yourself, move console logs to a debug util if many)
        console.log(`Canvas Dimensions: Width = ${this.sys.game.config.width}, Height = ${this.sys.game.config.height}`);
        console.log(`Player Grid Position: x = ${playerGridX}, y = ${playerGridY}`);
        console.log(`Enemy Grid Position: x = ${enemyGridX}, y = ${enemyGridY}`);

        // Set background color
        this.cameras.main.setBackgroundColor('#0066aa');

        // Create and position both grids (SLAP principle - delegating complex grid creation to Grid.js)
        this.playerGrid = createGrid(this, playerGridX, playerGridY, gridSize, cellSize, 'PLAYER');
        this.enemyGrid = createGrid(this, enemyGridX, enemyGridY, gridSize, cellSize, 'ENEMY');

        // Add grid titles
        const titleStyle = { font: '24px Arial', fill: '#ffffff', fontStyle: 'bold' };
        this.add.text(playerGridX + gridWidth / 2, playerGridY - 30, 'YOUR FLEET', titleStyle).setOrigin(0.5);
        this.add.text(enemyGridX + gridWidth / 2, enemyGridY - 30, 'ENEMY WATERS', titleStyle).setOrigin(0.5);

        // Initialize game state (SRP - initial state management within scene)
        this.gameState = 'SETUP';
        this.currentPlayer = 'PLAYER';
    }

    /**
     * Updates game logic during the game loop.
     * This method is called by Phaser once per frame.
     * @method
     */
    update() {
        // Update game logic here if necessary (YAGNI principle - only add what's needed now)
    }
}