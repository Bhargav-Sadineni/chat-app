import React, { useContext, useState } from 'react'
import { ChatContext } from '../../context/ChatContext'
import assets from '../assets/assets'

const CreateGroupModal = ({ users, onClose }) => {

    const { createGroup } = useContext(ChatContext)
    const [step, setStep] = useState(1) // 1 = name, 2 = members
    const [name, setName] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedMembers, setSelectedMembers] = useState([])
    const [submitting, setSubmitting] = useState(false)

    const toggleMember = (user) => {
        setSelectedMembers((prev) =>
            prev.some((m) => m._id === user._id)
                ? prev.filter((m) => m._id !== user._id)
                : [...prev, user]
        )
    }

    const removeMember = (userId) => {
        setSelectedMembers((prev) => prev.filter((m) => m._id !== userId))
    }

    const filteredUsers = users.filter(
        (u) =>
            u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !selectedMembers.some((m) => m._id === u._id)
    )

    const handleCreate = async () => {
        if (!name.trim() || selectedMembers.length === 0) return
        setSubmitting(true)
        const success = await createGroup({
            name: name.trim(),
            memberIds: selectedMembers.map((m) => m._id),
        })
        setSubmitting(false)
        if (success) onClose()
    }

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'>
            <div className='bg-white text-gray-900 w-full max-w-sm rounded-lg overflow-hidden flex flex-col max-h-[80vh]'>

                <div className='flex items-center gap-3 px-4 py-4 border-b border-gray-200'>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className='w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-2xl leading-none text-gray-700'
                    >
                        &times;
                    </button>
                    <h3 className='text-lg font-medium'>
                        {step === 1 ? "New group" : "Add group members"}
                    </h3>
                </div>

                {step === 1 && (
                    <div className='p-4 flex flex-col gap-4'>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Group name"
                            autoFocus
                            className='p-2 rounded-md bg-gray-100 border border-gray-300 outline-none text-sm'
                        />
                        <button
                            onClick={() => name.trim() && setStep(2)}
                            disabled={!name.trim()}
                            className='self-end px-4 py-2 rounded-md bg-gradient-to-r from-purple-400 to-violet-600 text-white text-sm disabled:opacity-50'
                        >
                            Next
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <>
                        {selectedMembers.length > 0 && (
                            <div className='flex flex-wrap gap-2 px-4 pt-3'>
                                {selectedMembers.map((member) => (
                                    <span
                                        key={member._id}
                                        className='flex items-center gap-1 bg-gray-100 rounded-full pl-1 pr-2 py-1 text-sm'
                                    >
                                        <img
                                            src={member.profilePic || assets.avatar_icon}
                                            alt=""
                                            className='w-6 h-6 rounded-full'
                                        />
                                        {member.fullName}
                                        <button
                                            onClick={() => removeMember(member._id)}
                                            aria-label={`Remove ${member.fullName}`}
                                            className='ml-1 text-gray-500 hover:text-gray-800 text-base leading-none'
                                        >
                                            &times;
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className='px-4 pt-3'>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search"
                                className='w-full p-2 border-b border-gray-300 outline-none text-sm'
                            />
                        </div>

                        <div className='flex-1 overflow-y-auto px-2 py-2'>
                            {filteredUsers.map((user) => (
                                <div
                                    key={user._id}
                                    onClick={() => toggleMember(user)}
                                    className='flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer hover:bg-gray-100'
                                >
                                    <img
                                        src={user.profilePic || assets.avatar_icon}
                                        alt=""
                                        className='w-10 h-10 rounded-full object-cover'
                                    />
                                    <div className='flex flex-col leading-5'>
                                        <p className='text-sm'>{user.fullName}</p>
                                        {user.bio && (
                                            <span className='text-xs text-gray-500'>{user.bio}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {filteredUsers.length === 0 && (
                                <p className='text-xs text-gray-400 px-2 py-4 text-center'>
                                    No users found.
                                </p>
                            )}
                        </div>

                        <div className='flex justify-between items-center gap-3 px-4 py-3 border-t border-gray-200'>
                            <button
                                onClick={() => setStep(1)}
                                className='px-3 py-1.5 rounded-md border border-gray-300 text-sm'
                            >
                                Back
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={submitting || selectedMembers.length === 0}
                                className='px-4 py-1.5 rounded-md bg-gradient-to-r from-purple-400 to-violet-600 text-white text-sm disabled:opacity-50'
                            >
                                {submitting ? "Creating..." : "Create"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default CreateGroupModal