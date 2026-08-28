// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Organization = require('../models/Organization');

// Route 1: Create a new Organization and a User inside it
router.post('/register',async(req,res)=>{
    try{
        const {userName, email, orgName}=req.body;

        //Check if organization already exist
        let existingOrg = await Organization.findOne({name:orgName});

        //If organization does not exist then create it
        if(!existingOrg){
            existingOrg=await Organization.create({name:orgName});
            console.log(`Created new Organization: ${existingOrg.orgName} with Id ${existingOrg._id}`);
        }
        else{
            console.log(`Joined existing Organization: ${existingOrg.name} with Id ${existingOrg._id}`);
        }

        const safeOrgId = existingOrg._id.toString();

        console.log(`Attempting to create User with safeOrgId: ${safeOrgId}`);

        //Create the user and link to Organization
        const newUser=await User.create({
            name:userName,
            email:email,
            organization:safeOrgId
        });

        res.status(201).json({message:'user created', user:newUser});
    }
    catch(error){
        console.error(error);
        res.status(500).json({error:"Something went wrong"});
    }
});

// Route 2: Get all users and their organization details
router.get('/', async (req, res) => {
    try {
        // .populate() tells MongoDB to fetch the actual Organization data, not just the ID!
        const users = await User.find().populate('organization');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: "Something went wrong" });
    }
});

module.exports = router;