const fs = require("fs").promises;
const crypto = require("node:crypto");
const { render } = require("../utils");

let activeChats = [];
let chatTimers = {};

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

    // Extract the chat ID from the route parameter
    let chatId = req.params.id;
    let chat = activeChats.find(c => c.id === chatId);

    if (!chat) {
        return res.send(render(req.session.loggedIn, req.session.uuid, "Chat room not found."));
    }

    // Render the chat room page with proper structure and classes
    let content = `
        <div class="chat-room">
            <h1 class="chat-title">Chat Room: ${chat.name}</h1>
            <div id="messages" class="chat-messages"></div>
            <div class="chat-input">
                <input id="messageInput" class="message-input" placeholder="Type a message..." />
                <button id="sendButton" class="send-button">Send</button>
            </div>
            <input type="hidden" id="chatId" value="${chatId}" />
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
        await fs.writeFile(`chats/chat_${chatId}.json`, JSON.stringify([], null, 3));
        console.log(`Chat created: ${chatName} (ID: ${chatId})`);
    } catch (err) {
        console.error("Error creating chat file:", err);
        return res.send("Error creating chat.");
    }

    res.redirect("/chat");
}

module.exports = {
    chatSearchPage,
    chatPage,
    createChat,
    activeChats,
    chatTimers,
};