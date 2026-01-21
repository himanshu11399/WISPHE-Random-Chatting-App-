import { Router } from "express"
import { protectRoute } from "../middlewares/auth";
import { getUsers } from "../controllers/userController";
const router = Router();

//Get api/users/
router.get("/",protectRoute,getUsers);


export default router;