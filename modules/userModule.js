const fs = require("fs").promises;
const bcrypt = require("bcryptjs");
const crypto = require("node:crypto");
const { render } = require("../utils");
const escapeHtml = require("escape-html");

async function loginPage(req, res) {
    let form = await fs.readFile(__dirname + "/../template/loginForm.html");
    form = form.toString();
    return res.send(render(req.session.loggedIn, req.session.uuid, form));
}

async function registerPage(req, res) {
    req.session.email = null;
    req.session.uuid = null;
    req.session.role = null;
    req.session.loggedIn = false;

    let form = await fs.readFile("template/registerForm.html");
    form = form.toString();
    res.send(render(req.session.loggedIn, req.session.uuid, form));
}

async function login(req, res) {
    let data = req.body;

    let users = (await fs.readFile("users.json")).toString();
    users = JSON.parse(users);
    let userExist = users.find(u => u.email == data.email);
    if (!userExist) return res.send(render(req.session.loggedIn, req.session.uuid, "No such user"));

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
    data.pfp = "/assets/defaultPfp.png";
    data.description = "";

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
        if (userExist) return res.send(render(req.session.loggedIn, req.session.uuid, "User exists"));

        users.push(data);

        await fs.writeFile("users.json", JSON.stringify(users, null, 3));
        res.redirect("/session");
    } catch (err) {
        console.log("Error: ", err);
        res.send(render(req.session.loggedIn, req.session.uuid, "Error: " + err));
    }
}

async function editProfilePage(req, res) {
    try {
        const usersData = JSON.parse(await fs.readFile("users.json"));
        const user = usersData.find(u => u.uuid == req.session.uuid);

        if (!user) {
            return res.send(render(req.session.loggedIn, req.session.uuid, "User not found"));
        }

        let content = `
            <div class="editProfileForm">
                <form action="/editProfile" method="POST" enctype="multipart/form-data">
                    <label for="username">Username:</label>
                    <input type="text" id="username" name="username" value="${escapeHtml(user.username)}" required />
                    
                    <label for="description">Description:</label>
                    <textarea id="description" name="description" required>${escapeHtml(user.description)}</textarea>
                    
                    <label for="pfp">Profile Picture:</label>
                    <input type="file" id="pfp" name="pfp" accept="image/*" />
                    
                    <button type="submit">Save Changes</button>
                </form>
            </div>
        `;

        return res.send(render(req.session.loggedIn, req.session.uuid, content));
    } catch (err) {
        console.error("Error loading edit profile page:", err);
        return res.send("Error loading edit profile page.");
    }
}

async function editProfile(req, res) {
    try {
        const usersData = JSON.parse(await fs.readFile("users.json"));
        const userIndex = usersData.findIndex(u => u.uuid == req.session.uuid);

        if (userIndex === -1) {
            return res.send(render(req.session.loggedIn, req.session.uuid, "User not found"));
        }

        const user = usersData[userIndex];
        user.username = req.body.username;
        user.description = req.body.description;

        if (req.file) {
            user.pfp = `/uploads/${escapeHtml(req.file.filename)}`;
        }
        
        await fs.writeFile("users.json", JSON.stringify(usersData, null, 2));

        return res.redirect(`/profile/${req.session.uuid}`);
    } catch (err) {
        console.error("Error updating profile:", err);
        return res.send("Error updating profile.");
    }
}

module.exports = {
    loginPage,
    registerPage,
    login,
    register,
    editProfilePage,
    editProfile,
};