import React from 'react'

const ConfirmModal = ({ message, confirmLabel = "Confirm", onConfirm, onCancel }) => {
    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'>
            <div className='bg-[#282142] text-white w-full max-w-xs rounded-lg p-5 flex flex-col gap-4'>
                <p className='text-sm'>{message}</p>
                <div className='flex justify-end gap-3 text-sm'>
                    <button onClick={onCancel} className='px-3 py-1.5 rounded-md border border-gray-500'>
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className='px-3 py-1.5 rounded-md bg-gradient-to-r from-purple-400 to-violet-600'>
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmModal