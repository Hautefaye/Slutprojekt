const path = require('path'); //hanterar filvägar
const multer = require('multer'); //filuppladdning


//Multer-konfiguration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: (req, file, cb) => {
        let ext = path.extname(file.originalname);
        console.log(file.originalname); // Debug log
        if (!ext) {
            // Default to .jpg if no extension is provided
            ext = '.jpg';
        }
        console.log(ext); // Debug log
        const filename = Date.now() + ext; // Genererar unikt namn på filen
        console.log("Generated filename:", filename); // Debug log
        cb(null, filename);
    }
});


const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
  
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

function render(loggedIn, uuid, content) {
    let html = require("fs").readFileSync("template/render.html").toString();
    html += `
        <script>
            (${setupClientSideScripts.toString()})();
        </script>
    `;
    if (loggedIn) {
        html = html.replace('<a class="headerLi" href="/register">Register</a>',
            `<div class="dropdown">
                <a class="headerLi" id="userProfileBtn" href="">
                    <img id="userProfileImg" src="/assets/defaultPfp.png">
                </a>
                <div class="dropdown-content">
                    <a href="/profile/${uuid}">View Profile</a>
                    <a href="#" id="toggleDarkMode">Dark Mode</a>
                </div>
            </div>`);
        html = html.replace('<a class="headerLi" href="/login">Login</a>', '<a href="/post">Create</a><a class="headerLi" href="/register">Log out</a>');
    }
    return html.replace('{content}', content);
}

function setupClientSideScripts() {
    document.addEventListener('DOMContentLoaded', () => {
        const userProfileBtn = document.getElementById('userProfileBtn');
        const dropdownContent = document.querySelector('.dropdown-content');
        const toggleDarkMode = document.getElementById('toggleDarkMode');

        // Toggle dropdown visibility on button click
        userProfileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
        });

        // Close dropdown if clicked outside
        document.addEventListener('click', (e) => {
            if (!userProfileBtn.contains(e.target) && !dropdownContent.contains(e.target)) {
                dropdownContent.style.display = 'none';
            }
        });

        // Toggle dark mode
        toggleDarkMode.addEventListener('click', (e) => {
            e.preventDefault();
            document.body.classList.toggle('dark-mode');
            const isDarkMode = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
        });

        // Apply dark mode if previously enabled
        if (localStorage.getItem('darkMode') === 'enabled') {
            document.body.classList.add('dark-mode');
        }
    });
}

module.exports = {render, upload};