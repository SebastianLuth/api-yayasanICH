module.exports = mongoose => {
    const schema = mongoose.Schema({
        judul : String,
        short_description : String,
        konten : String,
        image_one : String,
        tanggal_dibuat: { type: Date, required: true },
    }, { timestamps: true });

    schema.method("toJSON", function() {
        const { __v , _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    }); 

    const News = mongoose.model("news", schema);
    console.log("News model created");

    return News;
}