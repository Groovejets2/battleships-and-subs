import { isValidPlacement, getAdjacentCells, getShipCells } from './gridValidation.js';

// Create empty 10x10 grid
const grid = Array(10).fill(null).map(() => Array(10).fill(null));

console.log('=== GRID VALIDATION TESTS ===');

// Test 1: Valid horizontal placement
let result = isValidPlacement(grid, 0, 0, 5, 'horizontal');
console.log('Test 1 - Valid horizontal at A1:', result);

// Test 2: Invalid - goes off grid
result = isValidPlacement(grid, 0, 8, 5, 'horizontal');
console.log('Test 2 - Off-grid horizontal:', result);

// Test 3: Valid vertical placement
result = isValidPlacement(grid, 0, 0, 5, 'vertical');
console.log('Test 3 - Valid vertical at A1:', result);

// Test 4: Invalid - goes off grid vertically
result = isValidPlacement(grid, 8, 0, 5, 'vertical');
console.log('Test 4 - Off-grid vertical:', result);

// Test 5: Place a ship and test adjacency
grid[0][0] = { name: 'Test Ship' }; // Occupy A1
result = isValidPlacement(grid, 0, 1, 3, 'horizontal');
console.log('Test 5 - Adjacent to existing ship (should fail):', result);

result = isValidPlacement(grid, 0, 2, 3, 'horizontal');
console.log('Test 6 - 2 squares away (should pass):', result);

// Test 7: Test diagonal adjacency
grid[2][2] = { name: 'Test Ship 2' }; // Occupy C3
result = isValidPlacement(grid, 1, 1, 3, 'horizontal');
console.log('Test 7 - Diagonal adjacency (should fail):', result);

result = isValidPlacement(grid, 4, 4, 3, 'horizontal');
console.log('Test 8 - Far from other ships (should pass):', result);

// Test 9: Show adjacent cells
const adjacent = getAdjacentCells(5, 5, 3, 'horizontal');
console.log('Test 9 - Adjacent cells for 3-unit horizontal ship at F6:', adjacent);

// Test 10: Show ship cells
const shipCells = getShipCells(5, 5, 3, 'vertical');
console.log('Test 10 - Ship cells for 3-unit vertical ship at F6:', shipCells);