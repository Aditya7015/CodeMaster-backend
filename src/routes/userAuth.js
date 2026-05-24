const express = require('express');
const {register,login,logout,adminregister,deleteprofile}=require("../controllers/userAuthent");
const authRouter =  express.Router();
const usermidleware=require("../middleware/usermidleware");
const leaderboard = require("../controllers/leaderboard");
const getUserProfile = require("../controllers/getprofile");

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout',usermidleware,logout);
authRouter.post('/admin/register', usermidleware,adminregister);
authRouter.post('/profile',usermidleware,deleteprofile);
authRouter.get('/check',usermidleware,(req,res)=>{
    
   
    const reply = {
        firstName: req.result.firstName,
        emailId: req.result.emailId,
        _id:req.result._id,
        role:req.result.role
    }

    res.status(200).json({
        user:reply,
        message:"Valid User"
    });
})
authRouter.get('/leaderboard',leaderboard);
authRouter.get("/:userId/profile", getUserProfile);

module.exports= authRouter


