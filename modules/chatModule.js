const fs = require("fs").promises;
const crypto = require("node:crypto");
const path = require("path");
const { render } = require("../utils");

let activeChats = [];
let chatTimers = {};
const ChatTimeLimit = 1000 * 60 * 10;
const ChatsDir = path.join(__dirname, "../chats");

async function cleanupChats() {
    try {
        const files = await fs.readdir(ChatsDir);
        for (const file of files) {
            if (file.startsWith("chat_") && file.endsWith(".json")) {
                await fs.unlink(path.join(ChatsDir, file));
            }
        }
        activeChats = [];
        chatTimers = {};
    } catch (err) {
        console.error("Error during chat cleanup:", err);
    }
}

cleanupChats();

async function chatSearchPage(req, res) {
    if (!req.session.loggedIn) {
        return res.send(render(req.session.loggedIn, req.session.uuid, "Please log in to access chats."));
    }

    let chatListHTML = activeChats.map(chat => 
        `<li><a href="/chat/${chat.id}">${chat.name}</a></li>`
    ).join("");

    let content = `
        <h1>Active Chats</h1>
        <ul>${chatListHTML}</ul>
        <button id="createChatButton">Create New Chat</button>
        <div id="createChatModal" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border: 1px solid black;">
            <h2>Create a New Chat</h2>
            <form action="/createChat" method="POST">
                <input type="text" name="chatName" placeholder="Chat Name" required />
                <button type="submit">Create</button>
                <button type="button" id="closeModalButton">Cancel</button>
            </form>
        </div>
        <script>
            document.getElementById("createChatButton").addEventListener("click", () => {
                document.getElementById("createChatModal").style.display = "block";
            });
            document.getElementById("closeModalButton").addEventListener("click", () => {
                document.getElementById("createChatModal").style.display = "none";
            });
        </script>
        <script src="/socket.io/socket.io.js"></script>
        <script src="/chat.js"></script>
    `;
    return res.send(render(req.session.loggedIn, req.session.uuid, content));
}

async function chatPage(req, res) {
    if (!req.session.loggedIn) {
        return res.send(render(req.session.loggedIn, req.session.uuid, "Please log in to access this chat."));
    }

    let chatId = req.params.id;
    let chat = activeChats.find(c => c.id === chatId);

    if (!chat) {
        return res.send(render(req.session.loggedIn, req.session.uuid, "Chat room not found."));
    }

    let messages = [];
    try {
        const chatFilePath = path.join(ChatsDir, `chat_${chatId}.json`);
        const chatData = await fs.readFile(chatFilePath, "utf-8");
        messages = JSON.parse(chatData);
    } catch (err) {
        if (err.code !== "ENOENT") {
            console.error("Error reading chat file:", err);
        }
    }

    let content = `
        <div class="chat-room">
            <h1 class="chat-title">Chat Room: ${chat.name}</h1>
            <div id="messages" class="chat-messages">
                ${messages.map(msg => `<div><strong>${msg.user}:</strong> ${msg.text}</div>`).join("")}
            </div>
            <div class="chat-input">
                <input id="messageInput" class="message-input" placeholder="Type a message..." />
                <button id="sendButton" class="send-button">Send</button>
            </div>
            <input type="hidden" id="chatId" value="${chatId}"/>
        </div>
        <script src="/socket.io/socket.io.js"></script>
        <script src="/chat.js"></script>
    `;
    return res.send(render(req.session.loggedIn, req.session.uuid, content));
}

async function createChat(req, res) {
    if (!req.session.loggedIn) {
        return res.send(render(req.session.loggedIn, req.session.uuid, "Please log in to create a chat."));
    }

    let chatName = req.body.chatName;
    let chatId = crypto.randomUUID();

    activeChats.push({ id: chatId, name: chatName });

    try {
        await fs.writeFile(path.join(ChatsDir, `chat_${chatId}.json`), JSON.stringify([], null, 3));

        chatTimers[chatId] = setTimeout(async () => {
            await removeChat(chatId);
        }, ChatTimeLimit);
    } catch (err) {
        console.error("Error creating chat file:", err);
        return res.send("Error creating chat.");
    }

    res.redirect("/chat");
}

async function removeChat(chatId) {
    let chatIndex = activeChats.findIndex(chat => chat.id === chatId);
    if (chatIndex !== -1) {
        let chat = activeChats[chatIndex];
        activeChats.splice(chatIndex, 1);

        if (chatTimers[chatId]) {
            clearTimeout(chatTimers[chatId]);
            delete chatTimers[chatId];
        }

        try {
            await fs.unlink(path.join(ChatsDir, `chat_${chatId}.json`));
        } catch (err) {
            console.error("Error deleting chat file:", err);
        }
    }
}

async function addMessageToChat(req, res) {
    if (!req.session.loggedIn) {
        return res.status(401).send("Unauthorized");
    }

    const chatId = req.body.chatId;
    const messageText = String(req.body.message);

    const chat = activeChats.find(c => c.id === chatId);
    if (!chat) {
        return res.status(404).send("Chat not found");
    }

    let username;
    try {
        const usersFilePath = path.join(__dirname, "../users.json");

        const usersData = await fs.readFile(usersFilePath, "utf-8");
        const users = JSON.parse(usersData);
        const user = users.find(u => u.uuid === req.session.uuid);

        if (!user) {
            console.error("User not found for UUID:", req.session.uuid);
            return res.status(404).send("User not found");
        }

        username = user.username;
    } catch (err) {
        console.error("Error reading users file:", err);
        return res.status(500).send("Internal server error");
    }

    try {
        const chatFilePath = path.join(ChatsDir, `chat_${chatId}.json`);

        let messages = [];
        try {
            const chatData = await fs.readFile(chatFilePath, "utf-8");
            messages = JSON.parse(chatData);
        } catch (err) {
            if (err.code === "ENOENT") {
                console.log("Chat file not found, creating a new one:", chatFilePath);
            } else {
                console.error("Error reading chat file:", err);
                return res.status(500).send("Internal server error");
            }
        }

        messages.push({ user: username, text: messageText });

        await fs.writeFile(chatFilePath, JSON.stringify(messages, null, 3));

        res.status(200).send("Message added");
    } catch (err) {
        console.error("Error updating chat file:", err);
        res.status(500).send("Internal server error");
    }
}

module.exports = {
    chatSearchPage,
    chatPage,
    createChat,
    addMessageToChat,
};