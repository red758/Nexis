const jwt=require('jsonwebtoken');
const User=require('../models/User');

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
    return async (req,res,next)=>{
        try{
            const targetOrgId=req.header('X-Organization-Id') || req.body.organizationId || req.params.orgId;

            if(!targetOrgId){
                console.log("Rejected: no organization context provided");
                return res.status(400).json({error:"Organization Context Required"});
            }

            const user=await User.findById(req.user.userId);
            if(!user) return res.status(400).json({error:"User not found"});

            const membership=user.memberships.find(
                m=>m.organization.toString()===targetOrgId.toString()
            );

            if(!membership || !rolesAllowed.includes(membership.role)){
                console.log(`Rejected: User role ${membership?.role} is not allowed here`);
                return res.status(400).json({error:"Access denied, you do not have permission"});
            }

            req.user.activeRole=membership.role;
            next();
        }catch(error){
            console.error("Role verification error: ",error);
            res.status(500).json({error:"Server error verifying permissions"});
        }
    };
};

module.exports={authMiddleware, requireRole};