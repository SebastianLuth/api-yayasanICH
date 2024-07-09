const multer = require('multer');
const cloudinary = require('cloudinary').v2; 
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'uploads/pdf', // Folder di Cloudinary
        allowedFormats: 'pdf',
        public_id: (req, file) => file.filename + '-' + Date.now(),
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 3000000 }, // 3MB limit
}).single('pdf');
module.exports = upload;
