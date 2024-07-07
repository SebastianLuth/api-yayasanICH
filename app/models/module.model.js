module.exports = mongoose => {
    const schema = mongoose.Schema({
        judul: { type: String, required: true },
        deskripsi: { type: String, required: true },
        penulis: { type: String, required: true },
        tanggal_dibuat: { type: Date, required: true },
        bab: [{
            judul_bab: { type: String, required: true },
            deskripsi_bab: { type: String, required: true },
            materi: [{
                judul_materi: { type: String, required: true },
                konten: { type: String, required: true },
                video_url: { type: String },
                quiz: [{
                    pertanyaan: { type: String, required: true },
                    opsi: [{ type: String, required: true }],
                    jawaban_benar: { type: String, required: true }
                }]
            }]
        }],
        pdf_url: { type: String } 
    });

    schema.method("toJSON", function() {
        const {_v , _id, ...object} = this.toObject();
        object.id = _id;
        return object;
    });

    const Module = mongoose.model("modules", schema);
    return Module;
}