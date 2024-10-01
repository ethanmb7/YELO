const socket = io(); // Établir la connexion avec le serveur
const messagesContainer = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const usernameInput = document.getElementById('username-input');
const setUsernameButton = document.getElementById('set-username-button');
const usernameContainer = document.getElementById('username-container');
const usersContainer = document.getElementById('users');
const typingNotification = document.getElementById('typing-notification');

let username = 'Utilisateur' + Math.floor(Math.random() * 1000); // Nom d'utilisateur par défaut

// Fonction pour définir le pseudonyme
setUsernameButton.addEventListener('click', () => {
    username = usernameInput.value.trim() || username; // Si le champ est vide, utilise le nom par défaut
    usernameContainer.style.display = 'none'; // Masquer la zone de pseudonyme
    messageInput.disabled = false; // Activer le champ de message
    sendButton.disabled = false; // Activer le bouton d'envoi
    socket.emit('setUsername', username); // Émettre le nom d'utilisateur
});

// Fonction pour envoyer un message
function sendMessage() {
    const messageText = messageInput.value.trim();
    if (messageText !== '') {
        const messageData = { username, text: messageText }; // Créer un objet avec le nom d'utilisateur et le message
        socket.emit('sendMessage', messageData); // Envoyer le message au serveur
        messageInput.value = ''; // Réinitialiser le champ de saisie
    }
}

// Écouteur d'événements pour le bouton "Envoyer"
sendButton.addEventListener('click', sendMessage);

// Écouteur d'événements pour la touche "Entrée"
messageInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

// Écoute des messages reçus
socket.on('receiveMessage', (data) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', 'received');
    messageElement.textContent = `${data.username}: ${data.text}`; // Afficher le nom d'utilisateur et le message

    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight; // Faire défiler vers le bas
});

// Écoute de l'historique des messages
socket.on('messageHistory', (history) => {
    history.forEach(data => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', 'received');
        messageElement.textContent = `${data.username}: ${data.text}`;
        messagesContainer.appendChild(messageElement);
    });
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
});

// Écoute de la liste des utilisateurs
socket.on('userList', (userList) => {
    usersContainer.innerHTML = ''; // Réinitialiser la liste
    userList.forEach(user => {
        const userElement = document.createElement('div');
        userElement.textContent = user; // Ajouter chaque utilisateur à la liste
        usersContainer.appendChild(userElement);
    });
});

// Écoute des notifications de "tape"
messageInput.addEventListener('keypress', () => {
    socket.emit('typing'); // Émettre un événement "typing"
});

// Écoute des notifications de "tape" des autres utilisateurs
socket.on('userTyping', (username) => {
    typingNotification.textContent = `${username} est en train de taper...`;
    setTimeout(() => {
        typingNotification.textContent = '';
    }, 2000); // Effacer la notification après 2 secondes
});
