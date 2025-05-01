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

const LocksRoom = ({ room, floorIdx, roomIdx, updateRoom }) => {
  const updateLocks = (updates) => {
    updateRoom({ ...room, locks: { ...room.locks, ...updates } });
  };

  const lockRefs = React.useRef([]);

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
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 active:bg-yellow-700"
                    onClick={() => {
                      console.log(`Copying lock ${lockIdx} in room ${roomIdx} on floor ${floorIdx}`);
                      if (window.confirm(`Copy ${lock.name || `Lock ${lockIdx + 1}`}?`)) {
                        const newLocks = [...room.locks.locks];
                        newLocks.splice(lockIdx + 1, 0, { ...lock });
                        lockRefs.current.splice(lockIdx + 1, 0, React.createRef());
                        updateLocks({ locks: newLocks });
                        setTimeout(() => {
                          if (lockRefs.current[lockIdx + 1]?.current) {
                            lockRefs.current[lockIdx + 1].current.scrollIntoView({ behavior: 'smooth' });
                          }
                        }, 0);
                      } else {
                        console.log('Copy lock cancelled');
                      }
                    }}
                  >
                    Copy Lock
                  </button>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 active:bg-red-700"
                    onClick={() => {
                      console.log(`Deleting lock ${lockIdx} in room ${roomIdx} on floor ${floorIdx}`);
                      if (window.confirm(`Delete ${lock.name || `Lock ${lockIdx + 1}`}?`)) {
                        const newLocks = room.locks.locks.filter((_, i) => i !== lockIdx);
                        lockRefs.current.splice(lockIdx, 1);
                        updateLocks({ locks: newLocks });
                      } else {
                        console.log('Delete lock cancelled');
                      }
                    }}
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

export { LocksRoom };
