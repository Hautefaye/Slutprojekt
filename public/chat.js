const socket = io(); 

const chatId = document.getElementById("chatId").value;

socket.emit("joinRoom", chatId);

socket.on("message", (msg) => {
    const messagesDiv = document.getElementById("messages");
    const messageElement = document.createElement("div");
    messageElement.innerHTML = `<strong>${msg.user}:</strong> ${msg.text}`;
    messagesDiv.appendChild(messageElement);
});

document.getElementById("sendButton").addEventListener("click", async () => {
    const messageInput = document.getElementById("messageInput");
    const message = messageInput.value.trim();

    if (message) {
        socket.emit("chatMessage", { chatId, message });
        messageInput.value = ""; 
    }
});