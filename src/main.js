/**
 * @fileoverview Main game entry point for Battleships & Subs.
 * Initializes the Phaser game instance and handles responsive resizing.
 * @namespace BattleshipsGame
 */

import { TitleScene } from './scenes/TitleScene.js';
import { GameScene } from './scenes/GameScene.js';
import { SettingsScene } from './scenes/SettingsScene.js';
import { HighScoresScene } from './scenes/HighScoresScene.js';
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
            scene: [TitleScene, GameScene, SettingsScene, HighScoresScene],
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
     * Setup Phaser Scale Manager events (replaces manual window listeners)
     */
    setupScaleManagerEvents() {
        // Listen to Phaser's built-in resize event
        this.game.scale.on('resize', (gameSize) => {
            // Get the currently active scene
            const activeScenes = this.game.scene.getScenes(true);
            if (activeScenes.length > 0) {
                const activeScene = activeScenes[0];

                // Call handleResize if the scene implements it
                if (activeScene && typeof activeScene.handleResize === 'function') {
                    activeScene.handleResize(gameSize.width, gameSize.height);
                }
            }
        });
    }
}

// Initialize the game
const game = new BattleshipsGame();
game.init();