// import React, { useContext, useEffect, useState } from 'react'
// import assets, { imagesDummyData } from '../assets/assets'
// import { ChatContext } from '../../context/ChatContext'
// import { AuthContext } from '../../context/Authcontext'

// const RightSidebar = () => {

//     const {selectedUser,messages} = useContext(ChatContext)
//     const {logout, onlineUsers} = useContext(AuthContext)
//     const [msgImages, setMsgImages] = useState([]);

//     // Get all the images from the messages and set them to state
//     useEffect(() => {
//         setMsgImages(
//             messages
//                 .filter(msg => msg.image)
//                 .map(msg => msg.image)
//         );
//     }, [messages]);

//     return selectedUser && (
//         <div className={`bg-[#8185B2]/10 text-white w-full relative overflow-y-scroll ${selectedUser ? "max-md:hidden" : ""}`}>
//             <div className='pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto'>
//                 <img
//                     src={selectedUser?.profilePic || assets.avatar_icon}
//                     alt=""
//                     className='w-20 aspect-[1/1] rounded-full'
//                 />
//                 <h1 className='px-10 text-xl font-medium mx-auto flex items-center gap-2'>
//                     {onlineUsers.includes(selectedUser._id) && <p className='w-2 h-2 rounded-full bg-green-500'></p>}
//                     {selectedUser.fullName}
//                 </h1>
//                 <p className='px-10 mx-auto'>{selectedUser.bio}</p>
//             </div>

//             <hr className='border-[#ffffff50] my-4'/>

//           <div className="px-5 text-xs">
//               <p>Media</p>
//               <div className='mt-2 max-h-[200px] overflow-y-scroll grid grid-cols-2 gap-4 opacity-80'>
//                   {msgImages.map((url, index)=>(
//                       <div
//                           key={index}
//                           onClick={()=> window.open(url)}
//                           className='cursor-pointer rounded'
//                       >
//                           <img src={url} alt="" className='h-full rounded-md'/>
//                       </div>
//                   ))}
//               </div>
//           </div>

//           <button
//           onClick={()=> logout()}
//            className='absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-400 to-violet-600 text-white border-none text-sm font-light py-2 px-20 rounded-full cursor-pointer'>
//               Logout
//           </button>         

//         </div>
//     )
// }

// export default RightSidebar


import React, { useContext, useState } from 'react'
import assets from '../assets/assets'
import { ChatContext } from '../../context/ChatContext'
import ImageViewerModal from './ImageViewerModal'

const RightSidebar = () => {

    const { selectedUser, showUserInfo, setShowUserInfo, messages } = useContext(ChatContext)
    const [viewerImage, setViewerImage] = useState(null)

    if (!selectedUser || !showUserInfo) return null

    const mediaMessages = messages.filter((msg) => msg.image)

    return (
        <div className='bg-[#1a1533] md:bg-[#8185B2]/10 text-white w-full h-full
        fixed md:relative top-0 left-0 right-0 bottom-0 md:inset-auto
        z-50 md:z-auto overflow-y-auto'>

            <div className='flex items-center justify-between py-3 mx-4 border-b border-stone-500'>
                <p className='text-sm text-gray-300'>Contact info</p>
                <button
                    onClick={() => setShowUserInfo(false)}
                    aria-label="Close profile"
                    className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-2xl leading-none'
                >
                    &times;
                </button>
            </div>

            <div className='pt-8 flex flex-col items-center gap-2 text-xs font-light mx-auto'>
                <img
                    src={selectedUser?.profilePic || assets.avatar_icon}
                    alt=""
                    onClick={() => setViewerImage(selectedUser?.profilePic || assets.avatar_icon)}
                    className='w-20 aspect-[1/1] rounded-full cursor-pointer'
                />
                <h1 className='px-10 text-xl font-medium mx-auto flex items-center gap-2'>
                    <p className='w-2 h-2 rounded-full bg-green-500'></p>
                    {selectedUser.fullName}
                </h1>
                <p className='px-10 mx-auto'>{selectedUser.bio}</p>
            </div>

            <hr className='border-[#ffffff50] my-4' />

            <div className="px-5 text-xs">
                <p>Media</p>
                <div className='mt-2 max-h-[200px] overflow-y-scroll grid grid-cols-2 gap-4 opacity-80'>
                    {mediaMessages.map((msg) => (
                        <div
                            key={msg._id}
                            onClick={() => setViewerImage(msg.image)}
                            className='cursor-pointer rounded'
                        >
                            <img src={msg.image} alt="" className='h-full rounded-md' />
                        </div>
                    ))}
                    {mediaMessages.length === 0 && (
                        <p className='text-gray-400 col-span-2'>No media shared yet.</p>
                    )}
                </div>
            </div>

            {viewerImage && (
                <ImageViewerModal src={viewerImage} onClose={() => setViewerImage(null)} />
            )}
        </div>
    )
}

export default RightSidebar