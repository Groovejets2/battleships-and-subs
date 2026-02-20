/**
 * @fileoverview AI Manager - handles AI fleet placement and targeting logic.
 * Supports Easy, Normal, and Hard difficulty levels.
 * @namespace AIManager
 */

import { Ship } from '../models/Ship.js';
import { getShipPlacementOrder } from '../config/gameConfig.js';

/**
 * Manages AI opponent targeting and fleet placement
 * @class
 */
export class AIManager {
    /**
     * @param {string} difficulty - 'EASY', 'NORMAL', or 'HARD'
     */
    constructor(difficulty = 'NORMAL') {
        this.difficulty = difficulty;

        // Track current hits on player ships (cleared when ship sinks)
        this.activeHits = [];

        // Track all AI attacks (for duplicate prevention)
        this.attackedSquares = [];
    }

    /**
     * Place all AI ships randomly using valid placement rules.
     * @param {FleetManager} fleetManager - The AI's fleet manager
     * @returns {boolean} True if all ships placed successfully
     */
    placeFleet(fleetManager) {
        const shipTypes = getShipPlacementOrder();
        const MAX_ATTEMPTS = 200;

        for (const shipType of shipTypes) {
            const ship = new Ship(shipType.type, shipType.name, shipType.length, shipType.color);
            let placed = false;
            let attempts = 0;

            while (!placed && attempts < MAX_ATTEMPTS) {
                const row = Math.floor(Math.random() * 10);
                const col = Math.floor(Math.random() * 10);
                const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
                const result = fleetManager.placeShip(ship, row, col, orientation);
                placed = result.success;
                attempts++;
            }

            if (!placed) {
                console.error(`AIManager: Failed to place ${shipType.name} after ${MAX_ATTEMPTS} attempts`);
                return false;
            }
        }

        console.log('AIManager: Fleet placed successfully');
        return true;
    }

    /**
     * Select the next attack target based on difficulty.
     * @returns {{row: number, col: number}} Target coordinates
     */
    selectTarget() {
        switch (this.difficulty) {
            case 'EASY':   return this.selectEasyTarget();
            case 'NORMAL': return this.selectNormalTarget();
            case 'HARD':   return this.selectHardTarget();
            default:       return this.selectNormalTarget();
        }
    }

    /**
     * Easy: Completely random targeting (no strategy).
     * @returns {{row: number, col: number}}
     */
    selectEasyTarget() {
        const available = this.getAvailableSquares();
        return available[Math.floor(Math.random() * available.length)];
    }

    /**
     * Normal: Checkerboard pattern for search, then adjacent squares after a hit.
     * @returns {{row: number, col: number}}
     */
    selectNormalTarget() {
        // If we have active hits (unhit ship), follow up with adjacent squares
        if (this.activeHits.length > 0) {
            const adjacent = this.getAdjacentUnattacked(this.activeHits);
            if (adjacent.length > 0) {
                return adjacent[Math.floor(Math.random() * adjacent.length)];
            }
        }

        // Checkerboard: attack squares where (row + col) is even for efficient coverage
        const available = this.getAvailableSquares();
        const checkerboard = available.filter(sq => (sq.row + sq.col) % 2 === 0);

        if (checkerboard.length > 0) {
            return checkerboard[Math.floor(Math.random() * checkerboard.length)];
        }

        // Fallback to any available square
        return available[Math.floor(Math.random() * available.length)];
    }

    /**
     * Hard: Probability density + directional tracking after 2+ hits in a line.
     * @returns {{row: number, col: number}}
     */
    selectHardTarget() {
        if (this.activeHits.length >= 2) {
            // Try directional continuation (follow line of hits)
            const directed = this.getDirectedTarget();
            if (directed) return directed;
        }

        if (this.activeHits.length > 0) {
            const adjacent = this.getAdjacentUnattacked(this.activeHits);
            if (adjacent.length > 0) {
                return adjacent[Math.floor(Math.random() * adjacent.length)];
            }
        }

        // Probability density: checkerboard with center bias
        const available = this.getAvailableSquares();
        const scored = available.map(sq => {
            let score = 1;
            if ((sq.row + sq.col) % 2 === 0) score += 2;
            // Slight center bias
            score += (5 - Math.abs(sq.row - 4.5)) * 0.15;
            score += (5 - Math.abs(sq.col - 4.5)) * 0.15;
            return { ...sq, score };
        });

        scored.sort((a, b) => b.score - a.score);
        // Pick from top candidates to keep some randomness
        const topCount = Math.min(4, scored.length);
        const top = scored.slice(0, topCount);
        return top[Math.floor(Math.random() * top.length)];
    }

