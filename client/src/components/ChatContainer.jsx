// import React, { useContext, useEffect, useRef, useState } from 'react'
// import assets, { messagesDummyData } from '../assets/assets'
// import { formatMessageTime } from '../lib/utils'
// import { ChatContext } from '../../context/ChatContext'
// import { AuthContext } from '../../context/Authcontext'
// import toast from 'react-hot-toast'

// const ChatContainer = () => {

//     const { messages, selectedUser, setSelectedUser, sendMessage, getMessages} = useContext(ChatContext);
//     const {authUser,onlineUsers} = useContext(AuthContext)

//     const scrollEnd = useRef()

//     const [input, setInput] = useState('');

//     // Handle sending a message
//     const handleSendMessage = async (e) =>{
//         e.preventDefault();
//         if(input.trim()==="") return null;
//         await sendMessage({text: input.trim()});
//         setInput("")

//     }

//     // Handle sending an image
//     const handleSendImage = async (e) => {
//         const file = e.target.files[0];

//         if (!file || !file.type.startsWith("image/")) {
//             toast.error("select an image file");
//             return;
//         }

//         const reader = new FileReader();

//         reader.onloadend = async () => {
//             await sendMessage({ image: reader.result });
//             e.target.value = "";
//         };

//         reader.readAsDataURL(file);
//     }

//     useEffect(()=>{
//         if(selectedUser){
//             getMessages(selectedUser._id)
//         }
//     },[selectedUser])

//     useEffect(()=>{
//         if(scrollEnd.current && messages){
//             scrollEnd.current.scrollIntoView({ behavior:"smooth"})
//         }
//     },[messages])

//     return selectedUser ? (
//         <div className='h-full overflow-scroll relative backdrop-blur-lg'>
//           {/*--------header--------*/}
//             <div className='flex items-center gap-3 py-3 mx-4 border-b border-stone-500'>
//                 <img src={selectedUser.profilePic || assets.avatar_icon} alt="" className="w-8 rounded-full"/>
//                 <p className='flex-1 text-lg text-white flex items-center gap-2'>
//                     {selectedUser.fullName}
//                     {onlineUsers.includes(selectedUser._id) && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
//                 </p>
//                 <img onClick={()=> setSelectedUser(null)} src={assets.arrow_icon} alt=""
//                     className='md:hidden max-w-7'/>
//                 <img src={assets.help_icon} alt="" className='max-md:hidden max-w-5'/>
//             </div>
//             {/*--------chat area--------*/ }
//             <div className='flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6'>
//                 {messages.map((msg, index)=>(
//                     <div
//                         key={index}
//                         className={`flex items-end gap-2 justify-end ${msg.senderId !== authUser._id && 'flex-row-reverse'}`}
//                     >
//                         {msg.image ? (
//                             <img src={msg.image} alt="" className='max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8' />
//                         ) : (
//                             <p className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-all bg-violet-500/30 text-white
//                               ${msg.senderId === authUser._id ?'rounded-br-none':'rounded-bl-none'}`}>{msg.text}</p>
//                         )}
//                         <div className='text-center text-xs'>
//                           <img src={msg.senderId === authUser._id ? authUser?.profilePic || assets.avatar_icon : selectedUser?.profilePic || assets.avatar_icon } alt="" className='w-7 rounded-full'/>
//                           <p className='text-gray-500'>{formatMessageTime(msg.createdAt)}</p>
//                         </div>
//                     </div>
//                 ))}
//                 <div ref={scrollEnd}></div>
//             </div> 


//             {/*-----bottom area---- */}
//             <div className='absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3'>
//                 <div className='flex-1 flex items-center bg-gray-100/12 px-3 rounded-full'>
//                     <input
//                         onChange={(e)=>setInput(e.target.value)} value={input}
//                         onKeyDown={(e)=> e.key === "Enter" ? handleSendMessage(e) : null}
//                         type="text"
//                         placeholder="Send a message"
//                         className='flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400'
//                     />
//                     <input onChange={handleSendImage}
//                     type="file" id='image' accept='image/png, image/jpeg' hidden/>
//                     <label htmlFor='image'>
//                         <img
//                             src={assets.gallery_icon}
//                             alt=""
//                             className='w-5 mr-2 cursor-pointer'
//                         />
//                     </label>
//                 </div>
//                 <img onClick={handleSendMessage} src={assets.send_button} alt="" className='w-7 cursor-pointer' />
//             </div>

         
//         </div>
//     ):(
//       <div className='flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden'>
//         <img src={assets.logo_icon} className='max-w-16' alt="" />
//         <p className='text-lg font-medium text-white'>Chat anytime, anywhere</p>
//       </div>
//     )
// }

