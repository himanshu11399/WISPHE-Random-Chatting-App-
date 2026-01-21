import { Router } from "express"
import { protectRoute } from "../middlewares/auth";
import { getMe, authCallback } from "../controllers/authController";

const router = Router();

// /api/auth/me
router.get("/me", protectRoute, getMe);
router.post("/callback",authCallback);



export default router;