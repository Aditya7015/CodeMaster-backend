const jwt = require('jsonwebtoken');
const User = require("../models/user");
const redisClient = require("../config/redis")

const adminmidleware = async (req,res,next)=>{
    try{
        // console.log("adminmiddleware",req.cookies);
       
        const {token}=req.cookies;
        // console.log(req);
        if(!token){
            throw new Error("token is not persent");
        }
        const payload=jwt.verify(token,process.env.JWT_KEY );
        // console.log(payload);
        const {_id}=payload;

        if(!_id){
            throw new Error("invalid token");
        }

        const result=await User.findById(_id);
        if(!result){
            throw new Error("user is not persent");
        }

        if(payload.role!="admin"){
            throw new Error("you are not admin");
        }        
        const IsBlocked = await redisClient.exists(`token:${token}`);
        if(IsBlocked){
            throw new Error("invalid token");
        }
        req.result=result;
       
        next();
    }
    catch(err){
        res.status(401).send("Error: "+ err.message)
    }

}

module.exports=adminmidleware;