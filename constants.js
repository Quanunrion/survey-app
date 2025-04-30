const uuidv4 = window.uuidv4 || (() => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
});

const deviceTypes = [
    'Dimmer', 'Switch', 'Keypad', 'Fan', 'Companion Dimmer', 'Companion Switch', 'Remote Keypad', 'Pico Remote'
];

const bankColors = [
    'White', 'Light Almond', 'Ivory', 'Black', 'Brilliant White', 'Glacier White', 'Snow',
    'Architectural White', 'Lunar Grey', 'Mist', 'Pebble', 'Cobblestone', 'Biscuit', 'Slate',
    'Sand', 'Taupe', 'Pumice', 'Clay', 'Sage', 'Espresso', 'Truffle', 'Deep Sea', 'Signal Red', 'Midnight'
];

const colorCodes = {
    'White': 'WH', 'Light Almond': 'LA', 'Ivory': 'IV', 'Black': 'BL', 'Brilliant White': 'BW',
    'Glacier White': 'GL', 'Snow': 'SW', 'Architectural White': 'RW', 'Lunar Grey': 'LG', 'Mist': 'MI',
    'Pebble': 'PB', 'Cobblestone': 'CS', 'Biscuit': 'BI', 'Slate': 'SL', 'Sand': 'SD', 'Taupe': 'TP',
    'Pumice': 'PM', 'Clay': 'CY', 'Sage': 'SA', 'Espresso': 'EP', 'Truffle': 'TF', 'Deep Sea': 'DE',
    'Signal Red': 'SR', 'Midnight': 'MN'
};

const modelCodes = {
    'Switch': 'RRST-8ANS-XX',
    'Dimmer': 'RRST-PRO-N-XX',
    'Keypad': 'RRST-W4B-XX',
    'Fan': 'RRD-2ANF-XX',
    'Companion Dimmer': 'RRST-RD-XX',
    'Companion Switch': 'RRST-RS-XX',
    'Remote Keypad': 'RRST-W4B-XX',
    'Pico Remote': 'PJ2-4B-GWH-L31'
};

const audioDistributions = ['Mono', 'Stereo', '2.1', '5.1', '7.1', '7.2', '7.2.4'];
const touchscreenSizes = ['7"', '10"'];
const haloColors = ['Black', 'Silver'];
const lockHandings = ['Left Hand (LH)', 'Right Hand (RH)', 'Left Hand Reverse (LHR)', 'Right Hand Reverse (RHR)'];
const lockTypes = ['Cylindrical Latch', 'Cylindrical Deadbolt', 'Mortise Lock', 'Electromagnetic Lock', 'Exit Device'];
const lockFunctions = ['Storeroom', 'Office', 'Classroom', 'Passage', 'Privacy'];
const lockFinishes = ['Satin Chrome (626)', 'Bright Chrome (625)', 'Satin Brass (606)', 'Bright Brass (605)', 'Oil-Rubbed Bronze (613)', 'Satin Nickel (619)'];
const lockKeyways = ['Schlage C', 'Schlage E', 'Corbin 60', 'Kwikset KW1', 'Yale GA', 'Weiser WR5'];
const doorTypes = ['Wood', 'Metal', 'Glass', 'Hollow Core', 'Solid Core'];
const doorThicknesses = ['1-3/8"', '1-3/4"', '2"', 'Custom'];
const backsets = ['2-3/8"', '2-3/4"', '5"', 'Adjustable'];
const keyingRequirements = ['None', 'Keyed Alike (KA)', 'Keyed Different (KD)', 'Master Keyed (MK)', 'Maison Keyed'];
const fireRatings = ['None', '20-Minute', '1-Hour', '3-Hour'];
const adaCompliances = ['None', 'Yes'];
const leverStyles = ['None', 'Lever (Standard)', 'Lever (Curved)', 'Lever (Straight)', 'Knob', 'Push Bar'];

export {
    uuidv4, deviceTypes, bankColors, colorCodes, modelCodes, audioDistributions, touchscreenSizes, haloColors,
    lockHandings, lockTypes, lockFunctions, lockFinishes, lockKeyways, doorTypes, doorThicknesses, backsets,
    keyingRequirements, fireRatings, adaCompliances, leverStyles
};