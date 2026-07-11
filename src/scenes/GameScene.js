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
import { createRoundedMenuButton } from '../utils/uiButtons.js';
import { applyTextQuality } from '../utils/textQuality.js';

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
    SUNK:         0xff0000    // Bright red (same as HIT, but for sunk ships)
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

        // Ship sprite containers (Week 6A: Refactored to span multiple cells)
        this.playerShipSprites = [];  // Array of ship sprite objects {sprite, ship, orientation}
        this.enemyShipSprites = [];   // Array of enemy ship sprite objects {sprite, ship, shipType, orientation}

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

        // Week 6A: Ship status bar sprite containers
        this.playerShipStatusSprites = [];  // Array of {sprite, crossSprite, ship}
        this.enemyShipStatusSprites = [];   // Array of {sprite, crossSprite}

        // Layout state
        this.currentLayout = null;
        this.lastAbilityAvailability = { sonar: null, nuke: null };

        // Combat lock (prevent double-clicks during AI turn)
        this.combatLocked = false;

        // Special attack mode tracking
        this.attackMode = 'NORMAL'; // 'NORMAL', 'SONAR', 'NUKE'
        this.abilityButtons = null; // {sonarBtn, sonarText, nukeBtn, nukeText}

        // Week 6B: Gunsight cursor for targeting
        this.gunsightCursor = null;
        this.hoveredTarget = null;  // {row, col} of currently hovered enemy cell
        this.fireButton = null;  // FIRE button UI element
        this.backgroundTile = null;
        this.boardBackdrop = null;
    }

    /**
     * Preload ship sprite assets
     */
    preload() {
        // Load high-resolution ship sprites in both orientations to avoid rotation blur.
        this.load.image('ship-carrier', 'assets/ships/Carrier/ShipCarrierHull.png');
        this.load.image('ship-carrier-h', 'assets/ships/Carrier/ShipCarrierHull_Horizontal.png');
        this.load.image('ship-carrier-v', 'assets/ships/Carrier/ShipCarrierHull_Vertical.png');

        this.load.image('ship-battleship', 'assets/ships/Battleship/ShipBattleshipHull.png');
        this.load.image('ship-battleship-h', 'assets/ships/Battleship/ShipBattleshipHull_Horizontal.png');
        this.load.image('ship-battleship-v', 'assets/ships/Battleship/ShipBattleshipHull_Vertical.png');

        this.load.image('ship-cruiser', 'assets/ships/Cruiser/ShipCruiserHull.png');
        this.load.image('ship-cruiser-h', 'assets/ships/Cruiser/ShipCruiserHull_Horizontal.png');
        this.load.image('ship-cruiser-v', 'assets/ships/Cruiser/ShipCruiserHull_Vertical.png');

        this.load.image('ship-nuclear-sub', 'assets/ships/Submarine/ShipNuclearSubHull.png');
        this.load.image('ship-nuclear-sub-h', 'assets/ships/Submarine/ShipNuclearSubHull_Horizontal.png');
        this.load.image('ship-nuclear-sub-v', 'assets/ships/Submarine/ShipNuclearSubHull_Vertical.png');

        this.load.image('ship-attack-sub', 'assets/ships/Submarine/ShipAttackSubHull.png');
        this.load.image('ship-attack-sub-h', 'assets/ships/Submarine/ShipAttackSubHull_Horizontal.png');
        this.load.image('ship-attack-sub-v', 'assets/ships/Submarine/ShipAttackSubHull_Vertical.png');

        this.load.image('ship-destroyer', 'assets/ships/Destroyer/ShipDestroyerHull.png');
        this.load.image('ship-destroyer-h', 'assets/ships/Destroyer/ShipDestroyerHull_Horizontal.png');
        this.load.image('ship-destroyer-v', 'assets/ships/Destroyer/ShipDestroyerHull_Vertical.png');

        // Ship status icons for fleet indicators
        this.load.image('ship-status-safe', 'src/images/Ship-Icon-01-Safe.png');
        this.load.image('ship-status-hit', 'src/images/Ship-Icon-02-Hit.png');
        this.load.image('game-wave-tile', 'src/images/battleships-and-subs-game-screen-01.jpg');

        // Week 6B: Gunsight cursor for targeting
        this.load.image('gunsight', 'assets/ui/gunsight.png');
    }

    getOrientedShipTextureKey(baseKey, orientation) {
        const variantKey = orientation === 'horizontal' ? `${baseKey}-h` : `${baseKey}-v`;
        return this.textures.exists(variantKey) ? variantKey : baseKey;
    }

    getShipDisplaySize(shipLength, cellSize, orientation) {
        if (orientation === 'horizontal') {
            return {
                width: shipLength * cellSize * 0.92,
                height: cellSize * 0.82
            };
        }

        return {
            width: cellSize * 0.82,
            height: shipLength * cellSize * 0.92
        };
    }

    create() {
        // Check for saved game state
        const savedState = this.loadGameState();
        if (savedState && !savedState.gameOver) {
            this.showResumeDialog(savedState);
            return; // Wait for user choice before proceeding
        }

        // Start new game
        this.startNewGame();
    }

    /**
     * Start a new game (clean state)
     */
    startNewGame() {
        this.initCellStates();
        this.setupFleets();
        this.createGameLayout();
        this.createSceneTitle();
        this.createUI();
        this.applyGridStates();
        this.setupInput();
        this.setupBeforeUnload();
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
        this.playerShipSprites = [];  // Week 6A: Simple array of ship objects
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
                    // Week 6A: Store ship data for sprite rendering (whole ship, not per-cell)
                    this.playerShipSprites.push({
                        ship: ship,
                        shipType: shipType,
                        orientation: orientation,
                        sprite: null  // Will be created after layout is ready
                    });
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
     * @returns {string} 'EASY', 'NORMAL', or 'HARD'
     */
    getDifficulty() {
        try {
            const settings = JSON.parse(localStorage.getItem('battleshipsSettings') || '{}');
            const difficulty = settings.difficulty || 'NORMAL';
            // Validate difficulty value
            if (['EASY', 'NORMAL', 'HARD'].includes(difficulty)) {
                return difficulty;
            }
            return 'NORMAL';
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
        this.createWaveBackground(layout);

        // Create both grids
        this.playerGrid = createGrid(this, layout.playerX, layout.playerY, GRID_SIZE, layout.cellSize, 'PLAYER', {
            oceanAlpha: 0.08,
            cellAlpha: 0.035,
            lineAlpha: 0.12,
            labelFontFamily: 'Copperplate, "Palatino Linotype", Georgia, serif',
            labelColor: '#f2f5f7'
        });
        this.enemyGrid  = createGrid(this, layout.enemyX,  layout.enemyY,  GRID_SIZE, layout.cellSize, 'ENEMY', {
            oceanAlpha: 0.08,
            cellAlpha: 0.035,
            lineAlpha: 0.12,
            labelFontFamily: 'Copperplate, "Palatino Linotype", Georgia, serif',
            labelColor: '#f2f5f7'
        });

        // Grid titles - use adaptive titleH from layout to avoid overlap with top UI
        const titleH    = layout.titleH || 20;
        const titleSize = this.getBoardTitleFontSize(layout);
        const chrome = this.getBoardChromeMetrics(layout);
        const titleStyle = {
            fontSize: `${titleSize}px`,
            fontFamily: 'Copperplate, "Palatino Linotype", Georgia, serif',
            fill: '#f2f5f7',
            fontStyle: 'bold',
            stroke: '#11181f',
            strokeThickness: 3,
            shadow: {
                offsetX: 0,
                offsetY: 1,
                color: '#000000',
                blur: 6,
                fill: true
            }
        };

        const gridWidth = GRID_SIZE * layout.cellSize;

        const playerTitle = this.add.text(
            layout.playerX + gridWidth / 2,
            chrome.titleBarY + chrome.titleBarHeight / 2 - 1,
            'YOUR FLEET', titleStyle
        ).setOrigin(0.5);

        const enemyTitle = this.add.text(
            layout.enemyX + gridWidth / 2,
            chrome.enemyTitleBarY + chrome.titleBarHeight / 2 - 1,
            'ENEMY WATERS', titleStyle
        ).setOrigin(0.5);
        applyTextQuality([playerTitle, enemyTitle], 5);

        this.gridTitles = [playerTitle, enemyTitle];

        // Attach combat click handlers to enemy grid cells
        this.attachEnemyClickHandlers();

        // Week 6B: Create gunsight cursor for targeting
        this.createGunsightCursor();
    }

    /**
     * Create or update the repeated wave tile background behind the combat layout.
     * @param {object} layout
     */
    createWaveBackground(layout) {
        const { width, height } = layout;
        const chrome = this.getBoardChromeMetrics(layout);

        if (!this.backgroundTile || !this.backgroundTile.active) {
            this.backgroundTile = this.add.tileSprite(0, 0, width, height, 'game-wave-tile');
            this.backgroundTile.setOrigin(0, 0);
            this.backgroundTile.setDepth(-100);
        } else {
            this.backgroundTile.setPosition(0, 0);
            this.backgroundTile.setSize(width, height);
        }

        // Smaller tile scale makes the wave pattern feel farther away.
        this.backgroundTile.setTileScale(0.5, 0.5);

        if (!this.boardBackdrop || !this.boardBackdrop.active) {
            this.boardBackdrop = this.add.graphics().setDepth(-90);
        }

        this.boardBackdrop.clear();
        [chrome.playerBoard, chrome.enemyBoard].forEach((board) => {
            this.boardBackdrop.fillStyle(0x04090e, 0.46);
            this.boardBackdrop.fillRoundedRect(board.x, board.y, board.width, board.height, 20);

            this.boardBackdrop.lineStyle(5, 0x77818a, 0.38);
            this.boardBackdrop.strokeRoundedRect(board.x + 1, board.y + 1, board.width - 2, board.height - 2, 20);

            this.boardBackdrop.lineStyle(2, 0xe8edf2, 0.62);
            this.boardBackdrop.strokeRoundedRect(board.x + 4, board.y + 4, board.width - 8, board.height - 8, 17);

            this.boardBackdrop.lineStyle(2, 0x151d25, 0.95);
            this.boardBackdrop.strokeRoundedRect(board.x + 8, board.y + 8, board.width - 16, board.height - 16, 14);

            this.boardBackdrop.fillStyle(0xffffff, 0.07);
            this.boardBackdrop.fillRoundedRect(board.x + 14, board.y + 10, board.width - 28, Math.max(12, layout.cellSize * 0.18), 10);

            this.boardBackdrop.fillStyle(0x3e4953, 0.94);
            this.boardBackdrop.fillRoundedRect(board.x + 18, board.titleBarY, board.width - 36, chrome.titleBarHeight, 11);

            this.boardBackdrop.lineStyle(2, 0xcdd4da, 0.95);
            this.boardBackdrop.strokeRoundedRect(board.x + 18, board.titleBarY, board.width - 36, chrome.titleBarHeight, 11);

            this.boardBackdrop.lineStyle(2, 0x141b22, 0.92);
            this.boardBackdrop.strokeRoundedRect(board.x + 22, board.titleBarY + 4, board.width - 44, chrome.titleBarHeight - 8, 8);

            this.boardBackdrop.fillStyle(0xffffff, 0.12);
            this.boardBackdrop.fillRoundedRect(board.x + 26, board.titleBarY + 3, board.width - 52, Math.max(6, chrome.titleBarHeight * 0.28), 8);

            this.boardBackdrop.fillStyle(0x7d8a96, 0.16);
            this.boardBackdrop.fillRoundedRect(board.x + 22, board.y + board.height - 14, board.width - 44, 4, 2);
        });
    }

    /**
     * Shared board chrome geometry so the metallic frame and title text stay aligned.
     * @param {object} layout
     * @returns {object}
     */
    getBoardChromeMetrics(layout) {
        const sideMargin = Math.max(18, layout.cellSize * 0.55);
        const topMargin = Math.max(sideMargin + 12, layout.cellSize * 0.92);
        const bottomMargin = Math.max(18, layout.cellSize * 0.5);
        const boardWidth = (GAME_CONSTANTS.GRID_SIZE * layout.cellSize) + (sideMargin * 2);
        const boardHeight = (GAME_CONSTANTS.GRID_SIZE * layout.cellSize) + topMargin + bottomMargin;
        const titleBarHeight = Math.max(16, layout.cellSize * 0.42);
        const titleBarInsetY = Math.max(10, Math.round(topMargin * 0.24));
        const playerBoardX = layout.playerX - sideMargin;
        const playerBoardY = layout.playerY - topMargin;
        const enemyBoardX = layout.enemyX - sideMargin;
        const enemyBoardY = layout.enemyY - topMargin;

        return {
            titleBarHeight,
            titleBarY: playerBoardY + titleBarInsetY,
            enemyTitleBarY: enemyBoardY + titleBarInsetY,
            playerBoard: {
                x: playerBoardX,
                y: playerBoardY,
                width: boardWidth,
                height: boardHeight,
                titleBarY: playerBoardY + titleBarInsetY
            },
            enemyBoard: {
                x: enemyBoardX,
                y: enemyBoardY,
                width: boardWidth,
                height: boardHeight,
                titleBarY: enemyBoardY + titleBarInsetY
            }
        };
    }

    /**
     * Create gunsight cursor sprite for targeting (Week 6B).
     * Initially hidden, shown on enemy grid hover.
     */
    createGunsightCursor() {
        // Destroy existing gunsight if any
        if (this.gunsightCursor) {
            this.gunsightCursor.destroy();
        }

        // Create gunsight sprite (white crosshair)
        const size = this.currentLayout.cellSize * 1.2;  // 120% of cell size
        this.gunsightCursor = this.add.image(0, 0, 'gunsight');
        this.gunsightCursor.setDisplaySize(size, size);
        this.gunsightCursor.setDepth(100);  // Above grid cells
        this.gunsightCursor.setVisible(false);  // Hidden by default
    }

    /**
     * Create scene title header
     * Positioned at fixed y=70 to avoid overlap with top UI (status text at y=15, back button at y=45)
     */
    createSceneTitle() {
        const { width, height } = this.scale;
        const layout = this.currentLayout || this.calculateLayout(width, height);
        const titleMetrics = this.getSceneTitleMetrics(width, height, layout.shouldStack);

        this.sceneTitle = this.add.text(width / 2, titleMetrics.y, 'COMBAT', {
            fontSize: `${titleMetrics.fontSize}px`,
            fontFamily: 'Copperplate, "Palatino Linotype", Georgia, serif',
            fill: '#f5f7fa',
            fontStyle: 'bold',
            stroke: '#12181f',
            strokeThickness: titleMetrics.strokeThickness,
            shadow: {
                offsetX: 0,
                offsetY: 2,
                color: '#000000',
                blur: 8,
                fill: true
            }
        }).setOrigin(0.5).setDepth(10);
        applyTextQuality(this.sceneTitle, 5);
    }

    /**
     * Calculate responsive layout positions.
     * Stacked (portrait mobile): reserves space for top/bottom UI, adaptive spacing,
     * min cell size 16px so two grids always fit even at 375x500.
     * @param {number} width
     * @param {number} height
     * @returns {object}
     */
    calculateLayout(width, height) {
        const { GRID_SIZE, CELL_SIZE, GRID_SPACING, LABEL_SPACE, TITLE_SPACE, MARGIN } = GAME_CONSTANTS;

        const isPortrait = height > width;
        const shouldStack = isPortrait;  // All portrait orientations stack grids vertically

        let cellSize, playerX, playerY, enemyX, enemyY, titleH, labelSpace, gridSpacing;

        if (shouldStack) {
            // Fixed pixel reserves for non-grid UI elements
            // Keep portrait breathing room without letting the header dominate.
            const TOP_UI    = width < 500 ? 102 : 110;
            const BOTTOM_UI = 84;   // ship status bar (22px) + arcade button zone (62px)
            const available = height - TOP_UI - BOTTOM_UI;

            // Adaptive spacing so grids scale down gracefully on tiny screens
            // and look spacious on larger portrait screens (e.g. tablet)
            if (available < 380) {
                titleH      = 11;
                gridSpacing = 10;
                labelSpace  = 16;
            } else if (available < 460) {
                titleH      = 13;
                gridSpacing = 14;
                labelSpace  = 20;
            } else if (available < 700) {
                titleH      = 16;
                gridSpacing = 20;
                labelSpace  = 26;
            } else {
                // Large portrait (e.g. tablet 768×1024) — roomier spacing
                titleH      = 20;
                gridSpacing = 28;
                labelSpace  = 32;
            }

            // Solve for cellSize so both grids fit in available height:
            // 2*(cellSize*GRID_SIZE + labelSpace) + gridSpacing + 2*titleH = available
            const fixedH   = 2 * labelSpace + gridSpacing + 2 * titleH;
            const maxCellH = (available - fixedH) / (GRID_SIZE * 2);
            const maxCellW = (width - 24) / GRID_SIZE;  // 12px margin each side

            cellSize = Math.max(16, Math.min(CELL_SIZE, maxCellH, maxCellW));

            const gridWidth = GRID_SIZE * cellSize;
            const centerX   = (width - gridWidth) / 2;

            playerX = centerX;
            playerY = TOP_UI + titleH;   // Grid starts after top UI reserve + title height
            enemyX  = centerX;
            enemyY  = playerY + gridWidth + labelSpace + gridSpacing + titleH;

            return { playerX, playerY, enemyX, enemyY, cellSize, shouldStack,
                     width, height, titleH, labelSpace };
        } else {
            // Side-by-side (landscape / wide portrait tablet)
            const maxCell = Math.min(
                (width - MARGIN * 2 - LABEL_SPACE * 2 - GRID_SPACING) / (GRID_SIZE * 2),
                (height - MARGIN * 2 - TITLE_SPACE * 2 - 100) / GRID_SIZE
            );
            // Tight phone landscape needs smaller cells so labels, counters, and buttons stay visible.
            cellSize   = Math.max(15, Math.min(GAME_CONSTANTS.MAX_CELL_SIZE, maxCell));
            titleH     = 20;
            labelSpace = LABEL_SPACE;

            const gridWidth = GRID_SIZE * cellSize;
            const totalW    = gridWidth * 2 + GRID_SPACING;
            const startX    = Math.max(MARGIN, (width - totalW) / 2);
            const centerY   = Math.max(MARGIN + 18, (height - gridWidth - TITLE_SPACE) / 2 + 18);

            playerX = startX;
            playerY = centerY + TITLE_SPACE;
            enemyX  = startX + gridWidth + GRID_SPACING;
            enemyY  = centerY + TITLE_SPACE;

            return { playerX, playerY, enemyX, enemyY, cellSize, shouldStack,
                     width, height, titleH, labelSpace };
        }
    }

    // ─── UI ─────────────────────────────────────────────────────────────────────

    /**
     * Create status bar, turn indicator, back button, and ship status panel.
     */
    createUI() {
        const { width, height } = this.scale;
        const C = GAME_CONSTANTS.COLORS;
        const statusFontSize = this.getStatusFontSize(width);

        // Turn status text (top center)
        this.uiElements.statusText = this.add.text(width / 2, 15, 'YOUR TURN', {
            fontSize: statusFontSize,
            fontFamily: 'Arial',
            fill: '#ffff00',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        applyTextQuality(this.uiElements.statusText, 5);

        // Back button (top left)
        const buttonY = width < 450 ? 45 : 35;
        const backBtn = createRoundedMenuButton(this, {
            x: 58,
            y: buttonY,
            width: 108,
            height: 34,
            label: 'BACK',
            fontSize: 13,
            depth: 25,
            onClick: () => this.handleExitAttempt()
        });

        this.uiElements.backButton = backBtn.container;
        this.uiElements.backText   = null;

        // Score display (top right)
        this.uiElements.scoreText = this.add.text(width - 10, 15, 'SCORE: 0', {
            fontSize: statusFontSize,
            fontFamily: 'Arial',
            fill: C.TEXT,
            fontWeight: 'bold'
        }).setOrigin(1, 0.5);
        applyTextQuality(this.uiElements.scoreText, 5);

        // Round arcade buttons (FIRE, SONAR, NUKE)
        this.createArcadeButtons();

        // Ship status panel (below grids)
        this.createShipStatusPanel();
    }

    // ─── Round Arcade Buttons (FIRE, SONAR, NUKE) ────────────────────────────

    /**
     * Create three round arcade-cabinet-style buttons: FIRE (red), SONAR (blue), NUKE (orange).
     * Icons are drawn with Phaser Graphics. Layout adapts:
     *   Portrait  → horizontal row below enemy grid (above ship status bar)
     *   Landscape → vertical stack between the two grids
     */
    createArcadeButtons() {
        const { width, height } = this.scale;
        const layout = this.currentLayout;
        const gridWidth = GAME_CONSTANTS.GRID_SIZE * layout.cellSize;
        const buttonLayout = this.getArcadeButtonLayout(layout, width, height, gridWidth);
        const { radius: r, positions } = buttonLayout;

        // --- Helper: draw one round arcade button ---
        const makeButton = (x, y, baseColor, rimColor, drawIcon, onDown) => {
            const container = this.add.container(x, y);
            container.setDepth(50);

            // Outer rim (lighter ring for 3-D arcade look)
            const rim = this.add.graphics();
            rim.fillStyle(rimColor, 0.5);
            rim.fillCircle(0, 0, r + 3);
            container.add(rim);

            // Main filled circle
            const bg = this.add.graphics();
            bg.fillStyle(baseColor, 1);
            bg.fillCircle(0, 0, r);
            container.add(bg);

            // Inner highlight (glossy top)
            const gloss = this.add.graphics();
            gloss.fillStyle(0xffffff, 0.18);
            gloss.fillEllipse(0, -r * 0.25, r * 1.1, r * 0.7);
            container.add(gloss);

            // Icon drawn by callback
            const icon = this.add.graphics();
            drawIcon(icon, r);
            container.add(icon);

            // Invisible hit area circle
            const hitArea = this.add.circle(0, 0, r + 4, 0x000000, 0);
            hitArea.setInteractive({ useHandCursor: true });
            container.add(hitArea);

            hitArea.on('pointerover', () => { bg.clear(); bg.fillStyle(rimColor, 1); bg.fillCircle(0, 0, r); });
            hitArea.on('pointerout',  () => { bg.clear(); bg.fillStyle(baseColor, 1); bg.fillCircle(0, 0, r); });
            hitArea.on('pointerdown', onDown);

            return { container, bg, icon, hitArea, baseColor, rimColor };
        };

        // --- FIRE button (red, crosshair/sight icon) ---
        const fireBtn = makeButton(
            positions[0].x, positions[0].y,
            0xcc0000, 0xff3333,
            (g, r) => {
                // Crosshair icon
                const s = r * 0.55;
                g.lineStyle(2, 0xffffff, 0.9);
                g.strokeCircle(0, 0, s * 0.55);
                g.beginPath(); g.moveTo(0, -s); g.lineTo(0, s); g.strokePath();
                g.beginPath(); g.moveTo(-s, 0); g.lineTo(s, 0); g.strokePath();
            },
            () => {
                if (this.hoveredTarget) {
                    this.handlePlayerAttack(this.hoveredTarget.row, this.hoveredTarget.col);
                }
            }
        );

        // --- SONAR button (blue, sonar sweep icon) ---
        const sonarBtn = makeButton(
            positions[1].x, positions[1].y,
            0x0055aa, 0x00aaff,
            (g, r) => {
                // Sonar arcs
                const s = r * 0.55;
                g.lineStyle(2, 0xffffff, 0.9);
                // Center dot
                g.fillStyle(0xffffff, 0.9);
                g.fillCircle(0, 0, s * 0.12);
                // Two concentric arcs (top-right quadrant fan)
                for (let i = 1; i <= 3; i++) {
                    const arcR = s * (0.3 + i * 0.22);
                    g.beginPath();
                    g.arc(0, 0, arcR, -Math.PI * 0.4, Math.PI * 0.05, false);
                    g.strokePath();
                }
            },
            () => {
                if (this.turnManager.sonarPingAvailable && !this.combatLocked && this.turnManager.currentTurn === 'PLAYER') {
                    this.enterSonarMode();
                }
            }
        );

        // --- NUKE button (orange, radiation trefoil icon) ---
        const nukeBtn = makeButton(
            positions[2].x, positions[2].y,
            0xdd6600, 0xff9933,
            (g, r) => {
                // Radiation trefoil (3 blade fan)
                const s = r * 0.5;
                g.fillStyle(0xffffff, 0.9);
                g.fillCircle(0, 0, s * 0.18); // center dot
                g.lineStyle(0);
                for (let a = 0; a < 3; a++) {
                    const angle = (a * 2 * Math.PI / 3) - Math.PI / 2;
                    // Each blade: fat arc wedge
                    g.fillStyle(0xffffff, 0.85);
                    g.beginPath();
                    g.arc(0, 0, s * 0.85, angle - 0.35, angle + 0.35, false);
                    g.lineTo(Math.cos(angle) * s * 0.28, Math.sin(angle) * s * 0.28);
                    g.closePath();
                    g.fillPath();
                }
            },
            () => {
                if (this.turnManager.rowNukeCharges > 0 && !this.combatLocked && this.turnManager.currentTurn === 'PLAYER') {
                    this.enterNukeMode();
                }
            }
        );

        // Store references (backward-compatible with existing code that calls updateAbilityButtons)
        this.abilityButtons = {
            sonarBtn: sonarBtn.container,
            sonarText: null,
            nukeBtn: nukeBtn.container,
            nukeText: null,
            // New structured refs
            _fire: fireBtn,
            _sonar: sonarBtn,
            _nuke: nukeBtn
        };
        this.fireButton = {
            button: fireBtn.container,
            text: null,
            _ref: fireBtn
        };

        // Apply initial states
        this.updateAbilityButtons();
        this.updateFireButton();
    }

    /**
     * Compute responsive layout for the combat action buttons.
     * Portrait and tighter landscapes use a bottom row for easier reach.
     * Wide desktop keeps a smaller vertical stack in the center gap.
     * @param {object} layout
     * @param {number} width
     * @param {number} height
     * @param {number} gridWidth
     * @returns {{radius:number, positions:Array<{x:number,y:number}>}}
     */
    getArcadeButtonLayout(layout, width, height, gridWidth) {
        const enemyBottom = layout.enemyY + gridWidth + layout.labelSpace + 4;
        const shipBarTop = height - (layout.shouldStack ? 42 : 34);
        const playerRight = layout.playerX + gridWidth;
        const enemyLeft = layout.enemyX;
        const gap = enemyLeft - playerRight;
        const useBottomRow = layout.shouldStack || width >= 1200 || gap < 88;

        if (useBottomRow) {
            const availableHeight = Math.max(44, shipBarTop - enemyBottom);
            const radius = Math.max(15, Math.min(34, availableHeight * 0.36, width * 0.065));
            const spacing = Math.max(radius * 2.2, Math.min(radius * 2.85, (width - 7 * radius) / 2));
            const cx = width / 2;
            const cy = enemyBottom + (availableHeight * (layout.shouldStack ? 0.45 : 0.52));

            return {
                radius,
                positions: [
                    { x: cx - spacing, y: cy },
                    { x: cx, y: cy },
                    { x: cx + spacing, y: cy }
                ]
            };
        }

        const radius = Math.max(15, Math.min(28, gap * 0.24, height * 0.055));
        const cx = Math.min((playerRight + enemyLeft) / 2, enemyLeft - radius - 24);
        const clusterCenterY = layout.playerY + (gridWidth * 0.64);
        const spacing = Math.max(radius * 2.2, Math.min(radius * 2.55, (gridWidth - 6 * radius) / 3));

        return {
            radius,
            positions: [
                { x: cx, y: clusterCenterY - spacing },
                { x: cx, y: clusterCenterY },
                { x: cx, y: clusterCenterY + spacing }
            ]
        };
    }

    /**
     * Destroy all three arcade buttons (used during resize).
     */
    destroyArcadeButtons() {
        if (this.abilityButtons) {
            this.abilityButtons._fire?.container?.destroy();
            this.abilityButtons._sonar?.container?.destroy();
            this.abilityButtons._nuke?.container?.destroy();
            this.abilityButtons = null;
        }
        if (this.fireButton) {
            // Already destroyed above if same refs, but clear the ref
            this.fireButton = null;
        }
    }

    /** @deprecated Use destroyArcadeButtons — kept for resize handler compat */
    destroyAbilityButtons() { this.destroyArcadeButtons(); }
    /** @deprecated Use destroyArcadeButtons — kept for resize handler compat */
    destroyFireButton() { /* handled by destroyArcadeButtons */ }

    /**
     * Update ability button states (enabled/disabled based on availability).
     */
    updateAbilityButtons() {
        if (!this.abilityButtons) return;
        const sonar = this.abilityButtons._sonar;
        const nuke  = this.abilityButtons._nuke;
        const sonarAvailable = this.turnManager.sonarPingAvailable;
        const nukeAvailable = this.turnManager.rowNukeCharges > 0;

        if (sonar) sonar.container.setAlpha(sonarAvailable ? 1.0 : 0.3);
        if (nuke)  nuke.container.setAlpha(nukeAvailable ? 1.0 : 0.3);

        if (sonarAvailable && this.lastAbilityAvailability.sonar === false && sonar) {
            this.playAbilityReadyAnimation(sonar.container, 'SONAR READY', 0x33ccff);
        }
        if (nukeAvailable && this.lastAbilityAvailability.nuke === false && nuke) {
            this.playAbilityReadyAnimation(nuke.container, 'NUKE READY', 0xffaa33);
        }

        this.lastAbilityAvailability = {
            sonar: sonarAvailable,
            nuke: nukeAvailable
        };
    }

    /**
     * Update FIRE button state based on hovered target.
     */
    updateFireButton() {
        if (!this.fireButton) return;
        const fire = this.abilityButtons?._fire;
        if (!fire) return;

        const active = this.hoveredTarget && this.canPlayerAttack(this.hoveredTarget.row, this.hoveredTarget.col);
        fire.container.setAlpha(active ? 1.0 : 0.3);
    }

    /**
     * Play a short arcade-style burst to highlight an ability becoming ready or active.
     * @param {Phaser.GameObjects.Container} target
     * @param {string} label
     * @param {number} color
     */
    playAbilityReadyAnimation(target, label, color) {
        if (!target || !target.active) return;

        const { x, y } = target;
        const burst = this.add.circle(x, y, 12, color, 0.35).setDepth(49);
        const ring = this.add.circle(x, y, 10, color, 0).setDepth(49);
        ring.setStrokeStyle(3, color, 0.9);

        const text = this.add.text(x, y - 30, label, {
            fontSize: '14px',
            fontFamily: 'Arial Black',
            fill: '#f6fbff',
            stroke: '#081018',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(60);

        this.tweens.add({
            targets: target,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 130,
            yoyo: true,
            repeat: 1
        });

        this.tweens.add({
            targets: burst,
            scaleX: 4.4,
            scaleY: 4.4,
            alpha: 0,
            duration: 520,
            ease: 'Cubic.Out',
            onComplete: () => burst.destroy()
        });

        this.tweens.add({
            targets: ring,
            scaleX: 3.2,
            scaleY: 3.2,
            alpha: 0,
            duration: 560,
            ease: 'Cubic.Out',
            onComplete: () => ring.destroy()
        });

        this.tweens.add({
            targets: text,
            y: y - 52,
            alpha: 0,
            duration: 820,
            ease: 'Quad.Out',
            onComplete: () => text.destroy()
        });
    }

    /**
     * Destroy ship status panel sprites (used during resize).
     * Week 6A: Cleans up sprite-based status bar.
     */
    destroyShipStatusPanel() {
        // Destroy player ship status sprites
        this.playerShipStatusSprites.forEach(({ sprite, crossSprite }) => {
            if (sprite) sprite.destroy();
            if (crossSprite) crossSprite.destroy();
        });
        this.playerShipStatusSprites = [];

        // Destroy enemy ship status sprites
        this.enemyShipStatusSprites.forEach(({ sprite, crossSprite }) => {
            if (sprite) sprite.destroy();
            if (crossSprite) crossSprite.destroy();
        });
        this.enemyShipStatusSprites = [];

        // Destroy labels
        if (this.uiElements.playerShipStatusLabel) {
            this.uiElements.playerShipStatusLabel.destroy();
            this.uiElements.playerShipStatusLabel = null;
        }
        if (this.uiElements.enemyShipStatusLabel) {
            this.uiElements.enemyShipStatusLabel.destroy();
            this.uiElements.enemyShipStatusLabel = null;
        }
    }

    /**
     * Create ship health status display below the grids.
     * Uses the provided safe/hit icon artwork for both allied and enemy status.
     */
    createShipStatusPanel() {
        const { width, height } = this.scale;
        const playerShips = this.playerFleet.getAllShips();
        const enemyShipCount = 5;  // Always 5 enemy ships

        const statusY = height - 22;
        const baseFontPx = Math.max(10, Math.min(13, width * 0.016));
        const fontSize = `${baseFontPx}px`;
        const labelFontSize = `${baseFontPx + 2}px`;
        const iconSize = Math.min(24, width * 0.025);  // Ship icon size
        const iconSpacing = iconSize + 4;  // Space between icons

        // === PLAYER FLEET STATUS ===
        const playerLabelX = width * 0.25 - (iconSpacing * 2.5);
        this.uiElements.playerShipStatusLabel = this.add.text(
            playerLabelX, statusY,
            'ALLIES:',
            {
                fontSize: labelFontSize,
                fontFamily: 'Copperplate, "Palatino Linotype", Georgia, serif',
                fill: '#f5f7fa',
                fontWeight: 'bold',
                stroke: '#12181f',
                strokeThickness: 3
            }
        ).setOrigin(1, 0.5);

        // Create ship status sprites for each player ship
        this.playerShipStatusSprites = [];
        playerShips.forEach((ship, index) => {
            const iconX = playerLabelX + 10 + (index * iconSpacing);

            const sprite = this.add.image(iconX, statusY, 'ship-status-safe');
            sprite.setDisplaySize(iconSize, iconSize);
            this.playerShipStatusSprites.push({ sprite, ship });
        });

        // === ENEMY FLEET STATUS ===
        const enemyLabelX = width * 0.75 - (iconSpacing * 2.5);
        this.uiElements.enemyShipStatusLabel = this.add.text(
            enemyLabelX, statusY,
            'ENEMY:',
            {
                fontSize: labelFontSize,
                fontFamily: 'Copperplate, "Palatino Linotype", Georgia, serif',
                fill: '#f5f7fa',
                fontWeight: 'bold',
                stroke: '#12181f',
                strokeThickness: 3
            }
        ).setOrigin(1, 0.5);

        // Create 5 enemy ship status sprites
        this.enemyShipStatusSprites = [];
        for (let i = 0; i < enemyShipCount; i++) {
            const iconX = enemyLabelX + 10 + (i * iconSpacing);

            const sprite = this.add.image(iconX, statusY, 'ship-status-safe');
            sprite.setDisplaySize(iconSize, iconSize);
            this.enemyShipStatusSprites.push({ sprite });
        }
    }

    /**
     * Get ship type object by ship length.
     * @param {number} length
     * @returns {object} Ship type from SHIP_TYPES
     */
    getShipTypeByLength(length) {
        const types = Object.values(SHIP_TYPES);
        return types.find(t => t.length === length) || types[0];
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
     * Swaps between safe/hit icon art based on ship state.
     */
    updateShipStatus() {
        // Update player ship status sprites
        this.playerShipStatusSprites.forEach(({ sprite, ship }) => {
            sprite.setTexture(ship.isSunk ? 'ship-status-hit' : 'ship-status-safe');
        });

        // Update enemy ship status sprites
        const enemyShips = this.enemyFleet.getAllShips();
        this.enemyShipStatusSprites.forEach(({ sprite }, index) => {
            const ship = enemyShips[index];
            sprite.setTexture(ship?.isSunk ? 'ship-status-hit' : 'ship-status-safe');
        });

        // Update score
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
        if (width < 400) return '11px';
        if (width < 520) return '12px';
        if (width < 760) return '14px';
        return '16px';
    }

    /**
     * Get scaled board title size without letting narrow stacked layouts feel crowded.
     * @param {object} layout
     * @returns {number}
     */
    getBoardTitleFontSize(layout) {
        if (layout.shouldStack) {
            return Math.max(10, Math.min(15, layout.cellSize * 0.32));
        }

        return Math.max(12, Math.min(18, layout.cellSize * 0.38));
    }

    /**
     * Compute scene title position and scale for current viewport.
     * @param {number} width
     * @param {number} height
     * @param {boolean} shouldStack
     * @returns {{y:number,fontSize:number,strokeThickness:number}}
     */
    getSceneTitleMetrics(width, height, shouldStack) {
        if (shouldStack) {
            return {
                y: Math.min(64, height * 0.105),
                fontSize: Math.max(24, Math.min(34, width * 0.05)),
                strokeThickness: 4
            };
        }

        return {
            y: Math.min(58, height * 0.095),
            fontSize: Math.max(28, Math.min(40, width * 0.055)),
            strokeThickness: 5
        };
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
            GAME_OVER:   'GAME OVER',
            SONAR_MODE:  short ? 'SONAR' : 'SONAR PING - Select 3×3 zone',
            NUKE_MODE:   short ? 'NUKE' : 'ROW NUKE - Select target row'
        };

        const colors = {
            PLAYER_TURN: '#ffff00',
            ENEMY_TURN:  '#ff8800',
            GAME_OVER:   '#ff0000',
            SONAR_MODE:  '#00ffff',
            NUKE_MODE:   '#ff9900'
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
                    // Week 6B: Track hovered target for FIRE button
                    this.hoveredTarget = { row, col };
                    this.updateFireButton();

                    // Week 6B: Show gunsight cursor at cell center (no yellow highlight needed)
                    if (this.gunsightCursor) {
                        const cellCenterX = this.currentLayout.enemyX + (col + 0.5) * this.currentLayout.cellSize;
                        const cellCenterY = this.currentLayout.enemyY + (row + 0.5) * this.currentLayout.cellSize;
                        this.gunsightCursor.setPosition(cellCenterX, cellCenterY);
                        this.gunsightCursor.setVisible(true);
                    }
                }
            });

            cell.on('pointerout', () => {
                // Restore correct color based on state
                this.refreshEnemyCellColor(cell, row, col);

                // Week 6B: Clear hovered target and disable FIRE button
                this.hoveredTarget = null;
                this.updateFireButton();

                // Week 6B: Hide gunsight cursor
                if (this.gunsightCursor) {
                    this.gunsightCursor.setVisible(false);
                }
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
     * Routes to appropriate handler based on attackMode.
     * @param {number} row
     * @param {number} col
     */
    handlePlayerAttack(row, col) {
        // Week 6B: Hide gunsight cursor and disable FIRE button on attack
        if (this.gunsightCursor) {
            this.gunsightCursor.setVisible(false);
        }
        this.hoveredTarget = null;
        this.updateFireButton();

        // Route based on current attack mode
        if (this.attackMode === 'SONAR') {
            this.executeSonarPing(row, col);
            return;
        } else if (this.attackMode === 'NUKE') {
            this.executeRowNuke(row, col);
            return;
        }

        // Normal attack
        if (!this.canPlayerAttack(row, col)) return;

        this.combatLocked = true;

        const attackResult = this.enemyFleet.receiveAttack(row, col);
        if (attackResult.duplicate) {
            this.combatLocked = false;
            return;
        }

        // Record in turn manager (now returns chainBonus and rowNukeEarned)
        const { bonusTurn, chainBonus, rowNukeEarned } = this.turnManager.processPlayerAttack(row, col, attackResult);

        // Update visual state
        const newState = attackResult.sunk ? CELL.SUNK : (attackResult.hit ? CELL.HIT : CELL.MISS);
        this.enemyCellStates[row][col] = newState;
        this.refreshEnemyCellByState(row, col, newState);

        // Show floating combat text (HIT/MISS)
        const cellCenterX = this.currentLayout.enemyX + col * this.currentLayout.cellSize + this.currentLayout.cellSize / 2;
        const cellCenterY = this.currentLayout.enemyY + row * this.currentLayout.cellSize + this.currentLayout.cellSize / 2;
        if (attackResult.hit) {
            this.showCombatText('HIT!', '#ff4444', cellCenterX, cellCenterY);
        } else {
            this.showCombatText('MISS', '#ffffff', cellCenterX, cellCenterY);
        }

        // Show chain bonus if active
        if (chainBonus > 0) {
            const multiplier = this.turnManager.getChainMultiplier();
            this.showChainBonus(multiplier, chainBonus);
        }

        // Announce if sunk
        if (attackResult.sunk && attackResult.ship) {
            this.showSunkAnnouncement(`You sank their ${attackResult.ship.name}!`, true);
            // Mark all segments of sunk ship with red background
            attackResult.ship.segments.forEach(seg => {
                this.enemyCellStates[seg.row][seg.col] = CELL.SUNK;
                this.refreshEnemyCellByState(seg.row, seg.col, CELL.SUNK);
            });
            // Render enemy ship sprite on enemy grid
            this.renderEnemyShipSprite(attackResult.ship);
        }

        // Announce Row Nuke unlock
        if (rowNukeEarned) {
            this.showRowNukeEarned();
        }

        this.updateShipStatus();
        this.updateAbilityButtons(); // Update ability button states

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

        // Show floating combat text (HIT/MISS)
        const cellCenterX = this.currentLayout.playerX + target.col * this.currentLayout.cellSize + this.currentLayout.cellSize / 2;
        const cellCenterY = this.currentLayout.playerY + target.row * this.currentLayout.cellSize + this.currentLayout.cellSize / 2;
        if (attackResult.hit) {
            this.showCombatText('HIT!', '#ff4444', cellCenterX, cellCenterY);
        } else {
            this.showCombatText('MISS', '#ffffff', cellCenterX, cellCenterY);
        }

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

    // ─── Special Attacks ────────────────────────────────────────────────────────

    /**
     * Enter Sonar Ping mode (player clicks button to activate)
     */
    enterSonarMode() {
        this.attackMode = 'SONAR';
        // Highlight active sonar button (glow effect via scale)
        if (this.abilityButtons?._sonar) this.abilityButtons._sonar.container.setScale(1.2);
        if (this.abilityButtons?._sonar) this.playAbilityReadyAnimation(this.abilityButtons._sonar.container, 'SONAR ONLINE', 0x33ccff);
        this.updateStatusDisplay('SONAR_MODE');
        console.log('GameScene: SONAR PING mode activated - click 3×3 zone');
    }

    /**
     * Execute Sonar Ping on clicked cell (reveals 3×3 zone)
     * @param {number} centerRow - Center of 3×3 zone
     * @param {number} centerCol - Center of 3×3 zone
     */
    executeSonarPing(centerRow, centerCol) {
        console.log(`GameScene: Sonar ping at (${centerRow}, ${centerCol})`);

        // Mark sonar as used
        this.turnManager.sonarPingAvailable = false;
        this.attackMode = 'NORMAL';
        if (this.abilityButtons?._sonar) this.abilityButtons._sonar.container.setScale(1);
        this.updateAbilityButtons();
        this.updateStatusDisplay('PLAYER_TURN');

        // Reveal 3×3 grid centered on clicked cell
        const reveals = [];
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const r = centerRow + dr;
                const c = centerCol + dc;

                if (r >= 0 && r < 10 && c >= 0 && c < 10) {
                    const ship = this.enemyFleet.getShipAt(r, c);
                    reveals.push({ row: r, col: c, hasShip: ship !== null });
                }
            }
        }

        // Visual feedback - show sonar overlay
        this.showSonarOverlay(reveals);
    }

    /**
     * Show sonar ping visual overlay (reveals ship/no-ship in 3×3)
     * @param {Array} reveals - Array of {row, col, hasShip}
     */
    showSonarOverlay(reveals) {
        const { width, height } = this.scale;
        const cellSize = this.currentLayout.cellSize;

        reveals.forEach(({ row, col, hasShip }, index) => {
            const x = this.currentLayout.enemyX + col * cellSize + cellSize / 2;
            const y = this.currentLayout.enemyY + row * cellSize + cellSize / 2;

            // Create sonar pulse circle
            const circle = this.add.circle(x, y, cellSize * 0.4, hasShip ? 0xff0000 : 0x00ffff, 0.5);
            circle.setDepth(99);

            // Fade in + fade out
            circle.setAlpha(0);
            this.tweens.add({
                targets: circle,
                alpha: 0.7,
                duration: 400,
                delay: index * 50,
                yoyo: true,
                onComplete: () => circle.destroy()
            });
        });

        // Show announcement
        const text = this.add.text(width / 2, height / 2 - 60, 'SONAR PING!', {
            fontSize: '24px',
            fontFamily: 'Arial Black',
            fill: '#00ffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(100);

        this.time.delayedCall(1500, () => {
            this.tweens.add({
                targets: text,
                alpha: 0,
                duration: 600,
                onComplete: () => text.destroy()
            });
        });
    }

    /**
     * Enter Row Nuke mode (player clicks button to activate)
     */
    enterNukeMode() {
        this.attackMode = 'NUKE';
        // Highlight active nuke button (glow effect via scale)
        if (this.abilityButtons?._nuke) this.abilityButtons._nuke.container.setScale(1.2);
        if (this.abilityButtons?._nuke) this.playAbilityReadyAnimation(this.abilityButtons._nuke.container, 'NUKE ARMED', 0xffaa33);
        this.updateStatusDisplay('NUKE_MODE');
        console.log('GameScene: ROW NUKE mode activated - click any cell in target row');
    }

    /**
     * Execute Row Nuke on clicked row (attacks entire row)
     * @param {number} row - Target row (0-9)
     * @param {number} col - Clicked column (ignored, just for row detection)
     */
    executeRowNuke(row, col) {
        console.log(`GameScene: Row Nuke fired at row ${row}`);

        // Consume one nuke charge
        this.turnManager.rowNukeCharges--;
        this.attackMode = 'NORMAL';
        if (this.abilityButtons?._nuke) this.abilityButtons._nuke.container.setScale(1);
        this.updateAbilityButtons();
        this.updateStatusDisplay('PLAYER_TURN');
        this.combatLocked = true;

        // Attack all 10 cells in the row
        let totalHits = 0;
        let totalSinks = 0;
        const attackedCells = [];
        const sunkShips = [];

        for (let c = 0; c < 10; c++) {
            const attackResult = this.enemyFleet.receiveAttack(row, c);

            if (!attackResult.duplicate && attackResult.hit) {
                totalHits++;
                if (attackResult.sunk) {
                    totalSinks++;
                    // Track sunk ships (avoid duplicates)
                    if (attackResult.ship && !sunkShips.find(s => s === attackResult.ship)) {
                        sunkShips.push(attackResult.ship);
                    }
                }
            }

            const newState = attackResult.sunk ? CELL.SUNK : (attackResult.hit ? CELL.HIT : CELL.MISS);
            this.enemyCellStates[row][c] = newState;
            attackedCells.push({ col: c, state: newState, attackResult });
        }

        // Visual effects - sequential explosions
        attackedCells.forEach(({ col, state, attackResult }, index) => {
            this.time.delayedCall(index * 100, () => {
                this.refreshEnemyCellByState(row, col, state);

                // Show mini explosion
                const x = this.currentLayout.enemyX + col * this.currentLayout.cellSize + this.currentLayout.cellSize / 2;
                const y = this.currentLayout.enemyY + row * this.currentLayout.cellSize + this.currentLayout.cellSize / 2;

                const explosion = this.add.circle(x, y, this.currentLayout.cellSize * 0.6, 0xff00ff, 0.8);
                explosion.setDepth(100);
                this.tweens.add({
                    targets: explosion,
                    scaleX: 1.5,
                    scaleY: 1.5,
                    alpha: 0,
                    duration: 400,
                    ease: 'Power2',
                    onComplete: () => explosion.destroy()
                });
            });
        });

        // Show results after all explosions
        this.time.delayedCall(1200, () => {
            const { width, height } = this.scale;
            const text = this.add.text(width / 2, height / 2 - 60, `ROW NUKE!\n${totalHits} HITS, ${totalSinks} SUNK`, {
                fontSize: '24px',
                fontFamily: 'Arial Black',
                fill: '#ff9900',
                stroke: '#000000',
                strokeThickness: 4,
                align: 'center'
            }).setOrigin(0.5).setDepth(100);

            this.time.delayedCall(1500, () => {
                this.tweens.add({
                    targets: text,
                    alpha: 0,
                    duration: 600,
                    onComplete: () => text.destroy()
                });
            });

            // Mark all segments of sunk ships and render sprites
            sunkShips.forEach(ship => {
                ship.segments.forEach(seg => {
                    this.enemyCellStates[seg.row][seg.col] = CELL.SUNK;
                    this.refreshEnemyCellByState(seg.row, seg.col, CELL.SUNK);
                });
                this.renderEnemyShipSprite(ship);
            });

            // Update game state
            this.updateShipStatus();

            // Check victory
            if (this.enemyFleet.isFleetDestroyed()) {
                this.turnManager.setGameOver('PLAYER');
                this.time.delayedCall(800, () => this.endGame('PLAYER'));
                return;
            }

            // Switch to AI turn (nuke ends player turn)
            this.turnManager.switchToEnemy();
            this.updateStatusDisplay('ENEMY_TURN');
            this.time.delayedCall(700, () => this.executeAITurn());
        });
    }

    // ─── Visual Feedback ────────────────────────────────────────────────────────

    /**
     * Apply all stored cell states to the current grid cells (used after resize).
     * Week 6A: Also renders ship sprites after applying cell states.
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

        // Week 6A: Render ship sprites (one per ship, spanning multiple cells)
        this.renderAllShipSprites();
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
     * Week 6A: Ship sprites span entire ship, not per-cell
     * @param {Phaser.GameObjects.Rectangle} cell
     * @param {string} state
     * @param {number|null} shipColor
     */
    applyPlayerCellColor(cell, state, shipColor) {
        switch (state) {
            case CELL.SHIP:
                // Make cell transparent to show ocean background
                cell.setFillStyle(0x0088aa, 0.1);
                // Ship sprites are rendered separately (whole ship, not per-cell)
                break;
            case CELL.HIT:
                cell.setFillStyle(CELL_COLORS.HIT, 0.9);
                break;
            case CELL.SUNK:
                cell.setFillStyle(CELL_COLORS.SUNK, 0.9);
                break;
            case CELL.MISS:
                cell.setFillStyle(CELL_COLORS.MISS, 0.45);
                break;
            default:
                cell.setFillStyle(CELL_COLORS.PLAYER_EMPTY, 0.5);
        }
    }

    /**
     * Render all player ship sprites (Week 6A: One sprite per ship, spanning multiple cells).
     * Called after grid layout is ready.
     */
    renderAllShipSprites() {
        if (!this.currentLayout) return;

        // Render each ship sprite (spans entire ship length)
        this.playerShipSprites.forEach(shipObj => {
            const { ship, shipType, orientation } = shipObj;
            const spriteKey = this.getOrientedShipTextureKey(shipType.sprite, orientation);

            if (!this.textures.exists(spriteKey)) {
                console.warn(`Sprite not found: ${spriteKey}`);
                return;
            }

            // Calculate ship's center position based on actual grid placement
            const segments = ship.segments;
            const firstSeg = segments[0];
            const lastSeg = segments[segments.length - 1];
            const cellSize = this.currentLayout.cellSize;

            // Center = midpoint of first and last segment
            const centerX = this.currentLayout.playerX + ((firstSeg.col + lastSeg.col + 1) / 2) * cellSize;
            const centerY = this.currentLayout.playerY + ((firstSeg.row + lastSeg.row + 1) / 2) * cellSize;

            // CORRECT FIX: All sprites are designed as VERTICAL (tall × narrow, up-down)
            // Always calculate dimensions as vertical, then rotate for horizontal placement
            const { width: spriteWidth, height: spriteHeight } = this.getShipDisplaySize(ship.length, cellSize, orientation);

            // Create sprite
            const sprite = this.add.image(centerX, centerY, spriteKey);

            // Set display size (always vertical dimensions matching sprite design)
            sprite.setDisplaySize(spriteWidth, spriteHeight);

            // Rotate 90° if ship is placed HORIZONTALLY (to lay it sideways)

            // Store sprite reference
            shipObj.sprite = sprite;
        });
    }

    /**
     * Clear ship sprite for a specific ship (when sunk).
     * @param {object} ship - Ship model object
     */
    clearShipSpriteByShip(ship) {
        const shipObj = this.playerShipSprites.find(obj => obj.ship === ship);
        if (shipObj && shipObj.sprite) {
            shipObj.sprite.destroy();
            shipObj.sprite = null;
        }
    }

    /**
     * Clear all ship sprites (used during resize/grid recreation).
     */
    clearAllShipSprites() {
        this.playerShipSprites.forEach(shipObj => {
            if (shipObj.sprite) {
                shipObj.sprite.destroy();
                shipObj.sprite = null;
            }
        });
        this.enemyShipSprites.forEach(shipObj => {
            if (shipObj.sprite) {
                shipObj.sprite.destroy();
                shipObj.sprite = null;
            }
        });
    }

    /**
     * Render an enemy ship sprite when it's sunk (Week 6A).
     * @param {object} ship - Sunk enemy ship object
     */
    renderEnemyShipSprite(ship) {
        if (!this.currentLayout) return;

        // Find ship type from ship properties
        const shipType = Object.values(SHIP_TYPES).find(type =>
            type.length === ship.length && type.name === ship.name
        );

        if (!shipType) {
            console.warn(`renderEnemyShipSprite: Could not find ship type for ${ship.name}`);
            return;
        }

        const orientation = ship.orientation;
        const spriteKey = this.getOrientedShipTextureKey(shipType.sprite, orientation);
        if (!this.textures.exists(spriteKey)) {
            console.warn(`Sprite not found: ${spriteKey}`);
            return;
        }

        // Calculate ship's center position based on actual grid placement
        const segments = ship.segments;
        const firstSeg = segments[0];
        const lastSeg = segments[segments.length - 1];
        const cellSize = this.currentLayout.cellSize;

        // Center = midpoint of first and last segment
        const centerX = this.currentLayout.enemyX + ((firstSeg.col + lastSeg.col + 1) / 2) * cellSize;
        const centerY = this.currentLayout.enemyY + ((firstSeg.row + lastSeg.row + 1) / 2) * cellSize;

        // All sprites designed VERTICAL (tall × narrow)
        const { width: spriteWidth, height: spriteHeight } = this.getShipDisplaySize(ship.length, cellSize, orientation);

        // Create sprite
        const sprite = this.add.image(centerX, centerY, spriteKey);

        // Set display size (always vertical dimensions matching sprite design)
        sprite.setDisplaySize(spriteWidth, spriteHeight);

        // Rotate 90° if ship is placed HORIZONTALLY (to lay it sideways)

        // Store sprite reference
        this.enemyShipSprites.push({
            ship: ship,
            shipType: shipType,
            orientation: orientation,
            sprite: sprite
        });
    }

    /**
     * Get sprite key from ship color (reverse mapping).
     * @param {number} shipColor
     * @returns {string|null}
     */
    getSpriteKeyFromColor(shipColor) {
        // Map colors to sprite keys based on SHIP_TYPES config
        const colorMap = {
            [SHIP_TYPES.CARRIER.color]: SHIP_TYPES.CARRIER.sprite,
            [SHIP_TYPES.NUCLEAR_SUB.color]: SHIP_TYPES.NUCLEAR_SUB.sprite,
            [SHIP_TYPES.CRUISER.color]: SHIP_TYPES.CRUISER.sprite,
            [SHIP_TYPES.ATTACK_SUB.color]: SHIP_TYPES.ATTACK_SUB.sprite,
            [SHIP_TYPES.DESTROYER.color]: SHIP_TYPES.DESTROYER.sprite
        };
        return colorMap[shipColor] || null;
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
                cell.setFillStyle(0xffffff, 0);
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
     * Show floating combat text (HIT/MISS) over attacked grid cell.
     * @param {string} message - "HIT!" or "MISS"
     * @param {string} color - Text color (#ff4444 for HIT, #ffffff for MISS)
     * @param {number} centerX - Grid cell center X coordinate
     * @param {number} centerY - Grid cell center Y coordinate
     */
    showCombatText(message, color, centerX, centerY) {
        const text = this.add.text(centerX, centerY, message, {
            fontSize: Math.min(18, this.scale.width * 0.03) + 'px',
            fontFamily: 'Arial Black',
            fill: color,
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(101);

        // Hold for 900ms, then fade and float up over 1400ms
        this.time.delayedCall(900, () => {
            this.tweens.add({
                targets: text,
                y: centerY - 40,
                alpha: 0,
                duration: 1400,
                ease: 'Power2',
                onComplete: () => text.destroy()
            });
        });
    }

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

        // Hold for 1800ms, then fade and float up over 1800ms
        this.time.delayedCall(1800, () => {
            this.tweens.add({
                targets: text,
                y: height / 2 - 80,
                alpha: 0,
                duration: 1800,
                ease: 'Power2',
                onComplete: () => text.destroy()
            });
        });
    }

    /**
     * Show chain bonus combo text (COMBO x2/x3/x4!)
     * @param {number} multiplier - Chain multiplier (2, 3, or 4)
     * @param {number} bonus - Bonus points awarded
     */
    showChainBonus(multiplier, bonus) {
        const { width, height } = this.scale;

        const text = this.add.text(width / 2, height / 2 + 40, `COMBO x${multiplier}! +${bonus}`, {
            fontSize: Math.min(28, width * 0.045) + 'px',
            fontFamily: 'Arial Black',
            fill: '#ffff00', // Bright yellow for combo
            fontWeight: 'bold',
            stroke: '#ff8800',
            strokeThickness: 4,
            shadow: {
                offsetX: 0,
                offsetY: 0,
                color: '#ffaa00',
                blur: 12,
                fill: true
            }
        }).setOrigin(0.5).setDepth(101);

        // Pulse animation + fade out
        this.tweens.add({
            targets: text,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 300,
            yoyo: true,
            repeat: 1
        });

        this.time.delayedCall(1000, () => {
            this.tweens.add({
                targets: text,
                alpha: 0,
                duration: 600,
                ease: 'Power2',
                onComplete: () => text.destroy()
            });
        });
    }

    /**
     * Show "ROW NUKE EARNED!" announcement
     */
    showRowNukeEarned() {
        const { width, height } = this.scale;

        const text = this.add.text(width / 2, height / 2, 'ROW NUKE EARNED!', {
            fontSize: Math.min(32, width * 0.05) + 'px',
            fontFamily: 'Arial Black',
            fill: '#ff9900', // Orange to match NUKE button
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 5,
            shadow: {
                offsetX: 0,
                offsetY: 0,
                color: '#ff9900',
                blur: 16,
                fill: true
            }
        }).setOrigin(0.5).setDepth(102);

        // Flash animation
        this.tweens.add({
            targets: text,
            alpha: 0.3,
            duration: 200,
            yoyo: true,
            repeat: 4
        });

        this.time.delayedCall(2000, () => {
            this.tweens.add({
                targets: text,
                alpha: 0,
                y: height / 2 - 50,
                duration: 800,
                ease: 'Power2',
                onComplete: () => text.destroy()
            });
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
            this.handleExitAttempt();
        });
    }

    /**
     * Set up beforeunload handler to save game state when tab closes
     */
    setupBeforeUnload() {
        this.beforeUnloadHandler = () => {
            if (!this.turnManager.gameOver) {
                this.saveGameState();
            }
        };
        window.addEventListener('beforeunload', this.beforeUnloadHandler);
    }

    // ─── Save / Load ────────────────────────────────────────────────────────────

    /**
     * Handle exit attempt (BACK button or ESC key)
     */
    handleExitAttempt() {
        if (this.turnManager.gameOver) {
            // Game is over, exit immediately
            this.cleanupAndExit();
            return;
        }

        // Game in progress - show confirmation
        this.showConfirmationDialog(
            'Exit to main menu?\\nYour progress will be saved.',
            () => {
                this.saveGameState();
                this.cleanupAndExit();
            },
            () => {
                // User cancelled - do nothing
            }
        );
    }

    /**
     * Clean up event listeners and exit to title
     */
    cleanupAndExit() {
        if (this.beforeUnloadHandler) {
            window.removeEventListener('beforeunload', this.beforeUnloadHandler);
            this.beforeUnloadHandler = null;
        }
        this.scene.start('TitleScene');
    }

    /**
     * Save current game state to localStorage
     */
    saveGameState() {
        try {
            const state = {
                playerCellStates: this.playerCellStates,
                enemyCellStates: this.enemyCellStates,
                playerFleet: this.playerFleet.serialize(),
                enemyFleet: this.enemyFleet.serialize(),
                turnManager: this.turnManager.serialize(),
                aiManager: this.aiManager.serialize(),
                combatLocked: this.combatLocked,
                gameOver: this.turnManager.gameOver,
                timestamp: Date.now()
            };
            localStorage.setItem('battleshipsGameState', JSON.stringify(state));
            console.log('Game state saved to localStorage');
        } catch (error) {
            console.warn('Failed to save game state:', error);
        }
    }

    /**
     * Load game state from localStorage
     * @returns {object|null} Saved state or null if none exists
     */
    loadGameState() {
        try {
            const saved = localStorage.getItem('battleshipsGameState');
            if (!saved) return null;

            const state = JSON.parse(saved);

            // Check age - discard if older than 7 days
            const age = Date.now() - (state.timestamp || 0);
            if (age > 7 * 24 * 60 * 60 * 1000) {
                this.clearSavedGame();
                return null;
            }

            return state;
        } catch (error) {
            console.warn('Failed to load game state:', error);
            return null;
        }
    }

    /**
     * Restore game state from saved data
     */
    restoreGameState(savedState) {
        this.playerCellStates = savedState.playerCellStates;
        this.enemyCellStates = savedState.enemyCellStates;

        // Restore fleets (will need deserialize methods in FleetManager)
        this.playerFleet.deserialize(savedState.playerFleet);
        this.enemyFleet.deserialize(savedState.enemyFleet);

        // Restore managers
        this.turnManager.deserialize(savedState.turnManager);
        this.aiManager.deserialize(savedState.aiManager);

        this.combatLocked = savedState.combatLocked;

        // Create layout and apply states
        this.createGameLayout();
        this.createSceneTitle();
        this.createUI();
        this.applyGridStates();
        this.setupInput();
        this.setupBeforeUnload();

        // Update displays
        this.updateStatusDisplay(this.turnManager.currentTurn === 'PLAYER' ? 'PLAYER_TURN' : 'ENEMY_TURN');
        this.updateShipStatus();
        this.uiElements.scoreText.setText(`SCORE: ${this.turnManager.score}`);

        console.log('Game state restored from save');
    }

    /**
     * Clear saved game from localStorage
     */
    clearSavedGame() {
        try {
            localStorage.removeItem('battleshipsGameState');
            console.log('Saved game cleared');
        } catch (error) {
            console.warn('Failed to clear saved game:', error);
        }
    }

    /**
     * Show resume game dialog
     */
    showResumeDialog(savedState) {
        const { width, height } = this.scale;

        this.showConfirmationDialog(
            'Resume previous game?',
            () => {
                // Resume - restore saved state
                this.restoreGameState(savedState);
            },
            () => {
                // Start new game - clear saved state
                this.clearSavedGame();
                this.startNewGame();
            }
        );
    }

    /**
     * Show a confirmation dialog with Yes/No options
     * @param {string} message - Dialog message
     * @param {function} onConfirm - Callback for Yes
     * @param {function} onCancel - Callback for No
     */
    showConfirmationDialog(message, onConfirm, onCancel) {
        const { width, height } = this.scale;

        // Dim background overlay
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7)
            .setOrigin(0, 0)
            .setDepth(200)
            .setInteractive();

        // Dialog box
        const dialogWidth = Math.min(width * 0.8, 400);
        const dialogHeight = Math.min(height * 0.35, 200);
        const dialogBox = this.add.rectangle(width / 2, height / 2, dialogWidth, dialogHeight, 0x2c3e50)
            .setDepth(201)
            .setStrokeStyle(4, 0x3498db);

        // Message text
        const messageText = this.add.text(width / 2, height / 2 - 30, message, {
            fontSize: Math.min(width * 0.04, 18) + 'px',
            fontFamily: 'Arial',
            fill: '#ffffff',
            align: 'center',
            wordWrap: { width: dialogWidth - 40 }
        }).setOrigin(0.5).setDepth(202);

        // Yes button
        const yesBtn = this.add.rectangle(width / 2 - 60, height / 2 + 40, 100, 44, 0x2ecc71)
            .setDepth(202)
            .setInteractive({ useHandCursor: true });
        const yesText = this.add.text(width / 2 - 60, height / 2 + 40, 'YES', {
            fontSize: '16px',
            fontFamily: 'Arial Black',
            fill: '#ffffff'
        }).setOrigin(0.5).setDepth(202);

        // No button
        const noBtn = this.add.rectangle(width / 2 + 60, height / 2 + 40, 100, 44, 0xe74c3c)
            .setDepth(202)
            .setInteractive({ useHandCursor: true });
        const noText = this.add.text(width / 2 + 60, height / 2 + 40, 'NO', {
            fontSize: '16px',
            fontFamily: 'Arial Black',
            fill: '#ffffff'
        }).setOrigin(0.5).setDepth(202);

        // Button hover effects
        yesBtn.on('pointerover', () => yesBtn.setFillStyle(0x27ae60));
        yesBtn.on('pointerout', () => yesBtn.setFillStyle(0x2ecc71));
        noBtn.on('pointerover', () => noBtn.setFillStyle(0xc0392b));
        noBtn.on('pointerout', () => noBtn.setFillStyle(0xe74c3c));

        // Button click handlers
        const cleanup = () => {
            overlay.destroy();
            dialogBox.destroy();
            messageText.destroy();
            yesBtn.destroy();
            yesText.destroy();
            noBtn.destroy();
            noText.destroy();
        };

        yesBtn.on('pointerdown', () => {
            cleanup();
            if (onConfirm) onConfirm();
        });

        noBtn.on('pointerdown', () => {
            cleanup();
            if (onCancel) onCancel();
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

        // UPDATE LAYOUT FIRST - buttons and other elements need current layout data
        const oldLayout = this.currentLayout;
        this.currentLayout = newLayout;
        this.createWaveBackground(newLayout);

        const orientationChanged = oldLayout &&
            (oldLayout.width > oldLayout.height) !== (width > height);

        const stackChanged = oldLayout &&
            oldLayout.shouldStack !== newLayout.shouldStack;

        // Lower threshold from 15% to 5% to catch manual browser resizes
        const cellSizeChanged = oldLayout &&
            Math.abs(oldLayout.cellSize - newLayout.cellSize) / oldLayout.cellSize > 0.05;

        // Also check if grid positions changed significantly (manual resize fix)
        const gridPositionChanged = oldLayout && (
            Math.abs(oldLayout.enemyX - newLayout.enemyX) > 10 ||
            Math.abs(oldLayout.enemyY - newLayout.enemyY) > 10 ||
            Math.abs(oldLayout.playerX - newLayout.playerX) > 10 ||
            Math.abs(oldLayout.playerY - newLayout.playerY) > 10
        );

        if (orientationChanged || stackChanged || cellSizeChanged || gridPositionChanged || !oldLayout) {
            // Destroy ship sprites first (Week 6: Graphics)
            this.clearAllShipSprites();

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
        }

        // Update scene title position
        if (this.sceneTitle) {
            const titleMetrics = this.getSceneTitleMetrics(width, height, newLayout.shouldStack);
            this.sceneTitle.setPosition(width / 2, titleMetrics.y);
            this.sceneTitle.setFontSize(`${titleMetrics.fontSize}px`);
            this.sceneTitle.setStroke('#12181f', titleMetrics.strokeThickness);
        }

        // Update UI positions
        const buttonY = width < 450 ? 45 : 35;
        if (this.uiElements.statusText) {
            this.uiElements.statusText
                .setPosition(width / 2, 15)
                .setFontSize(this.getStatusFontSize(width));
        }
        if (this.uiElements.backButton) this.uiElements.backButton.setPosition(58, buttonY);
        if (this.uiElements.scoreText) {
            this.uiElements.scoreText
                .setPosition(width - 10, 15)
                .setFontSize(this.getStatusFontSize(width));
        }

        // Destroy and recreate ship status panel on resize (Week 6A: Sprite-based status bar)
        this.destroyShipStatusPanel();
        this.createShipStatusPanel();
        this.updateShipStatus();  // Restore sunk ship indicators

        // Destroy and recreate round arcade buttons on resize
        this.destroyArcadeButtons();
        this.createArcadeButtons();
    }
}
