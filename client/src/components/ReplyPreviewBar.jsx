import React from 'react'

const ReplyPreviewBar = ({ message, onCancel }) => {
    if (!message) return null

    const preview = message.text || (message.image ? "📷 Photo" : (message.fileName || "📄 File"))

    return (
        <div className='flex items-center gap-2 bg-gray-100/10 rounded-lg p-2 mx-1 border-l-2 border-violet-400'>
            <div className='flex-1 text-xs text-gray-300 truncate'>
                <p className='text-violet-300 font-medium'>Replying to</p>
                {preview}
            </div>
            <button
                onClick={onCancel}
                aria-label="Cancel reply"
                className='w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 text-white text-lg leading-none'
            >
                &times;
            </button>
        </div>
    )
}

export default ReplyPreviewBar