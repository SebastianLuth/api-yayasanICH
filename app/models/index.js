const dbConfig = require('../../config/db.config')
const mongoose = require('mongoose')

mongoose.Promise = global.Promise

const db = {}
db.mongoose = mongoose
db.url = dbConfig.url
db.products = require('./product.model')(mongoose)
db.carts = require('./cart.model')(mongoose)
db.consultation = require('./consultation.model')(mongoose)
console.log(db.consultation , "is exist")
db.users = require('./users.model')(mongoose)
db.modules = require('./module.model')(mongoose);
db.news = require('./news.model')(mongoose);

module.exports = db;