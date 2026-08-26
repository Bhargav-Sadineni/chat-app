// new
import React, { useContext, useState } from 'react'
import { ChatContext } from '../../context/ChatContext'

const CreateGroupModal = ({ users, onClose }) => {

    const { createGroup } = useContext(ChatContext)
    const [name, setName] = useState("")
    const [selectedIds, setSelectedIds] = useState([])
    const [submitting, setSubmitting] = useState(false)

    const toggleMember = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
        )
    }

    const handleCreate = async () => {
        if (!name.trim() || selectedIds.length === 0) return
        setSubmitting(true)
        const success = await createGroup({ name: name.trim(), memberIds: selectedIds })
        setSubmitting(false)
        if (success) onClose()
    }

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'>
            <div className='bg-[#282142] text-white w-full max-w-sm rounded-lg p-5 flex flex-col gap-4'>
                <h3 className='text-lg font-medium'>Create Group</h3>

                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Group name"
                    className='p-2 rounded-md bg-[#1a1533] border border-gray-600 outline-none text-sm'
                />

                <div className='max-h-52 overflow-y-scroll flex flex-col gap-2'>
                    {users.map((user) => (
                        <label key={user._id} className='flex items-center gap-2 text-sm cursor-pointer'>
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(user._id)}
                                onChange={() => toggleMember(user._id)}
                            />
                            {user.fullName}
                        </label>
                    ))}
                    {users.length === 0 && (
                        <p className='text-xs text-gray-400'>No other users to add yet.</p>
                    )}
                </div>

                <div className='flex justify-end gap-3 text-sm'>
                    <button onClick={onClose} className='px-3 py-1.5 rounded-md border border-gray-500'>
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={submitting || !name.trim() || selectedIds.length === 0}
                        className='px-3 py-1.5 rounded-md bg-gradient-to-r from-purple-400 to-violet-600 disabled:opacity-50'>
                        {submitting ? "Creating..." : "Create"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CreateGroupModal