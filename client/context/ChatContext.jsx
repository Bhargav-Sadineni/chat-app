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
import { perfStats } from "../src/lib/perfStats";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [groupMessages, setGroupMessages] = useState([]);
    const [aiMessages, setAiMessages] = useState([]);
    const [aiLoading, setAiLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [selectedUser, setSelectedUserState] = useState(null);
    const [selectedGroup, setSelectedGroupState] = useState(null);
    const [selectedAI, setSelectedAIState] = useState(false);
    const [unseenMessages, setUnseenMessages] = useState({});
    const [unseenGroupMessages, setUnseenGroupMessages] = useState({});
    const [showUserInfo, setShowUserInfo] = useState(false);
    const [sidebarView, setSidebarView] = useState('all'); // 'all' | 'groups' | 'calls'
    const [replyingTo, setReplyingTo] = useState(null);

    const { socket, axios } = useContext(AuthContext);

    const setSelectedUser = (user) => {
        setSelectedGroupState(null);
        setSelectedAIState(false);
        setSelectedUserState(user);
        setReplyingTo(null);
    };

    const setSelectedGroup = (group) => {
        setSelectedUserState(null);
        setSelectedAIState(false);
        setSelectedGroupState(group);
        setReplyingTo(null);

        if (group) {
            setUnseenGroupMessages((prev) => ({ ...prev, [group._id]: 0 }));
            axios.put(`/api/messages/mark-group/${group._id}`).catch(() => {});
        }
    };

    const setSelectedAI = (value) => {
        if (value) {
            setSelectedUserState(null);
            setSelectedGroupState(null);
        }
        setSelectedAIState(value);
    };

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

    const getGroups = async () => {
        try {
            const { data } = await axios.get("/api/groups");
            if (data.success) {
                setGroups(data.groups);
                setUnseenGroupMessages(data.unseenGroupMessages || {});
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

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

    const sendMessage = async (messageData) => {
        try {
            const { data } = await axios.post(
                `/api/messages/send/${selectedUser._id}`,
                { ...messageData, clientSentAt: Date.now() }
            );
            if (data.success) {
                setMessages((prev) => [...prev, data.newMessage]);
                setReplyingTo(null);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const getGroupMessages = async (groupId) => {
        try {
            const { data } = await axios.get(`/api/messages/group/${groupId}`);
            if (data.success) {
                setGroupMessages(data.messages);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const sendGroupMessage = async (messageData) => {
        try {
            const { data } = await axios.post(
                `/api/messages/send-group/${selectedGroup._id}`,
                { ...messageData, clientSentAt: Date.now() }
            );
            if (data.success) {
                setGroupMessages((prev) => [...prev, data.newMessage]);
                setReplyingTo(null);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Forward an existing message's content to one or more other chats
    // (1:1 users and/or groups), independent of the currently open chat.
    const forwardMessage = async (message, targets) => {
        try {
            const payload = {};
            if (message.text) payload.text = message.text;
            if (message.image) payload.image = message.image;
            if (message.fileUrl) {
                payload.file = message.fileUrl;
                payload.fileName = message.fileName;
                payload.fileType = message.fileType;
            }

            await Promise.all(
                targets.map((target) => {
                    const url = target.type === 'group'
                        ? `/api/messages/send-group/${target.id}`
                        : `/api/messages/send/${target.id}`;
                    return axios.post(url, payload);
                })
            );

            toast.success("Message forwarded");
            return true;
        } catch (error) {
            toast.error(error.message);
            return false;
        }
    };

    // Add / change / remove the logged-in user's reaction to a message
    const reactToMessage = async (messageId, emoji) => {
        try {
            const { data } = await axios.put(`/api/messages/react/${messageId}`, { emoji });
            if (data.success) {
                setMessages((prev) => prev.map((m) => (m._id === messageId ? { ...m, reactions: data.reactions } : m)));
                setGroupMessages((prev) => prev.map((m) => (m._id === messageId ? { ...m, reactions: data.reactions } : m)));
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const sendAIMessage = async (text) => {
        const userTurn = { role: "user", text };
        setAiMessages((prev) => [...prev, userTurn]);
        setAiLoading(true);
        const startedAt = Date.now();
        try {
            const { data } = await axios.post("/api/ai/chat", {
                message: text,
                history: [...aiMessages, userTurn],
            }, { timeout: 50000 });
            perfStats.record("ai-response-time", Date.now() - startedAt);
            if (data.success) {
                setAiMessages((prev) => [...prev, { role: "ai", text: data.reply }]);
            } else {
                setAiMessages((prev) => [...prev, { role: "ai", text: `⚠️ ${data.message}` }]);
                toast.error(data.message);
            }
        } catch (error) {
            const errMsg = error.code === "ECONNABORTED"
                ? "The AI took too long to respond. Please try again."
                : (error.response?.data?.message || error.message);
            setAiMessages((prev) => [...prev, { role: "ai", text: `⚠️ ${errMsg}` }]);
            toast.error(errMsg);
        } finally {
            setAiLoading(false);
        }
    };

    const askAIAbout = async (question, { userId, groupId } = {}) => {
        const startedAt = Date.now();
        try {
            const { data } = await axios.post("/api/ai/chat", {
                message: question,
                userId,
                groupId,
            }, { timeout: 50000 });
            perfStats.record("ai-response-time", Date.now() - startedAt);
            if (data.success) return data.reply;
            toast.error(data.message);
            return null;
        } catch (error) {
            const errMsg = error.code === "ECONNABORTED"
                ? "The AI took too long to respond. Please try again."
                : (error.response?.data?.message || error.message);
            toast.error(errMsg);
            return null;
        }
    };

    const summarizeConversation = async ({ userId, groupId }) => {
        try {
            const { data } = await axios.post("/api/ai/summarize", { userId, groupId }, { timeout: 50000 });
            if (data.success) return data.summary;
            toast.error(data.message);
            return null;
        } catch (error) {
            const errMsg = error.code === "ECONNABORTED"
                ? "The AI took too long to respond. Please try again."
                : (error.response?.data?.message || error.message);
            toast.error(errMsg);
            return null;
        }
    };

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

    const leaveGroup = async (groupId) => {
        try {
            const { data } = await axios.post(`/api/groups/${groupId}/leave`);
            if (data.success) {
                setGroups((prev) => prev.filter((g) => g._id !== groupId));
                if (selectedGroup?._id === groupId) {
                    setSelectedGroupState(null);
                }
                toast.success("Left group");
                return true;
            }
            toast.error(data.message);
            return false;
        } catch (error) {
            toast.error(error.message);
            return false;
        }
    };

    const addMembersToGroup = async (groupId, memberIds) => {
        try {
            const { data } = await axios.post(`/api/groups/${groupId}/add-members`, { memberIds });
            if (data.success) {
                setGroups((prev) => prev.map((g) => (g._id === groupId ? data.group : g)));
                if (selectedGroup?._id === groupId) {
                    setSelectedGroupState(data.group);
                }
                toast.success("Members added");
                return true;
            }
            toast.error(data.message);
            return false;
        } catch (error) {
            toast.error(error.message);
            return false;
        }
    };

    const subscribeToMessages = () => {
        if (!socket) return;

        socket.on("newMessage", (newMessage) => {
            if (newMessage.clientSentAt) {
                perfStats.record("message-delivery-latency", Date.now() - newMessage.clientSentAt);
            }

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

        socket.on("newGroupMessage", (newMessage) => {
            if (newMessage.clientSentAt) {
                perfStats.record("group-message-delivery-latency", Date.now() - newMessage.clientSentAt);
            }

            const isCurrentGroup = selectedGroup && newMessage.groupId === selectedGroup._id;

            if (isCurrentGroup) {
                setGroupMessages((prev) => [...prev, newMessage]);
                axios.put(`/api/messages/mark-group/${newMessage.groupId}`).catch(() => {});
            } else {
                setUnseenGroupMessages((prev) => ({
                    ...prev,
                    [newMessage.groupId]: prev[newMessage.groupId]
                        ? prev[newMessage.groupId] + 1
                        : 1,
                }));

                const group = groups.find((g) => g._id === newMessage.groupId);
                toast(`New message in ${group ? group.name : "a group"}`, {
                    icon: "👥",
                });
            }
        });

        socket.on("messageReaction", ({ messageId, reactions }) => {
            setMessages((prev) => prev.map((m) => (m._id === messageId ? { ...m, reactions } : m)));
            setGroupMessages((prev) => prev.map((m) => (m._id === messageId ? { ...m, reactions } : m)));
        });
    };

    const unsubscribeFromMessages = () => {
        if (socket) {
            socket.off("newMessage");
            socket.off("newGroupMessage");
            socket.off("messageReaction");
        }
    };

    useEffect(() => {
        subscribeToMessages();
        return () => unsubscribeFromMessages();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket, selectedUser, selectedGroup, users, groups]);

    const totalUnseen =
        Object.values(unseenMessages).reduce((sum, count) => sum + count, 0) +
        Object.values(unseenGroupMessages).reduce((sum, count) => sum + count, 0);

    useEffect(() => {
        document.title = totalUnseen > 0 ? `(${totalUnseen}) QuickChat` : "QuickChat";
    }, [totalUnseen]);

    const value = {
        messages,
        groupMessages,
        aiMessages,
        aiLoading,
        users,
        groups,
        selectedUser,
        setSelectedUser,
        selectedGroup,
        setSelectedGroup,
        selectedAI,
        setSelectedAI,
        showUserInfo,
        setShowUserInfo,
        unseenMessages,
        setUnseenMessages,
        unseenGroupMessages,
        setUnseenGroupMessages,
        totalUnseen,
        sidebarView,
        setSidebarView,
        replyingTo,
        setReplyingTo,
        getUsers,
        getGroups,
        getMessages,
        sendMessage,
        getGroupMessages,
        sendGroupMessage,
        forwardMessage,
        reactToMessage,
        sendAIMessage,
        askAIAbout,
        summarizeConversation,
        createGroup,
        leaveGroup,
        addMembersToGroup,
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};