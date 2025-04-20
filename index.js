const express = require("express");
const session = require("express-session");
const { createServer } = require("http");
const { Server } = require("socket.io");
const fs = require("fs").promises;
const { chatSearchPage, chatPage, createChat } = require("./modules/chatModule");
const { loginPage, registerPage, login, register, editProfile, editProfilePage } = require("./modules/userModule");
const { homePage, topPage, followingPage, profilePage } = require("./modules/generalModule");
const { postPage, postFunc } = require("./modules/postModule");
const { render, upload } = require("./utils");

const app = express();
const server = createServer(app); // Create the HTTP server
const io = new Server(server); // Attach socket.io to the server

const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

app.use(session({
    secret: 'KringlaBringlaBimbelbomPrimla',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
}));

// General
app.get("/", homePage);
app.get("/topPage", topPage);
app.get("/following", followingPage);
app.get("/profile/:id", profilePage);
app.get("/editProfile", editProfilePage);
app.post("/editProfile", upload.single("pfp"), editProfile);

// Chat
app.get("/chat", chatSearchPage);
app.get("/chat/:id", chatPage);
app.post("/createChat", createChat);

// Post
app.get("/post", postPage);
app.post("/post", upload.single("image"), postFunc); // Use multer middleware for file uploads

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

// WebSocket logic
io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("joinRoom", (chatId) => {
        socket.join(chatId);
        console.log(`User joined chat room: ${chatId}`);
    });

    socket.on("chatMessage", async ({ chatId, message }) => {
        console.log(`Message in chat ${chatId}: ${message}`);
        io.to(chatId).emit("message", message);
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});

server.listen(port, () => console.log(`Server running at http://localhost:${port}`));