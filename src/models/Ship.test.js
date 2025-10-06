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