import { askGemini, askGeminiWithRetry } from "../lib/gemini.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import Group from "../models/Group.js";

const MAX_CONTEXT_MESSAGES = 25;
const MAX_TRANSCRIPT_CHARS = 4000; // smaller transcript = faster Gemini response

// Builds a readable transcript of the recent conversation with a user or group
const buildConversationTranscript = async ({ userId, groupId, myId, myName }) => {
    let query;
    if (groupId) {
        query = { groupId };
    } else if (userId) {
        query = {
            $or: [
                { senderId: myId, receiverId: userId },
                { senderId: userId, receiverId: myId },
            ],
        };
    } else {
        return { transcript: "", label: "" };
    }

    const recentMessages = await Message.find(query)
        .sort({ createdAt: -1 })
        .limit(MAX_CONTEXT_MESSAGES);
    recentMessages.reverse();

    if (recentMessages.length === 0) {
        return { transcript: "", label: "" };
    }

    let label = "the conversation";
    let nameById = {};

    if (groupId) {
        const group = await Group.findById(groupId).populate("members", "fullName");
        label = group ? `the group "${group.name}"` : "the group chat";
        nameById = Object.fromEntries((group?.members || []).map((m) => [m._id.toString(), m.fullName]));
    } else {
        const otherUser = await User.findById(userId).select("fullName");
        label = otherUser ? `the chat with ${otherUser.fullName}` : "the conversation";
        nameById[userId] = otherUser?.fullName || "Contact";
        nameById[myId.toString()] = myName;
    }

    let transcript = recentMessages
        .map((m) => {
            const senderName = m.senderId.toString() === myId.toString()
                ? myName
                : (nameById[m.senderId.toString()] || "User");
            const body = m.text ? m.text.slice(0, 500) : "[sent an image]";
            return `${senderName}: ${body}`;
        })
        .join("\n");

    if (transcript.length > MAX_TRANSCRIPT_CHARS) {
        transcript = transcript.slice(-MAX_TRANSCRIPT_CHARS);
    }

    return { transcript, label };
};

// General-purpose chat with the AI assistant — optionally grounded in a specific chat's context
export const chatWithAI = async (req, res) => {
    try {
        const { message, history, userId, groupId } = req.body;
        const myId = req.user._id;
        const myName = req.user.fullName;

        if (!message || !message.trim()) {
            return res.json({ success: false, message: "Message is required" });
        }

        const historyText = (history || [])
            .slice(-10)
            .map((m) => `${m.role === "ai" ? "Assistant" : "User"}: ${m.text}`)
            .join("\n");

        let contextBlock = "";
        let usesContext = false;
        if (userId || groupId) {
            const { transcript, label } = await buildConversationTranscript({ userId, groupId, myId, myName });
            if (transcript) {
                contextBlock = `\nHere are the recent messages from ${label}, which you can reference to answer the user's question:\n"""\n${transcript}\n"""\n`;
                usesContext = true;
            }
        }

        const prompt = `You are a helpful assistant inside a chat app called QuickChat.
Answer the user's question clearly and concisely.
${contextBlock}${historyText ? `\nConversation with the assistant so far:\n${historyText}\n` : ""}
User: ${message}
Assistant:`;

        const reply = usesContext ? await askGeminiWithRetry(prompt) : await askGemini(prompt);

        res.json({ success: true, reply });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Summarize the recent conversation with a user or group
export const summarizeConversation = async (req, res) => {
    try {
        const { userId, groupId } = req.body;
        const myId = req.user._id;
        const myName = req.user.fullName;

        if (!userId && !groupId) {
            return res.json({ success: false, message: "userId or groupId is required" });
        }

        const { transcript, label } = await buildConversationTranscript({ userId, groupId, myId, myName });

        if (!transcript) {
            return res.json({ success: true, summary: "There's nothing to summarize yet — no messages here." });
        }

        const prompt = `Summarize the following recent chat messages from ${label} in 2-4 short sentences. Capture the key points and mention if anything clearly needs a reply:\n\n${transcript}`;

        const summary = await askGeminiWithRetry(prompt);

        res.json({ success: true, summary });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};