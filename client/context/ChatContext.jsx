/*import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./Authcontext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children })=>{

    const [messages, setMessages] = useState([]);
    const [users,setUsers] = useState([]);
    const [selectedUser,setSelectedUser] = useState(null)
    const [unseenMessages,setUnseenMessages] = useState({})

    const {socket, axios} = useContext(AuthContext);

    // function to get all users for sidebar
    const getUsers = async ()=>{
        try {
            const { data } = await axios.get("/api/messages/users");

            if (data.success) {
                setUsers(data.users);
                setUnseenMessages(data.unseenMessages);
            }

        } catch (error) {
            toast.error(error.message);
        }
    }

    // function to get messages for selected user
    const getMessages = async (userId)=>{
        try {
            const { data } = await axios.get(`/api/messages/${userId}`);

            if (data.success) {
                setMessages(data.messages);
            }

        } catch (error) {
            toast.error(error.message);
        }
    }


    // function to send message to selected user
    const sendMessage = async (messageData)=>{
        try {
            const { data } = await axios.post(
                `/api/messages/send/${selectedUser._id}`,
                messageData
            );

            if (data.success) {
                setMessages((prevMessages)=>[
                    ...prevMessages,
                    data.newMessage
                ]);
            } else {
                toast.error(data.message);
            }

        } catch (error) {
            toast.error(error.message);
        }
    }


    // function to subscribe to messages for selected user
    const subscribeToMessages = async ()=>{
        if (!socket) return;

        socket.on("newMessage", (newMessage)=>{
            if (selectedUser && newMessage.senderId === selectedUser._id) {
                newMessage.seen = true;
                setMessages((prevMessages)=>[
                    ...prevMessages,
                    newMessage
                ]);
                axios.put(`/api/messages/mark/${newMessage._id}`);
            } else {
                setUnseenMessages((prevUnseenMessages)=>({
                    ...prevUnseenMessages,
                    [newMessage.senderId]:
                        prevUnseenMessages[newMessage.senderId]
                            ? prevUnseenMessages[newMessage.senderId] + 1
                            : 1
                }));
            }
        });
    }


    // function to unsubscribe from messages
    const unsubscribeFromMessages = ()=>{
        if (socket) socket.off("newMessage");
    }

    useEffect(()=>{
        subscribeToMessages();
        return ()=> unsubscribeFromMessages();
    }, [socket, selectedUser]);

    const value = {
        messages,users,selectedUser,getUsers,getMessages,sendMessage,setSelectedUser,unseenMessages,setUnseenMessages
    }

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    )
}*/

import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AuthContext } from "./Authcontext";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});
    const [showUserInfo, setShowUserInfo] = useState(false);

    const { socket, axios } = useContext(AuthContext);

    // Fetch users + unseen counts for the sidebar
    const getUsers = async () => {
        try {
            const { data } = await axios.get("/api/messages/users");
            if (data.success) {
                setUsers(data.users);
                setUnseenMessages(data.unseenMessages);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Fetch groups the user belongs to
    const getGroups = async () => {
        try {
            const { data } = await axios.get("/api/groups");
            if (data.success) {
                setGroups(data.groups);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Fetch messages for a selected user
    const getMessages = async (userId) => {
        try {
            const { data } = await axios.get(`/api/messages/${userId}`);
            if (data.success) {
                setMessages(data.messages);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Send a message to the currently selected user
    const sendMessage = async (messageData) => {
        try {
            const { data } = await axios.post(
                `/api/messages/send/${selectedUser._id}`,
                messageData
            );
            if (data.success) {
                setMessages((prev) => [...prev, data.newMessage]);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Create a new group
    const createGroup = async ({ name, memberIds }) => {
        try {
            const { data } = await axios.post("/api/groups", { name, memberIds });
            if (data.success) {
                setGroups((prev) => [...prev, data.group]);
                toast.success("Group created");
                return true;
            }
            toast.error(data.message);
            return false;
        } catch (error) {
            toast.error(error.message);
            return false;
        }
    };

    // Subscribe to real-time new-message events + notifications
    const subscribeToMessages = () => {
        if (!socket) return;

        socket.on("newMessage", (newMessage) => {
            const isCurrentChat = selectedUser && newMessage.senderId === selectedUser._id;

            if (isCurrentChat) {
                newMessage.seen = true;
                setMessages((prev) => [...prev, newMessage]);
                axios.put(`/api/messages/mark/${newMessage._id}`);
            } else {
                setUnseenMessages((prev) => ({
                    ...prev,
                    [newMessage.senderId]: prev[newMessage.senderId]
                        ? prev[newMessage.senderId] + 1
                        : 1,
                }));

                const sender = users.find((u) => u._id === newMessage.senderId);
                toast(`New message from ${sender ? sender.fullName : "someone"}`, {
                    icon: "💬",
                });
            }
        });
    };

    const unsubscribeFromMessages = () => {
        if (socket) socket.off("newMessage");
    };

    useEffect(() => {
        subscribeToMessages();
        return () => unsubscribeFromMessages();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket, selectedUser, users]);

    // Total unseen count, used for the browser tab / title notification badge
    const totalUnseen = Object.values(unseenMessages).reduce(
        (sum, count) => sum + count,
        0
    );

    useEffect(() => {
        document.title = totalUnseen > 0 ? `(${totalUnseen}) QuickChat` : "QuickChat";
    }, [totalUnseen]);

    const value = {
        messages,
        users,
        groups,
        selectedUser,
        setSelectedUser,
        selectedGroup,
        setSelectedGroup,
        showUserInfo,
        setShowUserInfo,
        unseenMessages,
        setUnseenMessages,
        totalUnseen,
        getUsers,
        getGroups,
        getMessages,
        sendMessage,
        createGroup,
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};