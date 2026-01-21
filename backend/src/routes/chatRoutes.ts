import { Router } from "express"
import { protectRoute } from "../middlewares/auth";
import { getChats, createChat } from "../controllers/chatController";

const router = Router();

router.use(protectRoute);

router.get("/", getChats);
router.post("/with/:participantId", createChat)

export default router;