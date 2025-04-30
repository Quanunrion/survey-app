import React from 'https://cdn.jsdelivr.net/npm/react@18/umd/react.development.js';
import { audioDistributions, touchscreenSizes, haloColors } from './constants.js';

const Control4Room = ({ room, floorIdx, roomIdx, updateRoom }) => {
    const updateControl4 = (updates) => {
        updateRoom({ ...room, control4: { ...room.control4, ...updates } });
    };

    return (
        <div className="mt-2">
            <div className="mb-2">
                <label className="flex items-center">
                    <input
                        type="radio"
                        name={`equipmentRoom-${floorIdx}`}
                        checked={room.control4.isEquipmentRoom}
                        onChange={() => {
                            updateRoom({ ...room, control4: { ...room.control4, isEquipmentRoom: !room.control4.isEquipmentRoom } });
                        }}
                        className="mr-2"
                    />
                    Is this the Equipment Room?
                </label>
            </div>
            <div className="mb-2">
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={room.control4.videoStream.enabled}
                        onChange={(e) => updateControl4({ videoStream: { ...room.control4.videoStream, enabled: e.target.checked } })}
                        className="mr-2"
                    />
                    Video Stream in Room
                </label>
                {room.control4.videoStream.enabled && (
                    <input
                        type="text"
                        value={room.control4.videoStream.notes}
                        onChange={(e) => updateControl4({ videoStream: { ...room.control4.videoStream, notes: e.target.value } })}
                        placeholder="Video Stream Notes"
                        className="border p-3 rounded w-full"
                    />
                )}
            </div>
            <div className="mb-2">
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={room.control4.roomAudio.enabled}
                        onChange={(e) => updateControl4({ roomAudio: { ...room.control4.roomAudio, enabled: e.target.checked } })}
                        className="mr-2"
                    />
                    Room Audio (Outside Video Output)
                </label>
                {room.control4.roomAudio.enabled && (
                    <div className="ml-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <label>
                                <input
                                    type="radio"
                                    name={`audioType-${floorIdx}-${roomIdx}`}
                                    checked={!room.control4.roomAudio.wireless}
                                    onChange={() => updateControl4({ roomAudio: { ...room.control4.roomAudio, wireless: false } })}
                                    className="mr-2"
                                />
                                Wired
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name={`audioType-${floorIdx}-${roomIdx}`}
                                    checked={room.control4.roomAudio.wireless}
                                    onChange={() => updateControl4({ roomAudio: { ...room.control4.roomAudio, wireless: true } })}
                                    className="mr-2"
                                />
                                Wireless
                            </label>
                        </div>
                        <input
                            type="number"
                            value={room.control4.roomAudio.speakers}
                            onChange={(e) => updateControl4({ roomAudio: { ...room.control4.roomAudio, speakers: parseInt(e.target.value) || 2 } })}
                            placeholder="Number of Speakers"
                            className="border p-3 rounded w-full mt-1"
                            min="1"
                        />
                        <select
                            value={room.control4.roomAudio.distribution}
                            onChange={(e) => updateControl4({ roomAudio: { ...room.control4.roomAudio, distribution: e.target.value } })}
                            className="border p-3 rounded w-full mt-1"
                        >
                            {audioDistributions.map((dist) => (
                                <option key={dist} value={dist}>{dist}</option>
                            ))}
                        </select>
                        <input
                            type="text"
                            value={room.control4.roomAudio.notes}
                            onChange={(e) => updateControl4({ roomAudio: { ...room.control4.roomAudio, notes: e.target.value } })}
                            placeholder="Audio Notes"
                            className="border p-3 rounded w-full mt-1"
                        />
                    </div>
                )}
            </div>
            <div className="mb-2">
                <label className="block">
                    Number of Configurable Keypads:
                    <input
                        type="number"
                        value={room.control4.keypads.length}
                        onChange={(e) => {
                            const count = parseInt(e.target.value) || 0;
                            const keypads = Array(count).fill().map((_, i) => room.control4.keypads[i] || { notes: '' });
                            updateControl4({ keypads });
                        }}
                        className="border p-3 rounded w-20 mt-1"
                        min="0"
                    />
                </label>
                {room.control4.keypads.map((keypad, idx) => (
                    <input
                        key={idx}
                        type="text"
                        value={keypad.notes}
                        onChange={(e) => {
                            const newKeypads = [...room.control4.keypads];
                            newKeypads[idx] = { ...keypad, notes: e.target.value };
                            updateControl4({ keypads: newKeypads });
                        }}
                        placeholder={`Keypad ${idx + 1} Notes`}
                        className="border p-3 rounded w-full mt-1"
                    />
                ))}
            </div>
            <div className="mb-2">
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={room.control4.lights.enabled}
                        onChange={(e) => updateControl4({ lights: { ...room.control4.lights, enabled: e.target.checked } })}
                        className="mr-2"
                    />
                    Lights to be Controlled
                </label>
                {room.control4.lights.enabled && (
                    <div className="ml-4">
                        <label className="block">
                            Number of Lights:
                            <input
                                type="number"
                                value={room.control4.lights.count}
                                onChange={(e) => {
                                    const count = parseInt(e.target.value) || 0;
                                    const devices = Array(count).fill().map((_, i) => room.control4.lights.devices[i] || { notes: '' });
                                    updateControl4({ lights: { ...room.control4.lights, count, devices } });
                                }}
                                className="border p-3 rounded w-20 mt-1"
                                min="0"
                            />
                        </label>
                        {room.control4.lights.devices.map((device, idx) => (
                            <input
                                key={idx}
                                type="text"
                                value={device.notes}
                                onChange={(e) => {
                                    const newDevices = [...room.control4.lights.devices];
                                    newDevices[idx] = { ...device, notes: e.target.value };
                                    updateControl4({ lights: { ...room.control4.lights, devices: newDevices } });
                                }}
                                placeholder={`Light ${idx + 1} Notes`}
                                className="border p-3 rounded w-full mt-1"
                            />
                        ))}
                    </div>
                )}
            </div>
            <div className="mb-2">
                <label className="block">
                    Number of Shade Requirements:
                    <input
                        type="number"
                        value={room.control4.shades.length}
                        onChange={(e) => {
                            const count = parseInt(e.target.value) || 0;
                            const shades = Array(count).fill().map((_, i) => room.control4.shades[i] || { notes: '' });
                            updateControl4({ shades });
                        }}
                        className="border p-3 rounded w-20 mt-1"
                        min="0"
                    />
                </label>
                {room.control4.shades.map((shade, idx) => (
                    <input
                        key={idx}
                        type="text"
                        value={shade.notes}
                        onChange={(e) => {
                            const newShades = [...room.control4.shades];
                            newShades[idx] = { ...shade, notes: e.target.value };
                            updateControl4({ shades: newShades });
                        }}
                        placeholder={`Shade ${idx + 1} Notes`}
                        className="border p-3 rounded w-full mt-1"
                    />
                ))}
            </div>
            <div className="mb-2">
                <label className="block">
                    Number of C4 Touchscreens:
                    <input
                        type="number"
                        value={room.control4.touchscreens.length}
                        onChange={(e) => {
                            const count = parseInt(e.target.value) || 0;
                            const touchscreens = Array(count).fill().map((_, i) => room.control4.touchscreens[i] || { size: '7"', notes: '' });
                            updateControl4({ touchscreens });
                        }}
                        className="border p-3 rounded w-20 mt-1"
                        min="0"
                    />
                </label>
                {room.control4.touchscreens.map((screen, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center mt-1 gap-2">
                        <select
                            value={screen.size}
                            onChange={(e) => {
                                const newScreens = [...room.control4.touchscreens];
                                newScreens[idx] = { ...screen, size: e.target.value };
                                updateControl4({ touchscreens: newScreens });
                            }}
                            className="border p-3 rounded w-full sm:w-24"
                        >
                            {touchscreenSizes.map((size) => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                        <input
                            type="text"
                            value={screen.notes}
                            onChange={(e) => {
                                const newScreens = [...room.control4.touchscreens];
                                newScreens[idx] = { ...screen, notes: e.target.value };
                                updateControl4({ touchscreens: newScreens });
                            }}
                            placeholder={`Touchscreen ${idx + 1} Notes`}
                            className="border p-3 rounded w-full sm:flex-1"
                        />
                    </div>
                ))}
            </div>
            <div className="mb-2">
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={room.control4.haloRemote.enabled}
                        onChange={(e) => updateControl4({ haloRemote: { ...room.control4.haloRemote, enabled: e.target.checked } })}
                        className="mr-2"
                    />
                    C4 Halo Remote in Room
                </label>
                {room.control4.haloRemote.enabled && (
                    <div className="ml-4">
                        <select
                            value={room.control4.haloRemote.color}
                            onChange={(e) => updateControl4({ haloRemote: { ...room.control4.haloRemote, color: e.target.value } })}
                            className="border p-3 rounded w-full mt-1"
                        >
                            {haloColors.map((color) => (
                                <option key={color} value={color}>{color}</option>
                            ))}
                        </select>
                        <input
                            type="text"
                            value={room.control4.haloRemote.notes}
                            onChange={(e) => updateControl4({ haloRemote: { ...room.control4.haloRemote, notes: e.target.value } })}
                            placeholder="Halo Remote Notes"
                            className="border p-3 rounded w-full mt-1"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Control4Room;