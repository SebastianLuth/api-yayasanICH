const db = require('../models')
const consultation = db.consultation

exports.findAll = (req, res) => {
    consultation.find()
        .then((result) => {
            res.send(result)
        }).catch((err) => {
            res.status(500).send({
                message: err.message || "Some error while retrieving Consultation."
            })
        })
}

exports.findOne = (req, res) => {
    consultation.findOne({
            name: req.params.name
        })
        .then((result) => {
            res.send(result)
        }).catch((err) => {
            res.status(500).send({
                message: err.message || "Some error while retrieving Consultation."
            })
        })
}
