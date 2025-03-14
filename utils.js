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


io.on("connection", handleConnection);

function handleConnection(socket) {
    console.log("socket")

    if (!socket.request.session.loggedIn) return;
}