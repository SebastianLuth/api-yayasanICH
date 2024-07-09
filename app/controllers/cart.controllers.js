const db = require('../models');
const Cart = db.carts;
const Product = db.products;
const User = db.users;
const midtransClient = require('midtrans-client');

const snap = new midtransClient.Snap({
    isProduction: true,
    serverKey: process.env.MIDTRANS_SERVER_KEY
});

exports.addToCart = async (req, res) => {
    const userId = req.user.id;
    const { code, quantity } = req.body;

    // Validasi input
    if (!code || !quantity) {
        return res.status(400).send({ message: "Product code and quantity are required" });
    }

    try {
        //console.log('Looking for product with code:', code);
        const product = await Product.findOne({ code }).exec();
        if (!product) {
            //console.log('Product not found');
            return res.status(404).send({ message: "Product not found" });
        }
        //console.log('Product found:', product);

        let cart = await Cart.findOne({ userId }).exec();

        if (!cart) {
            cart = await Cart.create({ userId, products: [{ productId: product._id, quantity }] });
        } else {
            const productIndex = cart.products.findIndex(p => p.productId.toString() === product._id.toString());
            if (productIndex > -1) {
                cart.products[productIndex].quantity += quantity;
            } else {
                cart.products.push({ productId: product._id, quantity });
            }
            await cart.save();
        }

        res.status(200).send(cart);
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).send({ message: error.message });
    }
};

exports.getCart = async (req,res) => {
    try{
        const userId = req.user.id;
        const cart = await Cart.findOne({ userId }).populate('products.productId').exec();
        
        if (!cart) {
            return res.status(200).send({ message: "Cart is empty", products: [] });
        }
        
        return res.status(200).send(cart);
        
    }catch (error){
        res.status(500).send({ message: error.message });

    }
}

exports.romoveFromCart = async (req,res) => {
    try{
        const userId = req.user.id;
        const {productId} = req.body; 

        if(!productId){
            return res.status(400).send({ message: "Product ID is required" });
        }

        let cart = await Cart.findOne({userId }).exec();

        if (!cart) {
            return res.status(404).send({ message: "Cart not found" });
        }

        const productIndex = cart.products.findIndex(p => p.productId.toString() === productId)

        if(productIndex >= 0){
            cart.products.splice(productIndex, 1);
            await cart.save();
            return res.status(200).send(cart);
        }else{
            return res.status(404).send({ message: "Product not found in cart" });
        }

    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).send({ message: error.message });
    }
}

exports.checkout = async (req, res) => {
    try {
        const userId = req.user.id;
        let cart = await Cart.findOne({ userId }).populate('products.productId').exec();

        if (!cart) {
            return res.status(404).send({ message: "Cart not found" });
        }

        const user = await User.findById(userId).exec();

        // Create order details for Midtrans
        const transactionDetails = {
            order_id: `order-${Date.now()}-${userId}`,
            gross_amount: cart.products.reduce((sum, item) => sum + (Number(item.productId.price) * Number(item.quantity)), 0)
        };

        const itemDetails = cart.products.map(item => ({
            id: item.productId._id.toString(),
            price: Number(item.productId.price),
            quantity: item.quantity,
            name: item.productId.name
        }));

        const customerDetails = {
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone: user.phone 
        };

        const parameter = {
            transaction_details: transactionDetails,
            item_details: itemDetails,
            customer_details: customerDetails,
        };

        // Create transaction with Midtrans
        const transaction = await snap.createTransaction(parameter);

        res.status(200).send({
            transactionToken: transaction.token
        });

    }catch (error) {
        console.error('Error during checkout:', error);
        res.status(500).send({ message: error.message });
    }
};


exports.midtransNotification = async (req, res) => {
    try {
        const notificationJson = req.body;
        const statusResponse = await snap.transaction.notification(notificationJson);
        const orderId = statusResponse.order_id;
        const transactionStatus = statusResponse.transaction_status;
        
        console.log('Received notification:', notificationJson);
        console.log('Transaction status:', transactionStatus);

        if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
            const userId = orderId.split('-')[2];
            let cart = await Cart.findOne({ userId }).populate('products.productId').exec();
            const user = await User.findById(userId).exec();

            for (const cartProduct of cart.products) {
                const product = cartProduct.productId;
                const productName = product.name;
                const productImage = product.imageUrl;
                const modules = product.modules.map(moduleId => ({
                    moduleId,
                    accessGranted: true
                }));

                user.purchasedCourses.push({
                    courseId: product._id,
                    courseName: productName,
                    courseImage: productImage,
                    authorization: true,
                    modules
                });
            }

            await user.save();

            // Clear the cart after checkout
            cart.products = [];
            await cart.save();
        }

        res.status(200).send({ message: "Notification handled successfully" });

    } catch (error) {
        console.error('Error handling Midtrans notification:', error);
        res.status(500).send({ message: error.message });
    }
};
