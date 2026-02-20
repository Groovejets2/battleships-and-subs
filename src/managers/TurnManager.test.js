/**
 * @fileoverview Unit tests for TurnManager - Week 5 addictiveness mechanics
 * Tests chain bonus, row nuke charges, and serialize/deserialize
 */

import { TurnManager } from './TurnManager.js';
import { Ship } from '../models/Ship.js';

console.log('=== TurnManager Week 5 Tests ===\n');

// Test 1: Chain Bonus Calculation
console.log('Test 1: Chain Bonus Calculation');
const tm1 = new TurnManager();

// No chain bonus for 0-2 hits
console.log('  0 hits - bonus:', tm1.getChainBonus(), 'multiplier:', tm1.getChainMultiplier());
console.assert(tm1.getChainBonus() === 0, 'Expected 0 bonus for 0 hits');
console.assert(tm1.getChainMultiplier() === 1, 'Expected 1x multiplier for 0 hits');

tm1.consecutiveHits = 2;
console.log('  2 hits - bonus:', tm1.getChainBonus(), 'multiplier:', tm1.getChainMultiplier());
console.assert(tm1.getChainBonus() === 0, 'Expected 0 bonus for 2 hits');
console.assert(tm1.getChainMultiplier() === 1, 'Expected 1x multiplier for 2 hits');

// 2x multiplier for 3-4 hits
tm1.consecutiveHits = 3;
console.log('  3 hits - bonus:', tm1.getChainBonus(), 'multiplier:', tm1.getChainMultiplier());
console.assert(tm1.getChainBonus() === 20, 'Expected 20 bonus for 3 hits (10 * 2)');
console.assert(tm1.getChainMultiplier() === 2, 'Expected 2x multiplier for 3 hits');

tm1.consecutiveHits = 4;
console.log('  4 hits - bonus:', tm1.getChainBonus(), 'multiplier:', tm1.getChainMultiplier());
console.assert(tm1.getChainBonus() === 20, 'Expected 20 bonus for 4 hits (10 * 2)');
console.assert(tm1.getChainMultiplier() === 2, 'Expected 2x multiplier for 4 hits');

// 3x multiplier for 5-6 hits
tm1.consecutiveHits = 5;
console.log('  5 hits - bonus:', tm1.getChainBonus(), 'multiplier:', tm1.getChainMultiplier());
console.assert(tm1.getChainBonus() === 30, 'Expected 30 bonus for 5 hits (10 * 3)');
console.assert(tm1.getChainMultiplier() === 3, 'Expected 3x multiplier for 5 hits');

tm1.consecutiveHits = 6;
console.log('  6 hits - bonus:', tm1.getChainBonus(), 'multiplier:', tm1.getChainMultiplier());
console.assert(tm1.getChainBonus() === 30, 'Expected 30 bonus for 6 hits (10 * 3)');
console.assert(tm1.getChainMultiplier() === 3, 'Expected 3x multiplier for 6 hits');

// 4x multiplier for 7+ hits
tm1.consecutiveHits = 7;
console.log('  7 hits - bonus:', tm1.getChainBonus(), 'multiplier:', tm1.getChainMultiplier());
console.assert(tm1.getChainBonus() === 40, 'Expected 40 bonus for 7 hits (10 * 4)');
console.assert(tm1.getChainMultiplier() === 4, 'Expected 4x multiplier for 7 hits');

tm1.consecutiveHits = 10;
console.log('  10 hits - bonus:', tm1.getChainBonus(), 'multiplier:', tm1.getChainMultiplier());
console.assert(tm1.getChainBonus() === 40, 'Expected 40 bonus for 10 hits (10 * 4)');
console.assert(tm1.getChainMultiplier() === 4, 'Expected 4x multiplier for 10 hits');

console.log('✅ Test 1 passed\n');

// Test 2: Row Nuke Charge Earning (2 consecutive sinks)
console.log('Test 2: Row Nuke Charge Earning');
const tm2 = new TurnManager();
const destroyer = new Ship('DESTROYER', 'Destroyer', 2, 0xaaaaaa);
const cruiser = new Ship('CRUISER', 'Cruiser', 3, 0xbbbbbb);

