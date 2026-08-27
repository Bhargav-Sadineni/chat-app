import React, { useContext, useEffect, useState } from 'react'
import assets from '../assets/assets'
import { AuthContext } from '../../context/Authcontext'
import { ChatContext } from '../../context/ChatContext'
import { CallContext } from '../../context/CallContext'

const CallsListView = () => {
    const { axios, authUser } = useContext(AuthContext)
    const { setSelectedUser, setSelectedGroup } = useContext(ChatContext)
    const { startCall } = useContext(CallContext)
    const [calls, setCalls] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCalls = async () => {
            try {
                const { data } = await axios.get("/api/calls")
                if (data.success) setCalls(data.calls)
            } catch (err) {
                // non-critical
            } finally {
                setLoading(false)
            }
        }
        fetchCalls()
    }, [])

    const formatDuration = (seconds) => {
        if (!seconds) return ''
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return ` · ${m}:${s.toString().padStart(2, '0')}`
    }

    const otherParticipant = (call) => {
        if (call.isGroup) return null
        return (call.participants || []).find((p) => p._id !== authUser._id)
            || (call.invited || []).find((p) => p._id !== authUser._id)
    }

    const handleCallAgain = (call, e) => {
        e.stopPropagation()
        if (call.isGroup) {
            startCall(call.type, { groupId: call.group?._id, groupName: call.group?.name })
        } else {
            const other = otherParticipant(call)
            if (other) startCall(call.type, { userId: other._id, targetName: other.fullName })
        }
    }

    const handleOpenChat = (call) => {
        if (call.isGroup) {
            setSelectedUser(null)
            setSelectedGroup(call.group)
        } else {
            const other = otherParticipant(call)
            if (other) {
                setSelectedGroup(null)
                setSelectedUser(other)
            }
        }
    }

    if (loading) return <p className='text-xs text-gray-400 px-2'>Loading calls...</p>
    if (calls.length === 0) return <p className='text-xs text-gray-400 px-2'>No calls yet.</p>

    return (
        <div className='flex flex-col'>
            {calls.map((call) => {
                const other = otherParticipant(call)
                const title = call.isGroup ? (call.group?.name || "Group") : (other?.fullName || "Unknown")
                const image = call.isGroup ? assets.avatar_icon : (other?.profilePic || assets.avatar_icon)
                const missed = call.status === 'missed' || call.status === 'no-answer'
                const iAmCaller = call.caller?._id === authUser._id

                return (
                    <div
                        key={call._id}
                        onClick={() => handleOpenChat(call)}
                        className='flex items-center gap-3 p-2 pl-4 rounded cursor-pointer hover:bg-[#282142]/50'
                    >
                        <img src={image} alt="" className='w-[35px] aspect-[1/1] rounded-full' />
                        <div className='flex flex-col leading-5 flex-1'>
                            <p>{title}</p>
                            <span className={`text-xs flex items-center gap-1 ${missed && iAmCaller === false ? 'text-red-400' : 'text-neutral-400'}`}>
                                {iAmCaller ? '↗' : '↙'} {call.type === 'video' ? 'Video' : 'Audio'}
                                {call.status === 'completed' && formatDuration(call.duration)}
                                {missed && ' · Missed'}
                                {call.status === 'rejected' && ' · Declined'}
                            </span>
                        </div>
                        <button
                            onClick={(e) => handleCallAgain(call, e)}
                            className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white'
                            title="Call again"
                        >
                            {call.type === 'video' ? '🎥' : '📞'}
                        </button>
                    </div>
                )
            })}
        </div>
    )
}

export default CallsListView