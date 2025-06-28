/**
 * @fileoverview Enhanced GameScene with navigation and responsive design.
 * @namespace GameScene
 */

import { createGrid } from '../components/Grid.js';
import { GAME_CONSTANTS } from '../config/gameConfig.js';

/**
 * Enhanced game scene class with navigation support
 * @class
 * @augments Phaser.Scene
 */
export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.playerGrid = null;
        this.enemyGrid = null;
        this.gameState = 'SETUP';
        this.currentPlayer = 'PLAYER';
        this.uiElements = {};
        this.gridTitles = []; // Store grid titles
    }

    preload() {
        // Load game assets here
        // this.load.image('ship', 'assets/images/ship.png');
    }

    create() {
        this.createGameLayout();
        this.createUI();
        this.setupInput();
    }

    /**
     * Create responsive game layout
     */
    createGameLayout() {
        const { width, height } = this.scale;
        const { GRID_SIZE, CELL_SIZE, GRID_SPACING, COLORS } = GAME_CONSTANTS;
        
        // Set background
        this.cameras.main.setBackgroundColor(COLORS.BACKGROUND);
        
        // Calculate layout
        const layout = this.calculateLayout(width, height);
        console.log('Layout:', { width, height, ...layout }); // Debug layout
        
        // Create grids
        this.playerGrid = createGrid(
            this, layout.playerX, layout.playerY, 
            GRID_SIZE, layout.cellSize, 'PLAYER'
        );
        this.enemyGrid = createGrid(
            this, layout.enemyX, layout.enemyY, 
            GRID_SIZE, layout.cellSize, 'ENEMY'
        );
        
        // Add grid titles
        const titleStyle = { 
            font: `${Math.min(24, width * 0.03)}px Arial`, 
            fill: COLORS.TEXT, 
            fontStyle: 'bold' 
        };
        
        const playerTitle = this.add.text(
            layout.playerX + (GRID_SIZE * layout.cellSize) / 2, 
            layout.playerY - 30, 
            'YOUR FLEET', 
            titleStyle
        ).setOrigin(0.5);
        
        const enemyTitle = this.add.text(
            layout.enemyX + (GRID_SIZE * layout.cellSize) / 2, 
            layout.enemyY - 30, 
            'ENEMY WATERS', 
            titleStyle
        ).setOrigin(0.5);
        
        this.gridTitles = [playerTitle, enemyTitle];
        
        // Store layout for resize handling
        this.currentLayout = layout;
    }

    /**
     * Calculate responsive layout based on screen dimensions
     */
    calculateLayout(width, height) {
        const { GRID_SIZE, CELL_SIZE, GRID_SPACING, LABEL_SPACE, TITLE_SPACE, MARGIN } = GAME_CONSTANTS;
        
        // Determine optimal cell size based on screen
        const maxCellSize = Math.min(
            (width - MARGIN * 2 - LABEL_SPACE * 2 - GRID_SPACING) / (GRID_SIZE * 2),
            (height - MARGIN * 2 - TITLE_SPACE * 2 - 100) / GRID_SIZE
        );
        
        const cellSize = Math.max(GAME_CONSTANTS.MIN_CELL_SIZE, Math.min(CELL_SIZE, maxCellSize));
        const gridWidth = GRID_SIZE * cellSize;
        
        // Determine if we should stack grids
        const shouldStack = width < (gridWidth * 2 + GRID_SPACING + MARGIN * 2);
        
        let playerX, playerY, enemyX, enemyY;
        
        if (shouldStack) {
            // Vertical stacking for mobile
            const totalHeight = gridWidth * 2 + GRID_SPACING + TITLE_SPACE * 2;
            const startY = Math.max(MARGIN, (height - totalHeight) / 2);
            const centerX = (width - gridWidth) / 2;
            
            playerX = centerX;
            playerY = startY + TITLE_SPACE;
            enemyX = centerX;
            enemyY = startY + TITLE_SPACE + gridWidth + GRID_SPACING + TITLE_SPACE;
        } else {
            // Horizontal layout for desktop
            const totalWidth = gridWidth * 2 + GRID_SPACING;
            const startX = Math.max(MARGIN, (width - totalWidth) / 2);
            const centerY = Math.max(MARGIN, (height - gridWidth - TITLE_SPACE) / 2);
            
            playerX = startX;
            playerY = centerY + TITLE_SPACE;
            enemyX = startX + gridWidth + GRID_SPACING;
            enemyY = centerY + TITLE_SPACE;
        }
        
        return { playerX, playerY, enemyX, enemyY, cellSize, shouldStack };
    }

    /**
     * Create game UI elements
     */
    createUI() {
        const { width, height } = this.scale;
        
        // Back button (top-left)
        const backButton = this.add.rectangle(60, 30, 100, 40, 0x2c3e50)
            .setStrokeStyle(2, 0xe74c3c)
            .setInteractive({ useHandCursor: true });
            
        const backText = this.add.text(60, 30, 'BACK', {
            fontSize: '16px',
            fontFamily: 'Arial',
            fill: '#ffffff',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        // Back button interactions
        backButton.on('pointerover', () => {
            backButton.setFillStyle(0xe74c3c);
            this.tweens.add({
                targets: [backButton, backText],
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 150
            });
        });
        
        backButton.on('pointerout', () => {
            backButton.setFillStyle(0x2c3e50);
            this.tweens.add({
                targets: [backButton, backText],
                scaleX: 1,
                scaleY: 1,
                duration: 150
            });
        });
        
        backButton.on('pointerdown', () => {
            this.scene.start('TitleScene');
        });
        
        // Game status display
        this.uiElements.statusText = this.add.text(width / 2, 20, 'SETUP PHASE - Place your ships', {
            fontSize: '18px',
            fontFamily: 'Arial',
            fill: GAME_CONSTANTS.COLORS.TEXT,
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        // Store UI elements for updates
        this.uiElements.backButton = backButton;
        this.uiElements.backText = backText;
    }

    /**
     * Setup input handling including keyboard shortcuts
     */
    setupInput() {
        // ESC key to return to title
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start('TitleScene');
        });
        
        // Add other keyboard shortcuts as needed
        this.input.keyboard.on('keydown-R', () => {
            // Could add restart functionality
            console.log('Restart game');
        });
    }

    /**
     * Handle dynamic resize
     */
    handleResize(width, height) {
        // Destroy existing grids and titles
        if (this.playerGrid) {
            this.playerGrid.cells.clear(true, true); // Clear and destroy all cells
            this.playerGrid.graphics.destroy();
            this.playerGrid.labels.forEach(label => label.destroy());
            this.playerGrid = null;
        }
        if (this.enemyGrid) {
            this.enemyGrid.cells.clear(true, true); // Clear and destroy all cells
            this.enemyGrid.graphics.destroy();
            this.enemyGrid.labels.forEach(label => label.destroy());
            this.enemyGrid = null;
        }
        this.gridTitles.forEach(title => title.destroy());
        this.gridTitles = [];

        // Recreate the game layout
        this.createGameLayout();

        // Update UI elements
        this.uiElements.statusText.setPosition(width / 2, 20);
    }

    /**
     * Update game state text
     */
    updateGameState(newState) {
        this.gameState = newState;
        
        const stateMessages = {
            'SETUP': 'SETUP PHASE - Place your ships',
            'PLAYER_TURN': 'YOUR TURN - Choose target',
            'ENEMY_TURN': 'ENEMY TURN - Wait...',
            'GAME_OVER': 'GAME OVER'
        };
        
        if (this.uiElements.statusText) {
            this.uiElements.statusText.setText(stateMessages[newState] || newState);
        }
    }

    update() {
        // Game logic updates here
        // This is where AI turns, animations, etc. would be handled
    }
}