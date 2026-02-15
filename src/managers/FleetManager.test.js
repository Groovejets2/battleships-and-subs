import { FleetManager } from './FleetManager.js';
import { Ship } from '../models/Ship.js';
import { SHIP_TYPES } from '../config/gameConfig.js';

console.log('=== FLEET MANAGER TESTS ===');

const fleetManager = new FleetManager();

// Test 1: Create and place a carrier
const carrier = new Ship(
    SHIP_TYPES.CARRIER.type,
    SHIP_TYPES.CARRIER.name,
    SHIP_TYPES.CARRIER.length,
    SHIP_TYPES.CARRIER.color
);

let result = fleetManager.placeShip(carrier, 0, 0, 'horizontal');
console.log('Test 1 - Place carrier at A1:', result.success ? 'SUCCESS' : 'FAILED - ' + result.reason);

// Test 2: Try to place overlapping ship
const destroyer = new Ship(
    SHIP_TYPES.DESTROYER.type,
    SHIP_TYPES.DESTROYER.name,
    SHIP_TYPES.DESTROYER.length,
    SHIP_TYPES.DESTROYER.color
);

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