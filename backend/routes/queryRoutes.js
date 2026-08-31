const express=require('express');
const router=express.Router();
const Task=require('../models/Task');
const mongoose=require('mongoose');

router.post('/', async (req,res)=>{
    try{
        console.log('query execution started');
        const{organizationId, groupBy}=req.body;
        const mongoose=require('mongoose');
        const orgObjectId=new mongoose.Types.ObjectId(organizationId);
        
        //Filter by organization first for security
        const pipeline=[
            {$match:{organization: orgObjectId}}
        ];
        
        if(groupBy==='status'){
            pipeline.push({
                $group:{_id:"$status", count: {$sum:1}}
            });
        }
        else if(groupBy==='assignee'){
            pipeline.push(
                {
                    $lookup:{
                        from:'users',
                        localField:"assignee",
                        foreignField:"_id",
                        as:"userDetails"
                    }
                },

                {
                    $unwind:{
                        path:"$userDetails", 
                        preserveNullAndEmptyArrays: true
                    }
                },
                
                {
                    $group:{
                        _id:{ $ifNull: ["$userDetails.name","Unassigned"] },
                        count:{$sum:1}
                    }
                }
            );
        }else{
            return res.status(400).json({error:"Invalid groupBy parameter"});
        }
        const results=await Task.aggregate(pipeline);
        res.status(200).json(results);
    }catch(error){
        console.error("Query Engine Error:", error);
        res.status(500).json({error: "Failed to exectue query"});
    }
});

module.exports=router;