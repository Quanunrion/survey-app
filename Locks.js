import React, { useRef } from 'https://cdn.jsdelivr.net/npm/react@18/umd/react.development.js';
import { lockHandings, lockTypes, lockFunctions, lockFinishes, lockKeyways, doorTypes, doorThicknesses, backsets, keyingRequirements, fireRatings, adaCompliances, leverStyles } from './constants.js';

const LocksRoom = ({ room, floorIdx, roomIdx, updateRoom, showConfirmModal }) => {
    const updateLocks = (updates) => {
        updateRoom({ ...room, locks: { ...room.locks, ...updates } });
    };

    const lockRefs = useRef([]);

    const addLock = () => {
        const newLock = {
            name: '',
            handing: 'Left Hand (LH)',
            lockType: 'Cylindrical Latch',
            lockFunction: 'Office',
            finish: 'Satin Chrome (626)',
            keyway: 'Schlage C',
            doorType: 'Wood',
            doorThickness: '1-3/4"',
            backset: '2-3/4"',
            keying: 'None',
            fireRating: 'None',
            adaCompliance: 'None',
            leverStyle: 'None',
            notes: ''
        };
        lockRefs.current.push(React.createRef());
        updateLocks({
            locks: [...room.locks.locks, newLock]
        });
        setTimeout(() => {
            if (lockRefs.current[room.locks.locks.length]?.current) {
                lockRefs.current[room.locks.locks.length].current.scrollIntoView({ behavior: 'smooth' });
            }
        }, 0);
    };

    const updateLock = (lockIdx, updatedLock) => {
        const newLocks = [...room.locks.locks];
        newLocks[lockIdx] = updatedLock;
        updateLocks({ locks: newLocks });
    };

    return (
        <div className="mt-2 overflow-x-hidden">
            <label className="flex items-center">
                <input
                    type="checkbox"
                    checked={room.locks.enabled}
                    onChange={(e) => updateLocks({ enabled: e.target.checked })}
                    className="mr-2"
                />
                Room has lock requirements
            </label>
            {room.locks.enabled && (
                <div className="ml-1 sm:ml-2 mt-2 overflow-auto">
                    {room.locks.locks.map((lock, lockIdx) => (
                        <div
                            key={lockIdx}
                            ref={lockRefs.current[lockIdx] || (lockRefs.current[lockIdx] = React.createRef())}
                            className="mb-4 p-2 sm:p-4 bg-gray-100 rounded overflow-x-hidden"
                        >
                            <div className="flex flex-col sm:flex-row items-start sm:items-center mb-2 gap-2 flex-wrap">
                                <input
                                    type="text"
                                    value={lock.name}
                                    onFocus={() => updateLock(lockIdx, { ...lock, name: '' })}
                                    onBlur={(e) => {
                                        const value = e.target.value.trim();
                                        updateLock(lockIdx, { ...lock, name: value || `Lock ${lockIdx + 1}` });
                                    }}
                                    onChange={(e) => updateLock(lockIdx, { ...lock, name: e.target.value })}
                                    placeholder={`Lock ${lockIdx + 1}`}
                                    className="text-sm font-medium border p-3 rounded w-full sm:flex-1"
                                />
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <button
                                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 active:bg-yellow-700 disabled:opacity-50"
                                        onClick={() => {
                                            console.log(`Initiating copy lock ${lockIdx} in room ${roomIdx} on floor ${floorIdx}`);
                                            showConfirmModal({
                                                message: `Copy ${lock.name || `Lock ${lockIdx + 1}`}?`,
                                                onConfirm: () => {
                                                    console.log(`Confirmed copy lock ${lockIdx} in room ${roomIdx} on floor ${floorIdx}`);
                                                    const newLocks = [...room.locks.locks];
                                                    newLocks.splice(lockIdx + 1, 0, { ...lock });
                                                    lockRefs.current.splice(lockIdx + 1, 0, React.createRef());
                                                    updateLocks({ locks: newLocks });
                                                    setTimeout(() => {
                                                        if (lockRefs.current[lockIdx + 1]?.current) {
                                                            lockRefs.current[lockIdx + 1].current.scrollIntoView({ behavior: 'smooth' });
                                                        }
                                                    }, 0);
                                                },
                                                onCancel: () => console.log(`Copy lock ${lockIdx} in room ${roomIdx} on floor ${floorIdx} cancelled`)
                                            });
                                        }}
                                        disabled={showConfirmModal.isOpen}
                                    >
                                        Copy Lock
                                    </button>
                                    <button
                                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 active:bg-red-700 disabled:opacity-50"
                                        onClick={() => {
                                            console.log(`Initiating delete lock ${lockIdx} in room ${roomIdx} on floor ${floorIdx}`);
                                            showConfirmModal({
                                                message: `Delete ${lock.name || `Lock ${lockIdx + 1}`}?`,
                                                onConfirm: () => {
                                                    console.log(`Confirmed delete lock ${lockIdx} in room ${roomIdx} on floor ${floorIdx}`);
                                                    const newLocks = room.locks.locks.filter((_, i) => i !== lockIdx);
                                                    lockRefs.current.splice(lockIdx, 1);
                                                    updateLocks({ locks: newLocks });
                                                },
                                                onCancel: () => console.log(`Delete lock ${lockIdx} in room ${roomIdx} on floor ${floorIdx} cancelled`)
                                            });
                                        }}
                                        disabled={showConfirmModal.isOpen}
                                    >
                                        Delete Lock
                                    </button>
                                </div>
                            </div>
                            <label className="text-sm font-medium mt-2 block">Door Handing</label>
                            <select
                                value={lock.handing}
                                onChange={(e) => updateLock(lockIdx, { ...lock, handing: e.target.value })}
                                className="border p-3 rounded w-full"
                            >
                                {lockHandings.map((handing) => (
                                    <option key={handing} value={handing}>{handing}</option>
                                ))}
                            </select>
                            <label className="text-sm font-medium mt-2 block">Lock Type</label>
                            <select
                                value={lock.lockType}
                                onChange={(e) => updateLock(lockIdx, { ...lock, lockType: e.target.value })}
                                className="border p-3 rounded w-full"
                            >
                                {lockTypes.map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                            <label className="text-sm font-medium mt-2 block">Lock Function</label>
                            <select
                                value={lock.lockFunction}
                                onChange={(e) => updateLock(lockIdx, { ...lock, lockFunction: e.target.value })}
                                className="border p-3 rounded w-full"
                            >
                                {lockFunctions.map((func) => (
                                    <option key={func} value={func}>{func}</option>
                                ))}
                            </select>
                            <label className="text-sm font-medium mt-2 block">Finish</label>
                            <select
                                value={lock.finish}
                                onChange={(e) => updateLock(lockIdx, { ...lock, finish: e.target.value })}
                                className="border p-3 rounded w-full"
                            >
                                {lockFinishes.map((finish) => (
                                    <option key={finish} value={finish}>{finish}</option>
                                ))}
                            </select>
                            <label className="text-sm font-medium mt-2 block">Keyway</label>
                            <select
                                value={lock.keyway}
                                onChange={(e) => updateLock(lockIdx, { ...lock, keyway: e.target.value })}
                                className="border p-3 rounded w-full"
                            >
                                {lockKeyways.map((keyway) => (
                                    <option key={keyway} value={keyway}>{keyway}</option>
                                ))}
                            </select>
                            <label className="text-sm font-medium mt-2 block">Door Type</label>
                            <select
                                value={lock.doorType}
                                onChange={(e) => updateLock(lockIdx, { ...lock, doorType: e.target.value })}
                                className="border p-3 rounded w-full"
                            >
                                {doorTypes.map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                            <label className="text-sm font-medium mt-2 block">Door Thickness</label>
                            <select
                                value={lock.doorThickness}
                                onChange={(e) => updateLock(lockIdx, { ...lock, doorThickness: e.target.value })}
                                className="border p-3 rounded w-full"
                            >
                                {doorThicknesses.map((thickness) => (
                                    <option key={thickness} value={thickness}>{thickness}</option>
                                ))}
                            </select>
                            <label className="text-sm font-medium mt-2 block">Backset</label>
                            <select
                                value={lock.backset}
                                onChange={(e) => updateLock(lockIdx, { ...lock, backset: e.target.value })}
                                className="border p-3 rounded w-full"
                            >
                                {backsets.map((backset) => (
                                    <option key={backset} value={backset}>{backset}</option>
                                ))}
                            </select>
                            <label className="text-sm font-medium mt-2 block">Keying Requirement</label>
                            <select
                                value={lock.keying}
                                onChange={(e) => updateLock(lockIdx, { ...lock, keying: e.target.value })}
                                className="border p-3 rounded w-full"
                            >
                                {keyingRequirements.map((keying) => (
                                    <option key={keying} value={keying}>{keying}</option>
                                ))}
                            </select>
                            <label className="text-sm font-medium mt-2 block">Fire Rating</label>
                            <select
                                value={lock.fireRating}
                                onChange={(e) => updateLock(lockIdx, { ...lock, fireRating: e.target.value })}
                                className="border p-3 rounded w-full"
                            >
                                {fireRatings.map((rating) => (
                                    <option key={rating} value={rating}>{rating}</option>
                                ))}
                            </select>
                            <label className="text-sm font-medium mt-2 block">ADA Compliance</label>
                            <select
                                value={lock.adaCompliance}
                                onChange={(e) => updateLock(lockIdx, { ...lock, adaCompliance: e.target.value })}
                                className="border p-3 rounded w-full"
                            >
                                {adaCompliances.map((ada) => (
                                    <option key={ada} value={ada}>{ada}</option>
                                ))}
                            </select>
                            <label className="text-sm font-medium mt-2 block">Lever/Knob Style</label>
                            <select
                                value={lock.leverStyle}
                                onChange={(e) => updateLock(lockIdx, { ...lock, leverStyle: e.target.value })}
                                className="border p-3 rounded w-full"
                            >
                                {leverStyles.map((style) => (
                                    <option key={style} value={style}>{style}</option>
                                ))}
                            </select>
                            <label className="text-sm font-medium mt-2 block">Notes</label>
                            <input
                                type="text"
                                value={lock.notes}
                                onChange={(e) => updateLock(lockIdx, { ...lock, notes: e.target.value })}
                                placeholder="Lock Notes (e.g., Keypad entry)"
                                className="border p-3 rounded w-full"
                            />
                        </div>
                    ))}
                    <button
                        className="mt-2 bg-blue-400 text-white px-3 py-1 rounded hover:bg-blue-500 w-full sm:w-auto"
                        onClick={addLock}
                    >
                        + Add Lock
                    </button>
                </div>
            )}
        </div>
    );
};

export default LocksRoom;