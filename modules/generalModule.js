const { render } = require("../utils");

async function homePage(req, res) {
    try {
        let content = "gfsagsagsga";
        return res.send(render(req.session.loggedIn, content));
    } catch (err) {
        return res.send("error:" + err); // If something goes wrong during rendering
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