console.log("chat.js ran");


// Initialize WebSocket connection
const socket = io(); // This connects to the WebSocket server
console.log("WebSocket connection initialized");

// Get the chat ID from the hidden input field
const chatId = document.getElementById("chatId").value;
console.log(`Chat ID: ${chatId}`);

// Join the chat room
socket.emit("joinRoom", chatId);
console.log(`Joining room: ${chatId}`);

// Load existing messages
socket.on("loadMessages", (messages) => {
    const messagesDiv = document.getElementById("messages");
    messages.forEach(msg => {
        const messageElement = document.createElement("div");
        messageElement.textContent = msg;
        messagesDiv.appendChild(messageElement);
    });
});

// Listen for incoming messages
socket.on("message", (msg) => {
    console.log(`Received message: ${msg}`);
    const messagesDiv = document.getElementById("messages");
    const messageElement = document.createElement("div");
    messageElement.textContent = msg;
    messagesDiv.appendChild(messageElement);
});

// Send a message
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

    // Handle joining a chat room
    socket.on("joinRoom", (chatId) => {
        socket.join(chatId);
        console.log(`User joined chat room: ${chatId}`);
    });

    // Handle receiving a chat message
    socket.on("chatMessage", async ({ chatId, message }) => {
        console.log(`Message in chat ${chatId}: ${message}`);

        // Save the message to the corresponding chat's JSON file
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

        // Broadcast the message to all clients in the chat room
        io.to(chatId).emit("message", message);
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});