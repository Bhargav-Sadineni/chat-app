import React, { useContext, useState } from 'react'
import { ChatContext } from '../../context/ChatContext'
import assets from '../assets/assets'

const CircleCheckbox = ({ checked }) => (
    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
        ${checked ? 'bg-violet-600 border-violet-600' : 'border-gray-400'}`}>
        {checked && (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
            </svg>
        )}
    </span>
)

const ForwardModal = ({ message, onClose }) => {
    const { users, groups, forwardMessage } = useContext(ChatContext)
    const [searchTerm, setSearchTerm] = useState("")
    const [selected, setSelected] = useState([]) // [{ type, id }]
    const [sending, setSending] = useState(false)

    const toggle = (type, id) => {
        setSelected((prev) =>
            prev.some((s) => s.type === type && s.id === id)
                ? prev.filter((s) => !(s.type === type && s.id === id))
                : [...prev, { type, id }]
        )
    }

    const isSelected = (type, id) => selected.some((s) => s.type === type && s.id === id)

    const filteredGroups = groups.filter((g) => g.name.toLowerCase().includes(searchTerm.toLowerCase()))
    const filteredUsers = users.filter((u) => u.fullName.toLowerCase().includes(searchTerm.toLowerCase()))

    const handleForward = async () => {
        if (selected.length === 0) return
        setSending(true)
        const success = await forwardMessage(message, selected)
        setSending(false)
        if (success) onClose()
    }

    return (
        <div className='fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4'>
            <div className='bg-white text-gray-900 w-full max-w-sm rounded-lg overflow-hidden flex flex-col max-h-[80vh]'>
                <div className='flex items-center gap-3 px-4 py-4 border-b border-gray-200'>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className='w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-2xl leading-none text-gray-700'
                    >
                        &times;
                    </button>
                    <h3 className='text-lg font-medium'>Forward to</h3>
                </div>

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
                    {filteredGroups.length > 0 && <p className='text-xs text-gray-400 px-2 pt-2'>Groups</p>}
                    {filteredGroups.map((group) => (
                        <div
                            key={group._id}
                            onClick={() => toggle('group', group._id)}
                            className='flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer hover:bg-gray-100'
                        >
                            <CircleCheckbox checked={isSelected('group', group._id)} />
                            <img src={assets.avatar_icon} alt="" className='w-9 h-9 rounded-full' />
                            <p className='text-sm'>{group.name}</p>
                        </div>
                    ))}

                    {filteredUsers.length > 0 && <p className='text-xs text-gray-400 px-2 pt-3'>Contacts</p>}
                    {filteredUsers.map((user) => (
                        <div
                            key={user._id}
                            onClick={() => toggle('user', user._id)}
                            className='flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer hover:bg-gray-100'
                        >
                            <CircleCheckbox checked={isSelected('user', user._id)} />
                            <img src={user.profilePic || assets.avatar_icon} alt="" className='w-9 h-9 rounded-full object-cover' />
                            <p className='text-sm'>{user.fullName}</p>
                        </div>
                    ))}

                    {filteredGroups.length === 0 && filteredUsers.length === 0 && (
                        <p className='text-xs text-gray-400 px-2 py-4 text-center'>No matches found.</p>
                    )}
                </div>

                <div className='flex justify-end gap-3 px-4 py-3 border-t border-gray-200'>
                    <button
                        onClick={handleForward}
                        disabled={sending || selected.length === 0}
                        className='px-4 py-1.5 rounded-md bg-gradient-to-r from-purple-400 to-violet-600 text-white text-sm disabled:opacity-50'
                    >
                        {sending ? "Forwarding..." : `Forward${selected.length ? ` (${selected.length})` : ""}`}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ForwardModal