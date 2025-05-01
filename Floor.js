import React, { useEffect, useRef } from 'https://cdn.jsdelivr.net/npm/react@18/umd/react.development.js';
import { SwitchBank } from './Lighting.js';
import Control4Room from './Control4.js';
import LocksRoom from './Locks.js';
import { deviceTypes, bankColors, colorCodes } from './constants.js';

const Room = ({ room, floorIdx, roomIdx, updateRoom, deleteRoom, copyRoom, currentTab, roomRef, showConfirmModal }) => (
  <div ref={roomRef} className="ml-1 sm:ml-2 mb-4 p-2 sm:p-4 bg-gray-50 rounded shadow overflow-x-hidden">
    <div className="flex flex-col sm:flex-row items-start sm:items-center mb-2 gap-2 flex-wrap">
      <input
        type="text"
        value={room.name}
        onFocus={() => updateRoom({ ...room, name: '' })}
        onBlur={(e) => {
          const value = e.target.value.trim();
          updateRoom({ ...room, name: value || `Room ${roomIdx + 1}` });
        }}
        onChange={(e) => updateRoom({ ...room, name: e.target.value })}
        placeholder={`Room ${roomIdx + 1}`}
        className="text-md font-semibold border p-3 rounded w-full sm:flex-1"
      />
      <div className="flex gap-2 w-full sm:w-auto">
        <button
          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 active:bg-yellow-700 disabled:opacity-50"
          onClick={() => {
            console.log(`Initiating copy room ${roomIdx} on floor ${floorIdx}`);
            showConfirmModal({
              message: `Copy ${room.name || `Room ${roomIdx + 1}`} and its contents?`,
              onConfirm: () => {
                console.log(`Confirmed copy room ${roomIdx} on floor ${floorIdx}`);
                copyRoom();
              },
              onCancel: () => console.log(`Copy room ${roomIdx} on floor ${floorIdx} cancelled`)
            });
          }}
          disabled={showConfirmModal.isOpen}
        >
          Copy Room
        </button>
        <button
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 active:bg-red-700 disabled:opacity-50"
          onClick={() => {
            console.log(`Initiating delete room ${roomIdx} on floor ${floorIdx}`);
            showConfirmModal({
              message: `Delete ${room.name || `Room ${roomIdx + 1}`} and its contents?`,
              onConfirm: () => {
                console.log(`Confirmed delete room ${roomIdx} on floor ${floorIdx}`);
                deleteRoom();
              },
              onCancel: () => console.log(`Delete room ${roomIdx} on floor ${floorIdx} cancelled`)
            });
          }}
          disabled={showConfirmModal.isOpen}
        >
          Delete Room
        </button>
      </div>
    </div>
    {currentTab === 'lighting' && (
      <>
        <div className="overflow-auto">
          {room.lighting.banks.map((bank, bankIdx) => (
            <SwitchBank
              key={bankIdx}
              bank={bank}
              floorIdx={floorIdx}
              roomIdx={roomIdx}
              bankIdx={bankIdx}
              updateBank={(updatedBank) => {
                const newBanks = [...room.lighting.banks];
                newBanks[bankIdx] = updatedBank;
                updateRoom({ ...room, lighting: { ...room.lighting, banks: newBanks } });
              }}
              deleteBank={() => {
                showConfirmModal({
                  message: `Delete ${bank.name || `Switch Bank ${bankIdx + 1}`}?`,
                  onConfirm: () => {
                    console.log(`Confirmed delete bank ${bankIdx} in room ${roomIdx} on floor ${floorIdx}`);
                    const newBanks = room.lighting.banks.filter((_, i) => i !== bankIdx);
                    updateRoom({ ...room, lighting: { ...room.lighting, banks: newBanks } });
                  },
                  onCancel: () => console.log(`Delete bank ${bankIdx} in room ${roomIdx} on floor ${floorIdx} cancelled`)
                });
              }}
              copyBank={() => {
                showConfirmModal({
                  message: `Copy ${bank.name || `Switch Bank ${bankIdx + 1}`}?`,
                  onConfirm: () => {
                    console.log(`Confirmed copy bank ${bankIdx} in room ${roomIdx} on floor ${floorIdx}`);
                    const newBanks = [...room.lighting.banks];
                    newBanks.splice(bankIdx + 1, 0, { ...bank });
                    updateRoom({ ...room, lighting: { ...room.lighting, banks: newBanks } });
                  },
                  onCancel: () => console.log(`Copy bank ${bankIdx} in room ${roomIdx} on floor ${floorIdx} cancelled`)
                });
              }}
              showConfirmModal={showConfirmModal}
            />
          ))}
        </div>
        <button
          className="mt-2 bg-blue-400 text-white px-3 py-1 rounded hover:bg-blue-500 w-full sm:w-auto"
          onClick={() => updateRoom({ ...room, lighting: { ...room.lighting, banks: [...room.lighting.banks, { devices: [], name: '', color: 'White' }] } })}
        >
          + Add Switch Bank
        </button>
      </>
    )}
    {currentTab === 'control4' && (
      <Control4Room
        room={room}
        floorIdx={floorIdx}
        roomIdx={roomIdx}
        updateRoom={updateRoom}
      />
    )}
    {currentTab === 'locks' && (
      <LocksRoom
        room={room}
        floorIdx={floorIdx}
        roomIdx={roomIdx}
        updateRoom={updateRoom}
        showConfirmModal={showConfirmModal}
      />
    )}
  </div>
);

