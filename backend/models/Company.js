const mongoose  = require("mongoose");

const CompanySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    address:{
        type:String,
        

    },
    website:String,
    description:String,
    tel:String,


},{timestamps:true});
module.exports = mongoose.model("Company" , CompanySchema)