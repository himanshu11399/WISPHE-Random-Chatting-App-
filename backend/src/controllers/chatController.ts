import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middlewares/auth";
import { Chat } from "../models/Chat";


export async function getChats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const userId = req.userId;

        const chats = await Chat.find({ participants: userId })
            .populate("participants", "name email avatar")
            .populate("lastMessage")
            .populate("owner", "name email")
            .sort({ lastMessageAt: -1 });


        const formattedChats = chats.map((chat) => {
            const otherParticipant = chat.participants.find((p) => p._id.toString() !== userId);

            return {
                _id: chat._id,
                participant: otherParticipant,
                lastMessage: chat.lastMessage,
                lastMessageAt: chat.lastMessageAt,
                owner: chat.owner,
                createdAt: chat.createdAt,
            }
        });

        res.json(formattedChats);
    } catch (error) {
        res.status(500);
        next(error);
    }
}

export async function createChat(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const userId = req.userId;
        const { participantId } = req.params;

        //check chat is exist or not
        let chat = await Chat.findOne({
            participants: { $all: [userId, participantId] }
        })
            .populate("participants", "name email avatar")
            .populate("lastMessage").
            populate("owner", "name email");

        if (!chat) {
            const newChat = new Chat({ participants: [userId, participantId], owner: userId });
            await newChat.save();
            chat = (await newChat.populate("participants", "name email avatar"));
        }

        const otherParticipant = chat.participants.find((p: any) => p._id.toString() !== userId);

        res.json({
            _id: chat._id,
            participantId: otherParticipant ?? null,
            lastMessage: chat.lastMessage,
            lastMessageAt: chat.lastMessageAt,
            owner: chat.owner,
            createdAt: chat.createdAt,

        })


    } catch (error) {
        res.status(500);
        next(error);
    }
}

export async function deleteChat(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const userId = req.userId;
        const ownerId = req.params;

        await Chat.findOneAndDelete({ participants: [userId, ownerId] });

        res.status(200).json({
            message: "Delete Sucessfully"
        })
    } catch (error) {
        res.status(500);
        next(error);
    }
}