const Floor = ({ floor, index, updateFloor, addRoom, deleteFloor, copyFloor, currentTab, floorRef, showConfirmModal, setEquipmentRoom }) => {
  const roomRefs = useRef([]);

  useEffect(() => {
    roomRefs.current[index] = roomRefs.current[index] || Array(floor.rooms.length).fill().map(() => React.createRef());
  }, [index, floor.rooms.length]);

  return (
    <div ref={floorRef} className="mb-4 p-2 sm:p-4 bg-white rounded shadow overflow-x-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center mb-2 gap-2 flex-wrap">
        <input
          type="text"
          value={floor.name}
          onFocus={() => updateFloor({ ...floor, name: '' })}
          onBlur={(e) => {
            const value = e.target.value.trim();
            updateFloor({ ...floor, name: value || `Floor ${index + 1}` });
          }}
          onChange={(e) => updateFloor({ ...floor, name: e.target.value })}
          placeholder={`Floor ${index + 1}`}
          className="text-lg font-bold border p-3 rounded w-full sm:flex-1"
        />
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 active:bg-yellow-700 disabled:opacity-50"
            onClick={() => {
              console.log(`Initiating copy floor ${index}`);
              showConfirmModal({
                message: `Copy ${floor.name || `Floor ${index + 1}`} and all its rooms?`,
                onConfirm: () => {
                  console.log(`Confirmed copy floor ${index}`);
                  copyFloor();
                },
                onCancel: () => console.log(`Copy floor ${index} cancelled`)
              });
            }}
            disabled={showConfirmModal.isOpen}
          >
            Copy Floor
          </button>
          <button
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 active:bg-red-700 disabled:opacity-50"
            onClick={() => {
              console.log(`Initiating delete floor ${index}`);
              showConfirmModal({
                message: `Delete ${floor.name || `Floor ${index + 1}`} and all its rooms?`,
                onConfirm: () => {
                  console.log(`Confirmed delete floor ${index}`);
                  deleteFloor();
                },
                onCancel: () => console.log(`Delete floor ${index} cancelled`)
              });
            }}
            disabled={showConfirmModal.isOpen}
          >
            Delete Floor
          </button>
        </div>
      </div>
      <div className="overflow-auto">
        {floor.rooms.map((room, roomIdx) => (
          <Room
            key={roomIdx}
            room={room}
            floorIdx={index}
            roomIdx={roomIdx}
            updateRoom={(updatedRoom) => {
              const newRooms = [...floor.rooms];
              newRooms[roomIdx] = updatedRoom;
              updateFloor({ ...floor, rooms: newRooms });
            }}
            deleteRoom={() => {
              showConfirmModal({
                message: `Delete ${room.name || `Room ${roomIdx + 1}`} and its contents?`,
                onConfirm: () => {
                  console.log(`Confirmed delete room ${roomIdx} on floor ${index}`);
                  const newRooms = floor.rooms.filter((_, i) => i !== roomIdx);
                  roomRefs.current[index].splice(roomIdx, 1);
                  updateFloor({ ...floor, rooms: newRooms });
                },
                onCancel: () => console.log(`Delete room ${roomIdx} on floor ${index} cancelled`)
              });
            }}
            copyRoom={() => {
              showConfirmModal({
                message: `Copy ${room.name || `Room ${roomIdx + 1}`} and its contents?`,
                onConfirm: () => {
                  console.log(`Confirmed copy room ${roomIdx} on floor ${index}`);
                  const newRooms = [...floor.rooms];
                  newRooms.splice(roomIdx + 1, 0, { ...room });
                  roomRefs.current[index].splice(roomIdx + 1, 0, React.createRef());
                  updateFloor({ ...floor, rooms: newRooms });
                  setTimeout(() => {
                    if (roomRefs.current[index][roomIdx + 1]?.current) {
                      roomRefs.current[index][roomIdx + 1].current.scrollIntoView({ behavior: 'smooth' });
                    }
                  }, 0);
                },
                onCancel: () => console.log(`Copy room ${roomIdx} on floor ${index} cancelled`)
              });
            }}
            currentTab={currentTab}
            roomRef={roomRefs.current[index]?.[roomIdx] || React.createRef()}
            showConfirmModal={showConfirmModal}
          />
        ))}
      </div>
      <button
        className="mt-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 w-full sm:w-auto"
        onClick={addRoom}
      >
        + Add Room
      </button>
    </div>
  );
};

export default Floor;
export { Room };
