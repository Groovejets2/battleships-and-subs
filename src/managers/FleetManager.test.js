import { FleetManager } from './FleetManager.js';
import { Ship } from '../models/Ship.js';

console.log('=== FLEET MANAGER TESTS ===');

const fleetManager = new FleetManager();

// Test 1: Create and place a carrier
const carrier = new Ship('CARRIER', 'Carrier', 5, 0x808080);

let result = fleetManager.placeShip(carrier, 0, 0, 'horizontal');
console.log('Test 1 - Place carrier at A1:', result.success ? 'SUCCESS' : 'FAILED - ' + result.reason);

// Test 2: Try to place overlapping ship
const destroyer = new Ship('DESTROYER', 'Destroyer', 2, 0x606060);

result = fleetManager.placeShip(destroyer, 0, 2, 'horizontal');
console.log('Test 2 - Place destroyer overlapping carrier:', result.success ? 'FAILED - should not succeed' : 'SUCCESS - rejected: ' + result.reason);

// Test 3: Place ship with proper spacing
result = fleetManager.placeShip(destroyer, 2, 0, 'horizontal');
console.log('Test 3 - Place destroyer at C1 (2 rows away):', result.success ? 'SUCCESS' : 'FAILED - ' + result.reason);

// Test 4: Get ship at coordinate
const shipAtA1 = fleetManager.getShipAt(0, 0);
console.log('Test 4 - Get ship at A1:', shipAtA1 ? shipAtA1.name : 'No ship found');

// Test 5: Receive attack (hit)
const attackResult = fleetManager.receiveAttack(0, 0);
console.log('Test 5 - Attack A1 (should hit carrier):', attackResult);

// Test 6: Duplicate attack
const duplicateAttack = fleetManager.receiveAttack(0, 0);
console.log('Test 6 - Attack A1 again (duplicate):', duplicateAttack);

// Test 7: Miss
const missResult = fleetManager.receiveAttack(5, 5);
console.log('Test 7 - Attack F6 (should miss):', missResult);

// Test 8: Fleet stats
console.log('Test 8 - Fleet stats:', fleetManager.getFleetStats());

// Test 9: Preview placement
const preview = fleetManager.previewPlacement(4, 0, 3, 'vertical');
console.log('Test 9 - Preview 3-unit vertical at E1:', preview);

// Test 10: Remove ship
const removed = fleetManager.removeShip(destroyer);
console.log('Test 10 - Remove destroyer:', removed ? 'SUCCESS' : 'FAILED');
console.log('Test 10b - Ships remaining:', fleetManager.ships.length);

// Test 11: Serialize/Deserialize (Week 5)
console.log('\n=== Week 5: Serialize/Deserialize Tests ===');
const fm1 = new FleetManager();

// Place some ships
const ship1 = new Ship('CARRIER', 'Carrier', 5, 0x111111);
const ship2 = new Ship('CRUISER', 'Cruiser', 3, 0x222222);
fm1.placeShip(ship1, 0, 0, 'horizontal');
fm1.placeShip(ship2, 3, 3, 'vertical');

// Attack some squares
fm1.receiveAttack(0, 0); // Hit carrier
fm1.receiveAttack(0, 1); // Hit carrier
fm1.receiveAttack(5, 5); // Miss
fm1.receiveAttack(3, 3); // Hit cruiser

console.log('Original FleetManager state:');
console.log('  Ships:', fm1.ships.length);
console.log('  Grid occupied cells:', fm1.grid.filter(row => row.some(cell => cell !== null)).length);

const serialized = fm1.serialize();
console.log('  Serialized:', JSON.stringify(serialized, null, 2));

const fm2 = new FleetManager();
fm2.deserialize(serialized);

console.log('Restored FleetManager state:');
console.log('  Ships:', fm2.ships.length);
console.log('  Ship 1:', fm2.ships[0].name, 'at', fm2.ships[0].startRow + ',' + fm2.ships[0].startCol, fm2.ships[0].orientation);
console.log('  Ship 1 hits:', fm2.ships[0].segments.filter(s => s.hit).length);
console.log('  Ship 2:', fm2.ships[1].name, 'at', fm2.ships[1].startRow + ',' + fm2.ships[1].startCol, fm2.ships[1].orientation);
console.log('  Ship 2 hits:', fm2.ships[1].segments.filter(s => s.hit).length);

console.assert(fm2.ships.length === 2, 'Should have 2 ships');
console.assert(fm2.ships[0].name === 'Carrier', 'First ship should be Carrier');
console.assert(fm2.ships[1].name === 'Cruiser', 'Second ship should be Cruiser');
console.assert(fm2.ships[0].segments.filter(s => s.hit).length === 2, 'Carrier should have 2 hits');
console.assert(fm2.ships[1].segments.filter(s => s.hit).length === 1, 'Cruiser should have 1 hit');

// Test grid reconstruction
const gridShip1 = fm2.getShipAt(0, 0);
const gridShip2 = fm2.getShipAt(3, 3);
console.assert(gridShip1 !== null, 'Grid should have ship at (0,0)');
console.assert(gridShip2 !== null, 'Grid should have ship at (3,3)');
console.assert(gridShip1.name === 'Carrier', 'Ship at (0,0) should be Carrier');
console.assert(gridShip2.name === 'Cruiser', 'Ship at (3,3) should be Cruiser');

// Test duplicate attack detection still works
const dupAttack = fm2.receiveAttack(0, 0);
console.log('  Duplicate attack test:', dupAttack);
console.assert(dupAttack.duplicate === true, 'Should detect duplicate attack');

console.log('✅ All FleetManager serialize/deserialize tests passed');