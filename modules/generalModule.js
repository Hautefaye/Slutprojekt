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

        // Ensure the logged-in user is deleting their own profile
        if (req.session.uuid !== uuid) {
            return res.send(render(req.session.loggedIn, req.session.uuid, "Unauthorized action"));
        }

        const users = JSON.parse(await fs.readFile("users.json", "utf8"));
        const updatedUsers = users.filter(user => user.uuid !== uuid);

        // Save the updated users array back to users.json
        await fs.writeFile("users.json", JSON.stringify(updatedUsers, null, 3), "utf8");

        // Log the user out after deleting their profile
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