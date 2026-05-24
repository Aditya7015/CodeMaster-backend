const express= require("express");
const videoRouter= express.Router();
const  {generateSignature,saveMetaData,deleteVideo} = require("../controllers/videosubmission")
const adminmidleware = require("../middleware/adminmiddleware");

videoRouter.get("/create/:problemId",adminmidleware,generateSignature);
videoRouter.post("/save",adminmidleware,saveMetaData);
videoRouter.delete("/delete/:problemId",adminmidleware,deleteVideo);
module.exports = videoRouter;