// import express from "express";
// import { protectRoute } from "../middleware/auth.js";
// import {
//     getMessages,
//     getUsersForSidebar,
//     markMessageAsSeen,
//     sendMessage,
//     getGroupMessages,
//     sendGroupMessage,
//     markGroupMessagesSeen,
// } from "../controllers/messageController.js";

// const messageRouter = express.Router();

// messageRouter.get("/users", protectRoute, getUsersForSidebar);
// messageRouter.get("/group/:id", protectRoute, getGroupMessages);
// messageRouter.post("/send-group/:id", protectRoute, sendGroupMessage);
// messageRouter.put("/mark-group/:id", protectRoute, markGroupMessagesSeen);
// messageRouter.get("/:id", protectRoute, getMessages);
// messageRouter.put("/mark/:id", protectRoute, markMessageAsSeen);
// messageRouter.post("/send/:id", protectRoute, sendMessage);

// export default messageRouter;

import express from "express";
import { protectRoute } from "../middleware/auth.js";
import {
    getMessages,
    getUsersForSidebar,
    markMessageAsSeen,
    sendMessage,
    getGroupMessages,
    sendGroupMessage,
    markGroupMessagesSeen,
    reactToMessage,
} from "../controllers/messageController.js";

const messageRouter = express.Router();

messageRouter.get("/users", protectRoute, getUsersForSidebar);
messageRouter.get("/group/:id", protectRoute, getGroupMessages);
messageRouter.post("/send-group/:id", protectRoute, sendGroupMessage);
messageRouter.put("/mark-group/:id", protectRoute, markGroupMessagesSeen);
messageRouter.put("/react/:id", protectRoute, reactToMessage);
messageRouter.get("/:id", protectRoute, getMessages);
messageRouter.put("/mark/:id", protectRoute, markMessageAsSeen);
messageRouter.post("/send/:id", protectRoute, sendMessage);

export default messageRouter;