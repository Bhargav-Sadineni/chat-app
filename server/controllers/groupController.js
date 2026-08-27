import Group from "../models/Group.js";
import Message from "../models/Message.js";

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

// Get all groups the logged-in user belongs to, with unseen message counts
export const getGroups = async (req, res) => {
    try {
        const userId = req.user._id;

        const groups = await Group.find({ members: userId }).populate("members", "-password");

        const unseenGroupMessages = {};

        await Promise.all(
            groups.map(async (group) => {
                const count = await Message.countDocuments({
                    groupId: group._id,
                    senderId: { $ne: userId },
                    seenBy: { $ne: userId },
                });
                if (count > 0) {
                    unseenGroupMessages[group._id] = count;
                }
            })
        );

        res.json({ success: true, groups, unseenGroupMessages });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Leave a group — removes the logged-in user from its members.
// If they were the last member, the group is deleted entirely.
export const leaveGroup = async (req, res) => {
    try {
        const { id: groupId } = req.params;
        const userId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.json({ success: false, message: "Group not found" });
        }

        group.members = group.members.filter(
            (memberId) => memberId.toString() !== userId.toString()
        );

        if (group.members.length === 0) {
            await Group.findByIdAndDelete(groupId);
        } else {
            if (group.admin.toString() === userId.toString()) {
                group.admin = group.members[0]; // hand off admin to the next member
            }
            await group.save();
        }

        res.json({ success: true });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Add one or more members to an existing group
export const addMembers = async (req, res) => {
    try {
        const { id: groupId } = req.params;
        const { memberIds } = req.body;
        const userId = req.user._id;

        if (!memberIds || memberIds.length === 0) {
            return res.json({ success: false, message: "At least one member is required" });
        }

        const group = await Group.findById(groupId);
        if (!group) {
            return res.json({ success: false, message: "Group not found" });
        }

        const isMember = group.members.some((m) => m.toString() === userId.toString());
        if (!isMember) {
            return res.json({ success: false, message: "You're not a member of this group" });
        }

        const updatedMemberIds = Array.from(
            new Set([...group.members.map((m) => m.toString()), ...memberIds])
        );

        group.members = updatedMemberIds;
        await group.save();

        const populatedGroup = await group.populate("members", "-password");

        res.json({ success: true, group: populatedGroup });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};