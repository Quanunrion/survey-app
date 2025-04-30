import { modelCodes, colorCodes } from './constants.js';

const formatSurveyForEmail = (project) => {
    let csv = 'Quantity,Model,Location,Manufacturer,System,Custom Field 12\n';
    const equipmentRack = [];
    let totalDevices = 0;
    let audioStreams = 0;
    let totalZones = 0;
    let subAmps = 0;
    let controllerCount = 0;

    project.floors.forEach((floor, floorIdx) => {
        floor.rooms.forEach((room, roomIdx) => {
            const c4 = room.control4;
            totalDevices += c4.keypads.length;
            totalDevices += c4.touchscreens.length;
            totalDevices += c4.haloRemote.enabled ? 1 : 0;
            totalDevices += c4.lights.enabled ? c4.lights.count : 0;
            totalDevices += c4.shades.length;
            if (c4.videoStream.enabled) totalDevices += 1;
            if (c4.roomAudio.enabled) {
                audioStreams += 1;
                const dist = c4.roomAudio.distribution;
                const zones = dist === 'Mono' ? 1 : dist === 'Stereo' ? 2 : parseInt(dist.split('.')[0]) + (dist.includes('.1') || dist.includes('.2') ? 1 : 0);
                totalZones += zones;
                if (dist.includes('.1') || dist.includes('.2')) subAmps += 1;
                totalDevices += zones;
            }
        });
    });

    const videoStreamRooms = [];
    project.floors.forEach((floor, floorIdx) => {
        floor.rooms.forEach((room, roomIdx) => {
            if (room.control4.videoStream.enabled) {
                videoStreamRooms.push({ floorIdx, roomIdx });
            }
        });
    });
    totalDevices += videoStreamRooms.length;
    const needsCore5 = totalDevices > 45;
    const equipmentRoom = project.equipmentRoom;
    const equipmentRoomLocation = equipmentRoom ? `${project.floors[equipmentRoom.floorIdx].name || `Floor ${equipmentRoom.floorIdx + 1}`}: ${project.floors[equipmentRoom.floorIdx].rooms[equipmentRoom.roomIdx].name || `Room ${equipmentRoom.roomIdx + 1}`}` : 'Equipment Rack';

    videoStreamRooms.forEach((room, idx) => {
        const { floorIdx, roomIdx } = room;
        const roomName = project.floors[floorIdx].rooms[roomIdx].name || `Room ${roomIdx + 1}`;
        const floorName = project.floors[floorIdx].name || `Floor ${floorIdx + 1}`;
        const location = `${floorName}: ${roomName}`;
        let model = 'EA-1';
        if (equipmentRoom && equipmentRoom.floorIdx === floorIdx && equipmentRoom.roomIdx === roomIdx) {
            model = needsCore5 ? 'EA-5' : 'EA-3';
        } else if (idx === 1 && !needsCore5) {
            model = 'EA-3';
        } else if (idx === 1 && needsCore5) {
            model = 'EA-1';
        }
        controllerCount += 1;
        csv += `1,${model},${location},Control4,Control4,${project.floors[floorIdx].rooms[roomIdx].control4.videoStream.notes}\n`;
    });

    const totalAudioStreams = videoStreamRooms.length;
    if (totalAudioStreams > 0) {
        equipmentRack.push({ quantity: 1, model: 'CA-10', location: equipmentRoomLocation });
    }

    if (totalZones > 0) {
        const ampChannels = Math.ceil(totalZones / 8) * 8;
        const ampCount = Math.ceil(ampChannels / 8);
        equipmentRack.push({ quantity: ampCount, model: 'C4-16AMP3-B', location: equipmentRoomLocation });
    }

    if (subAmps > 0) {
        equipmentRack.push({ quantity: subAmps, model: 'SUB-AMP', location: equipmentRoomLocation });
    }

    project.floors.forEach((floor, floorIdx) => {
        floor.rooms.forEach((room, roomIdx) => {
            const floorName = floor.name || `Floor ${floorIdx + 1}`;
            const roomName = room.name || `Room ${roomIdx + 1}`;
            const location = `${floorName}: ${roomName}`;
            const c4 = room.control4;

            if (c4.isEquipmentRoom && equipmentRoom && equipmentRoom.floorIdx === floorIdx && equipmentRoom.roomIdx === roomIdx) {
                equipmentRack.push({ quantity: 1, model: needsCore5 ? 'CORE-5' : 'CORE-3', location });
            }

            c4.keypads.forEach((keypad, idx) => {
                csv += `1,C4-KC120277,${location},Control4,Control4,${keypad.notes}\n`;
            });

            c4.touchscreens.forEach((screen, idx) => {
                const model = screen.size === '7"' ? 'C4-T4IW7' : 'C4-T4IW10';
                csv += `1,${model},${location},Control4,Control4,${screen.notes}\n`;
            });

            if (c4.haloRemote.enabled) {
                csv += `1,C4-SR260,${location},Control4,Control4,${c4.haloRemote.color} - ${c4.haloRemote.notes}\n`;
            }

            if (c4.lights.enabled) {
                c4.lights.devices.forEach((device, idx) => {
                    csv += `1,C4-APD120,${location},Control4,Control4,${device.notes}\n`;
                });
            }

            c4.shades.forEach((shade, idx) => {
                csv += `1,C4-SH1,${location},Control4,Control4,${shade.notes}\n`;
            });

            room.lighting.banks.forEach((bank, bankIdx) => {
                const bankName = bank.name || `Switch Bank ${bankIdx + 1}`;
                const bankLocation = `${location}: ${bankName}`;
                bank.devices.forEach((device, devIdx) => {
                    if (device.type !== 'Pico Remote') {
                        csv += `1,${modelCodes[device.type].replace('XX', colorCodes[bank.color])},${bankLocation},Lutron,Lighting,${device.notes}\n`;
                    } else {
                        csv += `1,${modelCodes[device.type]},${bankLocation},Lutron,Lighting,${device.notes}\n`;
                    }
                });
            });

            room.locks.locks.forEach((lock, lockIdx) => {
                if (room.locks.enabled) {
                    const lockName = lock.name || `Lock ${lockIdx + 1}`;
                    csv += `1,${lock.lockType === 'Cylindrical Latch' ? 'ND53PD' : lock.lockType === 'Cylindrical Deadbolt' ? 'D441' : 'MORTISE'}-${lock.leverStyle}-${lock.finish.replace(/\s+\(.*\)/, '')},${location}: ${lockName},Schlage,Locks,Function: ${lock.lockFunction}, Handing: ${lock.handing}, Keyway: ${lock.keyway}, Door: ${lock.doorType} ${lock.doorThickness}, Backset: ${lock.backset}, Fire: ${lock.fireRating}, ADA: ${lock.adaCompliance}, Notes: ${lock.notes}\n`;
                }
            });
        });
    });

    equipmentRack.forEach((item) => {
        csv += `${item.quantity},${item.model},${item.location},Control4,Control4,Equipment Rack\n`;
    });

    return csv;
};

const generateFallbackId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

export { formatSurveyForEmail, generateFallbackId };