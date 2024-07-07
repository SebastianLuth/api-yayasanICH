module.exports = (app) => {
    const consultations = require('../controllers/consultation.controllers')
    const router = require('express').Router(); 
    router.get('/', consultations.findAll)
    router.get('/:name', consultations.findOne)

    app.use('/api/consultation', router)
}