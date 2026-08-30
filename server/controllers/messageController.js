import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";
import Group from "../models/Group.js";

// Treats anything starting with http as an already-hosted URL (forwarded
// content) instead of fresh base64 data that needs uploading.
const isRemoteUrl = (str) => typeof str === "string" && str.startsWith("http");

// Get all users except the logged in user
export const getUsersForSidebar = async (req, res)=>{
    try {
        const userId = req.user._id;

        const filteredUsers = await User.find({
            _id: { $ne: userId }
        }).select("-password");

        const unseenMessages = {};

        const promises = filteredUsers.map(async (user)=>{
            const messages = await Message.find({senderId:user._id, receiverId:userId,seen:false})
            if(messages.length>0){
                unseenMessages[user._id] = messages.length;
            }
        });

        await Promise.all(promises)
        res.json({success:true,users:filteredUsers,unseenMessages})
    } catch (error) {
        console.log(error.message)
        res.json({success:false,message:error.message})
    }
}

// Get all messages for selected user
export const getMessages = async (req, res) => {
    try {
        const { id: selectedUserId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: selectedUserId },
                { senderId: selectedUserId, receiverId: myId },
            ]
        });

        await Message.updateMany({senderId: selectedUserId,receiverId:myId},
            {seen:true})
        
        res.json({success:true,messages})
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// api to mark message as seen using message id
export const markMessageAsSeen = async (req, res)=>{
    try {
        const { id } = req.params;

        await Message.findByIdAndUpdate(id, { seen: true });

        res.json({ success: true });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}


// Send message to selected user
export const sendMessage = async (req, res) => {
    try {
        const { text, image, file, fileName, fileType, replyTo, clientSentAt } = req.body;

        const receiverId = req.params.id;
        const senderId = req.user._id;

        let imageUrl;
        if (image) {
            imageUrl = isRemoteUrl(image) ? image : (await cloudinary.uploader.upload(image)).secure_url;
        }

        let fileUrl;
        if (file) {
            fileUrl = isRemoteUrl(file) ? file : (await cloudinary.uploader.upload(file, { resource_type: "auto" })).secure_url;
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image: imageUrl,
            fileUrl,
            fileName: fileUrl ? fileName : undefined,
            fileType: fileUrl ? fileType : undefined,
            replyTo: replyTo || undefined,
        });

        const receiverSocketId = userSocketMap[receiverId];

        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", { ...newMessage.toObject(), clientSentAt });
        }

        res.json({ success: true, newMessage });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Get all messages for a group
export const getGroupMessages = async (req, res) => {
    try {
        const { id: groupId } = req.params;

        const messages = await Message.find({ groupId }).sort({ createdAt: 1 });

        res.json({ success: true, messages });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Send a message to a group
export const sendGroupMessage = async (req, res) => {
    try {
        const { text, image, file, fileName, fileType, replyTo, clientSentAt } = req.body;
        const { id: groupId } = req.params;
        const senderId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.json({ success: false, message: "Group not found" });
        }

        let imageUrl;
        if (image) {
            imageUrl = isRemoteUrl(image) ? image : (await cloudinary.uploader.upload(image)).secure_url;
        }

        let fileUrl;
        if (file) {
            fileUrl = isRemoteUrl(file) ? file : (await cloudinary.uploader.upload(file, { resource_type: "auto" })).secure_url;
        }

        const newMessage = await Message.create({
            senderId,
            groupId,
            text,
            image: imageUrl,
            fileUrl,
            fileName: fileUrl ? fileName : undefined,
            fileType: fileUrl ? fileType : undefined,
            replyTo: replyTo || undefined,
            seenBy: [senderId],
        });

        group.members.forEach((memberId) => {
            if (memberId.toString() === senderId.toString()) return;
            const socketId = userSocketMap[memberId.toString()];
            if (socketId) {
                io.to(socketId).emit("newGroupMessage", { ...newMessage.toObject(), clientSentAt });
            }
        });

        res.json({ success: true, newMessage });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Mark all of a group's messages as seen by the logged-in user
export const markGroupMessagesSeen = async (req, res) => {
    try {
        const { id: groupId } = req.params;
        const userId = req.user._id;

        await Message.updateMany(
            { groupId, senderId: { $ne: userId }, seenBy: { $ne: userId } },
            { $addToSet: { seenBy: userId } }
        );

        res.json({ success: true });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Add, change, or remove the logged-in user's reaction to a message
export const reactToMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { emoji } = req.body;
        const userId = req.user._id;

        if (!emoji) {
            return res.json({ success: false, message: "Emoji is required" });
        }

        const message = await Message.findById(id);
        if (!message) {
            return res.json({ success: false, message: "Message not found" });
        }

        const existingIndex = message.reactions.findIndex(
            (r) => r.userId.toString() === userId.toString()
        );

        if (existingIndex !== -1) {
            if (message.reactions[existingIndex].emoji === emoji) {
                message.reactions.splice(existingIndex, 1); // toggle off
            } else {
                message.reactions[existingIndex].emoji = emoji; // change reaction
            }
        } else {
            message.reactions.push({ userId, emoji });
        }

        await message.save();

        const payload = { messageId: id, reactions: message.reactions };

        if (message.groupId) {
            const group = await Group.findById(message.groupId);
            if (group) {
                group.members.forEach((memberId) => {
                    const socketId = userSocketMap[memberId.toString()];
                    if (socketId) io.to(socketId).emit("messageReaction", payload);
                });
            }
        } else {
            const otherId = message.senderId.toString() === userId.toString()
                ? message.receiverId?.toString()
                : message.senderId.toString();
            [otherId, userId.toString()].forEach((pid) => {
                const socketId = userSocketMap[pid];
                if (socketId) io.to(socketId).emit("messageReaction", payload);
            });
        }

        res.json({ success: true, reactions: message.reactions });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};