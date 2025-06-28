/**
 * @fileoverview Enhanced main entry point for Battleships and Subs.
 * Implements professional game initialization with proper scene management.
 * @namespace Main
 */

import { gameConfig, calculateGameDimensions, GAME_CONSTANTS } from './config/gameConfig.js';
import { TitleScene } from './scenes/TitleScene.js';
import { GameScene } from './scenes/GameScene.js';

/**
 * Game class following SRP - handles initialization and lifecycle
 */
class BattleshipsGame {
    constructor() {
        this.game = null;
        this.isInitialized = false;
    }

    /**
     * Initialize the game with proper error handling
     */
    async init() {
        try {
            // Calculate initial dimensions
            const { width, height } = calculateGameDimensions();
            
            // Update configuration
            gameConfig.width = width; // Set top-level width/height
            gameConfig.height = height;
            gameConfig.scene = [TitleScene, GameScene]; // Include both scenes
            
            // Create game instance
            this.game = new Phaser.Game(gameConfig);
            this.isInitialized = true;
            
            // Setup resize handling
            this.setupResizeHandler();
            
            console.log(`Game initialized: ${width}x${height}`);
            
        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.showError('Failed to load game. Please refresh the page.');
        }
    }

    /**
     * Professional resize handling without page reload
     */
    setupResizeHandler() {
        let resizeTimeout;
        
        const handleResize = () => {
            if (!this.isInitialized) return;
            
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const { width, height } = calculateGameDimensions();
                
                // Only resize if dimensions changed significantly
                const currentWidth = this.game.scale.width;
                const currentHeight = this.game.scale.height;
                
                if (Math.abs(width - currentWidth) > 10 || Math.abs(height - currentHeight) > 10) {
                    this.game.scale.resize(width, height);
                    
                    // Notify active scene of resize
                    const activeScene = this.game.scene.getScene('GameScene') || this.game.scene.getScene('TitleScene');
                    if (activeScene && activeScene.handleResize) {
                        activeScene.handleResize(width, height);
                    }
                }
            }, 250); // Debounced resize
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', () => {
            setTimeout(handleResize, 100); // Small delay for orientation change
        });
    }

    /**
     * Display error message to user
     */
    showError(message) {
        const container = document.getElementById('game-container');
        container.innerHTML = `
            <div style="
                color: white; 
                text-align: center; 
                padding: 20px;
                font-family: Arial, sans-serif;
            ">
                <h3>Game Error</h3>
                <p>${message}</p>
                <button onclick="window.location.reload()" style="
                    padding: 10px 20px;
                    background: #2a5298;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                ">Reload Game</button>
            </div>
        `;
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const battleshipsGame = new BattleshipsGame();
    battleshipsGame.init();
});

// Export for debugging
window.BattleshipsGame = BattleshipsGame;