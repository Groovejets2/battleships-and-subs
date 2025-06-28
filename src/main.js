/**
 * @fileoverview Main game entry point for Battleships & Subs.
 * Initializes the Phaser game instance and handles responsive resizing.
 * @namespace BattleshipsGame
 */

import { TitleScene } from './scenes/TitleScene.js';
import { GameScene } from './scenes/GameScene.js';
import { GAME_CONSTANTS } from './config/gameConfig.js';

/**
 * Main game class to initialize Phaser and manage scenes
 * @class
 */
export class BattleshipsGame {
    constructor() {
        this.game = null;
        this.isInitialized = false;
    }

    /**
     * Initialize the Phaser game instance
     */
    init() {
        if (this.isInitialized) return;

        const { width, height } = this.calculateGameDimensions();

        const config = {
            type: Phaser.AUTO,
            width: width,
            height: height,
            parent: 'game-container',
            scene: [TitleScene, GameScene],
            backgroundColor: GAME_CONSTANTS.COLORS.BACKGROUND,
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH
            }
        };

        this.game = new Phaser.Game(config);
        this.isInitialized = true;

        this.setupResizeHandler();

        // Hide loading screen after game initialization
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }

    /**
     * Calculate game dimensions based on window size
     * @returns {object} Width and height for the game canvas
     */
    calculateGameDimensions() {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const aspectRatio = 16 / 9;
        let width = windowWidth;
        let height = windowWidth / aspectRatio;

        if (height > windowHeight) {
            height = windowHeight;
            width = windowHeight * aspectRatio;
        }

        return {
            width: Math.round(width),
            height: Math.round(height)
        };
    }

    /**
     * Setup window resize handler with debouncing
     */
    setupResizeHandler() {
        let resizeTimeout;
        
        const handleResize = () => {
            if (!this.isInitialized) return;
            
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const { width, height } = this.calculateGameDimensions();
                
                // Force canvas resize
                this.game.scale.resize(width, height);
                this.game.scale.setGameSize(width, height);
                
                // Notify active scene of resize
                const activeScene = this.game.scene.getScene('GameScene') || this.game.scene.getScene('TitleScene');
                if (activeScene && activeScene.handleResize) {
                    activeScene.handleResize(width, height);
                }
            }, 250); // Debounced resize
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', () => {
            setTimeout(handleResize, 100); // Small delay for orientation change
        });
    }
}

// Initialize the game
const game = new BattleshipsGame();
game.init();