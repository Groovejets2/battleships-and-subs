/**
 * @fileoverview Ship class representing a naval vessel in the game.
 * @namespace Ship
 */

/**
 * Represents a single ship in the fleet
 * @class
 */
export class Ship {
    /**
     * Creates a new ship instance
     * @param {string} type - Ship type identifier (e.g., 'CARRIER', 'DESTROYER')
     * @param {string} name - Display name of the ship
     * @param {number} length - Number of grid squares the ship occupies
     * @param {number} color - Hex color code for visual representation
     */
    constructor(type, name, length, color) {
        this.type = type;
        this.name = name;
        this.length = length;
        this.color = color;
        
        // Placement state
        this.isPlaced = false;
        this.orientation = 'horizontal'; // 'horizontal' or 'vertical'
        this.startRow = null;
        this.startCol = null;
        
        // Game state
        this.segments = []; // Will store {row, col, isHit: false} for each unit
        this.isSunk = false;
        this.hits = 0;
        
        // Special abilities (we'll use these later)
        this.abilities = this.getAbilities(type);
    }

    /**
     * Define special abilities based on ship type
     * @param {string} type - Ship type
     * @returns {object} Abilities configuration
     */
    getAbilities(type) {
        const abilities = {
            CARRIER: {},
            NUCLEAR_SUB: {
                dive: { available: true, used: false },
                torpedo: { available: true, used: false }
            },
            CRUISER: {
                depthCharge: { available: true, used: false }
            },
            ATTACK_SUB: {
                torpedo: { available: true, used: false },
                silentRunning: { available: true, used: false }
            },
            DESTROYER: {}
        };
        
        return abilities[type] || {};
    }

    /**
     * Place the ship on the grid
     * @param {number} row - Starting row (0-9)
     * @param {number} col - Starting column (0-9)
     * @param {string} orientation - 'horizontal' or 'vertical'
     */
    place(row, col, orientation) {
        this.startRow = row;
        this.startCol = col;
        this.orientation = orientation;
        this.isPlaced = true;
        
        // Generate segments
        this.segments = [];
        for (let i = 0; i < this.length; i++) {
            if (orientation === 'horizontal') {
                this.segments.push({
                    row: row,
                    col: col + i,
                    isHit: false
                });
            } else {
                this.segments.push({
                    row: row + i,
                    col: col,
                    isHit: false
                });
            }
        }
    }

    /**
     * Remove ship from grid (unplace)
     */
    unplace() {
        this.isPlaced = false;
        this.startRow = null;
        this.startCol = null;
        this.segments = [];
    }

    /**
     * Toggle ship orientation
     */
    toggleOrientation() {
        this.orientation = this.orientation === 'horizontal' ? 'vertical' : 'horizontal';
    }

    /**
     * Check if a coordinate hits this ship
     * @param {number} row - Row to check
     * @param {number} col - Column to check
     * @returns {boolean} True if hit
     */
    checkHit(row, col) {
        const segment = this.segments.find(s => s.row === row && s.col === col);
        if (segment && !segment.isHit) {
            segment.isHit = true;
            this.hits++;
            
            // Check if ship is sunk
            if (this.hits >= this.length) {
                this.isSunk = true;
            }
            
            return true;
        }
        return false;
    }

    /**
     * Get all coordinates occupied by this ship
     * @returns {Array} Array of {row, col} objects
     */
    getOccupiedCoordinates() {
        return this.segments.map(s => ({ row: s.row, col: s.col }));
    }

    /**
     * Check if ship occupies a specific coordinate
     * @param {number} row - Row to check
     * @param {number} col - Column to check
     * @returns {boolean} True if ship is at this coordinate
     */
    occupiesCoordinate(row, col) {
        return this.segments.some(s => s.row === row && s.col === col);
    }
}