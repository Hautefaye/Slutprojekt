const { render } = require("../utils");
const fs = require("fs").promises; 


async function homePage(req, res) {
    try {
        // Load posts from posts.json
        const data = await fs.readFile("posts.json", "utf-8");
        const posts = JSON.parse(data);

        // Generate HTML content for posts
        let content = posts.map(post => `
            <div class="post">
                <h2>${post.title}</h2>
                <p>${post.description}</p>
                <img src="/uploads/${post.image}" alt="${post.title}" />
                <p>Posted by: ${post.poster}</p>
                <p>Date: ${post.date}</p>
            </div>
        `).join("");

        return res.send(render(req.session.loggedIn, req.session.uuid, content));
    } catch (err) {
        console.error("Error loading posts:", err);
        return res.send("Error loading posts.");
    }
}

async function topPage(req, res) {
    try {
        let content = "gfsagsagsga";
        return res.send(render(req.session.loggedIn, req.session.uuid, content));
    } catch (err) {
        return res.send("error:" + err); // If something goes wrong during rendering
    }
}

async function followingPage(req, res) {
    try {
        let content = "gfsagsagsga";
        return res.send(render(req.session.loggedIn, req.session.uuid, content));
    } catch (err) {
        return res.send("error:" + err); // If something goes wrong during rendering
    }
}

async function profilePage(req, res) {
    try {
        // Load posts from posts.json
        const data = JSON.parse(await fs.readFile("users.json"));
        const user = data.find(u => u.uuid == req.params.id);

        if (!user) {
            return res.send(render(req.session.loggedIn, req.session.uuid, "Post not found"));
        }

        const isOwnProfile = req.session.uuid == user.uuid;

        let editBtn = "";

        if (isOwnProfile) {
            editBtn = `
            <div class="editProfile">
                <button><a href="/editProfile">Edit Profile</a></button>
            </div>
        `;
        }

        // Generate HTML content for posts
        let content = `
            <div class="pfpDiv">
                <img src="${user.pfp}" alt="Profile Picture"/>
            </div>
            <div class="userDesc">
                <h2>${user.username}</h2>
                <p>${user.description}</p>
            </div>
            ${editBtn}
        `;

        return res.send(render(req.session.loggedIn, req.session.uuid, content));
    } catch (err) {
        console.error("Error loading user:", err);
        return res.send("Error loading user.");
    }
}

module.exports = {
    homePage,
    topPage,
    followingPage,
    profilePage,
};