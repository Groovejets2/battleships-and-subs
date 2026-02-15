/**
 * @fileoverview Grid validation utilities for ship placement.
 * Enforces adjacency rules and boundary constraints.
 * @namespace GridValidation
 */

import { GAME_CONSTANTS } from '../config/gameConfig.js';

/**
 * Check if a ship placement is valid on the grid
 * @param {Array<Array>} grid - 10x10 grid (null = empty, Ship object = occupied)
 * @param {number} row - Starting row (0-9)
 * @param {number} col - Starting column (0-9)
 * @param {number} length - Ship length
 * @param {string} orientation - 'horizontal' or 'vertical'
 * @returns {object} { valid: boolean, reason: string }
 */
export function isValidPlacement(grid, row, col, length, orientation) {
    const { GRID_SIZE } = GAME_CONSTANTS;

    // 1. Boundary check - ship must fit within grid
    if (orientation === 'horizontal') {
        if (col + length > GRID_SIZE) {
            return { valid: false, reason: 'Ship extends beyond grid boundary' };
        }
    } else {
        if (row + length > GRID_SIZE) {
            return { valid: false, reason: 'Ship extends beyond grid boundary' };
        }
    }

    // 2. Get all coordinates this ship would occupy
    const shipCoordinates = [];
    for (let i = 0; i < length; i++) {
        const r = orientation === 'horizontal' ? row : row + i;
        const c = orientation === 'horizontal' ? col + i : col;
        shipCoordinates.push({ row: r, col: c });
    }

    // 3. Check for overlap with existing ships
    for (const coord of shipCoordinates) {
        if (grid[coord.row][coord.col] !== null) {
            return { valid: false, reason: 'Ship overlaps with another ship' };
        }
    }

    // 4. Check adjacency rule - no ships within 1 square (including diagonals)
    const adjacentCells = getAdjacentCells(row, col, length, orientation);
    
    for (const cell of adjacentCells) {
        // Skip if cell is outside grid
        if (cell.row < 0 || cell.row >= GRID_SIZE || cell.col < 0 || cell.col >= GRID_SIZE) {
            continue;
        }
        
        // Check if any adjacent cell is occupied
        if (grid[cell.row][cell.col] !== null) {
            return { valid: false, reason: 'Ship too close to another ship (minimum 1 square spacing required)' };
        }
    }

    return { valid: true, reason: '' };
}

/**
 * Get all cells adjacent to a ship placement (including diagonals)
 * This creates the "buffer zone" around ships
 * @param {number} row - Starting row
 * @param {number} col - Starting column
 * @param {number} length - Ship length
 * @param {string} orientation - 'horizontal' or 'vertical'
 * @returns {Array<{row, col}>} Array of adjacent cell coordinates
 */
export function getAdjacentCells(row, col, length, orientation) {
    const adjacent = [];
    
    if (orientation === 'horizontal') {
        // Ship occupies: (row, col) to (row, col + length - 1)
        
        // Cells above the ship
        for (let c = col - 1; c <= col + length; c++) {
            adjacent.push({ row: row - 1, col: c });
        }
        
        // Cells below the ship
        for (let c = col - 1; c <= col + length; c++) {
            adjacent.push({ row: row + 1, col: c });
        }
        
        // Cells to the left and right
        adjacent.push({ row: row, col: col - 1 });
        adjacent.push({ row: row, col: col + length });
        
    } else {
        // Ship occupies: (row, col) to (row + length - 1, col)
        
        // Cells to the left of the ship
        for (let r = row - 1; r <= row + length; r++) {
            adjacent.push({ row: r, col: col - 1 });
        }
        
        // Cells to the right of the ship
        for (let r = row - 1; r <= row + length; r++) {
            adjacent.push({ row: r, col: col + 1 });
        }
        
        // Cells above and below
        adjacent.push({ row: row - 1, col: col });
        adjacent.push({ row: row + length, col: col });
    }
    
    return adjacent;
}

/**
 * Get all cells that would show placement preview
 * (the ship cells themselves, not the buffer zone)
 * @param {number} row - Starting row
 * @param {number} col - Starting column
 * @param {number} length - Ship length
 * @param {string} orientation - 'horizontal' or 'vertical'
 * @returns {Array<{row, col}>} Array of ship cell coordinates
 */
export function getShipCells(row, col, length, orientation) {
    const cells = [];
    
    for (let i = 0; i < length; i++) {
        if (orientation === 'horizontal') {
            cells.push({ row: row, col: col + i });
        } else {
            cells.push({ row: row + i, col: col });
        }
    }
    
    return cells;
}

/**
 * Convert grid coordinates to coordinate string (e.g., A1, J10)
 * @param {number} row - Row index (0-9)
 * @param {number} col - Column index (0-9)
 * @returns {string} Coordinate string
 */
export function coordToString(row, col) {
    return String.fromCharCode(65 + col) + (row + 1);
}

/**
 * Convert coordinate string to grid indices
 * @param {string} coord - Coordinate string (e.g., 'A1', 'J10')
 * @returns {{row: number, col: number}} Grid indices
 */
export function stringToCoord(coord) {
    const col = coord.charCodeAt(0) - 65; // A=0, B=1, etc.
    const row = parseInt(coord.substring(1)) - 1; // 1=0, 2=1, etc.
    return { row, col };
}

/**
 * Check if coordinates are within grid bounds
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @returns {boolean} True if within bounds
 */
export function isWithinBounds(row, col) {
    const { GRID_SIZE } = GAME_CONSTANTS;
    return row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE;
}