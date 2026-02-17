/**
 * @fileoverview GameScene - Full combat gameplay with AI opponent and turn management.
 * Week 4: AI Opponent & Game Loop implementation.
 * @namespace GameScene
 */

import { createGrid } from '../components/Grid.js';
import { GAME_CONSTANTS, SHIP_TYPES, getShipPlacementOrder } from '../config/gameConfig.js';
import { FleetManager } from '../managers/FleetManager.js';
import { AIManager } from '../managers/AIManager.js';
import { TurnManager } from '../managers/TurnManager.js';
import { Ship } from '../models/Ship.js';

/** Cell state constants */
const CELL = {
    EMPTY:      'empty',
    SHIP:       'ship',
    HIT:        'hit',
    MISS:       'miss',
    SUNK:       'sunk'
};

/** Cell fill colors */
const CELL_COLORS = {
    PLAYER_EMPTY: 0x00aa00,   // Green
    PLAYER_SHIP:  null,       // Uses ship color
    ENEMY_EMPTY:  0xff6600,   // Orange
    HIT:          0xff0000,   // Red
    MISS:         0xcccccc,   // Light gray
    SUNK:         0x660000    // Dark red
};

/**
 * Full gameplay scene with AI opponent, turn management, and visual combat feedback.
 * @class
 * @augments Phaser.Scene
 */
