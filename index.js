const express = require("express");
const bcrypt = require("bcryptjs");
const session = require('express-session');
const path = require('path'); //hanterar filvägar
const crypto = require('node:crypto');
const multer = require('multer'); //filuppladdning
const { Server } = require("socket.io");
const { createServer } = require("http");
const fs = require("fs").promises;
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true })); // Add this line to parse URL-encoded form data

app.use(express.static("public"));
const {render, upload} = require("./utils.js");
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
app.get("/upload", uploadPage);
app.post("/upload", upload.single('image'), uploadPost);


app.get('/session', (req, res) => {
    if(req.session.email) return res.send(render(req.session.loggedIn, "Welcome " + req.session.email));
    res.redirect("/login");
});


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
    let data = req.body;

    let users = (await fs.readFile("users.json")).toString();
    users = JSON.parse(users);
    let userExist = users.find(u=>u.email==data.email);
    if(!userExist) return res.send("No such user");

    let check = await bcrypt.compare(data.password, userExist.password);
    if(!check) return res.redirect("/login?wrong_credentials");

    req.session.username = userExist.username;
    req.session.email = userExist.email;
    req.session.uuid = userExist.uuid;
    req.session.role = userExist.role;
    req.session.loggedIn = true;

    res.redirect("/session");
}

async function register(req, res) {
    let data = req.body;
    data.uuid = crypto.randomUUID();
    data.role = "user";
    data.pfp = "defaultPfp.png";

    if(!data.email || !data.password || !data.passwordCheck || !data.uuid) {
        return res.send("Please fill in all fields!");
    } else if (data.password !== data.passwordCheck) {
        return res.send("Passwords do not match!");
    }
    try {
        data.password = await bcrypt.hash(data.password,12);
        delete data.passwordCheck;

        let users = (await fs.readFile("users.json")).toString();
        usersSave = users;
        users = JSON.parse(users);
        let userExist = users.find(u=>u.email == data.email);
        if(userExist) return res.send(render(req.session.loggedIn, "User exists"));
        let uuidExist = users.find(u=>u.uuid == data.uuid);
        if(uuidExist) {
            users.push(usersSave);
            register();
        }
        users.push(data);
    
        await fs.writeFile("users.json", JSON.stringify(users, null, 3));
        res.redirect("/session");
    } catch (err) {
        console.log("Error: ", err);
        res.send(render(req.session.loggedIn,"Error: " + err));
    }
}


async function uploadPage(req, res) { 
    if (!req.session.loggedIn) {
        return res.send(render(req.session.loggedIn, "Please log in or register before posting"))
    }
    let form = await fs.readFile("template/upload.html");
    form = form.toString();
    return res.send(render(req.session.loggedIn, form));
}

async function uploadPost(req, res) {
    let time = new Date();

    if (!req.file) {
        console.error("No file uploaded!");
        return res.send("No file uploaded.");
    }

    let data = req.body;
    data.image = req.file.filename;
    data.poster = req.session.uuid;
    data.id = crypto.randomUUID();
    data.date = time.getDate() + "-" + time.getMonth() + "-" + time.getFullYear();

    try {
        console.log('File uploaded successfully');
    } catch (err) {
        console.log("Error uploading file: ", err);
        return res.send(render(req.session.loggedIn, "Error uploading file: " + err));
    }

    if(!data.title || !data.description || !data.image) {
        return res.send("Please fill in all fields!");
    }
    try {
        let posts = (await fs.readFile("posts.json")).toString();
        posts = JSON.parse(posts);

        let idExist = posts.find(u=>u.id == data.id);
        if(idExist) {
            registerPost();
        }
        posts.push(data);
    
        await fs.writeFile("posts.json", JSON.stringify(posts, null, 3));
        return res.redirect("/");
    } catch (err) {
        console.log("Error: ", err);
        return res.send(req.session.loggedIn, "Error: " + err);
    }
}