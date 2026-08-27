import React from 'react'

const ImageViewerModal = ({ src, onClose }) => {
    if (!src) return null
    return (
        <div
            onClick={onClose}
            className='fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 cursor-zoom-out'
        >
            <img
                src={src}
                alt=""
                onClick={(e) => e.stopPropagation()}
                className='max-w-full max-h-full rounded-lg object-contain'
            />
            <button
                onClick={onClose}
                aria-label="Close"
                className='absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white text-lg leading-none'
            >
                &times;
            </button>
        </div>
    )
}

export default ImageViewerModal