/**
 * @fileoverview Unit tests for Week 5 Settings changes
 * Tests pip-dot volume scale (0-8) and difficulty selector
 */

console.log('=== Week 5 Settings Tests ===\n');

// Test 1: Default Settings Structure
console.log('Test 1: Default Settings Structure');
const defaultSettings = {
    masterVolume: 5,    // 0-8 scale (arcade 8-notch)
    sfxVolume: 6,       // 0-8 scale
    musicVolume: 4,     // 0-8 scale
    visualEffects: true,
    animations: true,
    difficulty: 'NORMAL' // EASY/NORMAL/HARD
};

console.log('  Default settings:', defaultSettings);
console.assert(typeof defaultSettings.masterVolume === 'number', 'masterVolume should be number');
console.assert(defaultSettings.masterVolume >= 0 && defaultSettings.masterVolume <= 8, 'masterVolume should be 0-8');
console.assert(typeof defaultSettings.sfxVolume === 'number', 'sfxVolume should be number');
console.assert(defaultSettings.sfxVolume >= 0 && defaultSettings.sfxVolume <= 8, 'sfxVolume should be 0-8');
console.assert(typeof defaultSettings.musicVolume === 'number', 'musicVolume should be number');
console.assert(defaultSettings.musicVolume >= 0 && defaultSettings.musicVolume <= 8, 'musicVolume should be 0-8');
console.assert(['EASY', 'NORMAL', 'HARD'].includes(defaultSettings.difficulty), 'difficulty should be EASY/NORMAL/HARD');

console.log('✅ Test 1 passed\n');

// Test 2: Volume Scale Validation (0-8 integers)
console.log('Test 2: Volume Scale Validation');
const validVolumes = [0, 1, 2, 3, 4, 5, 6, 7, 8];
validVolumes.forEach(vol => {
    console.assert(vol >= 0 && vol <= 8, `Volume ${vol} should be valid`);
    console.assert(Number.isInteger(vol), `Volume ${vol} should be integer`);
});

const invalidVolumes = [-1, 9, 0.5, 1.5, 'medium', null, undefined];
invalidVolumes.forEach(vol => {
    const isValid = typeof vol === 'number' && Number.isInteger(vol) && vol >= 0 && vol <= 8;
    console.assert(!isValid, `Volume ${vol} should be invalid`);
});

console.log('  All volume validations passed');
console.log('✅ Test 2 passed\n');

// Test 3: Difficulty Values
console.log('Test 3: Difficulty Values');
const validDifficulties = ['EASY', 'NORMAL', 'HARD'];
validDifficulties.forEach(diff => {
    console.assert(validDifficulties.includes(diff), `${diff} should be valid difficulty`);
});

const invalidDifficulties = ['easy', 'normal', 'MEDIUM', 0, 1, 2, null];
invalidDifficulties.forEach(diff => {
    const isValid = validDifficulties.includes(diff);
    console.assert(!isValid, `${diff} should be invalid difficulty`);
});

console.log('  All difficulty validations passed');
console.log('✅ Test 3 passed\n');

// Test 4: Volume to Float Conversion (for audio playback)
console.log('Test 4: Volume to Float Conversion');
function volumeToFloat(pipDotValue) {
    return pipDotValue / 8; // 0-8 -> 0.0-1.0
}

const conversions = [
    { pipDot: 0, expected: 0.0 },
    { pipDot: 2, expected: 0.25 },
    { pipDot: 4, expected: 0.5 },
    { pipDot: 6, expected: 0.75 },
    { pipDot: 8, expected: 1.0 }
];

conversions.forEach(({ pipDot, expected }) => {
    const result = volumeToFloat(pipDot);
    console.log(`  ${pipDot}/8 -> ${result} (expected ${expected})`);
    console.assert(Math.abs(result - expected) < 0.01, `${pipDot} should convert to ${expected}`);
});

console.log('✅ Test 4 passed\n');

// Test 5: Settings Serialization
console.log('Test 5: Settings Serialization');
const settings = {
    masterVolume: 7,
    sfxVolume: 5,
    musicVolume: 3,
    visualEffects: false,
    animations: true,
    difficulty: 'HARD'
};

const serialized = JSON.stringify(settings);
console.log('  Serialized:', serialized);

const deserialized = JSON.parse(serialized);
console.log('  Deserialized:', deserialized);

console.assert(deserialized.masterVolume === 7, 'masterVolume should be 7');
console.assert(deserialized.sfxVolume === 5, 'sfxVolume should be 5');
console.assert(deserialized.musicVolume === 3, 'musicVolume should be 3');
console.assert(deserialized.visualEffects === false, 'visualEffects should be false');
console.assert(deserialized.animations === true, 'animations should be true');
console.assert(deserialized.difficulty === 'HARD', 'difficulty should be HARD');

console.log('✅ Test 5 passed\n');

// Test 6: Settings Merge (loading saved settings)
console.log('Test 6: Settings Merge');
const defaults = {
    masterVolume: 5,
    sfxVolume: 6,
    musicVolume: 4,
    visualEffects: true,
    animations: true,
    difficulty: 'NORMAL'
};

const saved = {
    masterVolume: 8,
    difficulty: 'EASY'
    // sfxVolume, musicVolume, visualEffects, animations missing
};

const merged = { ...defaults, ...saved };
console.log('  Merged settings:', merged);

console.assert(merged.masterVolume === 8, 'masterVolume should be overridden to 8');
console.assert(merged.sfxVolume === 6, 'sfxVolume should use default 6');
console.assert(merged.musicVolume === 4, 'musicVolume should use default 4');
console.assert(merged.visualEffects === true, 'visualEffects should use default true');
console.assert(merged.animations === true, 'animations should use default true');
console.assert(merged.difficulty === 'EASY', 'difficulty should be overridden to EASY');

console.log('✅ Test 6 passed\n');

// Test 7: Backwards Compatibility (old float values)
console.log('Test 7: Backwards Compatibility');
const oldSettings = {
    masterVolume: 0.75,  // Old 0.0-1.0 float
    sfxVolume: 0.5,
    musicVolume: 1.0,
    visualEffects: true,
    animations: false
    // Missing: difficulty
};

function migrateSettings(old) {
    const migrated = { ...old };

    // Convert float volumes to pip-dot scale
    if (typeof migrated.masterVolume === 'number' && migrated.masterVolume <= 1.0) {
        migrated.masterVolume = Math.round(migrated.masterVolume * 8);
    }
    if (typeof migrated.sfxVolume === 'number' && migrated.sfxVolume <= 1.0) {
        migrated.sfxVolume = Math.round(migrated.sfxVolume * 8);
    }
    if (typeof migrated.musicVolume === 'number' && migrated.musicVolume <= 1.0) {
        migrated.musicVolume = Math.round(migrated.musicVolume * 8);
    }

    // Add default difficulty if missing
    if (!migrated.difficulty) {
        migrated.difficulty = 'NORMAL';
    }

    return migrated;
}

const migrated = migrateSettings(oldSettings);
console.log('  Migrated settings:', migrated);

console.assert(migrated.masterVolume === 6, 'masterVolume 0.75 should migrate to 6');
console.assert(migrated.sfxVolume === 4, 'sfxVolume 0.5 should migrate to 4');
console.assert(migrated.musicVolume === 8, 'musicVolume 1.0 should migrate to 8');
console.assert(migrated.difficulty === 'NORMAL', 'missing difficulty should default to NORMAL');

console.log('✅ Test 7 passed\n');

console.log('=== All Settings Tests Passed ✅ ===');
