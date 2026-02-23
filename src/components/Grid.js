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
export function createGrid(scene, xOffset, yOffset, gridSize, cellSize, gridType) {
    const gridWidth = gridSize * cellSize;
    const gridHeight = gridSize * cellSize;

    // Add ocean background gradient
    const graphics = scene.add.graphics();

    // Create ocean gradient (deeper blue at bottom, lighter at top)
    const oceanTopColor = gridType === 'PLAYER' ? 0x0066aa : 0x004488;  // Player: lighter blue, Enemy: darker blue
    const oceanBottomColor = gridType === 'PLAYER' ? 0x004488 : 0x002255;  // Darker gradient

    graphics.fillGradientStyle(oceanTopColor, oceanTopColor, oceanBottomColor, oceanBottomColor, 1);
    graphics.fillRect(xOffset, yOffset, gridWidth, gridHeight);

    // Draw grid lines (thicker, lighter for better visibility on ocean background)
    graphics.lineStyle(2, 0x000000, 1);

    for (let i = 0; i <= gridSize; i++) {
        graphics.moveTo(xOffset + i * cellSize, yOffset);
        graphics.lineTo(xOffset + i * cellSize, yOffset + gridHeight);
        graphics.moveTo(xOffset, yOffset + i * cellSize);
        graphics.lineTo(xOffset + gridWidth, yOffset + i * cellSize);
    }
    graphics.strokePath();

    // Add coordinate labels (arcade style)
    const labelStyle = {
        fontSize: '18px',
        fontFamily: 'Arial Black',
        fill: '#ffffff',
        fontWeight: 'bold',
        stroke: '#000000',
        strokeThickness: 2
    };
    const labels = [];

    // Column labels (A-J)
    for (let i = 0; i < gridSize; i++) {
        const label = scene.add.text(
            xOffset + i * cellSize + cellSize / 2,
            yOffset + gridHeight + 15,
            String.fromCharCode(65 + i),
            labelStyle
        ).setOrigin(0.5);
        labels.push(label);
    }

    // Row labels (1-10)
    for (let i = 0; i < gridSize; i++) {
        const label = scene.add.text(
            xOffset - 15,
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
                gridType === 'PLAYER' ? 0x0088aa : 0x006688,  // Light cyan for player, darker for enemy
                0.2  // More transparent to show ocean gradient
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