import type { NextFunction, Response, Request } from "express";
import type { AuthRequest } from "../middlewares/auth";
import { User } from "../models/User";
import { clerkClient, getAuth } from "@clerk/express";


export async function getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const userId = req.userId;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not Found" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500);
        next(error);
    }
}

export async function authCallback(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId: clerkId } = getAuth(req);

        if (!clerkId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        let user = await User.findOne({ clerkId });

        if (!user) {
            //get user info and save into db(sync)
            const clerkUser = await clerkClient.users.getUser(clerkId);

            user = await User.create({
                clerkId,
                name: clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim() :
                    clerkUser.emailAddresses[0]?.emailAddress.split("@")[0] || "User",
                email: clerkUser.primaryEmailAddress?.emailAddress,
                avatar: clerkUser.imageUrl
            });
        };


        res.status(200).json(user);
    } catch (error) {
        res.status(500);
        next(error);
    }
}