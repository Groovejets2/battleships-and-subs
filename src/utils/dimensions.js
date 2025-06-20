/**
 * @fileoverview Utility functions for calculating game dimensions.
 * @namespace Dimensions
 */

/**
 * Calculates dynamic game dimensions based on a fixed height and window width.
 * This ensures the game scales appropriately for various screen sizes.
 * @function
 * @returns {object} An object containing the calculated width and height.
 * @property {number} width - The calculated width for the game canvas.
 * @property {number} height - The fixed height for the game canvas.
 */
export function calculateDimensions() {
    const fixedHeight = 1100; // Fixed height as per original logic
    const width = window.innerWidth; // Use the window's inner width

    return { width, height: fixedHeight };
}