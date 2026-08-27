import CallLog from "../models/CallLog.js";

// Get all call history involving the logged-in user (1:1 and group), most recent first
export const getCallHistory = async (req, res) => {
    try {
        const userId = req.user._id;

        const calls = await CallLog.find({
            $or: [{ participants: userId }, { invited: userId }],
        })
            .populate("participants", "fullName profilePic")
            .populate("invited", "fullName profilePic")
            .populate("caller", "fullName profilePic")
            .populate("group", "name")
            .sort({ startedAt: -1 })
            .limit(100);

        res.json({ success: true, calls });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Get call history with a specific 1:1 contact
export const getCallHistoryWithUser = async (req, res) => {
    try {
        const myId = req.user._id;
        const { userId } = req.params;

        const calls = await CallLog.find({
            isGroup: false,
            $and: [
                { $or: [{ participants: myId }, { invited: myId }] },
                { $or: [{ participants: userId }, { invited: userId }] },
            ],
        })
            .populate("participants", "fullName profilePic")
            .populate("caller", "fullName profilePic")
            .sort({ startedAt: -1 })
            .limit(50);

        res.json({ success: true, calls });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Get call history for a group
export const getGroupCallHistory = async (req, res) => {
    try {
        const { groupId } = req.params;

        const calls = await CallLog.find({ isGroup: true, group: groupId })
            .populate("participants", "fullName profilePic")
            .populate("caller", "fullName profilePic")
            .sort({ startedAt: -1 })
            .limit(50);

        res.json({ success: true, calls });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};