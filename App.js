const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const corsOptions = require('./config/cors');
const credentials = require('./app/middleware/credentials');
const errorHandlerMiddleware = require('./app/middleware/error_handler');
const authenticationMiddleware = require('./app/middleware/authentication');
const authMiddleware = require('./app/middleware/auth');
 
const PORT = process.env.PORT || 8080;

//Connecting DB
const db = require('./app/models');
db.mongoose.connect(db.url).then((result) => {
    console.log('connected to DB');
}).catch((err) => {
    console.log(err);
});


process.env.ACCESS_TOKEN_SECRET = "448e0448fa31dd1c780027d4342b4dac8600b7eb61c7e809f2ffc10cafed8aa643fd670e9db4c6e7d57e6fb1175cbaa1beedd74d07f61b4b4121b07dd72feb06";
process.env.REFRESH_TOKEN_SECRET = "e87ca35a9ec18fe1965121767d07c8544271df114e449fb4dca79aecfaa094cade4386834ccd8e314c89ca7ca2a705ebe115e8285a507fdd8ab2c8cf503bd2be";

// Allow Credentials
app.use(credentials);

// Allow some orgins for backend and frontend
app.use(cors(corsOptions));

app.use(express.urlencoded({extended: true}));

app.use(express.json());

app.use(cookieParser());

app.use(authenticationMiddleware);

app.use('/img', express.static(path.join(__dirname,'./public/img')));
app.use('/uploads/image', express.static(path.join(__dirname, './uploads/image')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Default error handler
app.use(errorHandlerMiddleware);

app.get('/', (req, res) => {
    res.json({
        message: 'Hello Ini api yayasan ICH ©Sebastian_Luth'
    });
});

require('./app/routes/auth.route')(app);
require('./app/routes/product.route')(app);
require('./app/routes/consultation.route')(app);
require('./app/routes/cart.route')(app);
require('./app/routes/users.route')(app);
require('./app/routes/admin.route')(app);
require('./app/routes/news.route')(app);


app.listen(PORT, () => {
    console.log(`Server run on http://localhost:${PORT}`);
});