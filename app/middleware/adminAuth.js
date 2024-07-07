const jwt = require('jsonwebtoken');
const db = require('../models');
const Admin = db.users;

const adminAuth = async (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const admin = await Admin.findOne({ _id: decoded.id });

        if (!admin) {
            throw new Error();
        }

        req.admin = admin;
        next();
    } catch (error) {
        res.status(401).send({ error: 'Please authenticate as admin.' });
    }
};

module.exports = adminAuth;