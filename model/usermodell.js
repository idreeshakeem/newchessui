const mongoose=require("mongoose");
const userSchema = new mongoose.Schema({
    userName: { type: String },
    email: { type: String, unique: true },
    city: { type: String },
    mobileNo: { type: String },
    password: { type: String },
    joindate:{type:String},
    walletBalance:{type:Number},
  });
  

const user=mongoose.model('user',userSchema);

module.exports=user;