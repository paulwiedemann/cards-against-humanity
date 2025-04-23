const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const games = {};

io.on('connection', (socket) => {
  console.log('Neuer Spieler verbunden:', socket.id);

  socket.on('createGame', () => {
    const gameId = Math.random().toString(36).substring(2, 7).toUpperCase();
    games[gameId] = { players: [socket.id], czarIndex: 0 };
    socket.join(gameId);
    socket.emit('gameCreated', { gameId });
    console.log(`Spiel erstellt: ${gameId}`);
  });

  socket.on('joinGame', ({ gameId }) => {
    const game = games[gameId];
    if (game && game.players.length < 10) {
      game.players.push(socket.id);
      socket.join(gameId);
      io.to(gameId).emit('playerJoined', { playerCount: game.players.length });
    } else {
      socket.emit('errorMessage', 'Spiel existiert nicht oder ist voll');
    }
  });
});

server.listen(3000, () => console.log('Server läuft auf http://localhost:3000'));