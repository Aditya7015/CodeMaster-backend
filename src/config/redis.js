const {createClient} = require("redis");

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PAS ,
    socket: {
        host: 'redis-17216.c276.us-east-1-2.ec2.cloud.redislabs.com',
        port: 17216
    }
});

module.exports= redisClient;