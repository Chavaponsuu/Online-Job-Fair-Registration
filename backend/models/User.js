const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const UserSchema = new mongoose.model({
  name: {
    type: String,
    required: [true, "Please add a name"],
  },
  email: {
    type: String,
    required: [true, "Please add a email"],
    unique: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please add a valid email",
    ],
    
  },
  password:{
    type:String,
    required:[true,"Please add a password"],
    minlength:8,
    select:false,
  },
  tel:{
      type: String,
  required: [true, "Please add a telephone number"],
  unique: true,
  trim: true,
  match: [/^(?:\+66|0)[0-9]{8,9}$/, "Please enter a valid Thai phone number"],
    
  },
  role:{
    type:String,
    enum : ["user" , "admin"],
    default:"user",
  }
},{Timestamp:true});

UserSchema.pre("save", async function(next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.getSignedJwtToken = function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET , {
        expiresIn:process.env.JWT_EXPIRE
    })
};

UserSchema.methods.matchPassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword , this.password);
};
module.exports = mongoose.model("User", UserSchema);

