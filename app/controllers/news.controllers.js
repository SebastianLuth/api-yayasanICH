const db = require('../models')
const News = db.news

exports.findAll = (req, res) => {
    console.log("Find all news");
    News.find().sort({ tanggal_dibuat: -1 }).limit(10)
    .then(result => {
        console.log("News found: ", result);
        res.send(result);
    }).catch(err => {
        console.error("Error finding news: ", err);
        res.status(409).send({
            message: err.message
        });
    });
};

exports.findOne = (req, res) => {
    console.log("Find one news with title: ", req.params.judul);
    News.findOne({ judul: req.params.judul })
    .then(result => {
        console.log("News found: ", result);
        res.send(result);
    }).catch(err => {
        console.error("Error finding news: ", err);
        res.status(409).send({
            message: err.message
        });
    });
};
