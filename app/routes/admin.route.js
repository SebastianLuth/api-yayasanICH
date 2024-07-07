module.exports= (app)=> {
    
    const adminControllers = require('../controllers/admin.controllers');
    const adminAuth = require('../middleware/adminAuth');
    const upload = require('../middleware/upload');
    const uploadImage = require('../middleware/uploadImage');
    const router = require('express').Router(); 

    router.post('/login', adminControllers.adminLogin);
    router.post('/modules', adminAuth, upload, adminControllers.addModule);
    router.post('/products', adminAuth, uploadImage, adminControllers.addProduct);
    router.post('/addNews', adminAuth, uploadImage,adminControllers.addNews);
    router.get('/orders', adminAuth, adminControllers.viewOrders);
    router.get('/modules/getAllModules', adminAuth, adminControllers.viewsAllModules);
    router.delete('/users/:id', adminAuth, adminControllers.removeUser);
    router.delete('/users/:userId/courses/:courseId', adminAuth, adminControllers.removeModuleFromUser);
    router.delete('/module/:id', adminAuth, adminControllers.removeModule);

    app.use('/api/admin', router)
}