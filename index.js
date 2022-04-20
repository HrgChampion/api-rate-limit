const express=require("express");
const path=require("path");
//const fetch=require("node-fetch");

const redis=require("./redis-client");
const app=express();
app.use(express.json());

app.get("/",(req,res)=>{
    res.sendFile(path.join(__dirname,"index.html"));
}   
);

app.post("/api1",async (req,res)=>{

    const ip=req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    console.log(ip);
    const requests=await redis.incr(ip);

    let ttl;
    if(requests===1){
        await redis.expire(ip,60);
        ttl=60;
    }else{
        ttl=await redis.ttl(ip);
    }

   
    if(requests>10){
        res.status(429).send("Too many requests");
        return;
    }
    //console.log("No of requests made" +requests);
    return res.json({
        response:"success",
        callsInAMinute:requests,
        ttl
    });
});
app.post("/api2",async (req,res)=>{
    return res.json({
        response:"success",
        callsInAMinute:0,
        ttl
    });
});

app.post("/api3",async (req,res)=>{
    return res.json({
        response:"success",
        callsInAMinute:0
    });
});

app.listen(3000,()=>{
    console.log("Server started at port 3000");
}
);
