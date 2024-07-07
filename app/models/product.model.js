module.exports = mongoose => {
    const schema = mongoose.Schema({
        code: { type: String, required: true },  
        name : String,
        price : String,
        description : String,
        imageUrl : String,
        averageRating: Number,
        videoUrl: String,
        willLearn: [String],
        courseCurriculum: [{
            tittle : String,
            lesson : String
        }],
        materialInclude : [String],
        targetAudience : [String],
        modules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'modules' }]
    });

    schema.method("toJSON", function() {
        const {_v , _id, ...object} = this.toObject();
        object.id = _id;
        return object;
    });

    const Product = mongoose.model("products", schema);
    return Product;
}