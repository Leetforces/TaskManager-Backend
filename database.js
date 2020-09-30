//init code
const mongoose = require("mongoose");
const db_url = process.env.DB_URL;

//connection start
mongoose.connect(db_url,{useNewUrlParser:true,useUnifiedTopology:true,useCreateIndex:true},(error,link)=>{
   
    // check database connect error
    if(error)
    console.log("Error: "+error);
    
    // database connect success
    console.log("DB Connect Success..");
   // console.log(link);
});