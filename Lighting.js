import React from 'https://cdn.jsdelivr.net/npm/react@18/umd/react.development.js';
import { deviceTypes, bankColors } from './constants.js';

const SwitchBank = ({ bank, floorIdx, roomIdx, bankIdx, updateBank, deleteBank, copyBank, showConfirmModal }) => (
    <div className="ml-1 sm:ml-2 mb-4 p-2 sm:p-4 bg-gray-100 rounded overflow-x-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center mb-2 gap-2 flex-wrap">
            <input
                type="text"
                value={bank.name}
                onFocus={() => updateBank({ ...bank, name: '' })}
                onBlur={(e) => {
                    const value = e.target.value.trim();
                    updateBank({ ...bank, name: value || `Switch Bank ${bankIdx + 1}` });
                }}
                onChange={(e) => updateBank({ ...bank, name: e.target.value })}
                placeholder={`Switch Bank ${bankIdx + 1}`}
                className="text-sm font-medium border p-3 rounded w-full sm:flex-1"
            />
            <select
                value={bank.color}
                onChange={(e) => updateBank({ ...bank, color: e.target.value })}
                className="border p-3 rounded w-full sm:w-40"
                disabled={bank.devices.some(device => device.type === 'Pico Remote')}
            >
                {bankColors.map((color) => (
                    <option key={color} value={color}>{color}</option>
                ))}
            </select>
            <div className="flex gap-2 w-full sm:w-auto">
                <button
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 active:bg-yellow-700 disabled:opacity-50"
                    onClick={() => {
                        console.log(`Initiating copy bank ${bankIdx} in room ${roomIdx} on floor ${floorIdx}`);
                        showConfirmModal({
                            message: `Copy ${bank.name || `Switch Bank ${bankIdx + 1}`}?`,
                            onConfirm: () => {
                                console.log(`Confirmed copy bank ${bankIdx} in room ${roomIdx} on floor ${floorIdx}`);
                                copyBank();
                            },
                            onCancel: () => console.log(`Copy bank ${bankIdx} in room ${roomIdx} on floor ${floorIdx} cancelled`)
                        });
                    }}
                    disabled={showConfirmModal.isOpen}
                >
                    Copy Bank
                </button>
                <button
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 active:bg-red-700 disabled:opacity-50"
                    onClick={() => {
                        console.log(`Initiating delete bank ${bankIdx} in room ${roomIdx} on floor ${floorIdx}`);
                        showConfirmModal({
                            message: `Delete ${bank.name || `Switch Bank ${bankIdx + 1}`}?`,
                            onConfirm: () => {
                                console.log(`Confirmed delete bank ${bankIdx} in room ${roomIdx} on floor ${floorIdx}`);
                                deleteBank();
                            },
                            onCancel: () => console.log(`Delete bank ${bankIdx} in room ${roomIdx} on floor ${floorIdx} cancelled`)
                        });
                    }}
                    disabled={showConfirmModal.isOpen}
                >
                    Delete Bank
                </button>
            </div>
        </div>
        {bank.devices.map((device, devIdx) => (
            <div key={devIdx} className="flex flex-col sm:flex-row items-start sm:items-center mt-1 gap-2">
                <select
                    value={device.type}
                    onChange={(e) => {
                        const newDevices = [...bank.devices];
                        newDevices[devIdx] = { ...device, type: e.target.value };
                        updateBank({ ...bank, devices: newDevices });
                    }}
                    className="border p-3 rounded w-full sm:w-40"
                >
                    {deviceTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
                <input
                    type="text"
                    value={device.notes}
                    onChange={(e) => {
                        const newDevices = [...bank.devices];
                        newDevices[devIdx] = { ...device, notes: e.target.value };
                        updateBank({ ...bank, devices: newDevices });
                    }}
                    placeholder="Notes (e.g., Main Light)"
                    className="border p-3 rounded w-full sm:flex-1"
                />
            </div>
        ))}
        <button
            className="mt-2 bg-blue-300 text-white px-3 py-1 rounded hover:bg-blue-400 w-full sm:w-auto"
            onClick={() => updateBank({ ...bank, devices: [...bank.devices, { type: 'Switch', notes: '' }] })}
        >
            + Add Device
        </button>
    </div>
);

export { SwitchBank };