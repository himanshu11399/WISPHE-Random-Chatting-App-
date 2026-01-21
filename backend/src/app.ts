import express from "express"
import authRoutes from "./routes/authRoutes.js"
import chatRoutes from "./routes/chatRoutes.js"
import messageRoutes from "./routes/messageRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import cors from "cors"
import { clerkMiddleware } from '@clerk/express'
import { errorHandler } from "./middlewares/errorHandler.js"



const app = express();
//Parse incoming JSON request bodies and males them availabe as request body in your route handler
app.use(express.json());
app.use(cors({
    origin: "*",
}));

app.use(clerkMiddleware());


app.get("/health", (req, res) => {
    res.json({ status: "ok", message: "Server is Running" })
});

app.use("/api/auth", authRoutes)
app.use("/api/chats", chatRoutes)
app.use("/api/messages", messageRoutes)
app.use("/api/users", userRoutes)

// Error handler must come after all the routes and other middlewares so they can ctach the error 
// passed or thrown inside the async handler
app.use(errorHandler);

export default app;