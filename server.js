const { v4: randomizer } = require("uuid");
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});

app.use('/peerjs', peerServer)
app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.redirect(`/R${randomizer()}`);
});
app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (data) => {
    console.log("join-room", data);
    socket.join(data.roomId);
    socket.to(data.roomId).emit("user-joined", data.userId);
  });
  socket.on("leave-room", (data) => {
    console.log("leave-room", data);
    socket.to(data.roomId).emit("user-leaved", data.userId);
  });
});

server.listen(3001);
