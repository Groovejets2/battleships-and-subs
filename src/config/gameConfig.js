/**
 * @fileoverview Enhanced game configuration and constants.
 * @namespace GameConfig
 */

// Game constants following DRY principle
export const GAME_CONSTANTS = {
    GRID_SIZE: 10,
    CELL_SIZE: 40,      // Default/target cell size
    MIN_CELL_SIZE: 30,  // Minimum for tiny screens
    MAX_CELL_SIZE: 70,  // Maximum for large screens (increased from 50)
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
 * Ship type definitions
 * Following requirements: Carrier(5), Nuclear Sub(3), Cruiser(3), Attack Sub(2), Destroyer(2)
 */
export const SHIP_TYPES = {
    CARRIER: {
        type: 'CARRIER',
        name: 'Carrier',
        length: 5,
        color: 0x808080,
        sprite: 'ship-carrier'
    },
    NUCLEAR_SUB: {
        type: 'NUCLEAR_SUB',
        name: 'Nuclear Submarine',
        length: 3,
        color: 0x0000ff,
        sprite: 'ship-submarine'
    },
    CRUISER: {
        type: 'CRUISER',
        name: 'Cruiser',
        length: 3,
        color: 0x00ff00,
        sprite: 'ship-cruiser'
    },
    ATTACK_SUB: {
        type: 'ATTACK_SUB',
        name: 'Attack Submarine',
        length: 2,
        color: 0xff00ff,
        sprite: 'ship-submarine'
    },
    DESTROYER: {
        type: 'DESTROYER',
        name: 'Destroyer',
        length: 2,
        color: 0xffff00,
        sprite: 'ship-destroyer'
    }
};

/**
 * Get array of all ship types in placement order
 */
export function getShipPlacementOrder() {
    return [
        SHIP_TYPES.CARRIER,
        SHIP_TYPES.NUCLEAR_SUB,
        SHIP_TYPES.CRUISER,
        SHIP_TYPES.ATTACK_SUB,
        SHIP_TYPES.DESTROYER
    ];
}

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