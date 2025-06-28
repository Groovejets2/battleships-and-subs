/**
 * @fileoverview Enhanced game configuration and constants.
 * @namespace GameConfig
 */

// Game constants following DRY principle
export const GAME_CONSTANTS = {
    GRID_SIZE: 10,
    CELL_SIZE: 40,
    MIN_CELL_SIZE: 30,
    MAX_CELL_SIZE: 50,
    GRID_SPACING: 100,
    MIN_GRID_SPACING: 60,
    
    // UI Constants
    LABEL_SPACE: 30,
    TITLE_SPACE: 50,
    MARGIN: 20,
    
    // Colors
    COLORS: {
        BACKGROUND: '#0066aa',
        GRID_LINE: 0x000000,
        PLAYER_GRID: 0x00aa00,
        ENEMY_GRID: 0xff6600,
        TEXT: '#ffffff',
        UI_PRIMARY: '#1e3c72',
        UI_SECONDARY: '#2a5298'
    },
    
    // Responsive breakpoints
    BREAKPOINTS: {
        MOBILE: 768,
        TABLET: 1024
    }
};

/**
 * Calculates optimal game dimensions based on screen size
 * @returns {object} Calculated width and height
 */
export function calculateGameDimensions() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Calculate based on grid requirements
    const gridWidth = GAME_CONSTANTS.GRID_SIZE * GAME_CONSTANTS.CELL_SIZE;
    const minWidth = screenWidth < GAME_CONSTANTS.BREAKPOINTS.MOBILE 
        ? gridWidth + (GAME_CONSTANTS.MARGIN * 2) + GAME_CONSTANTS.LABEL_SPACE
        : (gridWidth * 2) + GAME_CONSTANTS.GRID_SPACING + (GAME_CONSTANTS.MARGIN * 2);
    
    const minHeight = screenWidth < GAME_CONSTANTS.BREAKPOINTS.MOBILE
        ? (gridWidth * 2) + GAME_CONSTANTS.GRID_SPACING + 200 // Extra space for UI
        : gridWidth + 200;
    
    return {
        width: Math.max(minWidth, screenWidth),
        height: Math.max(minHeight, screenHeight)
    };
}

/**
 * Enhanced Phaser game configuration object.
 * @constant {object}
 */
export const gameConfig = {
    type: Phaser.AUTO,
    parent: 'game-container',
    backgroundColor: GAME_CONSTANTS.COLORS.BACKGROUND,
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [],
    callbacks: {
        postBoot: function (game) {
            // Remove loading indicator once game boots
            const loading = document.getElementById('loading');
            if (loading) {
                loading.style.display = 'none';
            }
        }
    }
};