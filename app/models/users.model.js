module.exports = mongoose => {
    const schema = mongoose.Schema({
        username : {type: String , required : [true, 'username is required']},
        email: {type: String , required : [true, 'email is required']},
        password: {type: String , required : [true, 'password is required']},
        role: { type: String, enum: ['user', 'admin'], default: 'user' },
        joinedAt: { type: Date, default: Date.now },
        purchasedCourses: [{
          courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'products' },
          courseName: {type: String},
          courseImage: {type: String},
          authorization: { type: Boolean, default: true },
          modules: [{
              moduleId: { type: mongoose.Schema.Types.ObjectId },
              accessGranted: { type: Boolean, default: true },
          }]
      }],
        first_name: { type: String, required: true },
        last_name: { type: String, required: true },
        refresh_token: String
    }, {
        virtuals:{
          full_name: {
            get(){
              return this.first_name + ' ' + this.last_name
            }
          },
    
          id: {
            get(){
              return this._id
            }
          }
        },
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
      },);

    schema.method("toJSON", function() {
        const {_v , _id, ...object} = this.toObject();
        object.id = _id;
        return object;
    });

    const User = mongoose.model("users", schema);
    return User;
}