const express = require("express");
const route = require("./routes");
const cors = require("cors");
const { Server } = require("socket.io");
const app = express();
const bodyParser = require("body-parser");
const dotenv = require("dotenv").config();
const { createServer } = require("http");
const PORT = process.env.PORT;
const db = require("./config/db/db");
const { errorHandler, notFound } = require("./middlewares/ErrorHandler");
const cookieParser = require("cookie-parser");
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    pingTimeout:60000,
    origin: "http://localhost:5173",
  }
});
// const io = new Server(httpServer,{
// cors:{
//   origin:'http://localhost:5173/',
//   methods: ["GET", "POST"]
// }
// });
let onlineUser =[]

const addUser = (userName, socketId)=>{
   !onlineUser.some(user => user.userName === userName) && onlineUser.push({userName,socketId})
}

const removeUser = (socketId)=>{
  onlineUser = onlineUser.filter(user => user.socketId !== socketId)
}

const getUser = (userName)=>{
  let findUser = onlineUser.find(user => user.userName === userName)
  return findUser
}
io.on("connection", (socket) => {
  socket.on("newUserOnline",(userName)=>{
    addUser(userName,socket.id)
  })


  socket.on("sendNotification",({senderName,receiverName,type})=>{
    const receiver = getUser(receiverName)
    console.log(receiver, onlineUser)
    io.to(receiver?.socketId).emit("getNotification",{
      senderName,
      type
    })  
  })
});



app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json()); //middleware
app.use(cookieParser());
app.use(cors());
// connect MongoDB
db.connectToDb();
route(app);
// Error middleware
app.use(notFound);
app.use(errorHandler);

httpServer.listen(process.env.PORT, () => {
  console.log(`App are listening on Port:3000 `);
});
