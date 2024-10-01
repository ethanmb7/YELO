const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let messages = []; // Tableau pour stocker les messages
let users = {}; // Objet pour suivre les utilisateurs connectés

app.use(express.static('public'));

// Gestion des connexions Socket.io
io.on('connection', (socket) => {
    console.log('Nouvel utilisateur connecté : ' + socket.id);

    // Ajouter l'utilisateur à la liste
    socket.on('setUsername', (username) => {
        users[socket.id] = username;
        io.emit('userList', Object.values(users)); // Mettre à jour la liste des utilisateurs
        socket.emit('messageHistory', messages); // Envoyer l'historique des messages
    });

    // Écouter les messages envoyés par les utilisateurs
    socket.on('sendMessage', (data) => {
        messages.push(data); // Stocker le message dans l'historique
        io.emit('receiveMessage', data); // Émettre le message à tous les utilisateurs
    });

    // Indiquer qu'un utilisateur est en train d'écrire
    socket.on('typing', () => {
        socket.broadcast.emit('userTyping', users[socket.id]);
    });

    // Gérer la déconnexion
    socket.on('disconnect', () => {
        console.log('Utilisateur déconnecté : ' + socket.id);
        delete users[socket.id]; // Supprimer l'utilisateur de la liste
        io.emit('userList', Object.values(users)); // Mettre à jour la liste des utilisateurs
    });
});

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});
