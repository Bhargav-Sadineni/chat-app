import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { getCallHistory, getCallHistoryWithUser, getGroupCallHistory } from "../controllers/callController.js";

const callRouter = express.Router();

callRouter.get("/", protectRoute, getCallHistory);
callRouter.get("/user/:userId", protectRoute, getCallHistoryWithUser);
callRouter.get("/group/:groupId", protectRoute, getGroupCallHistory);

export default callRouter;