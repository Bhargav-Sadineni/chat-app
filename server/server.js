// import express from "express";
// import "dotenv/config";
// import cors from "cors";
// import http from "http";
// import { connectDB } from "./lib/db.js";
// import userRouter from "./routes/userRoutes.js";
// import messageRouter from "./routes/messageRoutes.js";
// import { Server } from "socket.io"
// import groupRouter from "./routes/groupRoutes.js";

// // Create Express app and HTTP server
// const app = express();
// const server = http.createServer(app);

// // Initialize socket.io server
// export const io = new Server(server, {
//     cors: { origin: "*" }
// });

// // Store online users
// export const userSocketMap = {}; // { userId: socketId }

// // Socket.io connection handler
// io.on("connection", (socket)=>{
//     const userId = socket.handshake.query.userId;
//     console.log("User Connected", userId);

//     if (userId) userSocketMap[userId] = socket.id;

//     // Emit online users to all connected clients
//     io.emit("getOnlineUsers", Object.keys(userSocketMap));

//     socket.on("disconnect", ()=>{
//         console.log("User Disconnected", userId);
//         delete userSocketMap[userId];
//         io.emit("getOnlineUsers", Object.keys(userSocketMap));
//     });
    
// })

// // Middleware setup
// app.use(express.json({limit: "10mb"}));
// app.use(cors());

// // route setup
// app.use("/api/status", (req, res)=> res.send("Server is live"));
// app.use("/api/auth",userRouter)
// app.use("/api/messages",messageRouter)
// app.use("/api/groups", groupRouter);

// // connect to mongodb
// await connectDB();


//     const PORT = process.env.PORT || 5000;
//     server.listen(PORT,()=> console.log("Server is running on PORT:"+PORT))



import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import groupRouter from "./routes/groupRoutes.js";
import aiRouter from "./routes/aiRoutes.js";
import callRouter from "./routes/callRoutes.js";
import { Server } from "socket.io"
import Group from "./models/Group.js";
import CallLog from "./models/CallLog.js";

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Initialize socket.io server
export const io = new Server(server, {
    cors: { origin: "*" }
});

// Store online users
export const userSocketMap = {}; // { userId: socketId }

// In-memory registry of calls currently ringing/in-progress.
// callId -> { type, isGroup, groupId, callerId, invited: [userId], participants: Set(userId), startedAt, connectedAt }
const activeCalls = {};

const buildUserInfo = (socket) => {
    if (!socket) return null;
    const { userId, fullName, profilePic } = socket.handshake.query;
    return { userId, fullName, profilePic: profilePic || "" };
};

// Persist a finished/failed call to the database
const finalizeCall = async (callId, status) => {
    const call = activeCalls[callId];
    if (!call) return;

    try {
        await CallLog.create({
            callId,
            type: call.type,
            isGroup: call.isGroup,
            group: call.isGroup ? call.groupId : undefined,
            caller: call.callerId,
            participants: Array.from(call.participants),
            invited: call.invited,
            status,
            startedAt: call.startedAt,
            endedAt: new Date(),
            duration: call.connectedAt ? Math.round((Date.now() - call.connectedAt) / 1000) : 0,
        });
    } catch (err) {
        console.log("Failed to save call log:", err.message);
    }

    delete activeCalls[callId];
};

