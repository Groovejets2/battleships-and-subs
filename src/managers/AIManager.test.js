/**
 * @fileoverview Unit tests for AIManager - Week 5 serialize/deserialize
 */

import { AIManager } from './AIManager.js';

console.log('=== AIManager Week 5 Tests ===\n');

// Test 1: Serialize/Deserialize
console.log('Test 1: Serialize/Deserialize');
const ai1 = new AIManager('HARD');

// Setup complex state
ai1.activeHits.push({ row: 2, col: 3 });
ai1.activeHits.push({ row: 2, col: 4 });
ai1.attackedSquares.push({ row: 0, col: 0 });
ai1.attackedSquares.push({ row: 1, col: 1 });
ai1.attackedSquares.push({ row: 2, col: 3 });
ai1.attackedSquares.push({ row: 2, col: 4 });

console.log('  Original state:');
console.log('    difficulty:', ai1.difficulty);
console.log('    activeHits:', ai1.activeHits);
console.log('    attackedSquares:', ai1.attackedSquares);

const serialized = ai1.serialize();
console.log('  Serialized:', JSON.stringify(serialized, null, 2));

const ai2 = new AIManager();
ai2.deserialize(serialized);

console.log('  Deserialized state:');
console.log('    difficulty:', ai2.difficulty);
console.log('    activeHits:', ai2.activeHits);
console.log('    attackedSquares:', ai2.attackedSquares);

console.assert(ai2.difficulty === 'HARD', 'Expected difficulty HARD');
console.assert(ai2.activeHits.length === 2, 'Expected 2 active hits');
console.assert(ai2.activeHits[0].row === 2 && ai2.activeHits[0].col === 3, 'Expected correct first hit');
console.assert(ai2.activeHits[1].row === 2 && ai2.activeHits[1].col === 4, 'Expected correct second hit');
console.assert(ai2.attackedSquares.length === 4, 'Expected 4 attacked squares');

console.log('✅ Test 1 passed\n');

// Test 2: Deep Copy (ensure arrays are not shared)
console.log('Test 2: Deep Copy Verification');
const ai3 = new AIManager('NORMAL');
ai3.activeHits.push({ row: 5, col: 5 });

const serialized2 = ai3.serialize();
const ai4 = new AIManager();
ai4.deserialize(serialized2);

// Modify original
ai3.activeHits.push({ row: 6, col: 6 });
ai3.attackedSquares.push({ row: 7, col: 7 });

console.log('  Original activeHits length:', ai3.activeHits.length);
console.log('  Deserialized activeHits length:', ai4.activeHits.length);
console.log('  Original attackedSquares length:', ai3.attackedSquares.length);
console.log('  Deserialized attackedSquares length:', ai4.attackedSquares.length);

console.assert(ai3.activeHits.length === 2, 'Expected original to have 2 hits');
console.assert(ai4.activeHits.length === 1, 'Expected deserialized to have 1 hit (not shared)');
console.assert(ai4.attackedSquares.length === 0, 'Expected deserialized to have 0 attacks (not shared)');

console.log('✅ Test 2 passed\n');

// Test 3: Empty State
console.log('Test 3: Empty State Serialize/Deserialize');
const ai5 = new AIManager('EASY');
const serialized3 = ai5.serialize();

console.log('  Empty state serialized:', JSON.stringify(serialized3, null, 2));

const ai6 = new AIManager();
ai6.deserialize(serialized3);

console.log('  Deserialized difficulty:', ai6.difficulty);
console.log('  Deserialized activeHits:', ai6.activeHits);
console.log('  Deserialized attackedSquares:', ai6.attackedSquares);

console.assert(ai6.difficulty === 'EASY', 'Expected difficulty EASY');
console.assert(ai6.activeHits.length === 0, 'Expected empty activeHits');
console.assert(ai6.attackedSquares.length === 0, 'Expected empty attackedSquares');

console.log('✅ Test 3 passed\n');

// Test 4: Difficulty Levels Preserved
console.log('Test 4: All Difficulty Levels');
const difficulties = ['EASY', 'NORMAL', 'HARD'];

difficulties.forEach(diff => {
    const ai = new AIManager(diff);
    const serialized = ai.serialize();
    const restored = new AIManager();
    restored.deserialize(serialized);

    console.log(`  ${diff} -> ${restored.difficulty}`);
    console.assert(restored.difficulty === diff, `Expected ${diff} to be preserved`);
});

console.log('✅ Test 4 passed\n');

console.log('=== All AIManager Tests Passed ✅ ===');
