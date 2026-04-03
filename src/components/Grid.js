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
 * @param {object} [options] - Optional visual overrides for the grid styling.
 * @returns {object} An object containing the grid cells group, graphics, labels, and grid properties.
 * @property {Phaser.GameObjects.Group} cells - A Phaser group containing all interactive grid cells.
 * @property {Phaser.GameObjects.Graphics} graphics - The graphics object for grid lines.
 * @property {Phaser.GameObjects.Text[]} labels - Array of text objects for coordinate labels.
 * @property {number} xOffset - The X-coordinate offset used for the grid.
 * @property {number} yOffset - The Y-coordinate offset used for the grid.
 * @property {number} gridSize - The size of the grid.
 * @property {number} cellSize - The size of each cell.
 * @property {string} type - The type of the grid.
 */
export function createGrid(scene, xOffset, yOffset, gridSize, cellSize, gridType, options = {}) {
    const gridWidth = gridSize * cellSize;
    const gridHeight = gridSize * cellSize;
    const {
        oceanAlpha = 1,
        cellAlpha = 0.2,
        lineAlpha = 1,
        labelFontFamily = 'Copperplate, "Palatino Linotype", Georgia, serif',
        labelColor = '#f1f4f7'
    } = options;

    // Add ocean background gradient
    const graphics = scene.add.graphics();

    // Create ocean gradient (deeper blue at bottom, lighter at top)
    const oceanTopColor = 0x0b1821;
    const oceanBottomColor = 0x050b10;

    graphics.fillGradientStyle(oceanTopColor, oceanTopColor, oceanBottomColor, oceanBottomColor, oceanAlpha);
    graphics.fillRect(xOffset, yOffset, gridWidth, gridHeight);

    // Draw broader translucent grid lines so the board still reads while the waves show through.
    graphics.lineStyle(3, 0x8e9ca5, lineAlpha);

    for (let i = 0; i <= gridSize; i++) {
        graphics.moveTo(xOffset + i * cellSize, yOffset);
        graphics.lineTo(xOffset + i * cellSize, yOffset + gridHeight);
        graphics.moveTo(xOffset, yOffset + i * cellSize);
        graphics.lineTo(xOffset + gridWidth, yOffset + i * cellSize);
    }
    graphics.strokePath();

    // Add coordinate labels (arcade style)
    const labelFontSize = Math.max(13, Math.min(18, cellSize * 0.46));
    const labelOffset = Math.max(5, Math.round(cellSize * 0.16));
    const bottomLabelOffset = Math.max(10, Math.round(cellSize * 0.24));
    const labelStyle = {
        fontSize: `${labelFontSize}px`,
        fontFamily: labelFontFamily,
        fill: labelColor,
        fontWeight: 'bold',
        stroke: '#0f151b',
        strokeThickness: 3
    };
    const labels = [];

    // Column labels (A-J)
    for (let i = 0; i < gridSize; i++) {
        const label = scene.add.text(
            xOffset + i * cellSize + cellSize / 2,
            yOffset + gridHeight + bottomLabelOffset,
            String.fromCharCode(65 + i),
            labelStyle
        ).setOrigin(0.5);
        labels.push(label);
    }

    // Row labels (1-10)
    for (let i = 0; i < gridSize; i++) {
        const label = scene.add.text(
            xOffset - labelOffset,
            yOffset + i * cellSize + cellSize / 2,
            (i + 1).toString(),
            labelStyle
        ).setOrigin(1, 0.5);
        labels.push(label);
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
                0xf3f7fa,
                cellAlpha
            );
            cell.setOrigin(0, 0);
            cell.setInteractive();

            cell.setData('row', row);
            cell.setData('col', col);
            cell.setData('gridType', gridType);

            cell.on('pointerdown', function () {
                const row = this.getData('row');
                const col = this.getData('col');
                const type = this.getData('gridType');
                const coordinate = String.fromCharCode(65 + col) + (row + 1);

                console.log(`${type} grid - ${type === 'PLAYER' ? 'Ship placement' : 'Attack'}: ${coordinate}`);
            });

            gridCells.add(cell);
        }
    }

    return { cells: gridCells, graphics, labels, xOffset, yOffset, gridSize, cellSize, type: gridType };
}
