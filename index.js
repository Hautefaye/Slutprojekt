const express = require("express");
const session = require("express-session");
const { createServer } = require("http");
const { Server } = require("socket.io");
const fs = require("fs").promises;
const path = require("path");
const { chatSearchPage, chatPage, createChat, addMessageToChat } = require("./modules/chatModule");
const { loginPage, registerPage, login, register, editProfile, editProfilePage } = require("./modules/userModule");
const { homePage, topPage, followingPage, profilePage, deleteProfile } = require("./modules/generalModule");
const { postPage, postFunc } = require("./modules/postModule");
const { render, upload } = require("./utils");
const sharedSession = require("express-socket.io-session");

const app = express();
const server = createServer(app);
const io = new Server(server);

const port = 3000;

const sessionMiddleware = session({
    secret: 'KringlaBringlaBimbelbomPrimla',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

app.use(sessionMiddleware);
io.use(sharedSession(sessionMiddleware, {
    autoSave: true,
}));

// General
app.get("/", homePage);
app.get("/topPage", topPage);
app.get("/following", followingPage);
app.get("/profile/:id", profilePage);
app.get("/editProfile", editProfilePage);
app.post("/editProfile", upload.single("pfp"), editProfile);
app.post("/deleteProfile", deleteProfile);

// Chat
app.get("/chat", chatSearchPage);
app.get("/chat/:id", chatPage);
app.post("/createChat", createChat);
app.post("/addMessage", addMessageToChat);

// Post
app.get("/post", postPage);
app.post("/post", upload.single("image"), postFunc); 

// User
app.get("/login", loginPage);
app.post("/login", login);
app.get("/register", registerPage);
app.post("/register", register);

app.get("/session", (req, res) => {
    if (req.session.email) {
        return res.redirect("/");
    }
    res.redirect("/login");
});



io.on("connection", (socket) => {
    socket.on("joinRoom", (chatId) => {
        socket.join(chatId);
    });

    socket.on("chatMessage", async ({ chatId, message }) => {

        const username = socket.handshake.session.username || "Anonymous";

        const chatFilePath = path.join(__dirname, `chats/chat_${chatId}.json`);
        let messages = [];
        try {
            const chatData = await fs.readFile(chatFilePath, "utf-8");
            messages = JSON.parse(chatData);
        } catch (err) {
            if (err.code !== "ENOENT") {
                console.error("Error reading chat file:", err);
            }
        }

        const newMessage = { user: username, text: message };
        messages.push(newMessage);

        try {
            await fs.writeFile(chatFilePath, JSON.stringify(messages, null, 3));
        } catch (err) {
            console.error("Error saving chat file:", err);
        }

        io.to(chatId).emit("message", newMessage);
    });
});

server.listen(port, () => console.log(`Server running at http://localhost:${port}`));