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
    }

    preload() {
        // Load game assets here
        // this.load.image('ship', 'assets/images/ship.png');
    }

    create() {
        this.createGameLayout();
        this.createUI();
        this.setupInput();
        // Add debug text to confirm scene loading
        this.add.text(100, 100, 'GameScene Loaded!', { font: '32px Arial', fill: '#ffffff' });
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
        
        this.add.text(
            layout.playerX + (GRID_SIZE * layout.cellSize) / 2, 
            layout.playerY - 30, 
            'YOUR FLEET', 
            titleStyle
        ).setOrigin(0.5);
        
        this.add.text(
            layout.enemyX + (GRID_SIZE * layout.cellSize) / 2, 
            layout.enemyY - 30, 
            'ENEMY WATERS', 
            titleStyle
        ).setOrigin(0.5);
        
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
            .setStrokeStyle(2, 0xe74c3c) // Fixed from setStroke
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
        // Recalculate layout and reposition elements
        const newLayout = this.calculateLayout(width, height);
        
        // Update grid positions (would need to enhance Grid.js to support repositioning)
        // For now, restart the scene
        this.scene.restart();
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
            this.uiElements.statusText.setText(stateHandler(newState) || newState);
        }
    }

    update() {
        // Game logic updates here
        // This is where AI turns, animations, etc. would be handled
    }
}