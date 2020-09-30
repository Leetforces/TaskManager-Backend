// init code
const mongoose= require("mongoose");
const moment =require("moment");

//create task schema

const taskSchema= mongoose.Schema({
    title:{
        type: String,
        required: true,
    },
    description:{
        type: String ,
        required: true,
    },
    deadline:{
        type: String ,
        required: true,
    },
    createdOn:{
        type: String,
        default: moment().format("DD/MM/YYYY")+';'+moment().format("hh/mm/ss"),
    },
    updatedOn:{
        type: String,
        default: moment().format("DD/MM/YYYY")+':'+moment().format("hh/mm/ss"),
    },
    isDone:{
        type: Boolean,
        default: false,
    },
    userID:{
        type: String,
        required: true
    }

});
mongoose.model("tasks",taskSchema);
module.exports= mongoose.model("tasks");