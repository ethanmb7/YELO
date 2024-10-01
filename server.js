const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let messages = []; // Tableau pour stocker les messages
let users = {}; // Objet pour suivre les utilisateurs connectés

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('Nouvel utilisateur connecté : ' + socket.id);

    socket.on('setUsername', (username) => {
        users[socket.id] = username;
        io.emit('userList', Object.values(users));
        socket.emit('messageHistory', messages);
    });

    socket.on('sendMessage', (data) => {
        messages.push(data);
        io.emit('receiveMessage', data);
    });

    socket.on('typing', () => {
        socket.broadcast.emit('userTyping', users[socket.id]);
    });

    socket.on('disconnect', () => {
        console.log('Utilisateur déconnecté : ' + socket.id);
        delete users[socket.id];
        io.emit('userList', Object.values(users));
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});
