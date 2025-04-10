// Initiates server
const socket = io(); 
console.log("WebSocket connection initialized");

const chatId = document.getElementById("chatId").value;
console.log(`Chat ID: ${chatId}`);

socket.emit("joinRoom", chatId);
console.log(`Joining room: ${chatId}`);

socket.on("loadMessages", (messages) => {
    const messagesDiv = document.getElementById("messages");
    messages.forEach(msg => {
        const messageElement = document.createElement("div");
        messageElement.textContent = msg;
        messagesDiv.appendChild(messageElement);
    });
});

socket.on("message", (msg) => {
    console.log(`Received message: ${msg}`);
    const messagesDiv = document.getElementById("messages");
    const messageElement = document.createElement("div");
    messageElement.textContent = msg;
    messagesDiv.appendChild(messageElement);
});

document.getElementById("sendButton").addEventListener("click", () => {
    const messageInput = document.getElementById("messageInput");
    const message = messageInput.value.trim(); // Trim whitespace
    if (message) {
        console.log(`Sending message: ${message}`);
        socket.emit("chatMessage", { chatId, message }); // Emit the message
        messageInput.value = ""; // Clear the input bar
    }
});


io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("joinRoom", (chatId) => {
        socket.join(chatId);
        console.log(`User joined chat room: ${chatId}`);
    });

    socket.on("chatMessage", async ({ chatId, message }) => {
        console.log(`Message in chat ${chatId}: ${message}`);

        try {
            const filePath = `chats/chat_${chatId}.json`;
            let messages = [];
            try {
                const data = await fs.readFile(filePath);
                messages = JSON.parse(data);
            } catch (err) {
                console.log("No existing messages, creating a new file.");
            }

            messages.push(message);
            await fs.writeFile(filePath, JSON.stringify(messages, null, 3));
            console.log("Message saved to file");
        } catch (err) {
            console.error("Error saving message:", err);
        }

        io.to(chatId).emit("message", message);
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});