// Socket.io connection handler
io.on("connection", (socket)=>{
    const userId = socket.handshake.query.userId;
    console.log("User Connected", userId);

    if (userId) userSocketMap[userId] = socket.id;

    // Emit online users to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // ---------- Call signaling ----------

    // Start a 1:1 or group call
    socket.on("call:initiate", async ({ callId, type, targetUserId, groupId }) => {
        const caller = buildUserInfo(socket);

        let invitedIds = [];
        let groupName = null;

        if (groupId) {
            const group = await Group.findById(groupId).select("name members");
            if (!group) return;
            groupName = group.name;
            invitedIds = group.members
                .map((m) => m.toString())
                .filter((id) => id !== userId);
        } else if (targetUserId) {
            invitedIds = [targetUserId];
        } else {
            return;
        }

        activeCalls[callId] = {
            type,
            isGroup: !!groupId,
            groupId: groupId || null,
            callerId: userId,
            invited: [...invitedIds, userId],
            participants: new Set([userId]),
            startedAt: new Date(),
            connectedAt: null,
        };

        const onlineInvited = invitedIds.filter((id) => userSocketMap[id]);

        if (onlineInvited.length === 0) {
            socket.emit("call:unavailable", { callId });
            await finalizeCall(callId, "missed");
            return;
        }

        onlineInvited.forEach((id) => {
            io.to(userSocketMap[id]).emit("call:incoming", {
                callId,
                type,
                isGroup: !!groupId,
                groupId: groupId || null,
                groupName,
                caller,
            });
        });
    });

    // Callee accepts — joins the call's participant set
    socket.on("call:accept", ({ callId }) => {
        const call = activeCalls[callId];
        if (!call) return;

        call.participants.add(userId);
        if (call.participants.size >= 2 && !call.connectedAt) {
            call.connectedAt = Date.now();
        }

        const participantInfos = Array.from(call.participants).map((id) => {
            if (id === userId) return buildUserInfo(socket);
            const sId = userSocketMap[id];
            return sId ? buildUserInfo(io.sockets.sockets.get(sId)) : { userId: id };
        });

        call.participants.forEach((pid) => {
            const sId = userSocketMap[pid];
            if (sId) io.to(sId).emit("call:participants-update", { callId, participants: participantInfos });
        });
    });

    // Callee declines
    socket.on("call:reject", async ({ callId }) => {
        const call = activeCalls[callId];
        if (!call) return;

        const callerSocketId = userSocketMap[call.callerId];
        if (callerSocketId) {
            io.to(callerSocketId).emit("call:rejected", { callId, userId });
        }

        // A single rejection ends a 1:1 call; group calls keep ringing for others
        if (!call.isGroup) {
            await finalizeCall(callId, "rejected");
        }
    });

    // WebRTC signaling relay (offer / answer / ICE candidates)
    socket.on("call:signal", ({ callId, toUserId, data }) => {
        const targetSocketId = userSocketMap[toUserId];
        if (targetSocketId) {
            io.to(targetSocketId).emit("call:signal", { callId, fromUserId: userId, data });
        }
    });

    // A participant leaves an ongoing/ringing call
    socket.on("call:leave", async ({ callId }) => {
        const call = activeCalls[callId];
        if (!call) return;

        call.participants.delete(userId);
        const remaining = Array.from(call.participants);

        remaining.forEach((pid) => {
            const sId = userSocketMap[pid];
            if (sId) io.to(sId).emit("call:peer-left", { callId, userId });
        });

        if (remaining.length <= 1) {
            const status = call.connectedAt ? "completed" : (call.callerId === userId ? "no-answer" : "missed");

            remaining.forEach((pid) => {
                const sId = userSocketMap[pid];
                if (sId) io.to(sId).emit("call:ended", { callId });
            });

            await finalizeCall(callId, status);
        }
    });

    socket.on("disconnect", async ()=>{
        console.log("User Disconnected", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));

        // Clean up any calls this user was part of
        for (const callId of Object.keys(activeCalls)) {
            const call = activeCalls[callId];
            if (call.participants.has(userId)) {
                call.participants.delete(userId);
                const remaining = Array.from(call.participants);
                remaining.forEach((pid) => {
                    const sId = userSocketMap[pid];
                    if (sId) io.to(sId).emit("call:peer-left", { callId, userId });
                });
                if (remaining.length <= 1) {
                    remaining.forEach((pid) => {
                        const sId = userSocketMap[pid];
                        if (sId) io.to(sId).emit("call:ended", { callId });
                    });
                    const status = call.connectedAt ? "completed" : "no-answer";
                    await finalizeCall(callId, status);
                }
            }
        }
    });

})

// Middleware setup
app.use(express.json({limit: "10mb"}));
app.use(cors());

// route setup
app.use("/api/status", (req, res)=> res.send("Server is live"));
app.use("/api/auth",userRouter)
app.use("/api/messages",messageRouter)
app.use("/api/groups",groupRouter)
app.use("/api/ai",aiRouter)
app.use("/api/calls",callRouter)

// connect to mongodb
await connectDB();

const PORT = process.env.PORT || 5000;
server.listen(PORT,()=> console.log("Server is running on PORT:"+PORT))