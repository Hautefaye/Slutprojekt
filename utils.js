const path = require('path'); //hanterar filvägar
const multer = require('multer'); //filuppladdning


//Multer-konfiguration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, 'uploads'));
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const filename = Date.now() + ext; // Genererar unikt namn på filen
      cb(null, filename);
    }
});


const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpg', 'image/png', 'image/gif'];
  
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images are allowed'), false);
    }
};


const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter 
});


// io.on("connection", handleConnection);

//function handleConnection(socket) {
//    console.log("socket")
//
//    if (!socket.request.session.loggedIn) return;
//}

function render(loggedIn, content) {
    let html = require("fs").readFileSync("template/render.html").toString();
    if (loggedIn) {
        html = html.replace('<a class="headerLi" href="/register">Register</a>', '<a class="headerLi" href="/register">Log out</a>');
        html = html.replace('<a class="headerLi" href="/login">Login</a>', '<a class="headerLi" href=""><img src="/assets/defaultPfp.png"></a>');
    }
    return html.replace('{content}', content);
}

module.exports = {render, upload};