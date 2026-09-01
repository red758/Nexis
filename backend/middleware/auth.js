const jwt=require('jsonwebtoken');

module.exports=function (req, res, next){
    console.log(`\nBOUNCER CHECKING REQUEST TO: ${req.originalUrl}`);
    const authHeader=req.header('Authorization');
    console.log(`Authorization Header received:`, authHeader ? "YES" : "NO");
    if(!authHeader){
        console.log("REJECTED: No header found.");
        return res.status(401).json({error:'Access Denied'});
    }
    try{
        const token=authHeader.split(' ')[1];
        const verifiedData=jwt.verify(token, process.env.JWT_SECRET);
        req.user=verifiedData;
        next();
    }catch(error){
        res.status(401).json({error:"Invalid Access"});
    }
};