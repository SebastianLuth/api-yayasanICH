module.exports = mongoose => {
    const schema = mongoose.Schema({
        name : String,
        header : String,
        description : String,
        imageUrl : String,
        averageRating: Number,
        videoUrl: String,
        consultationInclude : [String],
    });

    schema.method("toJSON", function() {
        const {_v , _id, ...object} = this.toObject();
        object.id = _id;
        return object;
    });

    const Consultation = mongoose.model("consultations", schema);
    return Consultation;
}