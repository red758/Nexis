const express=require("express");
const Organization=require("../models/Organization");
const User=require('../models/User');

const router=express.Router();

router.get('/allorg/:orgName', async(req,res)=>{
    try{
        console.log("Request received to fetch all Org");

        const orgName=req.params.orgName;

        if(!orgName){
            console.log("Organization name not given");
            return res.status(400).json({error:"No organization name given"});
        }

        const newOrg=await Organization.find({
            name:orgName
        });

        if(!newOrg){
            console.log("new org not created");
            return res.status(400).json({error:"No new Org created"});
        }

        console.log("This is new Org: ", newOrg);

        res.status(200).json({message:"New Org created successfully", newOrg});
    }catch(error){
        console.log("new org not created db error");
        return res.status(400).json({error:"New Org creation failed"});
    }
})

router.post('/add', async(req,res)=>{
    try{
        console.log("Request received to add a new Org");

        const {name, id}=req.body;

        if(!name){
            console.log("Organization name not given");
            return res.status(400).json({error:"No organization name given"});
        }

        const newOrg=await Organization.create({
            name:name
        });
        console.log("new org created");
        
        if(!newOrg){
            console.log("new org not created");
            return res.status(400).json({error:"No new Org created"});
        }

        const updatedUser=await User.findByIdAndUpdate(
            id,
            {
                $push:{
                    memberships:{
                        organization:newOrg._id,
                        role:'admin'
                    }
                }
            },
            {new: true}
        );
        console.log("user updated with org");

        const orgAdd={
            organization:newOrg,
            role:'admin'
        };

        console.log("This is updated user: ", updatedUser);
        console.log("This is new Org: ", newOrg);

        res.status(200).json({message:"New Org created successfully", orgAdd});
    }catch(error){
        console.log("new org not created db error");
        return res.status(400).json({error:"New Org creation failed"});
    }
});

module.exports=router;
