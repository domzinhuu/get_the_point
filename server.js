import express from "express";
import http from "http";
import createGame from "./public/game.js";
import socketio from "socket.io";

const app = express();
const server = http.createServer(app);
const sockets = socketio(server);

app.use(express.static("public"));

app.get("/game/:id", (req, res) => {});

const game = createGame();

game.subscribe((command) => {
  sockets.emit(command.type, command);
});

sockets.on("connection", (socket) => {
  const command = { playerId: socket.id };
  console.log(`> Player connected on server with id ${command.playerId}`);

  socket.on("enter-game", () => {
    game.addPlayer(command);
    socket.emit("setup", game.state);

    socket.emit("show-game");
  });

  socket.on("player-ready", (command) => {
    game.checkToStartGame(command);
  });

  socket.on("disconnect", () => {
    game.removePlayer(command);
    console.log(`> Player ${command.playerId} disconnected`);

    if (Object.keys(game.state.players).length === 0) {
      game.clearRoom();
    }
  });

  socket.on("move-player", (moveCommand) => {
    moveCommand.playerId = command.playerId;
    moveCommand.type = "move-player";

    game.movePlayer(moveCommand);
  });
});

server.listen(3000, () => {
  console.log("> Server listinning on port: 3000");
});
