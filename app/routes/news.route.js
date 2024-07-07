module.exports = (app) => {
    const News = require('../controllers/news.controllers');
    const router = require('express').Router();


    router.get('/' , News.findAll);
    router.get('/:judul', News.findOne);


    app.use('/api/news',router)
}