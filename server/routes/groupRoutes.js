import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { createGroup, getGroups, leaveGroup, addMembers } from "../controllers/groupController.js";

const groupRouter = express.Router();

groupRouter.post("/", protectRoute, createGroup);
groupRouter.get("/", protectRoute, getGroups);
groupRouter.post("/:id/leave", protectRoute, leaveGroup);
groupRouter.post("/:id/add-members", protectRoute, addMembers);

export default groupRouter;