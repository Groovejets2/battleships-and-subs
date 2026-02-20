import { Ship } from './Ship.js';

// Test ship creation
const carrier = new Ship('CARRIER', 'Carrier', 5, 0x808080);
console.log('Created carrier:', carrier);

// Test placement
carrier.place(0, 0, 'horizontal');
console.log('Placed carrier horizontally at A1:', carrier.segments);

// Test orientation toggle
carrier.unplace();
carrier.toggleOrientation();
carrier.place(0, 0, 'vertical');
console.log('Placed carrier vertically at A1:', carrier.segments);

// Test hit detection
const hitResult = carrier.checkHit(0, 0);
console.log('Hit at A1:', hitResult, 'Ship sunk?', carrier.isSunk);

// Hit all segments
for (let i = 1; i < 5; i++) {
    carrier.checkHit(i, 0);
}
console.log('After 5 hits - Ship sunk?', carrier.isSunk);

// Test serialize/deserialize (Week 5)
console.log('\n=== Week 5: Serialize/Deserialize Tests ===');
const testShip = new Ship('CRUISER', 'Cruiser', 3, 0xcccccc);
testShip.place(5, 5, 'horizontal');
testShip.checkHit(5, 5); // Hit first segment
testShip.checkHit(5, 6); // Hit second segment

console.log('Original ship state:', {
    type: testShip.type,
    name: testShip.name,
    length: testShip.length,
    color: testShip.color,
    isPlaced: testShip.isPlaced,
    orientation: testShip.orientation,
    startRow: testShip.startRow,
    startCol: testShip.startCol,
    isSunk: testShip.isSunk,
    segments: testShip.segments
});

const serialized = testShip.serialize();
console.log('Serialized:', JSON.stringify(serialized, null, 2));

const restoredShip = new Ship(serialized.type, serialized.name, serialized.length, serialized.color);
restoredShip.deserialize(serialized);
console.log('Restored ship state:', {
    type: restoredShip.type,
    name: restoredShip.name,
    length: restoredShip.length,
    color: restoredShip.color,
    isPlaced: restoredShip.isPlaced,
    orientation: restoredShip.orientation,
    startRow: restoredShip.startRow,
    startCol: restoredShip.startCol,
    isSunk: restoredShip.isSunk,
    segments: restoredShip.segments
});

console.assert(restoredShip.type === testShip.type, 'Type should match');
console.assert(restoredShip.name === testShip.name, 'Name should match');
console.assert(restoredShip.length === testShip.length, 'Length should match');
console.assert(restoredShip.color === testShip.color, 'Color should match');
console.assert(restoredShip.isPlaced === testShip.isPlaced, 'isPlaced should match');
console.assert(restoredShip.orientation === testShip.orientation, 'Orientation should match');
console.assert(restoredShip.startRow === testShip.startRow, 'startRow should match');
console.assert(restoredShip.startCol === testShip.startCol, 'startCol should match');
console.assert(restoredShip.isSunk === testShip.isSunk, 'isSunk should match');
console.assert(restoredShip.segments.length === testShip.segments.length, 'Segments length should match');
console.assert(restoredShip.segments[0].isHit === true, 'First segment should be hit');
console.assert(restoredShip.segments[1].isHit === true, 'Second segment should be hit');
console.assert(restoredShip.segments[2].isHit === false, 'Third segment should not be hit');

console.log('✅ All Ship serialize/deserialize tests passed');