export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });

        // Grid display objects
        this.playerGrid = null;
        this.enemyGrid = null;
        this.gridTitles = [];

        // Game managers
        this.playerFleet = null;
        this.enemyFleet = null;
        this.aiManager = null;
        this.turnManager = null;

        // Visual cell state tracking (persists across resize)
        // Each entry: 'empty', 'ship', 'hit', 'miss', 'sunk'
        this.playerCellStates = [];
        this.enemyCellStates = [];
        // Ship colors for player cells
        this.playerShipColors = [];

        // UI elements
        this.uiElements = {};

        // Layout state
        this.currentLayout = null;

        // Combat lock (prevent double-clicks during AI turn)
        this.combatLocked = false;
    }

    create() {
        this.initCellStates();
        this.setupFleets();
        this.createGameLayout();
        this.createUI();
        this.applyGridStates();
        this.setupInput();
        this.updateStatusDisplay('PLAYER_TURN');

        console.log('GameScene: Combat ready. Player goes first.');
    }

    // ─── Initialisation ────────────────────────────────────────────────────────

    /**
     * Initialise blank 10×10 cell state arrays.
     */
    initCellStates() {
        const SIZE = GAME_CONSTANTS.GRID_SIZE;
        this.playerCellStates  = Array.from({ length: SIZE }, () => Array(SIZE).fill(CELL.EMPTY));
        this.enemyCellStates   = Array.from({ length: SIZE }, () => Array(SIZE).fill(CELL.EMPTY));
        this.playerShipColors  = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
    }

    /**
     * Set up player and AI fleets, auto-placing all ships.
     */
    setupFleets() {
        const difficulty = this.getDifficulty();

        this.playerFleet  = new FleetManager();
        this.enemyFleet   = new FleetManager();
        this.aiManager    = new AIManager(difficulty);
        this.turnManager  = new TurnManager();

        // Auto-place player fleet
        this.autoPlaceFleet(this.playerFleet, true);

        // AI places its own fleet
        this.aiManager.placeFleet(this.enemyFleet);

        console.log(`GameScene: Fleets ready. Difficulty: ${difficulty}`);
    }

    /**
     * Auto-place all ships for a fleet manager.
     * @param {FleetManager} fleet
     * @param {boolean} isPlayer - Whether to record cell states for visual display
     */
    autoPlaceFleet(fleet, isPlayer) {
        const shipTypes = getShipPlacementOrder();
        const MAX = 200;

        for (const shipType of shipTypes) {
            const ship = new Ship(shipType.type, shipType.name, shipType.length, shipType.color);
            let placed = false;
            let attempts = 0;

            while (!placed && attempts < MAX) {
                const row = Math.floor(Math.random() * 10);
                const col = Math.floor(Math.random() * 10);
                const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
                const result = fleet.placeShip(ship, row, col, orientation);

                if (result.success && isPlayer) {
                    // Record ship position for visual display
                    for (const seg of ship.segments) {
                        this.playerCellStates[seg.row][seg.col] = CELL.SHIP;
                        this.playerShipColors[seg.row][seg.col] = shipType.color;
                    }
                }

                placed = result.success;
                attempts++;
            }

            if (!placed) {
                console.error(`setupFleets: Failed to place ${shipType.name}`);
            }
        }
    }

    /**
     * Read difficulty setting from localStorage (falls back to NORMAL).
     * @returns {string}
     */
    getDifficulty() {
        try {
            const settings = JSON.parse(localStorage.getItem('battleships_settings') || '{}');
            const diffMap = { 0: 'EASY', 1: 'NORMAL', 2: 'HARD' };
            return diffMap[settings.difficulty] || 'NORMAL';
        } catch {
            return 'NORMAL';
        }
    }

    // ─── Layout / Grid ──────────────────────────────────────────────────────────

    /**
     * Create or recreate the responsive two-grid game layout.
     */
    createGameLayout() {
        const { width, height } = this.scale;
        const { GRID_SIZE, COLORS } = GAME_CONSTANTS;

        this.cameras.main.setBackgroundColor(COLORS.BACKGROUND);

        const layout = this.calculateLayout(width, height);
        this.currentLayout = layout;

        // Create both grids
        this.playerGrid = createGrid(this, layout.playerX, layout.playerY, GRID_SIZE, layout.cellSize, 'PLAYER');
        this.enemyGrid  = createGrid(this, layout.enemyX,  layout.enemyY,  GRID_SIZE, layout.cellSize, 'ENEMY');

        // Grid titles
        const titleStyle = {
            font: `bold ${Math.min(20, width * 0.028)}px Arial`,
            fill: COLORS.TEXT
        };

        const gridWidth = GRID_SIZE * layout.cellSize;

        const playerTitle = this.add.text(
            layout.playerX + gridWidth / 2,
            layout.playerY - 28,
            'YOUR FLEET', titleStyle
        ).setOrigin(0.5);

        const enemyTitle = this.add.text(
            layout.enemyX + gridWidth / 2,
            layout.enemyY - 28,
            'ENEMY WATERS', titleStyle
        ).setOrigin(0.5);

        this.gridTitles = [playerTitle, enemyTitle];

        // Attach combat click handlers to enemy grid cells
        this.attachEnemyClickHandlers();
    }

    /**
     * Calculate responsive layout positions.
     * @param {number} width
     * @param {number} height
     * @returns {object}
     */
    calculateLayout(width, height) {
        const { GRID_SIZE, CELL_SIZE, GRID_SPACING, LABEL_SPACE, TITLE_SPACE, MARGIN } = GAME_CONSTANTS;

        const isPortrait = height > width;
        const shouldStack = isPortrait && width < 600;

        const stackedTitleSpace = 35;
        const stackedMargin = 10;
        const stackedGridSpacing = 20;

        let cellSize;
        if (shouldStack) {
            const verticalPadding = 60 + 2 * stackedTitleSpace + stackedGridSpacing + 2 * LABEL_SPACE + stackedMargin;
            const maxCell = (height - verticalPadding) / (GRID_SIZE * 2);
            cellSize = Math.max(20, Math.min(CELL_SIZE, maxCell));
        } else {
            const maxCell = Math.min(
                (width - MARGIN * 2 - LABEL_SPACE * 2 - GRID_SPACING) / (GRID_SIZE * 2),
                (height - MARGIN * 2 - TITLE_SPACE * 2 - 100) / GRID_SIZE
            );
            cellSize = Math.max(20, Math.min(CELL_SIZE, maxCell));
        }

        const gridWidth = GRID_SIZE * cellSize;
        let playerX, playerY, enemyX, enemyY;

        if (shouldStack) {
            const totalH = gridWidth * 2 + LABEL_SPACE * 2 + stackedGridSpacing + 2 * stackedTitleSpace;
            const startY = Math.max(stackedMargin, (height - totalH) / 2);
            const centerX = (width - gridWidth) / 2;

            playerX = centerX;
            playerY = startY + stackedTitleSpace;
            enemyX  = centerX;
            enemyY  = playerY + gridWidth + LABEL_SPACE + stackedGridSpacing + stackedTitleSpace;
        } else {
            const totalW = gridWidth * 2 + GRID_SPACING;
            const startX = Math.max(MARGIN, (width - totalW) / 2);
            const centerY = Math.max(MARGIN, (height - gridWidth - TITLE_SPACE) / 2);

            playerX = startX;
            playerY = centerY + TITLE_SPACE;
            enemyX  = startX + gridWidth + GRID_SPACING;
            enemyY  = centerY + TITLE_SPACE;
        }

        return { playerX, playerY, enemyX, enemyY, cellSize, shouldStack, width, height };
    }

    // ─── UI ─────────────────────────────────────────────────────────────────────

    /**
     * Create status bar, turn indicator, back button, and ship status panel.
     */
    createUI() {
        const { width, height } = this.scale;
        const C = GAME_CONSTANTS.COLORS;

        // Turn status text (top center)
        this.uiElements.statusText = this.add.text(width / 2, 15, 'YOUR TURN', {
            fontSize: this.getStatusFontSize(width),
            fontFamily: 'Arial',
            fill: '#ffff00',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        // Back button (top left)
        const buttonY = width < 450 ? 45 : 35;
        const backBtn = this.add.rectangle(55, buttonY, 90, 30, 0x2c3e50)
            .setStrokeStyle(2, 0xe74c3c)
            .setInteractive({ useHandCursor: true });
        const backText = this.add.text(55, buttonY, 'BACK', {
            fontSize: '13px', fontFamily: 'Arial', fill: '#ffffff', fontWeight: 'bold'
        }).setOrigin(0.5);

        backBtn.on('pointerover', () => backBtn.setFillStyle(0xe74c3c));
        backBtn.on('pointerout',  () => backBtn.setFillStyle(0x2c3e50));
        backBtn.on('pointerdown', () => this.scene.start('TitleScene'));

        this.uiElements.backButton = backBtn;
        this.uiElements.backText   = backText;

        // Score display (top right)
        this.uiElements.scoreText = this.add.text(width - 10, 15, 'SCORE: 0', {
            fontSize: this.getStatusFontSize(width),
            fontFamily: 'Arial',
            fill: C.TEXT,
            fontWeight: 'bold'
        }).setOrigin(1, 0.5);

        // Ship status panel (below grids)
        this.createShipStatusPanel();
    }

    /**
     * Create ship health status display below the grids.
     */
    createShipStatusPanel() {
        const { width, height } = this.scale;
        const ships = this.playerFleet.getAllShips();

        // Simple status line at bottom: "Your ships: ■■■■□  Enemy: ■■■■□"
        const statusY = height - 18;
        const fontSize = Math.max(10, Math.min(13, width * 0.016)) + 'px';

        // Player fleet status
        const playerStatus = this.buildFleetStatusString(ships, false);
        this.uiElements.playerShipStatus = this.add.text(
            width * 0.25, statusY,
            'YOUR SHIPS: ' + playerStatus,
            { fontSize, fontFamily: 'Arial', fill: '#00ff88' }
        ).setOrigin(0.5);

        // Enemy fleet status (show remaining ships count only)
        this.uiElements.enemyShipStatus = this.add.text(
            width * 0.75, statusY,
            'ENEMY: 5 ships',
            { fontSize, fontFamily: 'Arial', fill: '#ff8800' }
        ).setOrigin(0.5);
    }

    /**
     * Build a health bar string for a fleet's ships.
     * @param {Array<Ship>} ships
     * @param {boolean} hideHealth - If true just show count
     * @returns {string}
     */
    buildFleetStatusString(ships, hideHealth) {
        if (hideHealth) {
            const alive = ships.filter(s => !s.isSunk).length;
            return `${alive} ships`;
        }
        return ships.map(s => s.isSunk ? '✕' : '▣').join(' ');
    }

    /**
     * Update ship status panel after each attack.
     */
    updateShipStatus() {
        const playerShips = this.playerFleet.getAllShips();
        const enemyShips  = this.enemyFleet.getAllShips();

        if (this.uiElements.playerShipStatus) {
            const str = this.buildFleetStatusString(playerShips, false);
            this.uiElements.playerShipStatus.setText('YOUR SHIPS: ' + str);
        }

        if (this.uiElements.enemyShipStatus) {
            const alive = enemyShips.filter(s => !s.isSunk).length;
            this.uiElements.enemyShipStatus.setText(`ENEMY: ${alive} ship${alive !== 1 ? 's' : ''}`);
        }

        if (this.uiElements.scoreText) {
            this.uiElements.scoreText.setText('SCORE: ' + this.turnManager.score);
        }
    }

    /**
     * Get status font size for current screen width.
     * @param {number} width
     * @returns {string}
     */
    getStatusFontSize(width) {
        if (width < 400) return '12px';
        if (width < 600) return '14px';
        return '16px';
    }

    /**
     * Update the turn status text.
     * @param {string} state - 'PLAYER_TURN', 'ENEMY_TURN', 'GAME_OVER'
     */
    updateStatusDisplay(state) {
        if (!this.uiElements.statusText) return;
        const { width } = this.scale;
        const short = width < 400;

        const messages = {
            PLAYER_TURN: short ? 'YOUR TURN' : 'YOUR TURN - Choose target',
            ENEMY_TURN:  short ? 'ENEMY...' : 'ENEMY TURN - Thinking...',
            GAME_OVER:   'GAME OVER'
        };

        const colors = {
            PLAYER_TURN: '#ffff00',
            ENEMY_TURN:  '#ff8800',
            GAME_OVER:   '#ff0000'
        };

        this.uiElements.statusText
            .setText(messages[state] || state)
            .setColor(colors[state] || '#ffffff');
    }

    // ─── Grid Cell Interaction ──────────────────────────────────────────────────

    /**
     * Attach player attack handlers to all enemy grid cells.
     */
    attachEnemyClickHandlers() {
        if (!this.enemyGrid) return;

        this.enemyGrid.cells.getChildren().forEach(cell => {
            // Remove default handler from Grid.js
            cell.removeAllListeners('pointerdown');
            cell.removeAllListeners('pointerover');
            cell.removeAllListeners('pointerout');

            const row = cell.getData('row');
            const col = cell.getData('col');

            cell.on('pointerover', () => {
                if (this.canPlayerAttack(row, col)) {
                    cell.setFillStyle(0xffff00, 0.7); // Yellow hover
                }
            });

            cell.on('pointerout', () => {
                // Restore correct color based on state
                this.refreshEnemyCellColor(cell, row, col);
            });

            cell.on('pointerdown', () => {
                this.handlePlayerAttack(row, col);
            });
        });
    }

    /**
     * Check if player can legally attack this enemy cell.
     * @param {number} row
     * @param {number} col
     * @returns {boolean}
     */
    canPlayerAttack(row, col) {
        return (
            !this.combatLocked &&
            !this.turnManager.gameOver &&
            this.turnManager.currentTurn === 'PLAYER' &&
            !this.turnManager.isPlayerAlreadyAttacked(row, col)
        );
    }

    // ─── Combat Logic ───────────────────────────────────────────────────────────

    /**
     * Handle a player attack on the enemy fleet.
     * @param {number} row
     * @param {number} col
     */
    handlePlayerAttack(row, col) {
        if (!this.canPlayerAttack(row, col)) return;

        this.combatLocked = true;

        const attackResult = this.enemyFleet.receiveAttack(row, col);
        if (attackResult.duplicate) {
            this.combatLocked = false;
            return;
        }

        // Record in turn manager
        const { bonusTurn } = this.turnManager.processPlayerAttack(row, col, attackResult);

        // Update visual state
        const newState = attackResult.sunk ? CELL.SUNK : (attackResult.hit ? CELL.HIT : CELL.MISS);
        this.enemyCellStates[row][col] = newState;
        this.refreshEnemyCellByState(row, col, newState);

        // Announce if sunk
        if (attackResult.sunk && attackResult.ship) {
            this.showSunkAnnouncement(`You sank their ${attackResult.ship.name}!`, true);
            // Mark all segments of sunk ship
            attackResult.ship.segments.forEach(seg => {
                this.enemyCellStates[seg.row][seg.col] = CELL.SUNK;
                this.refreshEnemyCellByState(seg.row, seg.col, CELL.SUNK);
            });
        }

        this.updateShipStatus();

        // Check victory
        if (this.enemyFleet.isFleetDestroyed()) {
            this.turnManager.setGameOver('PLAYER');
            this.time.delayedCall(800, () => this.endGame('PLAYER'));
            return;
        }

        if (bonusTurn) {
            // Player hit - stays as player turn
            this.updateStatusDisplay('PLAYER_TURN');
            this.combatLocked = false;
        } else {
            // Player missed - switch to AI
            this.turnManager.switchToEnemy();
            this.updateStatusDisplay('ENEMY_TURN');
            this.time.delayedCall(700, () => this.executeAITurn());
        }
    }

    /**
     * Execute one AI attack, then either continue AI turn (hit) or hand back to player.
     */
    executeAITurn() {
        if (this.turnManager.gameOver) return;

        const target = this.aiManager.selectTarget();
        if (!target) {
            console.error('AIManager: No valid target available');
            this.turnManager.switchToPlayer();
            this.updateStatusDisplay('PLAYER_TURN');
            this.combatLocked = false;
            return;
        }

        this.aiManager.registerAttack(target.row, target.col);
        const attackResult = this.playerFleet.receiveAttack(target.row, target.col);
        const { bonusTurn } = this.turnManager.processEnemyAttack(target.row, target.col, attackResult);

        // Track AI hits for follow-up targeting
        if (attackResult.hit) {
            if (attackResult.sunk) {
                this.aiManager.registerSink();
            } else {
                this.aiManager.registerHit(target.row, target.col);
            }
        }

        // Update player grid visuals
        const newState = attackResult.sunk ? CELL.SUNK : (attackResult.hit ? CELL.HIT : CELL.MISS);
        this.playerCellStates[target.row][target.col] = newState;
        this.refreshPlayerCellByState(target.row, target.col, newState);

        // Announce if sunk
        if (attackResult.sunk && attackResult.ship) {
            this.showSunkAnnouncement(`Enemy sank your ${attackResult.ship.name}!`, false);
        }

        this.updateShipStatus();

        // Check defeat
        if (this.playerFleet.isFleetDestroyed()) {
            this.turnManager.setGameOver('ENEMY');
            this.time.delayedCall(800, () => this.endGame('ENEMY'));
            return;
        }

        if (bonusTurn) {
            // AI hit - gets bonus turn
            this.time.delayedCall(600, () => this.executeAITurn());
        } else {
            // AI missed - hand back to player
            this.turnManager.switchToPlayer();
            this.updateStatusDisplay('PLAYER_TURN');
            this.combatLocked = false;
        }
    }

    // ─── Visual Feedback ────────────────────────────────────────────────────────

    /**
     * Apply all stored cell states to the current grid cells (used after resize).
     */
    applyGridStates() {
        const SIZE = GAME_CONSTANTS.GRID_SIZE;

        // Player grid
        if (this.playerGrid) {
            this.playerGrid.cells.getChildren().forEach(cell => {
                const row = cell.getData('row');
                const col = cell.getData('col');
                const state = this.playerCellStates[row][col];
                const shipColor = this.playerShipColors[row][col];
                this.applyPlayerCellColor(cell, state, shipColor);
            });
        }

        // Enemy grid
        if (this.enemyGrid) {
            this.enemyGrid.cells.getChildren().forEach(cell => {
                const row = cell.getData('row');
                const col = cell.getData('col');
                const state = this.enemyCellStates[row][col];
                this.applyEnemyCellColor(cell, state);
            });
        }
    }

    /**
     * Find a specific enemy grid cell by row/col and update its color.
     * @param {number} row
     * @param {number} col
     * @param {string} state
     */
    refreshEnemyCellByState(row, col, state) {
        if (!this.enemyGrid) return;
        const cell = this.getGridCell(this.enemyGrid, row, col);
        if (cell) this.applyEnemyCellColor(cell, state);
    }

    /**
     * Restore enemy cell to its current state color (used after hover).
     * @param {Phaser.GameObjects.Rectangle} cell
     * @param {number} row
     * @param {number} col
     */
    refreshEnemyCellColor(cell, row, col) {
        const state = this.enemyCellStates[row][col];
        this.applyEnemyCellColor(cell, state);
    }

    /**
     * Find a specific player grid cell and update its color.
     * @param {number} row
     * @param {number} col
     * @param {string} state
     */
    refreshPlayerCellByState(row, col, state) {
        if (!this.playerGrid) return;
        const cell = this.getGridCell(this.playerGrid, row, col);
        if (cell) {
            const shipColor = this.playerShipColors[row][col];
            this.applyPlayerCellColor(cell, state, shipColor);
        }
    }

    /**
     * Apply color to a player grid cell based on its state.
     * @param {Phaser.GameObjects.Rectangle} cell
     * @param {string} state
     * @param {number|null} shipColor
     */
    applyPlayerCellColor(cell, state, shipColor) {
        switch (state) {
            case CELL.SHIP:
                cell.setFillStyle(shipColor || 0x00aa00, 0.85);
                break;
            case CELL.HIT:
                cell.setFillStyle(CELL_COLORS.HIT, 0.9);
                break;
            case CELL.SUNK:
                cell.setFillStyle(CELL_COLORS.SUNK, 0.9);
                break;
            case CELL.MISS:
                cell.setFillStyle(CELL_COLORS.MISS, 0.7);
                break;
            default:
                cell.setFillStyle(CELL_COLORS.PLAYER_EMPTY, 0.5);
        }
    }

    /**
     * Apply color to an enemy grid cell based on its state.
     * @param {Phaser.GameObjects.Rectangle} cell
     * @param {string} state
     */
    applyEnemyCellColor(cell, state) {
        switch (state) {
            case CELL.HIT:
                cell.setFillStyle(CELL_COLORS.HIT, 0.9);
                break;
            case CELL.SUNK:
                cell.setFillStyle(CELL_COLORS.SUNK, 0.9);
                break;
            case CELL.MISS:
                cell.setFillStyle(CELL_COLORS.MISS, 0.7);
                break;
            default:
                cell.setFillStyle(CELL_COLORS.ENEMY_EMPTY, 0.5);
        }
    }

    /**
     * Find a grid cell by row/col from a grid object.
     * @param {object} grid - Grid object from createGrid()
     * @param {number} targetRow
     * @param {number} targetCol
     * @returns {Phaser.GameObjects.Rectangle|null}
     */
    getGridCell(grid, targetRow, targetCol) {
        const children = grid.cells.getChildren();
        return children.find(
            c => c.getData('row') === targetRow && c.getData('col') === targetCol
        ) || null;
    }

    // ─── Announcements ──────────────────────────────────────────────────────────

    /**
     * Show a temporary "ship sunk" announcement.
     * @param {string} message
     * @param {boolean} isPlayerScoring - True = player sank enemy ship (use green)
     */
    showSunkAnnouncement(message, isPlayerScoring) {
        const { width, height } = this.scale;
        const color = isPlayerScoring ? '#00ff88' : '#ff4444';

        const text = this.add.text(width / 2, height / 2 - 30, message, {
            fontSize: Math.min(22, width * 0.04) + 'px',
            fontFamily: 'Arial',
            fill: color,
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(100);

        this.tweens.add({
            targets: text,
            y: height / 2 - 80,
            alpha: 0,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => text.destroy()
        });
    }

    // ─── Game Over ──────────────────────────────────────────────────────────────

    /**
     * Transition to the GameOver scene with final stats.
     * @param {'PLAYER'|'ENEMY'} winner
     */
    endGame(winner) {
        this.combatLocked = true;
        this.updateStatusDisplay('GAME_OVER');

        const scoreData = this.turnManager.calculateFinalScore();
        const playerShips = this.playerFleet.getAllShips();
        const enemyShips  = this.enemyFleet.getAllShips();

        const gameData = {
            winner,
            ...scoreData,
            playerShipsLost: playerShips.filter(s => s.isSunk).length,
            playerShipsRemaining: playerShips.filter(s => !s.isSunk).length,
            enemyShipsRemaining: enemyShips.filter(s => !s.isSunk).length,
            difficulty: this.aiManager.difficulty
        };

        console.log('GameScene: Game over -', gameData);

        this.time.delayedCall(1000, () => {
            this.scene.start('GameOverScene', gameData);
        });
    }

    // ─── Input ──────────────────────────────────────────────────────────────────

    /**
     * Set up keyboard shortcuts.
     */
    setupInput() {
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start('TitleScene');
        });
    }

    // ─── Resize ─────────────────────────────────────────────────────────────────

    /**
     * Handle screen resize - recreate grids if layout changes significantly.
     * @param {number} width
     * @param {number} height
     */
    handleResize(width, height) {
        const newLayout = this.calculateLayout(width, height);

        const orientationChanged = this.currentLayout &&
            (this.currentLayout.width > this.currentLayout.height) !== (width > height);

        const stackChanged = this.currentLayout &&
            this.currentLayout.shouldStack !== newLayout.shouldStack;

        const cellSizeChanged = this.currentLayout &&
            Math.abs(this.currentLayout.cellSize - newLayout.cellSize) / this.currentLayout.cellSize > 0.15;

        if (orientationChanged || stackChanged || cellSizeChanged || !this.currentLayout) {
            // Destroy old grids
            if (this.playerGrid) {
                this.playerGrid.cells.clear(true, true);
                this.playerGrid.graphics.destroy();
                this.playerGrid.labels.forEach(l => l.destroy());
                this.playerGrid = null;
            }
            if (this.enemyGrid) {
                this.enemyGrid.cells.clear(true, true);
                this.enemyGrid.graphics.destroy();
                this.enemyGrid.labels.forEach(l => l.destroy());
                this.enemyGrid = null;
            }
            this.gridTitles.forEach(t => t.destroy());
            this.gridTitles = [];

            this.createGameLayout();
            this.applyGridStates();

            // Restore combat lock state (don't allow clicks during AI turn after resize)
        }

        // Update UI positions
        const buttonY = width < 450 ? 45 : 35;
        if (this.uiElements.statusText) {
            this.uiElements.statusText
                .setPosition(width / 2, 15)
                .setFontSize(this.getStatusFontSize(width));
        }
        if (this.uiElements.backButton) this.uiElements.backButton.setPosition(55, buttonY);
        if (this.uiElements.backText)   this.uiElements.backText.setPosition(55, buttonY);
        if (this.uiElements.scoreText) {
            this.uiElements.scoreText
                .setPosition(width - 10, 15)
                .setFontSize(this.getStatusFontSize(width));
        }

        // Reposition ship status panel
        const statusY = height - 18;
        if (this.uiElements.playerShipStatus) {
            this.uiElements.playerShipStatus.setPosition(width * 0.25, statusY);
        }
        if (this.uiElements.enemyShipStatus) {
            this.uiElements.enemyShipStatus.setPosition(width * 0.75, statusY);
        }

        this.currentLayout = newLayout;
    }
}
