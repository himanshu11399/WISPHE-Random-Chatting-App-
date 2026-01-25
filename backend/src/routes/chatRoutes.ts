import { Router } from "express"
import { protectRoute } from "../middlewares/auth";
import { getChats, createChat, deleteChat } from "../controllers/chatController";

const router = Router();

router.use(protectRoute);

router.get("/", getChats);
router.post("/with/:participantId", createChat)
router.delete("/delete/chat/:ownerId",deleteChat)

export default router;