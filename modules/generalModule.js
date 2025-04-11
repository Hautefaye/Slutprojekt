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

        return res.send(render(req.session.loggedIn, content));
    } catch (err) {
        console.error("Error loading posts:", err);
        return res.send("Error loading posts.");
    }
}

async function topPage(req, res) {
    try {
        let content = "gfsagsagsga";
        return res.send(render(req.session.loggedIn, content));
    } catch (err) {
        return res.send("error:" + err); // If something goes wrong during rendering
    }
}

async function followingPage(req, res) {
    try {
        let content = "gfsagsagsga";
        return res.send(render(req.session.loggedIn, content));
    } catch (err) {
        return res.send("error:" + err); // If something goes wrong during rendering
    }
}

async function profilePage(req, res) {
    try {
        let content = "gfsagsagsga";
        return res.send(render(req.session.loggedIn, content));
    } catch (err) {
        return res.send("error:" + err); // If something goes wrong during rendering
    }
}

module.exports = {
    homePage,
    topPage,
    followingPage,
    profilePage,
};