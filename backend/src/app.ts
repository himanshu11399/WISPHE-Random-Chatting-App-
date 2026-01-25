import express from "express"
import authRoutes from "./routes/authRoutes"
import chatRoutes from "./routes/chatRoutes"
import messageRoutes from "./routes/messageRoutes"
import userRoutes from "./routes/userRoutes"
import cors from "cors"
import { clerkMiddleware } from '@clerk/express'
import { errorHandler } from "./middlewares/errorHandler"
import path from "path"


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


//Serve static files in production
if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname,"../../web/dist")))
    app.get("/{any*}",(req,res)=>{
        res.sendFile(path.join(__dirname,"../../web/dist/index.html"))
    })
}

export default app;