// export default ChatContainer

import React, { useContext, useEffect, useRef, useState } from 'react'
import assets from '../assets/assets'
import { formatMessageTime } from '../lib/utils'
import { ChatContext } from '../../context/ChatContext'
import { AuthContext } from '../../context/Authcontext'
import { CallContext } from '../../context/CallContext'
import AIAssistPanel from './AIAssistPanel'
import EmojiPicker from './EmojiPicker'
import ImageViewerModal from './ImageViewerModal'

const ChatContainer = () => {

    const {
        messages,
        groupMessages,
        aiMessages,
        aiLoading,
        selectedUser,
        setSelectedUser,
        selectedGroup,
        setSelectedGroup,
        selectedAI,
        setSelectedAI,
        showUserInfo,
        setShowUserInfo,
        getMessages,
        sendMessage,
        getGroupMessages,
        sendGroupMessage,
        sendAIMessage,
    } = useContext(ChatContext)
    const { authUser, onlineUsers } = useContext(AuthContext)
    const { callState, startCall } = useContext(CallContext)

    const [text, setText] = useState("")
    const [imagePreview, setImagePreview] = useState(null)
    const [filePreview, setFilePreview] = useState(null) // { dataUrl, name, type }
    const [sending, setSending] = useState(false)
    const [showMobileMenu, setShowMobileMenu] = useState(false)
    const [showAIPanel, setShowAIPanel] = useState(false)
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const [viewerImage, setViewerImage] = useState(null)
    const scrollEnd = useRef()
    const fileInputRef = useRef()
    const attachInputRef = useRef()

    const isGroup = !!selectedGroup
    const isAI = selectedAI
    const isSelfChat = !isGroup && !isAI && selectedUser?._id === authUser._id
    const activeMessages = isAI ? aiMessages : (isGroup ? groupMessages : messages)
    const headerName = isAI ? "AI" : (isGroup ? selectedGroup?.name : (isSelfChat ? `${selectedUser?.fullName} (You)` : selectedUser?.fullName))
    const headerImage = isGroup ? assets.avatar_icon : (selectedUser?.profilePic || assets.avatar_icon)
    const canCall = callState === 'idle' && !isSelfChat

    useEffect(() => {
        if (selectedUser) getMessages(selectedUser._id)
        if (selectedGroup) getGroupMessages(selectedGroup._id)
        setImagePreview(null)
        setFilePreview(null)
        setText("")
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedUser, selectedGroup, selectedAI])

    useEffect(() => {
        if (scrollEnd.current) {
            scrollEnd.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [activeMessages])

    const handleSend = async (e) => {
        e.preventDefault()

        if (isAI) {
            if (!text.trim() || aiLoading) return
            const question = text.trim()
            setText("")
            await sendAIMessage(question)
            return
        }

        if (!text.trim() && !imagePreview && !filePreview) return

        setSending(true)
        const payload = {}
        if (text.trim()) payload.text = text.trim()
        if (imagePreview) payload.image = imagePreview
        if (filePreview) {
            payload.file = filePreview.dataUrl
            payload.fileName = filePreview.name
            payload.fileType = filePreview.type
        }

        if (isGroup) {
            await sendGroupMessage(payload)
        } else {
            await sendMessage(payload)
        }

        setText("")
        setImagePreview(null)
        setFilePreview(null)
        setSending(false)
    }

    const handleImageSelect = (e) => {
        const file = e.target.files[0]
        if (!file || !file.type.startsWith("image/")) return
        const reader = new FileReader()
        reader.onload = () => setImagePreview(reader.result)
        reader.readAsDataURL(file)
        e.target.value = ""
    }

    const handleFileSelect = (e) => {
        const file = e.target.files[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = () => setFilePreview({ dataUrl: reader.result, name: file.name, type: file.type })
        reader.readAsDataURL(file)
        e.target.value = ""
    }

    const handleEmojiSelect = (emoji) => {
        setText((prev) => prev + emoji)
        setShowEmojiPicker(false)
    }

    const handleBack = () => {
        setSelectedUser(null)
        setSelectedGroup(null)
        setSelectedAI(false)
    }

    const handleCall = (type) => {
        if (!canCall) return
        if (isGroup) {
            startCall(type, { groupId: selectedGroup._id, groupName: selectedGroup.name })
        } else {
            startCall(type, { userId: selectedUser._id, targetName: selectedUser.fullName })
        }
    }

    if (!selectedUser && !selectedGroup && !selectedAI) {
        return (
            <div className='flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden'>
                <img src={assets.logo_icon} className='max-w-16' alt="" />
                <p className='text-lg font-medium text-white'>Chat anytime, anywhere</p>
            </div>
        )
    }

    return (
        <div className='h-full overflow-scroll relative backdrop-blur-lg'>
            {/*--------header--------*/}
            <div className='flex items-center gap-3 py-3 mx-4 border-b border-stone-500 relative'>
                <img onClick={handleBack} src={assets.arrow_icon} alt=""
                    className='md:hidden max-w-7 cursor-pointer' />

                {isAI ? (
                    <div className='w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-violet-600 flex items-center justify-center text-white text-xs font-semibold'>
                        AI
                    </div>
                ) : (
                    <img src={headerImage} alt="" className="w-8 rounded-full" />
                )}

                <p
                    onClick={() => !isAI && setShowUserInfo((prev) => !prev)}
                    className={`flex-1 text-lg text-white flex items-center gap-2 ${!isAI && 'cursor-pointer'}`}>
                    {headerName}
                    {!isGroup && !isAI && onlineUsers.includes(selectedUser._id) && (
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    )}
                </p>

                {!isAI && (
                    <>
                        <button
                            onClick={() => handleCall('audio')}
                            disabled={!canCall}
                            title="Audio call"
                            className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white disabled:opacity-30'
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                        </button>

                        <button
                            onClick={() => handleCall('video')}
                            disabled={!canCall}
                            title="Video call"
                            className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white disabled:opacity-30'
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M23 7l-7 5 7 5V7z" />
                                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                            </svg>
                        </button>

                        <div className='relative'>
                            <button
                                onClick={() => setShowAIPanel((prev) => !prev)}
                                title="Ask AI"
                                className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white'
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="8" width="18" height="12" rx="2" />
                                    <circle cx="8.5" cy="14" r="1.2" fill="currentColor" stroke="none" />
                                    <circle cx="15.5" cy="14" r="1.2" fill="currentColor" stroke="none" />
                                    <path d="M12 8V4" />
                                    <circle cx="12" cy="3" r="1" fill="currentColor" stroke="none" />
                                </svg>
                            </button>

                            {showAIPanel && (
                                <AIAssistPanel
                                    userId={!isGroup ? selectedUser?._id : undefined}
                                    groupId={isGroup ? selectedGroup?._id : undefined}
                                    onClose={() => setShowAIPanel(false)}
                                />
                            )}
                        </div>
                    </>
                )}

                <img src={assets.help_icon} alt="" className='max-md:hidden max-w-5' />

                {!isAI && (
                    <div className='md:hidden relative'>
                        <button
                            onClick={() => setShowMobileMenu((prev) => !prev)}
                            aria-label="More options"
                            className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white text-xl leading-none'
                        >
                            &#8942;
                        </button>

                        {showMobileMenu && (
                            <>
                                <div className='fixed inset-0 z-30' onClick={() => setShowMobileMenu(false)} />
                                <div className='absolute top-full right-0 z-40 w-40 mt-1 rounded-md bg-[#282142] border border-gray-600 text-gray-100 text-sm py-1'>
                                    <p
                                        onClick={() => { setShowUserInfo(true); setShowMobileMenu(false) }}
                                        className='px-4 py-2 cursor-pointer hover:bg-white/10'
                                    >
                                        {isGroup ? "Group info" : "View contact"}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/*--------chat area--------*/}
            <div className='flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6'>
                {isAI && activeMessages.length === 0 && (
                    <p className='text-center text-gray-500 text-sm mt-6'>Ask me anything about your chats, or anything at all.</p>
                )}
                {!isAI && activeMessages.length === 0 && (
                    <p className='text-center text-gray-500 text-sm mt-6'>No messages yet — say hi!</p>
                )}

                {isAI ? (
                    activeMessages.map((msg, index) => (
                        <div key={index} className={`flex mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <p className={`p-3 max-w-[75%] sm:max-w-[420px] text-sm rounded-lg break-words whitespace-pre-wrap
                                ${msg.role === 'user' ? 'bg-violet-500/30 text-white rounded-br-none' : 'bg-white/10 text-white rounded-bl-none'}`}>
                                {msg.text}
                            </p>
                        </div>
                    ))
                ) : (
                    activeMessages.map((msg, index) => (
                        <div
                            key={msg._id || index}
                            className={`flex flex-col items-end gap-1 ${msg.senderId !== authUser._id && 'items-start'}`}
                        >
                            <div className={`flex items-end gap-2 justify-end ${msg.senderId !== authUser._id && 'flex-row-reverse'}`}>
                                <div className={`flex flex-col gap-1 max-w-[75%] sm:max-w-[420px] ${msg.senderId === authUser._id ? 'items-end' : 'items-start'}`}>
                                    {msg.image && (
                                        <img
                                            src={msg.image}
                                            alt=""
                                            onClick={() => setViewerImage(msg.image)}
                                            className='max-w-[280px] border border-gray-700 rounded-lg overflow-hidden cursor-pointer'
                                        />
                                    )}
                                    {msg.fileUrl && (
                                        <a
                                            href={msg.fileUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className='flex items-center gap-2 p-2 rounded-lg bg-white/10 text-white text-xs max-w-[220px]'
                                        >
                                            <span className='text-lg'>📄</span>
                                            <span className='truncate'>{msg.fileName || "File"}</span>
                                        </a>
                                    )}
                                    {msg.text && (
                                        <p className={`p-3 max-w-full md:text-sm font-light rounded-lg break-words whitespace-pre-wrap bg-violet-500/30 text-white
                                          ${msg.senderId === authUser._id ? 'rounded-br-none' : 'rounded-bl-none'}`}>{msg.text}</p>
                                    )}
                                </div>
                                <div className='text-center text-xs'>
                                    <img src={msg.senderId === authUser._id ? (authUser.profilePic || assets.avatar_icon) : assets.avatar_icon} alt="" className='w-7 rounded-full' />
                                    <p className='text-gray-500'>{formatMessageTime(msg.createdAt)}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}

                {isAI && aiLoading && (
                    <p className='text-xs text-gray-400 mb-2'>AI is typing...</p>
                )}

                <div ref={scrollEnd}></div>
            </div>

            {/*-----bottom area---- */}
            <form onSubmit={handleSend} className='absolute bottom-0 left-0 right-0 flex flex-col gap-2 p-3'>

                {!isAI && imagePreview && (
                    <div className='flex items-center gap-3 bg-gray-100/10 rounded-lg p-2 mx-1'>
                        <img src={imagePreview} alt="" className='w-14 h-14 object-cover rounded-md' />
                        <p className='text-xs text-gray-300 flex-1'>Add a caption (optional)</p>
                        <button
                            type="button"
                            onClick={() => setImagePreview(null)}
                            aria-label="Remove image"
                            className='w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 text-white text-lg leading-none'
                        >
                            &times;
                        </button>
                    </div>
                )}

                {!isAI && filePreview && (
                    <div className='flex items-center gap-3 bg-gray-100/10 rounded-lg p-2 mx-1'>
                        <span className='text-2xl'>📄</span>
                        <p className='text-xs text-gray-300 flex-1 truncate'>{filePreview.name}</p>
                        <button
                            type="button"
                            onClick={() => setFilePreview(null)}
                            aria-label="Remove file"
                            className='w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 text-white text-lg leading-none'
                        >
                            &times;
                        </button>
                    </div>
                )}

                <div className='flex items-center gap-3'>
                    <div className='flex-1 flex items-center bg-gray-100/12 px-3 rounded-full relative'>
                        {!isAI && (
                            <button
                                type="button"
                                onClick={() => setShowEmojiPicker((prev) => !prev)}
                                className='mr-2 text-lg'
                            >
                                😊
                            </button>
                        )}
                        {!isAI && showEmojiPicker && (
                            <EmojiPicker onSelect={handleEmojiSelect} onClose={() => setShowEmojiPicker(false)} />
                        )}

                        <input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder={isAI ? "Ask AI anything..." : ((imagePreview || filePreview) ? "Add a caption..." : "Send a message")}
                            className='flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400'
                        />
                        {!isAI && (
                            <>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    id='image'
                                    accept='image/png, image/jpeg'
                                    hidden
                                    onChange={handleImageSelect}
                                />
                                <label htmlFor='image' title="Send image">
                                    <img
                                        src={assets.gallery_icon}
                                        alt=""
                                        className='w-5 mr-2 cursor-pointer'
                                    />
                                </label>

                                <input
                                    ref={attachInputRef}
                                    type="file"
                                    id='attach-file'
                                    hidden
                                    onChange={handleFileSelect}
                                />
                                <label htmlFor='attach-file' title="Send file" className='mr-2 cursor-pointer text-lg'>
                                    📎
                                </label>
                            </>
                        )}
                    </div>
                    <button type='submit' disabled={isAI ? (aiLoading || !text.trim()) : (sending || (!text.trim() && !imagePreview && !filePreview))}>
                        <img src={assets.send_button} alt="" className='w-7 cursor-pointer disabled:opacity-40' />
                    </button>
                </div>
            </form>

            {viewerImage && (
                <ImageViewerModal src={viewerImage} onClose={() => setViewerImage(null)} />
            )}
        </div>
    )
}

export default ChatContainer