import { Socket, Server as SocketIOServer } from "socket.io";
import { Server as httpServer } from "http";
import { verifyToken } from "@clerk/express";
import { Message } from "../models/Message";
import { User } from "../models/User";
import { Chat } from "../models/Chat";

interface SocketWithUserId extends Socket {
    userId?: string;
}

//Store online users in memory :userId->socketId
export const onlineUsers: Map<string, string> = new Map();

export const initializeSocket = (httpServer: httpServer) => {
    const allowedOrigins = [
        "http://localhost:3000", //For web frontend
        "http://localhost:8081",  //For Expo Dev Client
        process.env.FRONTEND_URL, //For production frontend
    ].filter(Boolean) as string[];

    const io = new SocketIOServer(httpServer, { cors: { origin: allowedOrigins } });


    //Verify Socket Connection -if the user is authenticated ,we will store the user
    // in the socket object for future use
    io.use(async (Socket, next) => {
        const token = Socket.handshake.auth.token;  //this is what user will send from client

        if (!token) {
            return next(new Error("Authentication error: Token not provided"));
        }

        try {
            const session = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY as string });

            const clerkId = session.sub;

            const user = await User.findOne({ clerkId });
            if (!user) {
                return next(new Error("Authentication error: User not found"));
            }

            (Socket as SocketWithUserId).userId = user._id.toString();

            return next();
        } catch (error: any) {
            return next(new Error("Authentication error: Invalid token"));
        }

    });


    //this "connection" event will be fired when a client connects to the server
    // it is an built-in event in socket.io
    // it should be written like this
    io.on("connection", (socket) => {
        const userId = (socket as SocketWithUserId).userId;
        console.log(`User connected: ${userId}`);

        //Send list of currently online users to the newly connected Clients
        socket.emit("online-users", { userIds: Array.from(onlineUsers.keys()) });


        //Store user in the onlineUsers map
        onlineUsers.set(userId as string, socket.id);

        //notify all other clients about the newly online user
        socket.broadcast.emit("user-online", { userId });

        socket.join(`user:${userId}`);


        socket.on("join-chat", (chatId: string) => {
            socket.join(`chat:${chatId}`);
        });

        socket.on("leave-chat", (chatId: string) => {
            socket.leave(`chat:${chatId}`);
        });

        //Handle sending messages
        socket.on("send-message", async (data: { chatId: string, content: string }) => {
            const { chatId, content } = data;
            try {
                const chat = await Chat.findOne({
                    _id: chatId,
                    participants: userId
                });

                if (!chat) {
                    socket.emit("socket-error", { message: "Chat Not Found or Access Denied" });
                    return;
                }

                const message = await Message.create({
                    chat: chatId,
                    sender: userId,
                    text: content,
                });

                chat.lastMessage = message._id;
                chat.lastMessageAt = new Date();
                await chat.save();

                await message.populate("sender", "name email avatar");

                // emit the new message to all participants in the chat
                io.to(`chat:${chatId}`).emit("new-message", message);

                //also emit to participants personal rooms (for chat list view)
                for (const participantId of chat.participants) {
                    io.to(`user:${participantId.toString()}`).emit("chat-updated", {
                        chatId,
                        lastMessage: message,
                        lastMessageAt: chat.lastMessageAt
                    });
                }


            } catch (error) {
                socket.emit("socket-error", { message: "Failed to send message" });
            }
        });


        socket.on("typing", (data: { chatId: string }) => {
            const { chatId } = data;
            socket.to(`chat:${chatId}`).emit("typing", { userId });
        });

        socket.on("stop-typing", (data: { chatId: string }) => {
            const { chatId } = data;
            socket.to(`chat:${chatId}`).emit("stop-typing", { userId });
        });

        socket.on("disconnect", () => {
            console.log(`User disconnected: ${userId}`);
            onlineUsers.delete(userId as string);
            //notify all other clients about the offline user
            socket.broadcast.emit("user-offline", { userId });
        });
    });

    return io;
}