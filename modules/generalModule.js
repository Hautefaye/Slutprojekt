const { render } = require("../utils");
const fs = require("fs").promises; 


async function homePage(req, res) {
    try {
        const posts = JSON.parse(await fs.readFile("posts.json", "utf-8"));
        const users = JSON.parse(await fs.readFile("users.json", "utf-8"));

        let content = posts.map(post => {
            const poster = users.find(u => u.uuid == post.poster);

            return `
            <div class="post">
                <h2>${post.title}</h2>
                <p>${post.description}</p>
                <img src="/uploads/${post.image}" alt="${post.title}" />
                <p>Posted by: ${poster.username}</p>
                <p>Date: ${post.date}</p>
            </div>
        `}).join("");

        return res.send(render(req.session.loggedIn, req.session.uuid, content));
    } catch (err) {
        console.error("Error loading posts:", err);
        return res.send("Error loading posts.");
    }
}

async function topPage(req, res) {
    try {
        let content = "Top";
        return res.send(render(req.session.loggedIn, req.session.uuid, content));
    } catch (err) {
        return res.send("error:" + err); 
    }
}

async function followingPage(req, res) {
    try {
        let content = "Following";
        return res.send(render(req.session.loggedIn, req.session.uuid, content));
    } catch (err) {
        return res.send("error:" + err); 
    }
}

async function profilePage(req, res) {
    try {
        const data = JSON.parse(await fs.readFile("users.json"));
        const user = data.find(u => u.uuid == req.params.id);

        if (!user) {
            return res.send(render(req.session.loggedIn, req.session.uuid, "Post not found"));
        }

        const isOwnProfile = req.session.uuid == user.uuid;

        let editBtn = "";
        let deleteForm = "";

        if (isOwnProfile) {
            editBtn = `
            <div class="editProfile">
                <button><a href="/editProfile">Edit Profile</a></button>
            </div>
        `;
            deleteForm = `
            <form action="/deleteProfile" method="POST">
                <input type="hidden" name="uuid" value="${user.uuid}"/>
                <button type="submit" id="deleteBtn">Delete profile</button>
            </form>
        `;
        }

        let content = `
            <div class="pfpDiv">
                <img src="${user.pfp}" alt="Profile Picture"/>
            </div>
            <div class="userDesc">
                <h2>${user.username}</h2>
                <p>${user.description}</p>
            </div>
            ${editBtn}
            ${deleteForm}
        `;

        return res.send(render(req.session.loggedIn, req.session.uuid, content));
    } catch (err) {
        console.error("Error loading user:", err);
        return res.send("Error loading user.");
    }
}

async function deleteProfile(req, res) {
    try {
        const { uuid } = req.body;

        if (!uuid) {
            return res.send(render(req.session.loggedIn, req.session.uuid, "UUID is required"));
        }

        if (req.session.uuid !== uuid) {
            return res.send(render(req.session.loggedIn, req.session.uuid, "Unauthorized action"));
        }

        const users = JSON.parse(await fs.readFile("users.json", "utf8"));
        const updatedUsers = users.filter(user => user.uuid !== uuid);

        await fs.writeFile("users.json", JSON.stringify(updatedUsers, null, 3), "utf8");

        req.session.destroy(err => {
            if (err) {
                console.error("Error logging out after profile deletion:", err);
                return res.send("Error deleting profile.");
            }
            return res.redirect("/login");
        });
    } catch (err) {
        console.error("Error deleting profile:", err);
        return res.send(render(req.session.loggedIn, req.session.uuid, "Error deleting profile: " + err));
    }
}

module.exports = {
    homePage,
    topPage,
    followingPage,
    profilePage,
    deleteProfile,
};