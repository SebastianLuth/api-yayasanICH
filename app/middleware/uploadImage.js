const multer = require('multer');
const cloudinary = require('cloudinary').v2; 
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'uploads', // Folder di Cloudinary
        allowedFormats: ['jpeg', 'jpg', 'png'],
        public_id: (req, file) => file.filename + '-' + Date.now(),
    },
});

const uploadImage = multer({
    storage: storage,
    limits: { fileSize: 3000000 }, // 3MB limit
}).single('image');

module.exports = uploadImage;
