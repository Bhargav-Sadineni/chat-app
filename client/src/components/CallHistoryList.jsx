import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../context/Authcontext'

const CallHistoryList = ({ userId, groupId }) => {
    const { axios, authUser } = useContext(AuthContext)
    const [calls, setCalls] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCalls = async () => {
            setLoading(true)
            try {
                const url = groupId ? `/api/calls/group/${groupId}` : `/api/calls/user/${userId}`
                const { data } = await axios.get(url)
                if (data.success) setCalls(data.calls)
            } catch (err) {
                // history is non-critical — fail silently
            } finally {
                setLoading(false)
            }
        }
        if (userId || groupId) fetchCalls()
    }, [userId, groupId])

    const formatDuration = (seconds) => {
        if (!seconds) return ''
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m}:${s.toString().padStart(2, '0')}`
    }

    const statusLabel = (call) => {
        if (call.status === 'completed') return formatDuration(call.duration)
        if (call.status === 'missed') return 'Missed'
        if (call.status === 'rejected') return call.caller?._id === authUser._id ? 'Declined' : 'You declined'
        if (call.status === 'no-answer') return 'No answer'
        return call.status
    }

    if (loading) return <p className='text-xs text-gray-400'>Loading calls...</p>
    if (calls.length === 0) return <p className='text-gray-400 text-xs'>No calls yet.</p>

    return (
        <div className='flex flex-col gap-2'>
            {calls.map((call) => (
                <div key={call._id} className='flex items-center justify-between text-xs'>
                    <span className='flex items-center gap-2'>
                        {call.type === 'video' ? '🎥' : '📞'}
                        {new Date(call.startedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={call.status === 'completed' ? 'text-gray-400' : 'text-red-400'}>
                        {statusLabel(call)}
                    </span>
                </div>
            ))}
        </div>
    )
}

export default CallHistoryList