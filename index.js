const express = require("express");
const dotenv = require("dotenv");
dotenv.config({});
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();

let elements = [];

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  io.to(socket.id).emit("whiteboard-state", elements);

  socket.on("element-update", (elementData) => {
    updateElementInElements(elementData);

    socket.broadcast.emit("element-update", elementData);
  });

  socket.on("whiteboard-clear", () => {
    elements = [];

    socket.broadcast.emit("whiteboard-clear");
  });

  socket.on("cursor-position", (cursorData) => {
    socket.broadcast.emit("cursor-position", {
      ...cursorData,
      userId: socket.id,
    });
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("user-disconnected", socket.id);
  });
});

app.get("/", (req, res) => {
  res.send("Hello server is working");
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => console.log(`Server running on PORT : ${PORT}`));

const updateElementInElements = (elementData) => {
  const index = elements.findIndex((ele) => ele.id === elementData.id);

  if (index === -1) return elements.push(elementData);

  elements[index] = elementData;
};
