module.exports= (app)=> {
    
    const authControllers = require('../controllers/user.controllers');
    const authMiddleware = require('../middleware/auth')
    const router = require('express').Router(); 

    router.get('/purchased-modules', authMiddleware, authControllers.getAllPurchasedModules);
    router.get('/purchased-modules/:courseId', authMiddleware, authControllers.getPurchasedModulesByCourse);
    router.get('/download-module/:moduleId', authMiddleware, authControllers.downloadModuleFile);
    

    app.use('/api', router)
}   