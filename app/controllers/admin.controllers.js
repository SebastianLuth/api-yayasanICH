const db = require('../models');
const Admin = db.users;
const Product = db.products;
const Module = db.modules;
const  Order = db.carts;
const News = db.news;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email, role: 'admin' });

        if (!admin || !(await bcrypt.compare(password, admin.password))) {
            return res.status(401).send({ message: 'Invalid email or password' });
        }

        const accessToken = jwt.sign({ id: admin._id, role: admin.role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

        // Generate refresh token
        const refreshToken = jwt.sign({ id: admin._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' });
        
        admin.refresh_token = refreshToken;
        await admin.save();

        res.cookie('refresh_token', refreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 });
        res.send({ access_token: accessToken });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
exports.viewOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('userId').populate('products').exec();
        res.status(200).send(orders);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
exports.removeUser = async (req, res) => {
    try{
        const userId = req.params.id;
        const user = await Admin.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }
        res.status(200).send({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
exports.viewsAllModules = async (req,res) => {
    try {
        const modules = await Module.find();
        res.status(200).send(modules)
    } catch (error) {
        res.status(500).send({message:error.message})
    }
};
exports.removeModuleFromUser = async (req, res) =>{
    try {
        const { userId, courseId } = req.params;
        const user = await Admin.findById(userId);
    
        if (!user) {
          return res.status(404).send({ message: 'User not found' });
        }

        user.purchasedCourses = user.purchasedCourses.filter(course => course.courseId.toString() !== courseId);

        await user.save();
        res.status(200).send({ message: 'Module removed successfully' });
    } catch (error) {
        res.status(500).send({message: error.message})
    }
};
exports.removeModule = async (req,res) => {
    try{
        const moduleId = req.params.id;
        const module = await Module.findByIdAndDelete(moduleId);
        if (!module) {
            return res.status(404).send({ message: 'Module not found' }); 
        }
        res.status(200).send({ message: 'Module deleted successfully' });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
exports.addModule = async (req, res) => {
    try {
        // console.log(req.body);//Debug log untuk memastikan field body sesuai
        // console.log(req.file);
        const { 
            judul, 
            deskripsi, 
            penulis, 
            tanggal_dibuat, 
            bab 
        } = req.body;
        const pdf_url = req.file ? req.file.path : null;
        const newModule = new Module({ 
            judul, 
            deskripsi, 
            penulis, 
            tanggal_dibuat, 
            bab: JSON.parse(bab), 
            pdf_url 
        });
        
        await newModule.save();
        res.status(201).send(newModule);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
exports.addProduct = async (req, res) => {
    //console.log(req.body); //Debug log untuk memastikan field body sesuai
    //console.log(req.file);
    try {
        const {
            code,
            name,
            price,
            description,
            longDescription,
            averageRating,
            videoUrl,
            willLearn,
            materialInclude,
            targetAudience,
            modules,
        } = req.body;
        
        const imageUrl = req.file ? req.file.path : null;

        const newProduct = new Product({
            code,
            name,
            price,
            description,
            longDescription,
            imageUrl,
            averageRating,
            videoUrl,
            willLearn: JSON.parse(willLearn),
            materialInclude: JSON.parse(materialInclude),
            targetAudience: JSON.parse(targetAudience),
            modules: JSON.parse(modules),
        });

        await newProduct.save();
        res.status(201).send(newProduct);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
exports.addNews = async (req, res) => {
    try {
        //console.log(req.files); // Debug log
        const { 
            judul, 
            short_description, 
            konten, 
            tanggal_dibuat 
        } = req.body;

        if (!judul || !short_description || !konten || !tanggal_dibuat) {
            return res.status(400).send({ message: 'All fields are required.' });
        }

        const image_one = req.file ? req.file.path : null;

        const newNews = new News({
            judul,
            short_description,
            konten,
            image_one,
            tanggal_dibuat
        });

        await newNews.save();
        res.status(201).send(newNews);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
exports.addConsultation = async (req, res) => {
    try {
        const {
            name,
            header,
            description,
            averageRating,
            id,
            consultationInclude,
        } = req.body;
        
        const imageUrl = req.file ? req.file.path : null;

        const newConsultation = new Consultation({
            name,
            header,
            description,
            imageUrl,
            averageRating,
            id,
            consultationInclude: JSON.parse(consultationInclude),
        });

        await newConsultation.save();
        res.status(201).send(newConsultation);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
