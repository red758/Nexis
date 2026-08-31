const jwt=require('jsonwebtoken');

module.exports=function (req, res, next){
    const authHeader=req.header('Authorisation');
    if(!authHeader){
        return res.status(401).json({error:'Access Denied'});
    }
    try{
        const token=authHeader.split('')[1];
        const verifiedData=jwt.verify(token, process.env.JWT_SECRET);
        req.user=verifiedData;
        next();
    }catch(error){
        res.status(401).json({error:"Invalid Access"});
    }
};