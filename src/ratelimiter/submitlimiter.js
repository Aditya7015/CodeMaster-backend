const redisClient = require("../config/redis");

const submitlimiter = async (req,res,next)=>{
    try{
        const userId = req.result._id;
        const rediskey= `reiskey:${userId}`;

        const isexist= await redisClient.exists(rediskey);
        if(isexist){
            res.status(239).send("Error wait for 10 sec to submit");
        }

        await redisClient.set(rediskey, "cooldown_active",{
            EX:10,
            NX:true
        })
        next();
    }
    catch(err){
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = submitlimiter;