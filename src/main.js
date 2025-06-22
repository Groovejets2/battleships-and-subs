/**
 * @fileoverview Main entry point for the Battleships and Subs Phaser game.
 * Initializes the Phaser game instance and registers scenes.
 * @namespace Main
 */

import { gameConfig } from './config/gameConfig.js';
import { calculateDimensions } from './utils/dimensions.js';
import { GameScene } from './scenes/GameScene.js';

// Calculate the initial dimensions
const { width, height } = calculateDimensions();

// Update the game configuration with dynamic dimensions
gameConfig.width = width;
gameConfig.height = height;
gameConfig.scale.width = width;
gameConfig.scale.height = height;

// Add the GameScene to the configuration
gameConfig.scene.push(GameScene);

/**
 * The main Phaser game instance.
 * @constant {Phaser.Game}
 */
const game = new Phaser.Game(gameConfig);

// Listen for window resize events to adjust game dimensions (DRY principle - centralizing resize handling)
window.addEventListener('resize', () => {
    const { width: newWidth, height: newHeight } = calculateDimensions();
    game.scale.resize(newWidth, newHeight);
    // You might need to explicitly call a resize method on your scene here if layout needs re-calculating
    // For now, the create method in GameScene handles initial layout based on scale.width,
    // but dynamic re-layout during runtime would require more advanced handling in the scene.
});