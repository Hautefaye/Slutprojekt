const express = require("express");
const bcrypt = require("bcryptjs");
const session = require('express-session');
const path = require('path'); //hanterar filvägar
const crypto = require('node:crypto');
const multer = require('multer'); //filuppladdning
const { Server } = require("socket.io");
const { db, getAll } = require("./db.js");
const { createServer } = require("http");
const fs = require("fs").promises;
const app = express();
const port = 3000;

app.use(express.static("public"));
app.listen(port, () => console.log(`localhost:${port}`));

app.use(session({
    secret: 'KringlaBringlaBimbelbomPrimla',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false}
}));

app.get("/", homePage);
app.get("/login", loginPage);
app.post("/login", login);
app.get("/register", registerPage);
app.post("/register", register);


app.get('/session', (req, res) => {
    if(req.session.email) return res.send(render(req.session.loggedIn, "Welcome " + req.session.email));
    res.redirect("/login");
});


//Multer-konfiguration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, 'uploads'));
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const filename = Date.now() + ext; // Genererar unikt namn på filen
      cb(null, filename);
    }
});


const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpg', 'image/png', 'image/gif'];
  
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images are allowed'), false);
    }
};


const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter 
});


io.on("connection", handleConnection);

function handleConnection(socket) {
    console.log("socket")

    if (!socket.request.session.loggedIn) return;
}



async function homePage(req, res) {
    try {
        let content = "gfsagsagsga";
        return res.send(render(req.session.loggedIn, content));
    } catch (err) {
        return res.send("error:" + err); // Om något går fel i renderingen
    }
}


async function loginPage(req, res) {
    let form = await fs.readFile(__dirname + "/template/loginForm.html");
    form = form.toString();
    return res.send(render(req.session.loggedIn, form));
}


async function registerPage(req, res) {
    req.session.email = null;
    req.session.uuid = null;
    req.session.role = null;
    req.session.loggedIn = false;

    let form = await fs.readFile("template/registerForm.html");
    form = form.toString();
    res.send(render(req.session.loggedIn, form)); 
}


async function login(req, res) {
    let form = await fs.readFile("template/login.html");
    form = form.toString();
    res.send(render(req.session.loggedIn, form));
}


async function register(req, res) {
    let html = "";
    return res.send(render(req.session.loggedIn, html));
}


function render(loggedIn, content) {
    let html = require("fs").readFileSync("template/render.html").toString();
    if (loggedIn) {
        html = html.replace('<a href="/register">Register</a>', '<a href="/register">Log out</a>');
        html = html.replace('<li class = "headerLi"><a href="/login">Login</a></li>', '');
    }
    return html.replace('{content}', content);
}