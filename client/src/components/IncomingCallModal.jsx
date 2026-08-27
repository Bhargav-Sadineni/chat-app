import React, { useContext } from 'react'
import { CallContext } from '../../context/CallContext'
import assets from '../assets/assets'

const IncomingCallModal = () => {
    const { incomingCall, acceptCall, rejectCall } = useContext(CallContext)

    if (!incomingCall) return null

    const title = incomingCall.isGroup ? incomingCall.groupName : incomingCall.caller.fullName
    const subtitle = incomingCall.isGroup
        ? `Incoming group ${incomingCall.type} call`
        : `Incoming ${incomingCall.type} call`

    return (
        <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4'>
            <div className='bg-[#282142] text-white w-full max-w-xs rounded-2xl p-6 flex flex-col items-center gap-4'>
                <img
                    src={incomingCall.isGroup ? assets.avatar_icon : (incomingCall.caller.profilePic || assets.avatar_icon)}
                    alt=""
                    className='w-20 h-20 rounded-full object-cover animate-pulse'
                />
                <div className='text-center'>
                    <p className='text-lg font-medium'>{title}</p>
                    <p className='text-sm text-gray-400'>{subtitle}</p>
                </div>
                <div className='flex gap-6 mt-2'>
                    <button
                        onClick={rejectCall}
                        className='w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-2xl'
                        aria-label="Decline"
                    >
                        📵
                    </button>
                    <button
                        onClick={acceptCall}
                        className='w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-2xl'
                        aria-label="Accept"
                    >
                        📞
                    </button>
                </div>
            </div>
        </div>
    )
}

export default IncomingCallModal