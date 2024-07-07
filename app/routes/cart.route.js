module.exports = (app) => {
    const cartController = require('../controllers/cart.controllers.js');
    const authMiddleware = require('../middleware/auth.js');
    const router = require('express').Router();

    router.get('/', authMiddleware, cartController.getCart);
    router.post('/add', authMiddleware, cartController.addToCart);
    router.post('/remove', authMiddleware, cartController.romoveFromCart);
    router.post('/checkout', authMiddleware, cartController.checkout);
    router.post('/midtrans-notification', cartController.midtransNotification);

    app.use('/api/cart', router);
};