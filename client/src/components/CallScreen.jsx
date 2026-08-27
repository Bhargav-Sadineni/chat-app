import React, { useContext, useEffect, useRef } from 'react'
import { CallContext } from '../../context/CallContext'
import assets from '../assets/assets'

const RemoteVideo = ({ stream, name }) => {
    const ref = useRef()
    useEffect(() => {
        if (ref.current) ref.current.srcObject = stream
    }, [stream])
    return (
        <div className='relative bg-black rounded-lg overflow-hidden flex items-center justify-center'>
            <video ref={ref} autoPlay playsInline className='w-full h-full object-cover' />
            <p className='absolute bottom-2 left-2 text-white text-xs bg-black/50 px-2 py-0.5 rounded'>{name}</p>
        </div>
    )
}

const CallScreen = () => {
    const {
        callState,
        currentCall,
        localStream,
        remoteStreams,
        muted,
        cameraOff,
        endCall,
        toggleMute,
        toggleCamera,
    } = useContext(CallContext)

    const localVideoRef = useRef()

    useEffect(() => {
        if (localVideoRef.current) localVideoRef.current.srcObject = localStream
    }, [localStream])

    if (callState === 'idle' || !currentCall) return null

    const isVideo = currentCall.type === 'video'
    const remoteEntries = Object.entries(remoteStreams)
    const title = currentCall.isGroup ? currentCall.groupName : currentCall.targetName

    return (
        <div className='fixed inset-0 z-[90] bg-[#0d0a1a] flex flex-col text-white'>
            <div className='flex items-center justify-between p-4'>
                <div>
                    <p className='text-lg font-medium'>{title}</p>
                    <p className='text-xs text-gray-400'>
                        {callState === 'ringing-outgoing' ? 'Ringing...' : `${isVideo ? 'Video' : 'Audio'} call`}
                    </p>
                </div>
            </div>

            <div className='flex-1 p-4 overflow-y-auto relative'>
                {isVideo ? (
                    <div className={`grid gap-3 h-full ${remoteEntries.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        {remoteEntries.map(([userId, stream]) => (
                            <RemoteVideo
                                key={userId}
                                stream={stream}
                                name={currentCall.participants.find((p) => p.userId === userId)?.fullName || 'Participant'}
                            />
                        ))}
                        {remoteEntries.length === 0 && (
                            <div className='flex items-center justify-center text-gray-400'>
                                {callState === 'ringing-outgoing' ? 'Calling...' : 'Waiting for others to join...'}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className='h-full flex flex-col items-center justify-center gap-3'>
                        <img src={assets.avatar_icon} alt="" className='w-24 h-24 rounded-full' />
                        <p className='text-gray-300'>
                            {callState === 'ringing-outgoing' ? 'Calling...' : `${remoteEntries.length} connected`}
                        </p>
                    </div>
                )}

                {isVideo && localStream && (
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className='absolute bottom-4 right-4 w-28 h-40 object-cover rounded-lg border border-gray-600'
                    />
                )}
            </div>

            <div className='flex items-center justify-center gap-6 p-6'>
                <button
                    onClick={toggleMute}
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${muted ? 'bg-white text-black' : 'bg-white/10'}`}
                >
                    {muted ? '🔇' : '🎙️'}
                </button>
                {isVideo && (
                    <button
                        onClick={toggleCamera}
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${cameraOff ? 'bg-white text-black' : 'bg-white/10'}`}
                    >
                        {cameraOff ? '📷' : '🎥'}
                    </button>
                )}
                <button
                    onClick={endCall}
                    className='w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-2xl'
                >
                    📴
                </button>
            </div>
        </div>
    )
}

export default CallScreen