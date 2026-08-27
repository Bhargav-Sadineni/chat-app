import React from 'react'

const EMOJIS = [
    "😀","😂","😅","😊","😍","😘","😜","🤔","😎","🙄",
    "😴","😭","😡","🥳","🤗","👍","👎","🙏","👏","💪",
    "❤️","🔥","🎉","✨","💯","😢","😱","🤝","👋","🙌",
]

const EmojiPicker = ({ onSelect, onClose }) => {
    return (
        <>
            <div className='fixed inset-0 z-30' onClick={onClose} />
            <div className='absolute bottom-full left-0 mb-2 z-40 w-64 bg-[#282142] border border-gray-600 rounded-lg shadow-lg p-3 grid grid-cols-6 gap-2'>
                {EMOJIS.map((emoji) => (
                    <button
                        key={emoji}
                        onClick={() => onSelect(emoji)}
                        className='text-xl hover:bg-white/10 rounded p-1'
                    >
                        {emoji}
                    </button>
                ))}
            </div>
        </>
    )
}

export default EmojiPicker