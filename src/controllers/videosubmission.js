const cloudinary = require("cloudinary").v2
const SolutionVideo =require("../models/vidSubm");
const Problem = require("../models/problem");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

const generateSignature=async(req,res)=>{
    
    try{
        const {problemId} = req.params;
        const userId=req.result._id;
        //verify the problem persent or not 
        
        const problem =await Problem.findById(problemId);
        if(!problem){
           return res.status(404).json("the problem is not present");
        }
        
        const timestamp = Math.round(new Date().getTime() / 1000);
        const publicId = `leetcode-solutions/${problemId}/${userId}_${timestamp}`;
       
        const uploadParams = {
            timestamp:timestamp,
            public_id:publicId,
        } 

        const signature = cloudinary.utils.api_sign_request(
            uploadParams,
            process.env.CLOUDINARY_SECRET_KEY
        );

        res.json({
            timestamp,
            signature,
            public_id:publicId,
            api_key: process.env.CLOUDINARY_API_KEY,
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            upload_url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload`,
        })
    }
    catch(error){
        console.log('Error generating upload signature:', error);
        res.status(500).json({ error: 'Failed to generate upload credentials' });

    }
}


const saveMetaData = async(req,res)=>{

    try{
        const {
      problemId,
      cloudinaryPublicId,
      secureUrl,
      duration,
    } = req.body;

    // Verify the upload with Cloudinary
    const cloudinaryResource = await cloudinary.api.resource(
      cloudinaryPublicId,
      { resource_type: 'video' }
    );
  
    if (!cloudinaryResource) {
      return res.status(400).json({ error: 'Video not found on Cloudinary' });
    }

    const isExisting = SolutionVideo.findOne({
        problemId,
        secureUrl,
        cloudinaryPublicId
    })
    
    if(isExisting){
       return res.json("video already uploaded");
    }
       
        const thumbnailUrl = cloudinary.image(cloudinaryResource.public_id,{resource_type: "video"})
        onsole.log(thumbnailUrl)

        const videoSolution = await SolutionVideo.create({
            problemId,
            userId,
            cloudinaryPublicId,
            secureUrl,
            duration: cloudinaryResource.duration || duration,
            thumbnailUrl
        });
        console.log(videoSolution)
        res.status(201).json({
            message: 'Video solution saved successfully',
            videoSolution: {
                id: videoSolution._id,
                thumbnailUrl: videoSolution.thumbnailUrl,
                duration: videoSolution.duration,
                uploadedAt: videoSolution.createdAt
            }
        });

    }
    catch(error){
        console.log('Error saving video metadata:', error);
        res.status(500).json({ error: 'Failed to save video metadata' });
    }

}

const deleteVideo = async(req,res)=>{
    try{
        const {problemId}=req.params;
        
        const video = await SolutionVideo.findOneAndDelete({problemId:problemId});
        
        
        if(!video){
            return res.json({error:"video does not exist"});
        }
            console.log("4")
        await cloudinary.uploader.destroy(video.cloudinaryPublicId, { resource_type: 'video' , invalidate: true });
        console.log("5")
        res.json({message:"video delteted successfully"});
    }
    catch(error){
        res.json({error:"failed"});

    }
}

module.exports = {generateSignature,saveMetaData,deleteVideo};