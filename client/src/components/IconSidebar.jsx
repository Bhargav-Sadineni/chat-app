import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/Authcontext'
import { ChatContext } from '../../context/ChatContext'
import ConfirmModal from './ConfirmModal'

const IconSidebar = () => {
    const navigate = useNavigate()
    const { logout } = useContext(AuthContext)
    const { sidebarView, setSidebarView, selectedAI, setSelectedAI } = useContext(ChatContext)
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

    const iconBtnClass = (active) =>
        `w-9 h-9 flex items-center justify-center rounded-lg cursor-pointer transition
         ${active ? 'bg-violet-500/40 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`

    return (
        <>
            <div className='hidden md:flex flex-col items-center justify-between h-full py-4 bg-[#1a1533] w-16 border-r border-gray-700'>
                <div className='flex flex-col items-center gap-3'>
                    <div
                        title="All chats"
                        onClick={() => { setSelectedAI(false); setSidebarView('all') }}
                        className={iconBtnClass(sidebarView === 'all' && !selectedAI)}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                    </div>

                    <div
                        title="Groups"
                        onClick={() => { setSelectedAI(false); setSidebarView('groups') }}
                        className={iconBtnClass(sidebarView === 'groups' && !selectedAI)}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                    </div>

                    <div
                        title="AI Assistant"
                        onClick={() => setSelectedAI(true)}
                        className={iconBtnClass(selectedAI)}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="8" width="18" height="12" rx="2" />
                            <circle cx="8.5" cy="14" r="1.2" fill="currentColor" stroke="none" />
                            <circle cx="15.5" cy="14" r="1.2" fill="currentColor" stroke="none" />
                            <path d="M12 8V4" />
                            <circle cx="12" cy="3" r="1" fill="currentColor" stroke="none" />
                        </svg>
                    </div>
                </div>

                <div className='flex flex-col items-center gap-3'>
                    <div
                        title="Edit profile"
                        onClick={() => navigate('/profile')}
                        className={iconBtnClass(false)}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>

                    <div
                        title="Logout"
                        onClick={() => setShowLogoutConfirm(true)}
                        className={iconBtnClass(false)}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <path d="M16 17l5-5-5-5" />
                            <path d="M21 12H9" />
                        </svg>
                    </div>
                </div>
            </div>

            {showLogoutConfirm && (
                <ConfirmModal
                    message="Are you sure you want to logout?"
                    confirmLabel="Logout"
                    onCancel={() => setShowLogoutConfirm(false)}
                    onConfirm={() => { setShowLogoutConfirm(false); logout(); }}
                />
            )}
        </>
    )
}

export default IconSidebar