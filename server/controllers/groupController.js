import Group from "../models/Group.js";

// Create a new group with the logged-in user as admin
export const createGroup = async (req, res) => {
    try {
        const { name, memberIds } = req.body;
        const userId = req.user._id;

        if (!name || !memberIds || memberIds.length === 0) {
            return res.json({ success: false, message: "Group name and at least one member are required" });
        }

        const members = Array.from(new Set([...memberIds, userId.toString()]));

        const group = await Group.create({
            name,
            members,
            admin: userId,
        });

        const populatedGroup = await group.populate("members", "-password");

        res.json({ success: true, group: populatedGroup });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Get all groups the logged-in user belongs to
export const getGroups = async (req, res) => {
    try {
        const userId = req.user._id;

        const groups = await Group.find({ members: userId }).populate("members", "-password");

        res.json({ success: true, groups });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};