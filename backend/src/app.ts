import express from "express"
import authRoutes from "./routes/authRoutes.js"
import chatRoutes from "./routes/chatRoutes.js"
import messageRoutes from "./routes/messageRoutes.js"
import userRoutes from "./routes/userRoutes.js"



const app = express();
app.use(express.json()); //Parse incoming JSON request bodies and males them availabe as request body in your route handler


app.get("/health", (req, res) => {
    res.json({ status: "ok", message: "Server is Running" })
});

app.use("/api/auth", authRoutes)
app.use("/api/chats", chatRoutes)
app.use("/api/messages", messageRoutes)
app.use("/api/users", userRoutes)

export default app;