import app from "./src/app.js"
import { connectDB } from "./src/config/database.js"
import {createServer} from "http";
import { initializeSocket } from "./src/utils/socket.js";

const PORT = process.env.PORT || 3000;

const httpServer=createServer(app);

initializeSocket(httpServer);

connectDB().then(() => {
    httpServer.listen(PORT, () => {
        console.log(` Server running at http://localhost:${PORT}`);
    });
});
