const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
	allowEIO3: true,
	cors: {
		origin: "*",
	},
	transports: ["polling", "websocket"],
});

io.use((socket, next) => {
	const username = socket.handshake.auth?.username;
	if (!username) return next(new Error("Không tìm thây username"));
	socket.username = username;
	next();
});

io.on("connection", (socket, next) => {
	const users = [];
	for (let [id, socket] of io.of("/").sockets) {
		users.push({
			userId: id,
			username: socket.username,
		});
	}
	socket.emit("getUsers", users);

	socket.broadcast.emit("userJustConnected", {
		userId: socket.id,
		username: socket.username,
	});

	socket.on("privateMessage", ({message, to}) => {
		socket.to(to).emit("privateMessageToReceiver", {
      message,
      from: socket.id,
    });
	});

	socket.on("disconnect", () => {
		console.log("user disconnected");
	});
});

server.listen(8000, () => {
	console.log("listening on *:8000");
});
