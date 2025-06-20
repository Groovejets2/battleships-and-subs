/**
 * @fileoverview Defines the Phaser game configuration.
 * @namespace GameConfig
 */

/**
 * Phaser game configuration object.
 * Specifies rendering type, dimensions, parent container, scaling, and scenes.
 * @constant {object}
 */
export const gameConfig = {
    type: Phaser.AUTO,
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        // Width and height will be set dynamically at game creation
        width: 0,
        height: 0
    },
    scene: [] // Scenes will be added dynamically
};