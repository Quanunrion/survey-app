import React from 'https://cdn.jsdelivr.net/npm/react@18/umd/react.development.js';

const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 sm:p-6 rounded shadow-lg max-w-sm w-full">
                <p className="mb-4 text-sm sm:text-base">{message}</p>
                <div className="flex flex-col sm:flex-row justify-end gap-2">
                    <button
                        className="bg-gray-300 text-black px-3 sm:px-4 py-1 sm:py-2 rounded hover:bg-gray-400"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                    <button
                        className="bg-red-500 text-white px-3 sm:px-4 py-1 sm:py-2 rounded hover:bg-red-600"
                        onClick={onConfirm}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;