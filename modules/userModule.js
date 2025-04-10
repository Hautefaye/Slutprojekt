const fs = require("fs").promises;
const bcrypt = require("bcryptjs");
const crypto = require("node:crypto");
const { render } = require("../utils");

async function loginPage(req, res) {
    let form = await fs.readFile(__dirname + "/../template/loginForm.html");
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
    let userExist = users.find(u => u.email == data.email);
    if (!userExist) return res.send(render(req.session.loggedIn, "No such user"));

    let check = await bcrypt.compare(data.password, userExist.password);
    if (!check) return res.redirect("/login?wrong_credentials");

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

    if (!data.email || !data.password || !data.passwordCheck || !data.uuid) {
        return res.send("Please fill in all fields!");
    } else if (data.password !== data.passwordCheck) {
        return res.send("Passwords do not match!");
    }
    try {
        data.password = await bcrypt.hash(data.password, 12);
        delete data.passwordCheck;

        let users = (await fs.readFile("users.json")).toString();
        users = JSON.parse(users);
        let userExist = users.find(u => u.email == data.email);
        if (userExist) return res.send(render(req.session.loggedIn, "User exists"));

        users.push(data);

        await fs.writeFile("users.json", JSON.stringify(users, null, 3));
        res.redirect("/session");
    } catch (err) {
        console.log("Error: ", err);
        res.send(render(req.session.loggedIn, "Error: " + err));
    }
}

module.exports = {
    loginPage,
    registerPage,
    login,
    register,
};