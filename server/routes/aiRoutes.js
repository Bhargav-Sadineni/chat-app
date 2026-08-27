import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { chatWithAI, summarizeConversation } from "../controllers/aiController.js";

const aiRouter = express.Router();

aiRouter.post("/chat", protectRoute, chatWithAI);
aiRouter.post("/summarize", protectRoute, summarizeConversation);

export default aiRouter;