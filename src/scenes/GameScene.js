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

        // Ship sprite containers (Week 6A: Refactored to span multiple cells)
        this.playerShipSprites = [];  // Array of ship sprite objects {sprite, ship, orientation}

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

        // Combat lock (prevent double-clicks during AI turn)
        this.combatLocked = false;

        // Special attack mode tracking
        this.attackMode = 'NORMAL'; // 'NORMAL', 'SONAR', 'NUKE'
        this.abilityButtons = null; // {sonarBtn, sonarText, nukeBtn, nukeText}

        // Week 6B: Gunsight cursor for targeting
        this.gunsightCursor = null;
        this.hoveredTarget = null;  // {row, col} of currently hovered enemy cell
        this.fireButton = null;  // FIRE button UI element
    }

    /**
     * Preload ship sprite assets
     */
    preload() {
        // Load ship sprites (Kenney.nl CC0 assets)
        this.load.image('ship-carrier', 'assets/ships/Carrier/ShipCarrierHull.png');
        this.load.image('ship-battleship', 'assets/ships/Battleship/ShipBattleshipHull.png');
        this.load.image('ship-cruiser', 'assets/ships/Cruiser/ShipCruiserHull.png');
        this.load.image('ship-submarine', 'assets/ships/Submarine/ShipSubMarineHull.png');
        this.load.image('ship-destroyer', 'assets/ships/Destroyer/ShipDestroyerHull.png');

        // Week 6B: Simple ship icon for status bar indicators (basic boat outline)
        this.load.image('ship-status-icon', 'assets/ui/simple-ship-icon.png');

        // Week 6B: Gunsight cursor for targeting
        this.load.image('gunsight', 'assets/ui/gunsight.png');
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

        // Create both grids
        this.playerGrid = createGrid(this, layout.playerX, layout.playerY, GRID_SIZE, layout.cellSize, 'PLAYER');
        this.enemyGrid  = createGrid(this, layout.enemyX,  layout.enemyY,  GRID_SIZE, layout.cellSize, 'ENEMY');

        // Grid titles - use adaptive titleH from layout to avoid overlap with top UI
        const titleH    = layout.titleH || 20;
        const titleSize = Math.max(10, Math.min(titleH - 2, width * 0.028));
        const titleStyle = {
            font: `bold ${titleSize}px Arial`,
            fill: COLORS.TEXT
        };

        const gridWidth = GRID_SIZE * layout.cellSize;

        const playerTitle = this.add.text(
            layout.playerX + gridWidth / 2,
            layout.playerY - titleH + 1,   // Sits just above the grid, within the reserved titleH space
            'YOUR FLEET', titleStyle
        ).setOrigin(0.5);

        const enemyTitle = this.add.text(
            layout.enemyX + gridWidth / 2,
            layout.enemyY - titleH + 1,
            'ENEMY WATERS', titleStyle
        ).setOrigin(0.5);

        this.gridTitles = [playerTitle, enemyTitle];

        // Attach combat click handlers to enemy grid cells
        this.attachEnemyClickHandlers();

        // Week 6B: Create gunsight cursor for targeting
        this.createGunsightCursor();
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
        // Fixed position: below back button (y=45, height=30) with 10px gap = y=70
        // This ensures no overlap with status text (y=15) or back button (y=30-60)
        const titleY = Math.min(70, height * 0.12); // Use percentage fallback for very short screens

        this.sceneTitle = this.add.text(width / 2, titleY, 'COMBAT', {
            fontSize: Math.min(width * 0.06, 42) + 'px',
            fontFamily: 'Arial Black',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(10);
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
            // TOP_UI: status text (y=15) + back button (y=45, h=30) + title (y=70, h~42) + gap
            const TOP_UI    = 120;  // Increased to account for COMBAT title at y=70 (42px font + 8px gap = 120)
            const BOTTOM_UI = 24;   // ship status bar at bottom
            const available = height - TOP_UI - BOTTOM_UI;

            // Adaptive spacing so grids scale down gracefully on tiny screens
            // and look spacious on larger portrait screens (e.g. tablet)
            if (available < 380) {
                titleH     = 13;
                gridSpacing = 8;
                labelSpace  = 18;
            } else if (available < 460) {
                titleH     = 15;
                gridSpacing = 12;
                labelSpace  = 22;
            } else if (available < 700) {
                titleH     = 18;
                gridSpacing = 18;
                labelSpace  = 28;
            } else {
                // Large portrait (e.g. tablet 768×1024) — roomier spacing
                titleH     = 24;
                gridSpacing = 30;
                labelSpace  = 35;
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
            // Allow larger cells on big screens (use MAX_CELL_SIZE instead of CELL_SIZE)
            cellSize   = Math.max(20, Math.min(GAME_CONSTANTS.MAX_CELL_SIZE, maxCell));
            titleH     = 20;
            labelSpace = LABEL_SPACE;

            const gridWidth = GRID_SIZE * cellSize;
            const totalW    = gridWidth * 2 + GRID_SPACING;
            const startX    = Math.max(MARGIN, (width - totalW) / 2);
            const centerY   = Math.max(MARGIN, (height - gridWidth - TITLE_SPACE) / 2);

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
        backBtn.on('pointerdown', () => this.handleExitAttempt());

        this.uiElements.backButton = backBtn;
        this.uiElements.backText   = backText;

        // Score display (top right)
        this.uiElements.scoreText = this.add.text(width - 10, 15, 'SCORE: 0', {
            fontSize: this.getStatusFontSize(width),
            fontFamily: 'Arial',
            fill: C.TEXT,
            fontWeight: 'bold'
        }).setOrigin(1, 0.5);

        // Ability buttons (center between grids)
        this.createAbilityButtons();

        // Week 6B: FIRE button for attacking
        this.createFireButton();

        // Ship status panel (below grids)
        this.createShipStatusPanel();
    }

    /**
     * Create special ability buttons (Sonar Ping + Row Nuke)
     * Week 6A: Fixed positioning to avoid grid overlap on desktop
     */
    createAbilityButtons() {
        const { width, height } = this.scale;

        // Position buttons based on layout to avoid overlap with grids
        let centerX, centerY;
        const gridWidth = GAME_CONSTANTS.GRID_SIZE * this.currentLayout.cellSize;

        if (this.currentLayout.shouldStack) {
            // Stacked layout (portrait): Position between the two grids vertically
            const playerBottom = this.currentLayout.playerY + gridWidth + this.currentLayout.labelSpace;
            const enemyTop = this.currentLayout.enemyY - this.currentLayout.titleH;
            centerX = width / 2;
            centerY = (playerBottom + enemyTop) / 2;
        } else {
            // Side-by-side layout (landscape): Center between grid edges
            const playerRight = this.currentLayout.playerX + gridWidth;
            const enemyLeft = this.currentLayout.enemyX;
            centerX = (playerRight + enemyLeft) / 2;
            centerY = this.currentLayout.playerY + (gridWidth / 2);
        }

        const buttonWidth = Math.min(width * 0.18, 100);
        const buttonHeight = 44;
        const spacing = 12;

        // Sonar Ping button (top)
        const sonarY = centerY - (buttonHeight / 2) - (spacing / 2);
        const sonarBtn = this.add.rectangle(
            centerX, sonarY, buttonWidth, buttonHeight, 0x2c3e50
        );
        sonarBtn.setStrokeStyle(3, 0x00ffff);
        sonarBtn.setInteractive({ useHandCursor: true });

        const sonarText = this.add.text(centerX, sonarY, 'SONAR', {
            fontSize: '14px',
            fontFamily: 'Arial Black',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        sonarBtn.on('pointerover', () => {
            if (this.turnManager.sonarPingAvailable && this.attackMode === 'NORMAL') {
                sonarBtn.setFillStyle(0x00ffff);
            }
        });

        sonarBtn.on('pointerout', () => {
            if (this.attackMode !== 'SONAR') {
                sonarBtn.setFillStyle(0x2c3e50);
            }
        });

        sonarBtn.on('pointerdown', () => {
            if (this.turnManager.sonarPingAvailable && !this.combatLocked && this.turnManager.currentTurn === 'PLAYER') {
                this.enterSonarMode();
            }
        });

        // Row Nuke button (bottom)
        const nukeY = centerY + (buttonHeight / 2) + (spacing / 2);
        const nukeBtn = this.add.rectangle(
            centerX, nukeY, buttonWidth, buttonHeight, 0x2c3e50
        );
        nukeBtn.setStrokeStyle(3, 0xff00ff);
        nukeBtn.setInteractive({ useHandCursor: true });

        const nukeText = this.add.text(centerX, nukeY, 'NUKE', {
            fontSize: '14px',
            fontFamily: 'Arial Black',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        nukeBtn.on('pointerover', () => {
            if (this.turnManager.rowNukeCharges > 0 && this.attackMode === 'NORMAL') {
                nukeBtn.setFillStyle(0xff00ff);
            }
        });

        nukeBtn.on('pointerout', () => {
            if (this.attackMode !== 'NUKE') {
                nukeBtn.setFillStyle(0x2c3e50);
            }
        });

        nukeBtn.on('pointerdown', () => {
            if (this.turnManager.rowNukeCharges > 0 && !this.combatLocked && this.turnManager.currentTurn === 'PLAYER') {
                this.enterNukeMode();
            }
        });

        // Store references
        this.abilityButtons = { sonarBtn, sonarText, nukeBtn, nukeText };

        // Initial state update
        this.updateAbilityButtons();
    }

    /**
     * Update ability button states (enabled/disabled based on availability)
     */
    updateAbilityButtons() {
        if (!this.abilityButtons) return;

        const { sonarBtn, sonarText, nukeBtn, nukeText } = this.abilityButtons;

        // Sonar state
        if (this.turnManager.sonarPingAvailable) {
            sonarBtn.setAlpha(1.0);
            sonarText.setAlpha(1.0);
        } else {
            sonarBtn.setAlpha(0.3);
            sonarText.setAlpha(0.3);
        }

        // Nuke state (show charge count if > 1)
        if (this.turnManager.rowNukeCharges > 0) {
            nukeBtn.setAlpha(1.0);
            nukeText.setAlpha(1.0);
            if (this.turnManager.rowNukeCharges > 1) {
                nukeText.setText(`NUKE x${this.turnManager.rowNukeCharges}`);
            } else {
                nukeText.setText('NUKE');
            }
        } else {
            nukeBtn.setAlpha(0.3);
            nukeText.setAlpha(0.3);
            nukeText.setText('NUKE');
        }
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
     * Create FIRE button for attacking (Week 6B).
     * Alternative to clicking on cells - useful for mobile/touch screens.
     */
    createFireButton() {
        const { width, height } = this.scale;

        // Position FIRE button based on layout
        let centerX, centerY;
        const gridWidth = GAME_CONSTANTS.GRID_SIZE * this.currentLayout.cellSize;

        if (this.currentLayout.shouldStack) {
            // Stacked layout (portrait): Position between grids vertically
            const playerBottom = this.currentLayout.playerY + gridWidth + this.currentLayout.labelSpace;
            const enemyTop = this.currentLayout.enemyY - this.currentLayout.titleH;
            centerX = width / 2;
            centerY = (playerBottom + enemyTop) / 2;
        } else {
            // Side-by-side (landscape): Center between grid edges
            const playerRight = this.currentLayout.playerX + gridWidth;
            const enemyLeft = this.currentLayout.enemyX;
            centerX = (playerRight + enemyLeft) / 2;
            centerY = this.currentLayout.playerY + (gridWidth / 2);
        }

        const buttonWidth = Math.min(width * 0.20, 110);
        const buttonHeight = 50;

        // FIRE button (below Row Nuke button)
        const nukeBtn = this.abilityButtons?.nukeBtn;
        const nukeY = nukeBtn ? nukeBtn.y : centerY;
        const fireY = nukeY + (buttonHeight / 2) + 14;  // 14px spacing

        const fireBtn = this.add.rectangle(
            centerX, fireY, buttonWidth, buttonHeight, 0x8B0000  // Dark red
        );
        fireBtn.setStrokeStyle(3, 0xff0000);  // Red border
        fireBtn.setInteractive({ useHandCursor: true });
        fireBtn.setAlpha(0.3);  // Disabled by default

        const fireText = this.add.text(centerX, fireY, 'FIRE', {
            fontSize: '18px',
            fontFamily: 'Arial Black',
            fill: '#ffffff',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        fireText.setAlpha(0.3);  // Disabled by default

        fireBtn.on('pointerover', () => {
            if (this.hoveredTarget) {
                fireBtn.setFillStyle(0xff0000);  // Bright red on hover
            }
        });

        fireBtn.on('pointerout', () => {
            fireBtn.setFillStyle(0x8B0000);  // Back to dark red
        });

        fireBtn.on('pointerdown', () => {
            if (this.hoveredTarget) {
                this.handlePlayerAttack(this.hoveredTarget.row, this.hoveredTarget.col);
            }
        });

        this.fireButton = { button: fireBtn, text: fireText };
    }

    /**
     * Update FIRE button state based on hovered target.
     */
    updateFireButton() {
        if (!this.fireButton) return;

        const { button, text } = this.fireButton;

        if (this.hoveredTarget && this.canPlayerAttack(this.hoveredTarget.row, this.hoveredTarget.col)) {
            // Enable button
            button.setAlpha(1.0);
            text.setAlpha(1.0);
        } else {
            // Disable button
            button.setAlpha(0.3);
            text.setAlpha(0.3);
        }
    }

    /**
     * Create ship health status display below the grids.
     * Week 6A: Uses ship outline sprites (patrol boat) tinted with ship colors.
     */
    createShipStatusPanel() {
        const { width, height } = this.scale;
        const playerShips = this.playerFleet.getAllShips();
        const enemyShipCount = 5;  // Always 5 enemy ships

        const statusY = height - 22;
        const fontSize = Math.max(10, Math.min(13, width * 0.016)) + 'px';
        const iconSize = Math.min(24, width * 0.025);  // Ship icon size
        const iconSpacing = iconSize + 4;  // Space between icons

        // === PLAYER FLEET STATUS ===
        const playerLabelX = width * 0.25 - (iconSpacing * 2.5);
        this.uiElements.playerShipStatusLabel = this.add.text(
            playerLabelX, statusY,
            'YOUR SHIPS:',
            { fontSize, fontFamily: 'Arial', fill: '#00ff88', fontWeight: 'bold' }
        ).setOrigin(1, 0.5);

        // Create ship status sprites for each player ship
        this.playerShipStatusSprites = [];
        playerShips.forEach((ship, index) => {
            const iconX = playerLabelX + 10 + (index * iconSpacing);

            // Ship outline sprite (green to match "YOUR SHIPS" label)
            const sprite = this.add.image(iconX, statusY, 'ship-status-icon');
            sprite.setDisplaySize(iconSize, iconSize);
            sprite.setTint(0x00ff88);  // Green (same as label)

            // Red cross sprite (hidden initially, shown when sunk)
            const crossSprite = this.add.graphics();
            crossSprite.lineStyle(2, 0xff0000, 1);
            crossSprite.beginPath();
            crossSprite.moveTo(iconX - iconSize * 0.35, statusY - iconSize * 0.35);
            crossSprite.lineTo(iconX + iconSize * 0.35, statusY + iconSize * 0.35);
            crossSprite.moveTo(iconX + iconSize * 0.35, statusY - iconSize * 0.35);
            crossSprite.lineTo(iconX - iconSize * 0.35, statusY + iconSize * 0.35);
            crossSprite.strokePath();
            crossSprite.setVisible(false);

            this.playerShipStatusSprites.push({ sprite, crossSprite, ship });
        });

        // === ENEMY FLEET STATUS ===
        const enemyLabelX = width * 0.75 - (iconSpacing * 2.5);
        this.uiElements.enemyShipStatusLabel = this.add.text(
            enemyLabelX, statusY,
            'ENEMY:',
            { fontSize, fontFamily: 'Arial', fill: '#ff8800', fontWeight: 'bold' }
        ).setOrigin(1, 0.5);

        // Create 5 enemy ship status sprites (all same color)
        this.enemyShipStatusSprites = [];
        for (let i = 0; i < enemyShipCount; i++) {
            const iconX = enemyLabelX + 10 + (i * iconSpacing);

            // Ship outline sprite (orange for enemy)
            const sprite = this.add.image(iconX, statusY, 'ship-status-icon');
            sprite.setDisplaySize(iconSize, iconSize);
            sprite.setTint(0xff8800);  // Orange

            // Red cross sprite (hidden initially)
            const crossSprite = this.add.graphics();
            crossSprite.lineStyle(2, 0xff0000, 1);
            crossSprite.beginPath();
            crossSprite.moveTo(iconX - iconSize * 0.35, statusY - iconSize * 0.35);
            crossSprite.lineTo(iconX + iconSize * 0.35, statusY + iconSize * 0.35);
            crossSprite.moveTo(iconX + iconSize * 0.35, statusY - iconSize * 0.35);
            crossSprite.lineTo(iconX - iconSize * 0.35, statusY + iconSize * 0.35);
            crossSprite.strokePath();
            crossSprite.setVisible(false);

            this.enemyShipStatusSprites.push({ sprite, crossSprite });
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
     * Week 6A: Updates sprite-based status bar with red X overlays on sunk ships.
     */
    updateShipStatus() {
        // Update player ship status sprites
        this.playerShipStatusSprites.forEach(({ sprite, crossSprite, ship }) => {
            if (ship.isSunk) {
                // Show red X over sunk ship (ship sprite remains visible)
                crossSprite.setVisible(true);
            } else {
                crossSprite.setVisible(false);
            }
        });

        // Update enemy ship status sprites
        const enemyShips = this.enemyFleet.getAllShips();
        const sunkEnemyShips = enemyShips.filter(s => s.isSunk);
        this.enemyShipStatusSprites.forEach(({ sprite, crossSprite }, index) => {
            if (index < sunkEnemyShips.length) {
                // Show red X over sunk ships
                crossSprite.setVisible(true);
            } else {
                crossSprite.setVisible(false);
            }
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
            GAME_OVER:   'GAME OVER',
            SONAR_MODE:  short ? 'SONAR' : 'SONAR PING - Select 3×3 zone',
            NUKE_MODE:   short ? 'NUKE' : 'ROW NUKE - Select target row'
        };

        const colors = {
            PLAYER_TURN: '#ffff00',
            ENEMY_TURN:  '#ff8800',
            GAME_OVER:   '#ff0000',
            SONAR_MODE:  '#00ffff',
            NUKE_MODE:   '#ff00ff'
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
            // Mark all segments of sunk ship
            attackResult.ship.segments.forEach(seg => {
                this.enemyCellStates[seg.row][seg.col] = CELL.SUNK;
                this.refreshEnemyCellByState(seg.row, seg.col, CELL.SUNK);
            });
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
        this.abilityButtons.sonarBtn.setFillStyle(0x00ffff); // Highlight active
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
        this.abilityButtons.sonarBtn.setFillStyle(0x2c3e50); // Reset button
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
        this.abilityButtons.nukeBtn.setFillStyle(0xff00ff); // Highlight active
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
        this.abilityButtons.nukeBtn.setFillStyle(0x2c3e50); // Reset button
        this.updateAbilityButtons();
        this.updateStatusDisplay('PLAYER_TURN');
        this.combatLocked = true;

        // Attack all 10 cells in the row
        let totalHits = 0;
        let totalSinks = 0;
        const attackedCells = [];

        for (let c = 0; c < 10; c++) {
            const attackResult = this.enemyFleet.receiveAttack(row, c);

            if (!attackResult.duplicate && attackResult.hit) {
                totalHits++;
                if (attackResult.sunk) totalSinks++;
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
                fill: '#ff00ff',
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
                cell.setFillStyle(CELL_COLORS.MISS, 0.7);
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
            const spriteKey = shipType.sprite;

            if (!this.textures.exists(spriteKey)) {
                console.warn(`Sprite not found: ${spriteKey}`);
                return;
            }

            // Calculate ship's center position
            const segments = ship.segments;
            const firstSeg = segments[0];
            const lastSeg = segments[segments.length - 1];

            let centerX, centerY, spriteWidth, spriteHeight;
            const cellSize = this.currentLayout.cellSize;

            if (orientation === 'horizontal') {
                // Horizontal ship: spans multiple columns
                centerX = this.currentLayout.playerX + ((firstSeg.col + lastSeg.col + 1) / 2) * cellSize;
                centerY = this.currentLayout.playerY + (firstSeg.row + 0.5) * cellSize;
                spriteWidth = ship.length * cellSize * 0.9;  // 90% of cell width
                spriteHeight = cellSize * 0.8;  // 80% of cell height
            } else {
                // Vertical ship: spans multiple rows
                centerX = this.currentLayout.playerX + (firstSeg.col + 0.5) * cellSize;
                centerY = this.currentLayout.playerY + ((firstSeg.row + lastSeg.row + 1) / 2) * cellSize;
                spriteWidth = cellSize * 0.8;  // 80% of cell width
                spriteHeight = ship.length * cellSize * 0.9;  // 90% of cell height
            }

            // Create sprite
            const sprite = this.add.image(centerX, centerY, spriteKey);

            // Set display size (not scale, to handle rotation properly)
            sprite.setDisplaySize(spriteWidth, spriteHeight);

            // Rotate if vertical
            if (orientation === 'vertical') {
                sprite.setAngle(90);
            }

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
            fill: '#ff00ff', // Magenta for special unlock
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 5,
            shadow: {
                offsetX: 0,
                offsetY: 0,
                color: '#ff00ff',
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

        const orientationChanged = this.currentLayout &&
            (this.currentLayout.width > this.currentLayout.height) !== (width > height);

        const stackChanged = this.currentLayout &&
            this.currentLayout.shouldStack !== newLayout.shouldStack;

        const cellSizeChanged = this.currentLayout &&
            Math.abs(this.currentLayout.cellSize - newLayout.cellSize) / this.currentLayout.cellSize > 0.15;

        if (orientationChanged || stackChanged || cellSizeChanged || !this.currentLayout) {
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
            const titleY = Math.min(70, height * 0.12);
            this.sceneTitle.setPosition(width / 2, titleY);
            this.sceneTitle.setFontSize(Math.min(width * 0.06, 42) + 'px');
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

        // Destroy and recreate ship status panel on resize (Week 6A: Sprite-based status bar)
        this.destroyShipStatusPanel();
        this.createShipStatusPanel();
        this.updateShipStatus();  // Restore sunk ship indicators

        // Reposition ability buttons based on new layout (Week 6A: Fixed grid overlap)
        if (this.abilityButtons) {
            let centerX, centerY;
            const gridWidth = GAME_CONSTANTS.GRID_SIZE * newLayout.cellSize;

            if (newLayout.shouldStack) {
                // Stacked layout: Position between grids vertically
                const playerBottom = newLayout.playerY + gridWidth + newLayout.labelSpace;
                const enemyTop = newLayout.enemyY - newLayout.titleH;
                centerX = width / 2;
                centerY = (playerBottom + enemyTop) / 2;
            } else {
                // Side-by-side: Center between grid edges
                const playerRight = newLayout.playerX + gridWidth;
                const enemyLeft = newLayout.enemyX;
                centerX = (playerRight + enemyLeft) / 2;
                centerY = newLayout.playerY + (gridWidth / 2);
            }

            const buttonHeight = 44;
            const spacing = 12;
            const sonarY = centerY - (buttonHeight / 2) - (spacing / 2);
            const nukeY = centerY + (buttonHeight / 2) + (spacing / 2);

            this.abilityButtons.sonarBtn.setPosition(centerX, sonarY);
            this.abilityButtons.sonarText.setPosition(centerX, sonarY);
            this.abilityButtons.nukeBtn.setPosition(centerX, nukeY);
            this.abilityButtons.nukeText.setPosition(centerX, nukeY);
        }

        // Week 6B: Reposition FIRE button (below Row Nuke)
        if (this.fireButton && this.abilityButtons) {
            let centerX, centerY;
            const gridWidth = GAME_CONSTANTS.GRID_SIZE * newLayout.cellSize;

            if (newLayout.shouldStack) {
                const playerBottom = newLayout.playerY + gridWidth + newLayout.labelSpace;
                const enemyTop = newLayout.enemyY - newLayout.titleH;
                centerX = width / 2;
                centerY = (playerBottom + enemyTop) / 2;
            } else {
                const playerRight = newLayout.playerX + gridWidth;
                const enemyLeft = newLayout.enemyX;
                centerX = (playerRight + enemyLeft) / 2;
                centerY = newLayout.playerY + (gridWidth / 2);
            }

            const buttonHeight = 50;
            const nukeY = this.abilityButtons.nukeBtn.y;
            const fireY = nukeY + (buttonHeight / 2) + 14;

            this.fireButton.button.setPosition(centerX, fireY);
            this.fireButton.text.setPosition(centerX, fireY);
        }

        this.currentLayout = newLayout;
    }
}
