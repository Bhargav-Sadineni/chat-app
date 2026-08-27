import React, { useContext, useEffect, useState } from 'react'
import assets from '../assets/assets'
import { AuthContext } from '../../context/Authcontext'
import { ChatContext } from '../../context/ChatContext'
import { CallContext } from '../../context/CallContext'
import ImageViewerModal from './ImageViewerModal'

const MemberInfoPanel = ({ member, onBack, onClose }) => {
    const { axios, authUser } = useContext(AuthContext)
    const { setSelectedUser, setSelectedGroup, setShowUserInfo } = useContext(ChatContext)
    const { startCall } = useContext(CallContext)
    const [viewerImage, setViewerImage] = useState(null)
    const [media, setMedia] = useState([])
    const [loading, setLoading] = useState(true)

    const isSelf = member._id === authUser._id

    useEffect(() => {
        const fetchMedia = async () => {
            if (isSelf) { setLoading(false); return }
            try {
                const { data } = await axios.get(`/api/messages/${member._id}`)
                if (data.success) {
                    setMedia(data.messages.filter((m) => m.image || m.fileUrl))
                }
            } catch (err) {
                // non-critical
            } finally {
                setLoading(false)
            }
        }
        fetchMedia()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [member._id])

    const handleMessage = () => {
        setSelectedGroup(null)
        setSelectedUser(member)
        setShowUserInfo(false)
        onClose()
    }

    const handleCall = (type) => {
        startCall(type, { userId: member._id, targetName: member.fullName })
        onClose()
    }

    return (
        <div className='bg-[#1a1533] text-white w-full h-full
        fixed inset-0 z-[70] overflow-y-auto'>

            <div className='flex items-center gap-3 py-3 px-4 border-b border-stone-500'>
                <button onClick={onBack} aria-label="Back" className='text-2xl leading-none'>&larr;</button>
                <p className='text-sm text-gray-300'>Contact info</p>
                <button
                    onClick={onClose}
                    aria-label="Close"
                    className='ml-auto w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-2xl leading-none'
                >
                    &times;
                </button>
            </div>

            <div className='pt-8 flex flex-col items-center gap-2 text-xs font-light mx-auto'>
                <img
                    src={member.profilePic || assets.avatar_icon}
                    alt=""
                    onClick={() => setViewerImage(member.profilePic || assets.avatar_icon)}
                    className='w-24 aspect-[1/1] rounded-full cursor-pointer'
                />
                <h1 className='px-10 text-xl font-medium mx-auto text-center'>
                    {member.fullName}{isSelf ? " (You)" : ""}
                </h1>
                {member.bio && <p className='px-10 mx-auto text-gray-400 text-center'>{member.bio}</p>}
            </div>

            {!isSelf && (
                <div className='flex justify-center gap-8 mt-6'>
                    <button onClick={handleMessage} className='flex flex-col items-center gap-1 text-xs text-gray-300'>
                        <span className='w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-lg'>💬</span>
                        Message
                    </button>
                    <button onClick={() => handleCall('audio')} className='flex flex-col items-center gap-1 text-xs text-gray-300'>
                        <span className='w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-lg'>📞</span>
                        Voice
                    </button>
                    <button onClick={() => handleCall('video')} className='flex flex-col items-center gap-1 text-xs text-gray-300'>
                        <span className='w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-lg'>🎥</span>
                        Video
                    </button>
                </div>
            )}

            <hr className='border-[#ffffff20] my-6' />

            <div className='px-5 text-xs pb-6'>
                <p className='mb-2'>Media, links and docs</p>
                {loading && <p className='text-gray-400'>Loading...</p>}
                {!loading && media.length === 0 && <p className='text-gray-400'>Nothing shared yet.</p>}
                {!loading && media.length > 0 && (
                    <div className='grid grid-cols-4 gap-2'>
                        {media.map((m) => (
                            m.image ? (
                                <img
                                    key={m._id}
                                    src={m.image}
                                    alt=""
                                    onClick={() => setViewerImage(m.image)}
                                    className='w-full aspect-square object-cover rounded cursor-pointer'
                                />
                            ) : (
                                <a
                                    key={m._id}
                                    href={m.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className='w-full aspect-square bg-white/10 rounded flex items-center justify-center text-lg'
                                    title={m.fileName}
                                >
                                    📄
                                </a>
                            )
                        ))}
                    </div>
                )}
            </div>

            {viewerImage && (
                <ImageViewerModal src={viewerImage} onClose={() => setViewerImage(null)} />
            )}
        </div>
    )
}

export default MemberInfoPanel