// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const User = require('../models/User');
const Organization = require('../models/Organization');
const authMiddleware=require('../middleware/auth');

router.post('/register', async(req, res)=>{
    try{
        const {userName, email, password, orgName}=req.body;

        let existingOrg=await Organization.findOne({name: orgName});
        if(!existingOrg){
            existingOrg=await Organization.create({name: orgName});
        }

        const safeOrgId=existingOrg._id.toString();

        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password, salt);

        await User.create({
            name:userName,
            email:email,
            password:hashedPassword,
            organization:safeOrgId
        });

        res.status(201).json({message:'User securely created'});
    }catch(error){
        console.error('Registration error: ', error);
        res.status(500).json({error:'Failed to register'});
    }
});

router.post('/login', async(req, res)=>{
    try{

    //console.log("Email trying to log in:", req.body.email);

        const {email, password}=req.body;
        const user =await User.findOne({email}).populate('organization');
        if(!user){
            return res.status(400).json({error:"Invalid email or password"});
        }
        const isMatch=await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({error:"Invalid email or password"});
        }
        const token=jwt.sign(
            {userId:user._id, orgId:user.organization._id},
            process.env.JWT_SECRET,
            {expiresIn:'1d'}
        );
        res.status(200).json({
            message:'Login Succesfull',
            token:token,
            user:{
                _id:user._id,
                name:user.name,
                email:user.email,
                organization:user.organization
            }
        });
    }catch(error){
        console.error("Login error: ", error);
        res.status(500).json({error: "Failed to login"});
    }
});

//Delete a User from database
router.delete('/:id', async(req,res)=>{
    try{
        //Extracting id from route parameters
        const userId=req.params.id;
        //console.log(userId);
        //early fallback if user id dont exist
        if (!userId){
            console.log('Id not found');
            return res.status(404).json({message:'User not found'});
        } 
        await User.findByIdAndDelete(userId);
        res.status(200).json({message:"Successfully deleted user from database"});
    }
    catch{
        res.status(500).json({message:"Server database error", error:error.message});
    }
});

//used to auto login when refreshed
router.get('/me', authMiddleware, async(req, res)=>{
    try{
        const user=await User.findById(req.user.userId).populate('organization');
        if(!user){
            return res.status(404).json({error:'User not found'});
        }
        res.status(200).json({
            _id: user._id,
            name:user.name,
            email:user.email,
            organization:user.organization
        });
    }catch(error){
        console.error('Auto login failed: ',error);
        res.status(500).json({error:'Server error'});
    }
});
module.exports = router;