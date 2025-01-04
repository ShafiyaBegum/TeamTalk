import express from "express";
import {createServer} from "node:http";
import {Server} from "socket.io";
import mongoose from "mongoose";

import cors from "cors";
import userRoutes from "./routes/users.routes.js";
import connectToSocket from "./controllers/socketManager.js";

const app = express();
const server = createServer(app);
const io = connectToSocket(server);



app.set("port", (process.env.PORT || 8000));
app.use(cors());
// app.use(cors({
//     origin: 'http://localhost:5173', // Allow frontend on this port
//     //methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed methods
//     credentials: true // If you are using cookies or auth headers
// }));

app.use(express.json({limit : "40kb"}));
app.use(express.urlencoded({limit: "40kb", extended : true}));

app.use("/api/v1/users", userRoutes);

// app.get("/home", (req, res) => {
//     return res.json({"hello" : "world"})
// });

const start = async() => {
//app.set("mongo_user")
    const connectionDb = await mongoose.connect("mongodb+srv://shafiyabegum:nsdrbuTjhkqQctIa@cluster0.blkxs.mongodb.net/");
    console.log(`MONGO Connected DB Host: ${connectionDb.connection.host}`);
    server.listen(app.get("port"), () => {
        console.log("Listen on port 8000");
    });
}

start();