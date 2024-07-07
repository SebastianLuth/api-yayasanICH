module.exports = (app) => {
    const products = require('../controllers/product.controllers')

    let router = require('express').Router()

    router.get('/', products.findAll)
    router.get('/:name', products.findOne)

    app.use('/api/products', router)
}