destroyer.place(0, 0, 'horizontal');
cruiser.place(2, 0, 'horizontal');

console.log('  Initial rowNukeCharges:', tm2.rowNukeCharges);
console.assert(tm2.rowNukeCharges === 0, 'Expected 0 initial charges');

// First sink
destroyer.checkHit(0, 0);
destroyer.checkHit(0, 1);
const result1 = tm2.processPlayerAttack(0, 1, { hit: true, sunk: true, ship: destroyer, duplicate: false });
console.log('  After 1st sink - charges:', tm2.rowNukeCharges, 'rowNukeEarned:', result1.rowNukeEarned);
console.assert(tm2.rowNukeCharges === 0, 'Expected 0 charges after 1 sink');
console.assert(result1.rowNukeEarned === false, 'Expected no charge earned yet');

// Second consecutive sink (should award charge)
cruiser.checkHit(2, 0);
cruiser.checkHit(2, 1);
cruiser.checkHit(2, 2);
const result2 = tm2.processPlayerAttack(2, 2, { hit: true, sunk: true, ship: cruiser, duplicate: false });
console.log('  After 2nd consecutive sink - charges:', tm2.rowNukeCharges, 'rowNukeEarned:', result2.rowNukeEarned);
console.assert(tm2.rowNukeCharges === 1, 'Expected 1 charge after 2 consecutive sinks');
console.assert(result2.rowNukeEarned === true, 'Expected charge earned on 2nd sink');

// Miss resets consecutive sink counter
const result3 = tm2.processPlayerAttack(5, 5, { hit: false, sunk: false, ship: null, duplicate: false });
console.log('  After miss - lastConsecutiveSinks:', tm2.lastConsecutiveSinks);
console.assert(tm2.lastConsecutiveSinks === 0, 'Expected consecutive sinks reset to 0 on miss');

console.log('✅ Test 2 passed\n');

// Test 3: Consecutive Hits Tracking
console.log('Test 3: Consecutive Hits Tracking');
const tm3 = new TurnManager();

// Hit increases consecutiveHits
const hit1 = tm3.processPlayerAttack(0, 0, { hit: true, sunk: false, ship: null, duplicate: false });
console.log('  After hit 1 - consecutiveHits:', tm3.consecutiveHits);
console.assert(tm3.consecutiveHits === 1, 'Expected 1 consecutive hit');

const hit2 = tm3.processPlayerAttack(0, 1, { hit: true, sunk: false, ship: null, duplicate: false });
console.log('  After hit 2 - consecutiveHits:', tm3.consecutiveHits);
console.assert(tm3.consecutiveHits === 2, 'Expected 2 consecutive hits');

const hit3 = tm3.processPlayerAttack(0, 2, { hit: true, sunk: false, ship: null, duplicate: false });
console.log('  After hit 3 - consecutiveHits:', tm3.consecutiveHits, 'chainBonus:', hit3.chainBonus);
console.assert(tm3.consecutiveHits === 3, 'Expected 3 consecutive hits');
console.assert(hit3.chainBonus === 20, 'Expected 20 bonus on 3rd hit');

// Miss resets consecutiveHits
const miss = tm3.processPlayerAttack(5, 5, { hit: false, sunk: false, ship: null, duplicate: false });
console.log('  After miss - consecutiveHits:', tm3.consecutiveHits);
console.assert(tm3.consecutiveHits === 0, 'Expected consecutive hits reset to 0 on miss');

console.log('✅ Test 3 passed\n');

// Test 4: Sonar Ping Availability
console.log('Test 4: Sonar Ping Availability');
const tm4 = new TurnManager();

console.log('  Initial sonarPingAvailable:', tm4.sonarPingAvailable);
console.assert(tm4.sonarPingAvailable === true, 'Expected sonar available initially');

tm4.sonarPingAvailable = false;
console.log('  After use - sonarPingAvailable:', tm4.sonarPingAvailable);
console.assert(tm4.sonarPingAvailable === false, 'Expected sonar unavailable after use');

