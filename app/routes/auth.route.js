module.exports= (app)=> {

    const router = require('express').Router(); 
    const authControllers = require('../controllers/user.controllers')
    const authMiddleware = require('../middleware/auth')

    router.post('/register', authControllers.register)
    router.post('/login', authControllers.login)
    router.post('/logout', authControllers.logout)
    router.post('/refresh', authControllers.refresh)
    router.get('/user', authMiddleware, authControllers.user)

    app.use('/api/auth', router)
}
