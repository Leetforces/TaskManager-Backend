//init code
const jwt= require("jsonwebtoken");
const token_key= process.env.TOKEN_KEY;
const User= require("./../models/users");

function verifyToken(req,res,next){
    const token=req.headers['x-access-token'];
    if(!token)
    {
        return res.json({
            status: false,
            message: 'Token not provided'
        });
    }
     
    //token verify
    jwt.verify(token,token_key,(error,decoded)=>
    {
        // check error
        if(error){
            return res.json({
                status: false,
                message: "Fail to verify token.",
            });
        }

        // check user id in database
        User.findById(decoded.id,{password:0,createdAt:0,updatedAt:0
        },(error,result)=>{
            // check error
            if(error)
            {
                return res.json({
                    status: false,
                    message:"Fail to read user data in database ",
                    error: error
                });
            }
            // check result is empty
            if(!result)
            {
                return res.json({
                    status: false,
                    message:"User don\'t exists. Invalid ID",
                });
            }

            // output the final result
            req.userID=result._id;
            return next();
            
        })
    })
     
};

//module export
module.exports= verifyToken;