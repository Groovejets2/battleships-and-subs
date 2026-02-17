/**
 * @fileoverview Main game entry point for Battleships & Subs.
 * Initializes the Phaser game instance and handles responsive resizing.
 * @namespace BattleshipsGame
 */

import { TitleScene } from './scenes/TitleScene.js';
import { GameScene } from './scenes/GameScene.js';
import { SettingsScene } from './scenes/SettingsScene.js';
import { HighScoresScene } from './scenes/HighScoresScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';
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

        const config = {
            type: Phaser.AUTO,
            width: window.innerWidth,
            height: window.innerHeight,
            parent: 'game-container',
            scene: [TitleScene, GameScene, SettingsScene, HighScoresScene, GameOverScene],
            backgroundColor: GAME_CONSTANTS.COLORS.BACKGROUND,
            scale: {
                mode: Phaser.Scale.RESIZE,
                autoCenter: Phaser.Scale.CENTER_BOTH
            },
            callbacks: {
                postBoot: (game) => {
                    // Hide loading screen after Phaser boots
                    const loadingElement = document.getElementById('loading');
                    if (loadingElement) {
                        loadingElement.style.display = 'none';
                    }
                }
            }
        };

        this.game = new Phaser.Game(config);
        this.isInitialized = true;

        this.setupScaleManagerEvents();
    }

    // Removed calculateGameDimensions - Phaser.Scale.RESIZE handles this automatically

    /**
     * Setup Phaser Scale Manager events and window resize listener
     */
    setupScaleManagerEvents() {
        // Listen to Phaser's built-in resize event
        this.game.scale.on('resize', (gameSize) => {
            this.handleSceneResize(gameSize.width, gameSize.height);
        });

        // ALSO listen to window resize for Chrome DevTools rotation button
        // DevTools rotation doesn't always trigger Phaser's resize event properly
        window.addEventListener('resize', () => {
            // Use Phaser's scale dimensions which account for device pixel ratio
            const width = this.game.scale.width;
            const height = this.game.scale.height;
            this.handleSceneResize(width, height);
        });
    }

    /**
     * Handle resize for active scene
     */
    handleSceneResize(width, height) {
        const activeScenes = this.game.scene.getScenes(true);
        if (activeScenes.length > 0) {
            const activeScene = activeScenes[0];
            if (activeScene && typeof activeScene.handleResize === 'function') {
                activeScene.handleResize(width, height);
            }
        }
    }
}

// Initialize the game
const game = new BattleshipsGame();
game.init();

// Expose game instance globally for testing/debugging
window.battleshipsGame = game;