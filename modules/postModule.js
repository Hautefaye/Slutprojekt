const fs = require("fs").promises;
const crypto = require("crypto");
const { render, upload } = require("../utils");


async function loadPosts() {
    try {
        const data = await fs.readFile("posts.json", "utf-8");
        return JSON.parse(data);
    } catch (err) {
        console.error("Error loading posts:", err);
        return [];
    }
}

async function savePosts(posts) {
    try {
        await fs.writeFile("posts.json", JSON.stringify(posts, null, 3));
    } catch (err) {
        console.error("Error saving posts:", err);
    }
}

async function postPage(req, res) {
    if (!req.session.loggedIn) {
        return res.send(render(req.session.loggedIn, req.session.uuid, "Please log in to create a post."));
    }

    const form = await fs.readFile("template/upload.html", "utf-8");
    return res.send(render(req.session.loggedIn, req.session.uuid, form));
}

async function postFunc(req, res) {
    if (!req.session.loggedIn) {
        return res.send(render(req.session.loggedIn, req.session.uuid, "Please log in to create a post."));
    }

    try {
        const { title, description } = req.body;
        const image = req.file ? req.file.filename : null;

        if (!title || !description || !image) {
            if (image) {
                try {
                    await fs.unlink(`uploads/${image}`);
                } catch (err) {
                    console.error("Error deleting image:", err);
                }
            }

            return res.send(render(req.session.loggedIn, req.session.uuid, "All fields are required!"));
        }

        const posts = await loadPosts();

        const newPost = {
            id: crypto.randomUUID(),
            title,
            description,
            image,
            poster: req.session.uuid || "Anonymous",
            date: new Date().toLocaleDateString(),
        };

        posts.push(newPost);
        await savePosts(posts);

        res.redirect("/"); 
    } catch (err) {
        console.error("Error creating post:", err);
        res.send(render(req.session.loggedIn, req.session.uuid, "Error creating post."));
    }
}

module.exports = {
    postPage,
    postFunc,
};