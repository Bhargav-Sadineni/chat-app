/*import React, { useContext, useEffect, useState } from 'react'
import assets from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/Authcontext'
import { ChatContext } from '../../context/ChatContext'

const Sidebar = () => {

    const {getUsers,users,selectedUser,setSelectedUser,unseenMessages,setUnseenMessages} = useContext(ChatContext)

    const {logout, onlineUsers} = useContext(AuthContext)

    const navigate = useNavigate()

    const [input , setInput] = useState(false)

    const filteredUsers = input ? users.filter((user)=> user.fullName.toLowerCase().includes(input.toLowerCase())):users;

    useEffect(()=>{
        getUsers();
    },[onlineUsers])
  return (
    <div className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-scroll text-white 
    ${selectedUser?"max-md:hidden":''}`}>
      <div className='pb-5'>
        <div className='flex justify-between items-center'>
            <img src={assets.logo} alt="logo" className='max-w-40'/>
            <div className='relative py-2 group'>
                <img src={assets.menu_icon} alt="Menu" className='max-h-5 cursor-pointer' />
                <div className='absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-[#282142] border border-gray-600 text-gray-100 hidden group-hover:block'>
                    <p onClick={()=>navigate('/profile')}
                     className='cursor-pointer text-sm'>Edit Profile</p>
                    <hr className='my-2 border-t border-gray-500'/>
                    <p onClick={()=> logout()}
                    className='cursor-pointer text-sm'>Logout</p>
                </div>
            </div>
        </div>

        <div className='bg-[#282142] rounded-full flex items-center gap-2 py-3 px-4 mt-5'>
            <img src={assets.search_icon} alt="Search" className='w-3'/>
            <input onChange={(e)=>setInput(e.target.value)}
            type="text" className='bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1' 
            placeholder='Search User...'/>
        </div>
      </div>

      <div className='flex flex-col'>
        {filteredUsers.map((user, index)=>(
            <div onClick={()=>{setSelectedUser(user); setUnseenMessages(prev=>({...prev, [user._id]:0}))}}
            key={index}
            className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm
            ${selectedUser?._id===user._id && 'bg-[#282142]/50'}`}>
                <img src={user?.profilePic || assets.avatar_icon} alt=""
                    className='w-[35px] aspect-[1/1] rounded-full'/>
                <div className='flex flex-col leading-5'>
                    <p>{user.fullName}</p>
                    {
                        onlineUsers.includes(user._id)
                        ?<span className='text-green-400 text-xs'>Online</span>
                        :<span className='text-neutral-400 text-xs'>Offline</span>
                    }
                </div>
                {unseenMessages[user._id]>0&&<p className='absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50'>
                {unseenMessages[user._id]}</p>}
            </div>
        ))}
      </div>
    </div>
  )
}

export default Sidebar
*/

import React, { useContext, useEffect, useState } from 'react'
import assets from '../assets/assets'
import { AuthContext } from '../../context/Authcontext'
import { ChatContext } from '../../context/ChatContext'
import CreateGroupModal from './CreateGroupModal'

const Sidebar = () => {

    const { onlineUsers } = useContext(AuthContext)
    const {
        users,
        groups,
        getUsers,
        getGroups,
        selectedUser,
        setSelectedUser,
        selectedGroup,
        setSelectedGroup,
        selectedAI,
        setSelectedAI,
        unseenMessages,
        setUnseenMessages,
        unseenGroupMessages,
        sidebarView,
    } = useContext(ChatContext)

    const [searchTerm, setSearchTerm] = useState("")
    const [showGroupModal, setShowGroupModal] = useState(false)

    useEffect(() => {
        getUsers()
        getGroups()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const filteredUsers = searchTerm
        ? users.filter((u) => u.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
        : users

    const handleSelectUser = (user) => {
        setSelectedUser(user)
        setUnseenMessages((prev) => ({ ...prev, [user._id]: 0 }))
    }

    return (
        <div className={`bg-[#8185B2]/10 h-full p-5 rounded-none md:rounded-r-xl overflow-y-scroll text-white
        ${(selectedUser || selectedGroup || selectedAI) ? "max-md:hidden" : ""}`}>
            <div className='pb-5'>
                <div className='flex justify-between items-center'>
                    <img src={assets.logo} alt="logo" className='max-w-40' />
                    <button
                        title="Create group"
                        onClick={() => setShowGroupModal(true)}
                        className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-xl leading-none cursor-pointer'
                    >
                        +
                    </button>
                </div>

                {sidebarView !== 'groups' && (
                    <div className='bg-[#282142] rounded-full flex items-center gap-2 py-3 px-4 mt-5'>
                        <img src={assets.search_icon} alt="Search" className='w-3' />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className='bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1'
                            placeholder='Search User...' />
                    </div>
                )}
            </div>

            {(sidebarView === 'groups' || sidebarView === 'all') && groups.length > 0 && (
                <div className='flex flex-col mb-3'>
                    <p className='text-xs text-gray-400 px-2 mb-1'>Groups</p>
                    {groups.map((group) => (
                        <div
                            key={group._id}
                            onClick={() => setSelectedGroup(group)}
                            className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm
                            ${selectedGroup?._id === group._id && 'bg-[#282142]/50'}`}>
                            <img src={assets.avatar_icon} alt="" className='w-[35px] aspect-[1/1] rounded-full' />
                            <div className='flex flex-col leading-5'>
                                <p>{group.name}</p>
                                <span className='text-neutral-400 text-xs'>{group.members?.length || 0} members</span>
                            </div>
                            {!!unseenGroupMessages[group._id] && (
                                <p className='absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500'>
                                    {unseenGroupMessages[group._id]}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {sidebarView === 'groups' && groups.length === 0 && (
                <p className='text-xs text-gray-400 px-2'>No groups yet — tap "+" to create one.</p>
            )}

            {sidebarView !== 'groups' && (
                <div className='flex flex-col mb-3'>
                    <div
                        onClick={() => setSelectedAI(true)}
                        className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm
                        ${selectedAI && 'bg-[#282142]/50'}`}>
                        <div className='w-[35px] aspect-[1/1] rounded-full bg-gradient-to-r from-purple-400 to-violet-600 flex items-center justify-center text-white text-xs font-semibold'>
                            AI
                        </div>
                        <div className='flex flex-col leading-5'>
                            <p>AI</p>
                            <span className='text-neutral-400 text-xs'>Ask me anything</span>
                        </div>
                    </div>
                </div>
            )}

            {sidebarView !== 'groups' && (
                <div className='flex flex-col'>
                    {filteredUsers.map((user) => (
                        <div onClick={() => handleSelectUser(user)}
                            key={user._id}
                            className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm
                            ${selectedUser?._id === user._id && 'bg-[#282142]/50'}`}>
                            <img src={user?.profilePic || assets.avatar_icon} alt=""
                                className='w-[35px] aspect-[1/1] rounded-full' />
                            <div className='flex flex-col leading-5'>
                                <p>{user.fullName}</p>
                                {
                                    onlineUsers.includes(user._id)
                                        ? <span className="text-green-400 text-xs">Online</span>
                                        : <span className='text-neutral-400 text-xs'>Offline</span>
                                }
                            </div>
                            {!!unseenMessages[user._id] && (
                                <p className='absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500'>
                                    {unseenMessages[user._id]}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {showGroupModal && (
                <CreateGroupModal users={users} onClose={() => setShowGroupModal(false)} />
            )}
        </div>
    )
}

export default Sidebar