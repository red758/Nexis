const express=require('express');
const router=express.Router();
const Project=require('../models/Project');
const {requireRole} = require('../middleware/auth');

router.post('/', requireRole(['admin']), async(req,res)=>{
    try{
        const {name, organizationId, assignedMembers}=req.body;

        const members=assignedMembers || [];

        if(!members.includes(req.user.userId)){
            members.push(req.user.userId)
        }

        const newProject=await Project.create({
            name,
            organization: organizationId,
            assignedMembers: members
        });
        res.status(201).json(newProject)
    }catch(error){
        console.error("Create Project Error:",error)
        res.status(500).json({error:"Failed to create project"});
    }
});

router.get('/org/:orgId', async(req,res)=>{
    try{
        const {orgId}=req.params;
        const userId=req.user.userId;
        const role=req.user.role;

        let projects;

        if(role=='admin'){
            projects=await Project.find({organization: orgId}).populate('assignedMembers','name role');
        } else{
            projects=await Project.find({
                organization:orgId,
                assignedMembers:userId
            }).populate('assignedMembers','name role');
        } 

        res.status(200).json(projects);
    } catch(error){
        console.error("Fetch Projects Error: ", error);
        res.status(500).json({error:"Failed to fetch projects"});
    }
});

router.put('/:id/brief',requireRole(['admin','developer']), async(req,res)=>{
    try{
        const projectId=req.params.id;
        const {projectBrief}=req.body;

        const updatedProject=await Project.findByIdAndUpdate(
            projectId,
            {projectBrief},
            {new:true}
        );

        if(!updatedProject) return res.status(404).json({error:"Project not found"});

        res.status(200).json(updatedProject);
    } catch(error){
        console.error("Brief Update Error: ", error);
        res.status(500).json({error:"Failed to update project brief"});
    }
});

router.get('/:id', async (req,res)=>{
    try{
        const project=await Project.findById(req.params.id);
        
        if(!project)return res.status(404).json({error:"Project not found"});
        res.status(200).json(project);
    }catch(error){
        console.error("Fetch Project Error: ",error);
        res.status(500).json({error:"Failed to feth projects"});
    }
});

module.exports=router;