
require("dotenv").config();
const express = require('express')
const app = express();

const http = require("http");              // 👈 NEW
const { Server } = require("socket.io");

const main =  require('./config/db')
const cookieParser =  require('cookie-parser');
const authRouter=require("./routes/userAuth");
const redisClient=require("./config/redis")
const problemRouter = require("./routes/problemcreater");
const submitrouter = require('./routes/submit');
const cors = require("cors")
const Airouter = require("./routes/aiRoot")
const videoRouter = require("./routes/videoInsertion");
const contestRouter = require("./routes/contestCreation");

app.use(cors({
    origin: ['http://localhost:5173',"https://codemaster-peach.vercel.app"],
    credentials: true 
}))

app.use(express.json());
app.use(cookieParser());

app.use("/auth",authRouter);
app.use("/problem",problemRouter);
app.use("/submit",submitrouter);
app.use("/chat",Airouter);
app.use("/video",videoRouter);
app.use("/contest",contestRouter);

// 👇 CREATE HTTP SERVER
const server = http.createServer(app);

// 👇 ATTACH SOCKET.IO
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://codemaster-peach.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// 👇 MAKE GLOBAL (so you can use in routes/controllers)
global.io = io;

// 👇 SOCKET LOGIC
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("joinContest", (contestId) => {
        socket.join(contestId);
        console.log("User joined contest:", contestId);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

const Insialization=async()=>{
    
    try{
        await Promise.all([main(),redisClient.connect()]);
        console.log("DB Connected");
        
        server.listen(process.env.PORT, () => {
            console.log("Server listening at port number: " + `${process.env.PORT}`);
        });

    }
    catch(err){
        console.log("Error: "+err);
    }
}
Insialization();
