//Initialisation of code
const mongoose =require("mongoose");
const moment= require("moment");

// User Schema Code
const userSchema = mongoose.Schema({
    firstName:
    {
        type: String,
        required: true,
    },
    lastName:{
        type: String,
        require: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password:{
        type: String,
        required: true
    },
    createdAt:{
        type: String,
        default:moment().format('DD/MM/YYYY') +';'+ moment().format('hh/mm/ss'), 
        //  type: Date,default: Date.now()
    },
    updatedAt:{
        type: String,
        default: moment().format('DD/MM/YYYY')+';'+ moment().format('hh/mm/ss'),
    },
    isActive:{
        type: Boolean,
        default: false,
    }
});


// create User Model
mongoose.model("users",userSchema);

//export user model
module.exports= mongoose.model('users');