console.log('✅ Test 4 passed\n');

// Test 5: Serialize/Deserialize
console.log('Test 5: Serialize/Deserialize');
const tm5 = new TurnManager();

// Setup complex state
tm5.currentTurn = 'ENEMY';
tm5.score = 350;
tm5.totalShots = 20;
tm5.totalHits = 12;
tm5.turnsCount = 5;
tm5.consecutiveHits = 4;
tm5.sonarPingAvailable = false;
tm5.rowNukeCharges = 2;
tm5.lastConsecutiveSinks = 1;
tm5.playerAttacks.push({ row: 0, col: 0, hit: true, sunk: false });
tm5.playerAttacks.push({ row: 0, col: 1, hit: false, sunk: false });
tm5.enemyAttacks.push({ row: 5, col: 5, hit: true, sunk: true });

const serialized = tm5.serialize();
console.log('  Serialized data:', JSON.stringify(serialized, null, 2));

const tm6 = new TurnManager();
tm6.deserialize(serialized);

console.log('  Deserialized state:');
console.log('    currentTurn:', tm6.currentTurn);
console.log('    score:', tm6.score);
console.log('    totalShots:', tm6.totalShots);
console.log('    totalHits:', tm6.totalHits);
console.log('    turnsCount:', tm6.turnsCount);
console.log('    consecutiveHits:', tm6.consecutiveHits);
console.log('    sonarPingAvailable:', tm6.sonarPingAvailable);
console.log('    rowNukeCharges:', tm6.rowNukeCharges);
console.log('    lastConsecutiveSinks:', tm6.lastConsecutiveSinks);
console.log('    playerAttacks:', tm6.playerAttacks);
console.log('    enemyAttacks:', tm6.enemyAttacks);

console.assert(tm6.currentTurn === 'ENEMY', 'Expected ENEMY turn');
console.assert(tm6.score === 350, 'Expected score 350');
console.assert(tm6.totalShots === 20, 'Expected 20 shots');
console.assert(tm6.totalHits === 12, 'Expected 12 hits');
console.assert(tm6.turnsCount === 5, 'Expected 5 turns');
console.assert(tm6.consecutiveHits === 4, 'Expected 4 consecutive hits');
console.assert(tm6.sonarPingAvailable === false, 'Expected sonar unavailable');
console.assert(tm6.rowNukeCharges === 2, 'Expected 2 nuke charges');
console.assert(tm6.lastConsecutiveSinks === 1, 'Expected 1 consecutive sink');
console.assert(tm6.playerAttacks.length === 2, 'Expected 2 player attacks');
console.assert(tm6.enemyAttacks.length === 1, 'Expected 1 enemy attack');

console.log('✅ Test 5 passed\n');

// Test 6: Backwards Compatibility (deserialize old save without Week 5 fields)
console.log('Test 6: Backwards Compatibility');
const oldSave = {
    currentTurn: 'PLAYER',
    gameOver: false,
    winner: null,
    score: 100,
    totalShots: 10,
    totalHits: 5,
    turnsCount: 2,
    playerAttacks: [],
    enemyAttacks: []
    // Missing: sonarPingAvailable, rowNukeCharges, consecutiveHits, lastConsecutiveSinks
};

const tm7 = new TurnManager();
tm7.deserialize(oldSave);

console.log('  Deserialized old save:');
console.log('    sonarPingAvailable:', tm7.sonarPingAvailable);
console.log('    rowNukeCharges:', tm7.rowNukeCharges);
console.log('    consecutiveHits:', tm7.consecutiveHits);
console.log('    lastConsecutiveSinks:', tm7.lastConsecutiveSinks);

console.assert(tm7.sonarPingAvailable === true, 'Expected sonar default to true');
console.assert(tm7.rowNukeCharges === 0, 'Expected nuke charges default to 0');
console.assert(tm7.consecutiveHits === 0, 'Expected consecutive hits default to 0');
console.assert(tm7.lastConsecutiveSinks === 0, 'Expected consecutive sinks default to 0');

console.log('✅ Test 6 passed\n');

console.log('=== All TurnManager Tests Passed ✅ ===');
