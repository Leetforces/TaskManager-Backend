// init code
require("dotenv").config();
const express =require("express");
const app=express();
const morgan = require("morgan");
const cors = require("cors");
const port= process.env.PORT;
const database= require("./database.js");
const userController= require("./controllers/users");

const taskController=require('./controllers/tasks');
// Middleware Setup
app.use(morgan("dev")); // development log available for each routes
app.use(cors());
app.use('/api/user',userController); // virtual path prefix  (/api/user)
app.use('/api/task',taskController);

// Routes
app.all("/",(req,res)=>{
    return res.json({
        status: true,
        message: "Index Page Route Working..."
    });
});

//server start
app.listen(port,()=>{
    
    console.log("Server running at Port: "+port);
});
