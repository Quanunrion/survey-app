import { v4 as uuidv4 } from 'https://cdn.jsdelivr.net/npm/uuid@9.0.1/dist/index.js';

const deviceTypes = ['Switch', 'Dimmer', 'Fan Control', 'Pico Remote'];
const bankColors = ['White', 'Light Almond', 'Black', 'Gray', 'Brown', 'Ivory'];

const lockHandings = ['Left Hand (LH)', 'Right Hand (RH)', 'Left Hand Reverse (LHR)', 'Right Hand Reverse (RHR)'];
const lockTypes = ['Cylindrical Latch', 'Cylindrical Deadbolt', 'Mortise'];
const lockFunctions = ['Office', 'Storeroom', 'Classroom', 'Entrance', 'Privacy', 'Passage'];
const lockFinishes = ['Satin Chrome (626)', 'Bright Chrome (625)', 'Satin Nickel (619)', 'Aged Bronze (716)', 'Oil Rubbed Bronze (613)', 'Bright Brass (605)'];
const lockKeyways = ['Schlage C', 'Schlage E', 'Schlage F', 'Sargent LA', 'Yale GA', 'None'];
const lockDoorTypes = ['Wood', 'Metal', 'Glass', 'Other'];
const lockDoorThicknesses = ['1-3/4"', '1-3/8"', '2"', '2-1/4"', 'Other'];
const lockBacksets = ['2-3/4"', '2-3/8"', '5"', 'Other'];
const lockKeyings = ['Keyed Alike', 'Keyed Different', 'Master Keyed', 'None'];
const lockFireRatings = ['None', '20 Minute', '45 Minute', '90 Minute', '3 Hour'];
const lockAdaCompliances = ['None', 'ADA Compliant'];
const lockLeverStyles = ['None', 'Omega', 'Rhodes', 'Athens', 'Sparta', 'Tubular'];

const modelCodes = {
    'Switch': 'CA-1XX',
    'Dimmer': 'MACL-L3XX',
    'Fan Control': 'MA-FQ4M-XX',
    'Pico Remote': 'PJ2-3BRL-GXX-L01'
};

const colorCodes = {
    'White': 'WH',
    'Light Almond': 'LA',
    'Black': 'BL',
    'Gray': 'GR',
    'Brown': 'BR',
    'Ivory': 'IV'
};

// Log successful import or catch errors
try {
    console.log('UUID v4 imported successfully:', uuidv4);
} catch (e) {
    console.error('Failed to import UUID:', e);
    alert('Failed to load UUID library. Check console for details and ensure network connectivity.');
}

export {
    deviceTypes,
    bankColors,
    lockHandings,
    lockTypes,
    lockFunctions,
    lockFinishes,
    lockKeyways,
    lockDoorTypes,
    lockDoorThicknesses,
    lockBacksets,
    lockKeyings,
    lockFireRatings,
    lockAdaCompliances,
    lockLeverStyles,
    modelCodes,
    colorCodes,
    uuidv4
};