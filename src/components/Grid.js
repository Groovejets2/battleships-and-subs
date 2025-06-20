/**
 * @fileoverview Provides functionality to create and manage a game grid.
 * @namespace GridComponent
 */

/**
 * Creates and renders a game grid with interactive cells and coordinate labels.
 * Adheres to SLAP (Single Level of Abstraction Principle) for clarity in grid creation.
 * @function
 * @param {Phaser.Scene} scene - The Phaser scene to which the grid will be added.
 * @param {number} xOffset - The X-coordinate offset for the grid's top-left corner.
 * @param {number} yOffset - The Y-coordinate offset for the grid's top-left corner.
 * @param {number} gridSize - The number of cells along one side of the square grid (e.g., 10 for 10x10).
 * @param {number} cellSize - The size of an individual cell in pixels.
 * @param {string} gridType - A string indicating the type of grid ('PLAYER' or 'ENEMY').
 * @returns {object} An object containing the grid cells group and grid properties.
 * @property {Phaser.GameObjects.Group} cells - A Phaser group containing all interactive grid cells.
 * @property {number} xOffset - The X-coordinate offset used for the grid.
 * @property {number} yOffset - The Y-coordinate offset used for the grid.
 * @property {number} gridSize - The size of the grid.
 * @property {number} cellSize - The size of each cell.
 * @property {string} type - The type of the grid.
 */
export function createGrid(scene, xOffset, yOffset, gridSize, cellSize, gridType) {
    const gridWidth = gridSize * cellSize;
    const gridHeight = gridSize * cellSize;

    // Draw grid lines
    const graphics = scene.add.graphics();
    graphics.lineStyle(2, 0x000000, 1);

    for (let i = 0; i <= gridSize; i++) {
        graphics.moveTo(xOffset + i * cellSize, yOffset);
        graphics.lineTo(xOffset + i * cellSize, yOffset + gridHeight);
        graphics.moveTo(xOffset, yOffset + i * cellSize);
        graphics.lineTo(xOffset + gridWidth, yOffset + i * cellSize);
    }
    graphics.strokePath();

    // Add coordinate labels
    const labelStyle = { font: '16px Arial', fill: '#ffffff' };

    for (let i = 0; i < gridSize; i++) {
        scene.add.text(xOffset + i * cellSize + cellSize / 2, yOffset + gridHeight + 15, String.fromCharCode(65 + i), labelStyle).setOrigin(0.5);
    }

    for (let i = 0; i < gridSize; i++) {
        scene.add.text(xOffset - 15, yOffset + i * cellSize + cellSize / 2, (i + 1).toString(), labelStyle).setOrigin(1, 0.5);
    }

    // Create interactive grid cells
    const gridCells = scene.add.group();

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const cell = scene.add.rectangle(
                xOffset + col * cellSize,
                yOffset + row * cellSize,
                cellSize,
                cellSize,
                gridType === 'PLAYER' ? 0x00aa00 : 0xff6600,
                0.5
            );
            cell.setOrigin(0, 0);
            cell.setInteractive();

            cell.setData('row', row);
            cell.setData('col', col);
            cell.setData('gridType', gridType);

            cell.on('pointerdown', function() {
                const row = this.getData('row');
                const col = this.getData('col');
                const type = this.getData('gridType');
                const coordinate = String.fromCharCode(65 + col) + (row + 1);

                if (type === 'PLAYER') {
                    console.log('Player grid - Ship placement: ' + coordinate);
                } else {
                    console.log('Enemy grid - Attack: ' + coordinate);
                }
            });

            gridCells.add(cell);
        }
    }

    return { cells: gridCells, xOffset, yOffset, gridSize, cellSize, type: gridType };
}