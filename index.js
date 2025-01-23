const express = require("express");
const bcrypt = require("bcryptjs");
const session = require('express-session');
const path = require('path'); //hanterar filvägar
const crypto = require('node:crypto');
const multer = require('multer'); //filuppladdning
const app = express();
const port = 3000;
const fs = require("fs").promises;

app.use(express.static("public"));
app.listen(port, () => console.log(`localhost:${port}`));

app.get("/", homePage);
app.get("/login", loginPage);
app.post("/login", login);
app.get("/register", registerPage);
app.post("/register", register);

async function homePage(req, res) {
    let html = "";
    return res.send(html);
}

/*--------------------------------------------------------------------------*/

async function loginPage(req, res) {
    let html = "";
    return res.send(html);
}

/*--------------------------------------------------------------------------*/

async function registerPage(req, res) {
    let html = "";
    return res.send(html);
}

/*--------------------------------------------------------------------------*/

async function login(req, res) {
    let html = "";
    return res.send(html);
}

/*--------------------------------------------------------------------------*/

async function register(req, res) {
    let html = "";
    return res.send(html);
}