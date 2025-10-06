/**
 * @fileoverview Fleet Manager - manages ship placement and fleet state.
 * @namespace FleetManager
 */

import { Ship } from '../models/Ship.js';
import { isValidPlacement } from '../utils/gridValidation.js';
import { GAME_CONSTANTS } from '../config/gameConfig.js';

/**
 * Manages a player's fleet and grid state
 * @class
 */
export class FleetManager {
    constructor() {
        const { GRID_SIZE } = GAME_CONSTANTS;
        
        // Initialize 10x10 grid (null = empty, Ship reference = occupied)
        this.grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
        
        // Array of Ship objects
        this.ships = [];
        
        // Track placement state
        this.allShipsPlaced = false;
    }

    /**
     * Add a ship to the fleet
     * @param {Ship} ship - Ship instance to add
     * @param {number} row - Starting row (0-9)
     * @param {number} col - Starting column (0-9)
     * @param {string} orientation - 'horizontal' or 'vertical'
     * @returns {object} { success: boolean, reason: string, ship: Ship }
     */
    placeShip(ship, row, col, orientation) {
        // Validate placement
        const validation = isValidPlacement(this.grid, row, col, ship.length, orientation);
        
        if (!validation.valid) {
            return { 
                success: false, 
                reason: validation.reason,
                ship: null
            };
        }

        // Place the ship
        ship.place(row, col, orientation);
        
        // Update grid - mark all cells occupied by this ship
        for (const segment of ship.segments) {
            this.grid[segment.row][segment.col] = ship;
        }
        
        // Add to ships array
        this.ships.push(ship);
        
        // Check if all ships are placed
        this.checkFleetComplete();
        
        return { 
            success: true, 
            reason: '',
            ship: ship
        };
    }

    /**
     * Remove a ship from the fleet
     * @param {Ship} ship - Ship to remove
     * @returns {boolean} Success status
     */
    removeShip(ship) {
        if (!ship.isPlaced) {
            return false;
        }

        // Clear grid cells
        for (const segment of ship.segments) {
            this.grid[segment.row][segment.col] = null;
        }

        // Unplace the ship
        ship.unplace();

        // Remove from ships array
        const index = this.ships.indexOf(ship);
        if (index > -1) {
            this.ships.splice(index, 1);
        }

        this.allShipsPlaced = false;
        
        return true;
    }

    /**
     * Get ship at specific coordinate
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @returns {Ship|null} Ship at coordinate or null
     */
    getShipAt(row, col) {
        if (row < 0 || row >= GAME_CONSTANTS.GRID_SIZE || 
            col < 0 || col >= GAME_CONSTANTS.GRID_SIZE) {
            return null;
        }
        return this.grid[row][col];
    }

    /**
     * Process an attack on this fleet
     * @param {number} row - Row to attack
     * @param {number} col - Column to attack
     * @returns {object} { hit: boolean, ship: Ship|null, sunk: boolean, duplicate: boolean }
     */
    receiveAttack(row, col) {
        const ship = this.getShipAt(row, col);
        
        if (!ship) {
            return { 
                hit: false, 
                ship: null, 
                sunk: false, 
                duplicate: false 
            };
        }

        // Check if this segment was already hit
        const segment = ship.segments.find(s => s.row === row && s.col === col);
        if (segment && segment.isHit) {
            return { 
                hit: true, 
                ship: ship, 
                sunk: ship.isSunk, 
                duplicate: true 
            };
        }

        // Register the hit
        const wasHit = ship.checkHit(row, col);
        
        return { 
            hit: wasHit, 
            ship: ship, 
            sunk: ship.isSunk, 
            duplicate: false 
        };
    }

    /**
     * Check if all ships in fleet are sunk
     * @returns {boolean} True if fleet is destroyed
     */
    isFleetDestroyed() {
        return this.ships.length > 0 && this.ships.every(ship => ship.isSunk);
    }

    /**
     * Check if fleet is complete (all 5 ships placed)
     */
    checkFleetComplete() {
        this.allShipsPlaced = this.ships.length === 5;
    }

    /**
     * Get all ships in the fleet
     * @returns {Array<Ship>} Array of ships
     */
    getAllShips() {
        return [...this.ships]; // Return copy to prevent external modification
    }

    /**
     * Get fleet statistics
     * @returns {object} Fleet stats
     */
    getFleetStats() {
        const totalShips = this.ships.length;
        const sunkShips = this.ships.filter(s => s.isSunk).length;
        const totalHits = this.ships.reduce((sum, ship) => sum + ship.hits, 0);
        const totalHealth = this.ships.reduce((sum, ship) => sum + ship.length, 0);
        
        return {
            totalShips,
            sunkShips,
            shipsRemaining: totalShips - sunkShips,
            totalHits,
            totalHealth,
            healthRemaining: totalHealth - totalHits,
            isDestroyed: this.isFleetDestroyed()
        };
    }

    /**
     * Clear all ships and reset grid
     */
    reset() {
        this.ships.forEach(ship => ship.unplace());
        this.ships = [];
        this.grid = Array(GAME_CONSTANTS.GRID_SIZE).fill(null)
            .map(() => Array(GAME_CONSTANTS.GRID_SIZE).fill(null));
        this.allShipsPlaced = false;
    }

    /**
     * Preview placement without actually placing
     * @param {number} row - Starting row
     * @param {number} col - Starting column
     * @param {number} length - Ship length
     * @param {string} orientation - 'horizontal' or 'vertical'
     * @returns {object} { valid: boolean, reason: string, cells: Array }
     */
    previewPlacement(row, col, length, orientation) {
        const validation = isValidPlacement(this.grid, row, col, length, orientation);
        
        const cells = [];
        if (validation.valid) {
            for (let i = 0; i < length; i++) {
                if (orientation === 'horizontal') {
                    cells.push({ row, col: col + i });
                } else {
                    cells.push({ row: row + i, col });
                }
            }
        }
        
        return {
            valid: validation.valid,
            reason: validation.reason,
            cells
        };
    }
}