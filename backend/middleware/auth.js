const jwt=require('jsonwebtoken');

const authMiddleware= (req, res, next)=>{
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
        console.log("Invalid token");
        res.status(401).json({error:"Invalid Access"});
    }
    
};

const requireRole=(rolesAllowed)=>{
    return (req,res,next)=>{
        if(!req.user || !rolesAllowed.includes(req.user.role)){
            console.log(`Rejected: user role '${req.user?.role}' is not allowed here`);
            return res.status(403).json({error:"Access Denied, Do not have permission."});
        }
        next();
    };
};

module.exports={authMiddleware, requireRole};