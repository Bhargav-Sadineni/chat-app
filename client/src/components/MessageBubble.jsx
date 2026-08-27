import React, { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { formatMessageTime } from '../lib/utils'

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"]
const SWIPE_THRESHOLD = 45
const TAP_MOVE_TOLERANCE = 8 // if finger moved less than this, treat it as a tap not a drag

const MessageBubble = ({ message, isOwn, avatarSrc, currentUserId, repliedMessage, onReply, onForward, onReact }) => {
    const [dragX, setDragX] = useState(0)
    const [dragging, setDragging] = useState(false)
    const [showMenu, setShowMenu] = useState(false)
    const touchStartX = useRef(null)
    const maxMoveSeen = useRef(0)
    const replyFiredRef = useRef(false)

    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX
        maxMoveSeen.current = 0
        replyFiredRef.current = false
        setDragging(true)
    }

    const handleTouchMove = (e) => {
        if (touchStartX.current === null) return
        const delta = e.touches[0].clientX - touchStartX.current
        maxMoveSeen.current = Math.max(maxMoveSeen.current, Math.abs(delta))
        setDragX(Math.max(-70, Math.min(70, delta)))

        if (!replyFiredRef.current && Math.abs(delta) > SWIPE_THRESHOLD) {
            replyFiredRef.current = true
            onReply(message)
            if (navigator.vibrate) navigator.vibrate(15)
        }
    }

    const handleTouchEnd = () => {
        setDragging(false)
        setDragX(0)
        touchStartX.current = null
    }

    // Only opens the action menu on an actual tap — not at the end of a swipe
    const handleContentClick = () => {
        if (maxMoveSeen.current > TAP_MOVE_TOLERANCE) return
        setShowMenu((prev) => !prev)
    }

    const handleCopy = () => {
        if (message.image) {
            navigator.clipboard.writeText(message.image)
            toast.success("Image link copied")
        } else if (message.fileUrl) {
            navigator.clipboard.writeText(message.fileUrl)
            toast.success("File link copied")
        } else if (message.text) {
            navigator.clipboard.writeText(message.text)
            toast.success("Text copied")
        }
        setShowMenu(false)
    }

    const reactionGroups = (message.reactions || []).reduce((acc, r) => {
        (acc[r.emoji] = acc[r.emoji] || []).push(r.userId)
        return acc
    }, {})

    return (
        <div className={`flex flex-col gap-1 relative ${isOwn ? 'items-end' : 'items-start'}`}>
            <div
                className={`flex items-end gap-2 justify-end ${!isOwn && 'flex-row-reverse'}`}
                style={{
                    transform: `translateX(${dragX}px)`,
                    transition: dragging ? 'none' : 'transform 0.15s ease-out',
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div
                    onClick={handleContentClick}
                    className={`flex flex-col gap-1 max-w-[75%] sm:max-w-[420px] cursor-pointer ${isOwn ? 'items-end' : 'items-start'}`}
                >
                    {repliedMessage && (
                        <div className='border-l-2 border-violet-400 pl-2 py-1 bg-white/10 rounded text-xs text-gray-100 max-w-full truncate w-full'>
                            {repliedMessage.text || (repliedMessage.image ? "📷 Photo" : (repliedMessage.fileName || "📄 File"))}
                        </div>
                    )}

                    {message.image && (
                        <img src={message.image} alt="" className='max-w-[280px] border border-gray-700 rounded-lg overflow-hidden' />
                    )}

                    {message.fileUrl && (
                        <a
                            href={message.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className='flex items-center gap-2 p-2 rounded-lg bg-white/10 text-white text-xs max-w-[220px]'
                        >
                            <span className='text-lg'>📄</span>
                            <span className='truncate'>{message.fileName || "File"}</span>
                        </a>
                    )}

                    {message.text && (
                        <p className={`p-3 max-w-full md:text-sm font-light rounded-lg break-words whitespace-pre-wrap bg-violet-500/30 text-white
                          ${isOwn ? 'rounded-br-none' : 'rounded-bl-none'}`}>
                            {message.text}
                        </p>
                    )}

                    {Object.keys(reactionGroups).length > 0 && (
                        <div className='flex gap-1 flex-wrap'>
                            {Object.entries(reactionGroups).map(([emoji, userIds]) => (
                                <button
                                    key={emoji}
                                    onClick={(e) => { e.stopPropagation(); onReact(message._id, emoji) }}
                                    className={`text-xs px-1.5 py-0.5 rounded-full border ${userIds.includes(currentUserId) ? 'border-violet-400 bg-violet-500/20' : 'border-gray-600 bg-white/5'}`}
                                >
                                    {emoji} {userIds.length}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className='text-center text-xs shrink-0'>
                    <img src={avatarSrc} alt="" className='w-7 rounded-full' />
                    <p className='text-gray-400'>{formatMessageTime(message.createdAt)}</p>
                </div>
            </div>

            {showMenu && (
                <>
                    <div className='fixed inset-0 z-30' onClick={() => setShowMenu(false)} />
                    <div className={`absolute z-40 top-full ${isOwn ? 'right-0' : 'left-0'} mt-1 bg-[#282142] border border-gray-600 rounded-lg shadow-lg p-2 flex flex-col gap-1 w-48`}>
                        <div className='flex justify-between px-1'>
                            {QUICK_REACTIONS.map((emoji) => (
                                <button
                                    key={emoji}
                                    onClick={() => { onReact(message._id, emoji); setShowMenu(false) }}
                                    className='text-lg hover:scale-125 transition'
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                        <hr className='border-gray-600 my-1' />
                        <button
                            type="button"
                            onClick={() => { onReply(message); setShowMenu(false) }}
                            className='text-left text-sm px-2 py-1.5 hover:bg-white/10 rounded text-gray-100'
                        >
                            ↩️ Reply
                        </button>
                        <button
                            type="button"
                            onClick={handleCopy}
                            className='text-left text-sm px-2 py-1.5 hover:bg-white/10 rounded text-gray-100'
                        >
                            📋 Copy
                        </button>
                        <button
                            type="button"
                            onClick={() => { onForward(message); setShowMenu(false) }}
                            className='text-left text-sm px-2 py-1.5 hover:bg-white/10 rounded text-gray-100'
                        >
                            ➡️ Forward
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}

export default MessageBubble