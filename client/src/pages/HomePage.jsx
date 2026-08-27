// import React, { useContext, useState } from 'react'
// import Sidebar from '../components/Sidebar'
// import ChatContainer from '../components/ChatContainer'
// import RightSidebar from '../components/RightSidebar'
// import { ChatContext } from '../../context/ChatContext'

// const HomePage = () => {

//   const {selectedUser} = useContext(ChatContext)

//   return (
//     <div className='border w-full h-screen sm:px-[15%] sm:py-[5%]'>
//       <div className={`backdrop-blur-xl border-2 border-gray-600 rounded-2xl overflow-hidden h-[100%] grid grid-cols-1 relative
//         ${selectedUser ? 'md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]':'md:grid-cols-2'}`}>
//         <Sidebar />
//         <ChatContainer />
//         <RightSidebar />
//       </div>
//     </div>
//   )
// }

// export default HomePage

import React, { useContext } from 'react'
import IconSidebar from '../components/IconSidebar'
import Sidebar from '../components/Sidebar'
import ChatContainer from '../components/ChatContainer'
import RightSidebar from '../components/RightSidebar'
import GroupInfoSidebar from '../components/GroupInfoSidebar'
import { ChatContext } from '../../context/ChatContext'

const HomePage = () => {

  const { selectedUser, selectedGroup, selectedAI, showUserInfo } = useContext(ChatContext)
  const hasActiveChat = selectedUser || selectedGroup || selectedAI
  const showInfoColumn = !selectedAI && showUserInfo

  return (
    <div className='w-full h-screen'>
      <div className={`h-full grid grid-cols-1 relative
        ${hasActiveChat
          ? (showInfoColumn ? 'md:grid-cols-[64px_1fr_1.5fr_1fr] xl:grid-cols-[64px_1fr_2fr_1fr]' : 'md:grid-cols-[64px_1fr_2.5fr]')
          : 'md:grid-cols-[64px_1fr_2.5fr]'}`}>
        <IconSidebar />
        <Sidebar />
        <ChatContainer />
        <RightSidebar />
        <GroupInfoSidebar />
      </div>
    </div>
  )
}

export default HomePage