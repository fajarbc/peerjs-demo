const socket = io("/");
const peer = new Peer(undefined, {
  host: "/",
  path: '/peerjs',
  port: "3001",
});
const videos = document.getElementById("video");
const peers = {};
const myVideo = createVideo();
myVideo.muted = true;

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {
      console.log("ada yang mau masuk");
      call.answer(stream);
      const video = createVideo();
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-joined", (userId) => {
      setTimeout(() => {
        console.log("user join", userId);
        userJoinRoom(userId, stream);
      }, 1000);
    });
  });

  socket.on("user-leaved", (userId) => {
  if (peers[userId]) peers[userId].close();
});

peer.on("open", (id) => {
  socket.emit("join-room", { roomId: ROOM_ID, userId: id });
});

function userJoinRoom(userId, stream) {
  const call = peer.call(userId, stream);
  const video = createVideo();
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
    socket.emit("leave-room", { roomId: ROOM_ID, userId });
  });

  peers[userId] = call;
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videos.append(video);
}

function createVideo() {
  return document.createElement("video");
}
