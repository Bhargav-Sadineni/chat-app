import React, { useContext, useState } from 'react'
import assets from '../assets/assets'
import { ChatContext } from '../../context/ChatContext'
import ImageViewerModal from './ImageViewerModal'
import ConfirmModal from './ConfirmModal'
import AddMembersModal from './AddMembersModal'

const GroupInfoSidebar = () => {

    const { selectedGroup, showUserInfo, setShowUserInfo, groupMessages, leaveGroup, users } = useContext(ChatContext)
    const [viewerImage, setViewerImage] = useState(null)
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
    const [showAddMembers, setShowAddMembers] = useState(false)
    const [leaving, setLeaving] = useState(false)

    if (!selectedGroup || !showUserInfo) return null

    const mediaMessages = groupMessages.filter((msg) => msg.image)

    const handleLeave = async () => {
        setLeaving(true)
        const success = await leaveGroup(selectedGroup._id)
        setLeaving(false)
        if (success) {
            setShowLeaveConfirm(false)
            setShowUserInfo(false)
        }
    }

    return (
        <div className='bg-[#1a1533] md:bg-[#8185B2]/10 text-white w-full h-full
        fixed md:relative top-0 left-0 right-0 bottom-0 md:inset-auto
        z-50 md:z-auto overflow-y-auto'>

            <div className='flex items-center justify-between py-3 mx-4 border-b border-stone-500'>
                <p className='text-sm text-gray-300'>Group info</p>
                <button
                    onClick={() => setShowUserInfo(false)}
                    aria-label="Close group info"
                    className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-2xl leading-none'
                >
                    &times;
                </button>
            </div>

            <div className='pt-8 flex flex-col items-center gap-2 text-xs font-light mx-auto'>
                <img
                    src={assets.avatar_icon}
                    alt=""
                    onClick={() => setViewerImage(assets.avatar_icon)}
                    className='w-20 aspect-[1/1] rounded-full cursor-pointer'
                />
                <h1 className='px-10 text-xl font-medium mx-auto'>
                    {selectedGroup.name}
                </h1>
                <p className='px-10 mx-auto text-gray-400'>
                    {selectedGroup.members?.length || 0} members
                </p>
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

            <hr className='border-[#ffffff50] my-4' />

            <div className='px-5 text-xs pb-6'>
                <div className='flex items-center justify-between mb-2'>
                    <p>Members</p>
                    <button
                        onClick={() => setShowAddMembers(true)}
                        className='text-violet-400 hover:text-violet-300 text-xs font-medium'
                    >
                        + Add member
                    </button>
                </div>
                <div className='flex flex-col gap-3'>
                    {selectedGroup.members?.map((member) => (
                        <div key={member._id} className='flex items-center gap-3'>
                            <img
                                src={member.profilePic || assets.avatar_icon}
                                alt=""
                                className='w-8 h-8 rounded-full'
                            />
                            <p className='text-sm'>{member.fullName}</p>
                        </div>
                    ))}
                </div>
            </div>

            <button
                onClick={() => setShowLeaveConfirm(true)}
                className='w-[calc(100%-2.5rem)] mx-5 mb-6 py-2.5 rounded-full border border-red-400 text-red-400 text-sm font-light hover:bg-red-400/10'
            >
                Leave Group
            </button>

            {showLeaveConfirm && (
                <ConfirmModal
                    message={`Leave "${selectedGroup.name}"? You won't receive new messages from this group.`}
                    confirmLabel={leaving ? "Leaving..." : "Leave"}
                    onCancel={() => setShowLeaveConfirm(false)}
                    onConfirm={handleLeave}
                />
            )}

            {showAddMembers && (
                <AddMembersModal
                    group={selectedGroup}
                    allUsers={users}
                    onClose={() => setShowAddMembers(false)}
                />
            )}

            {viewerImage && (
                <ImageViewerModal src={viewerImage} onClose={() => setViewerImage(null)} />
            )}
        </div>
    )
}

export default GroupInfoSidebar