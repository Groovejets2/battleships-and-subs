/**
 * @fileoverview Turn Manager - manages game turn state, scoring, and win/loss detection.
 * @namespace TurnManager
 */

/**
 * Ship sinking bonuses per ship type (per GAME_RULES.md)
 */
const SINK_BONUSES = {
    CARRIER:     100,
    NUCLEAR_SUB:  75,
    CRUISER:      75,
    ATTACK_SUB:   50,
    DESTROYER:    50
};

/**
 * Points per hit (non-sinking)
 */
const HIT_POINTS = 10;

/**
 * Manages turn order, score tracking, and game end detection.
 * @class
 */
export class TurnManager {
    constructor() {
        this.reset();
    }

    /**
     * Reset all state for a new game.
     */
    reset() {
        /** @type {'PLAYER'|'ENEMY'} */
        this.currentTurn = 'PLAYER';

        /** @type {boolean} */
        this.gameOver = false;

        /** @type {'PLAYER'|'ENEMY'|null} */
        this.winner = null;

        // Score components
        this.score = 0;
        this.totalShots = 0;
        this.totalHits = 0;

        // Turn counter (incremented when a miss ends a player round)
        this.turnsCount = 0;

        // Attack history (used for visual state tracking)
        /** @type {Array<{row: number, col: number, hit: boolean, sunk: boolean}>} */
        this.playerAttacks = [];

        /** @type {Array<{row: number, col: number, hit: boolean, sunk: boolean}>} */
        this.enemyAttacks = [];
    }

    /**
     * Process a player attack result.
     * @param {number} row
     * @param {number} col
     * @param {{hit: boolean, sunk: boolean, ship: Ship|null, duplicate: boolean}} result
     * @returns {{valid: boolean, bonusTurn: boolean}}
     */
    processPlayerAttack(row, col, result) {
        if (result.duplicate) {
            return { valid: false, bonusTurn: false };
        }

        this.playerAttacks.push({ row, col, hit: result.hit, sunk: result.sunk });
        this.totalShots++;

        if (result.hit) {
            this.totalHits++;
            this.score += HIT_POINTS;

            if (result.sunk && result.ship) {
                const bonus = SINK_BONUSES[result.ship.type] || 50;
                this.score += bonus;
                console.log(`TurnManager: Sank ${result.ship.name} for +${bonus} bonus`);
            }
        } else {
            // Miss ends the player's turn round
            this.turnsCount++;
        }

        return { valid: true, bonusTurn: result.hit };
    }

    /**
     * Process an AI attack result.
     * @param {number} row
     * @param {number} col
     * @param {{hit: boolean, sunk: boolean, ship: Ship|null}} result
     * @returns {{bonusTurn: boolean}}
     */
    processEnemyAttack(row, col, result) {
        this.enemyAttacks.push({ row, col, hit: result.hit, sunk: result.sunk });
        return { bonusTurn: result.hit };
    }

    /**
     * Check if the player has already attacked this square.
     * @param {number} row
     * @param {number} col
     * @returns {boolean}
     */
    isPlayerAlreadyAttacked(row, col) {
        return this.playerAttacks.some(a => a.row === row && a.col === col);
    }

    /**
     * Switch turn to the enemy.
     */
    switchToEnemy() {
        this.currentTurn = 'ENEMY';
    }

    /**
     * Switch turn to the player.
     */
    switchToPlayer() {
        this.currentTurn = 'PLAYER';
    }

    /**
     * Mark the game as over.
     * @param {'PLAYER'|'ENEMY'} winner
     */
    setGameOver(winner) {
        this.gameOver = true;
        this.winner = winner;
    }

    /**
     * Calculate and return final score breakdown.
     * Score formula per GAME_RULES.md:
     *   Total = Hit Points + Sunk Ship Bonuses + Accuracy Bonus + Efficiency Bonus
     *   Accuracy Bonus = (accuracy as decimal) × 50
     *   Efficiency: <30 turns +200, 30-50 +100, 50-70 +50, >70 +0
     * @returns {object} Final score breakdown
     */
    calculateFinalScore() {
        const accuracy = this.totalShots > 0
            ? (this.totalHits / this.totalShots) * 100
            : 0;

        const accuracyBonus = Math.round((accuracy / 100) * 50);

        let efficiencyBonus = 0;
        if (this.turnsCount < 30)       efficiencyBonus = 200;
        else if (this.turnsCount < 50)  efficiencyBonus = 100;
        else if (this.turnsCount < 70)  efficiencyBonus = 50;

        const finalScore = this.score + accuracyBonus + efficiencyBonus;

        return {
            total: finalScore,
            baseScore: this.score,
            accuracy: Math.round(accuracy),
            accuracyBonus,
            efficiencyBonus,
            turns: this.turnsCount,
            hits: this.totalHits,
            shots: this.totalShots
        };
    }

    /**
     * Get current game statistics (for real-time display).
     * @returns {object}
     */
    getStats() {
        const accuracy = this.totalShots > 0
            ? Math.round((this.totalHits / this.totalShots) * 100)
            : 0;

        return {
            score: this.score,
            turns: this.turnsCount,
            shots: this.totalShots,
            hits: this.totalHits,
            accuracy,
            currentTurn: this.currentTurn,
            gameOver: this.gameOver,
            winner: this.winner
        };
    }
}
