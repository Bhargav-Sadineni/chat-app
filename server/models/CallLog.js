import mongoose from "mongoose";

const callLogSchema = new mongoose.Schema({
    callId: { type: String, required: true },
    type: { type: String, enum: ["audio", "video"], required: true },
    isGroup: { type: Boolean, default: false },
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
    caller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // Everyone who actually joined the call (accepted), including the caller
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // Everyone who was rung, for missed-call bookkeeping
    invited: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    status: { type: String, enum: ["completed", "missed", "rejected", "no-answer"], required: true },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date },
    duration: { type: Number, default: 0 }, // seconds
}, { timestamps: true });

const CallLog = mongoose.model("CallLog", callLogSchema);

export default CallLog;