    /**
     * Register a hit to track for follow-up targeting.
     * @param {number} row
     * @param {number} col
     */
    registerHit(row, col) {
        this.activeHits.push({ row, col });
    }

    /**
     * Call when a ship sinks - clears active hit tracking.
     */
    registerSink() {
        this.activeHits = [];
    }

    /**
     * Register an AI attack (for duplicate prevention).
     * @param {number} row
     * @param {number} col
     */
    registerAttack(row, col) {
        this.attackedSquares.push({ row, col });
    }

    /**
     * Get all squares not yet attacked by AI.
     * @returns {Array<{row, col}>}
     */
    getAvailableSquares() {
        const available = [];
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                if (!this.attackedSquares.some(s => s.row === row && s.col === col)) {
                    available.push({ row, col });
                }
            }
        }
        return available;
    }

    /**
     * Get unattacked squares adjacent to all active hit squares.
     * @param {Array<{row, col}>} hitSquares
     * @returns {Array<{row, col}>}
     */
    getAdjacentUnattacked(hitSquares) {
        const seen = new Set();
        const result = [];
        const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

        for (const hit of hitSquares) {
            for (const [dr, dc] of dirs) {
                const nr = hit.row + dr;
                const nc = hit.col + dc;

                if (nr < 0 || nr >= 10 || nc < 0 || nc >= 10) continue;
                if (this.attackedSquares.some(s => s.row === nr && s.col === nc)) continue;

                const key = `${nr},${nc}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    result.push({ row: nr, col: nc });
                }
            }
        }

        return result;
    }

    /**
     * When 2+ hits are in a line, try to extend in that direction.
     * @returns {{row, col}|null}
     */
    getDirectedTarget() {
        if (this.activeHits.length < 2) return null;

        const sorted = [...this.activeHits].sort((a, b) => a.row - b.row || a.col - b.col);
        const first = sorted[0];
        const last = sorted[sorted.length - 1];

        const allSameRow = sorted.every(h => h.row === first.row);
        const allSameCol = sorted.every(h => h.col === first.col);

        let candidates = [];

        if (allSameRow) {
            // Horizontal line - extend left and right
            candidates = [
                { row: first.row, col: first.col - 1 },
                { row: last.row, col: last.col + 1 }
            ];
        } else if (allSameCol) {
            // Vertical line - extend up and down
            candidates = [
                { row: first.row - 1, col: first.col },
                { row: last.row + 1, col: last.col }
            ];
        }

        const valid = candidates.filter(c =>
            c.row >= 0 && c.row < 10 &&
            c.col >= 0 && c.col < 10 &&
            !this.attackedSquares.some(s => s.row === c.row && s.col === c.col)
        );

        if (valid.length > 0) {
            return valid[Math.floor(Math.random() * valid.length)];
        }

        return null;
    }

    /**
     * Reset AI state for a new game.
     */
    reset() {
        this.activeHits = [];
        this.attackedSquares = [];
    }

    /**
     * Serialize AI manager state to plain object for save/load
     * @returns {object} Serialized AI manager state
     */
    serialize() {
        return {
            difficulty: this.difficulty,
            activeHits: this.activeHits.map(h => ({ ...h })),       // Deep copy
            attackedSquares: this.attackedSquares.map(s => ({ ...s })) // Deep copy
        };
    }

    /**
     * Restore AI manager state from serialized object
     * @param {object} data - Serialized AI manager state
     */
    deserialize(data) {
        this.difficulty = data.difficulty;
        this.activeHits = data.activeHits.map(h => ({ ...h }));       // Deep copy
        this.attackedSquares = data.attackedSquares.map(s => ({ ...s })); // Deep copy
    }
}
