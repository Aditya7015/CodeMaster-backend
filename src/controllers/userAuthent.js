const User =  require("../models/user")
const validate = require('../utils/validator');
const bcrypt = require("bcrypt");

const jwt = require('jsonwebtoken');
const express=require("express")
const redisClient=require("../config/redis")
const Submitproblem = require("../models/submissions");

const register = async (req,res)=>{
    console.log(process.env.JWT_KEY);
    try{
        // validate the data;
       validate(req.body); 
      const {firstName, emailId, password}  = req.body;
      req.body.password = await bcrypt.hash(password, 10);
      req.body.role="user";
    
   
    //  const user =  await User.create(req.body);
     const user = new User(req.body);
     user.save();
    
     const reply={
        firstName:user.firstName,
        emailId:user.emailId,
        _id:user._id,
        role:user.role
     }

     
     const token =  jwt.sign({_id:user._id , emailId:emailId,role:user.role},process.env.JWT_KEY,{expiresIn: 60*60*24*30});
     res.cookie("token", token, {
  secure: true,        // REQUIRED for HTTPS
  sameSite: "none",
  maxAge: 60 * 60 * 1000*24*30
});
     
     
    res.status(201).json({
        user:reply,
        message:"User Registered Successfully"
     });
    }
    catch(err){
        res.status(400).send("Error: "+err);
    }
}


const login = async (req,res)=>{

    try{
        const {emailId, password} = req.body;

        if(!emailId)
            throw new Error("Invalid Credentials");
        if(!password)
            throw new Error("Invalid Credentials");

        const user = await User.findOne({emailId});

        const match =await bcrypt.compare(password,user.password);

        const reply={
        firstName:user.firstName,
        emailId:user.emailId,
        _id:user._id,
        role:user.role
        }

        if(!match)
            throw new Error("Invalid Credentials");

        const token =  jwt.sign({_id:user._id , emailId:emailId,role:user.role},process.env.JWT_KEY,{expiresIn: 60*60*24*30});
       res.cookie("token", token, {
  httpOnly: true,
  secure: true,        // REQUIRED for HTTPS
  sameSite: "none",
  maxAge: 60 * 60 * 1000*24*30
});
        res.status(200).json({
            user:reply,
            message:"User Registered Successfully"
        });
    }
    catch(err){
        res.status(401).send("Error: "+err);
    }
}


// logOut feature

const logout = async(req,res)=>{
    
    try{
        const {token} = req.cookies;
        const payload = jwt.decode(token);

        await redisClient.set(`token:${token}`,'Blocked');
        await redisClient.expireAt(`token:${token}`,payload.exp);
    //    Token add kar dung Redis ke blockList
    //    Cookies ko clear kar dena.....

    res.cookie("token",null,{expires: new Date(Date.now())});
    res.send("Logged Out Succesfully");

    }
    catch(err){
       res.status(503).send("Error: "+err);
    }
}


const adminregister = async (req,res)=>{
    
    try{
      // validate the data;
    //   console.log(req.result.role);
      if(req.result.role != "admin"){
        throw new Error("you are not admin");
      }
      validate(req.body); 
      const {firstName, emailId, password}  = req.body;
      req.body.password = await bcrypt.hash(password, 10);
     
    //
    
     const user =  await User.create(req.body);
     const token =  jwt.sign({_id:user._id , emailId:emailId,role:user.role},process.env.JWT_KEY,{expiresIn: 60*60});
     res.cookie('token',token,{maxAge: 60*60*1000});
     res.status(201).send("User Registered Successfully");
     console.log("2")
    }
    catch(err){
        res.status(400).send("Error: "+err);
    }
}

const deleteprofile = async (req,res)=>{
    try{
        const userId= req.result._id;
        if(!userId){
            res.send("user is not exist");
        }
       await User.findByIdAndDelete(userId);

        //await Submission.deleteMany({userId});

        res.send("successfully deleted");
    }
    catch(err){
        res.send("error"+ err);
    }
}
module.exports = {register,login,logout,adminregister,deleteprofile};
