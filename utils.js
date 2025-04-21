const path = require('path');
const multer = require('multer');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: (req, file, cb) => {
        let ext = path.extname(file.originalname);
        if (!ext) {
            ext = '.jpg';
        }
        const filename = Date.now() + ext; 
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

        userProfileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
        });

        document.addEventListener('click', (e) => {
            if (!userProfileBtn.contains(e.target) && !dropdownContent.contains(e.target)) {
                dropdownContent.style.display = 'none';
            }
        });

        toggleDarkMode.addEventListener('click', (e) => {
            e.preventDefault();
            document.body.classList.toggle('dark-mode');
            const isDarkMode = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
        });

        if (localStorage.getItem('darkMode') === 'enabled') {
            document.body.classList.add('dark-mode');
        }
    });
}

module.exports = {render, upload};