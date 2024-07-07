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

// Use environment variables for secrets
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

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
