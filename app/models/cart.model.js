module.exports = mongoose => {
    const schema = mongoose.Schema({
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
        products: [{
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'products', required: true },
            quantity: { type: Number, default: 1 }
        }]
    }, {
        timestamps: true
    });

    schema.method("toJSON", function() {
        const {_v , _id, ...object} = this.toObject();
        object.id = _id;
        return object;
    });

    const Cart = mongoose.model("cart", schema);
    return Cart;
}
