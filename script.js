const socket = io();
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
    username = usernameInput.value.trim() || username;
    usernameContainer.style.display = 'none';
    messageInput.disabled = false;
    sendButton.disabled = false;
    socket.emit('setUsername', username);
});

// Fonction pour envoyer un message
function sendMessage() {
    const messageText = messageInput.value.trim();
    if (messageText !== '') {
        const messageData = { username, text: messageText };
        socket.emit('sendMessage', messageData);
        messageInput.value = '';
    }
}

sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

socket.on('receiveMessage', (data) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', 'received');
    messageElement.textContent = `${data.username}: ${data.text}`;

    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
});

socket.on('messageHistory', (history) => {
    history.forEach(data => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', 'received');
        messageElement.textContent = `${data.username}: ${data.text}`;
        messagesContainer.appendChild(messageElement);
    });
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
});

socket.on('userList', (userList) => {
    usersContainer.innerHTML = '';
    userList.forEach(user => {
        const userElement = document.createElement('div');
        userElement.textContent = user;
        usersContainer.appendChild(userElement);
    });
});

messageInput.addEventListener('keypress', () => {
    socket.emit('typing');
});

socket.on('userTyping', (username) => {
    typingNotification.textContent = `${username} est en train de taper...`;
    setTimeout(() => {
        typingNotification.textContent = '';
    }, 2000);
});
