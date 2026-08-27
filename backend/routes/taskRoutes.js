const express=require('express');
const router=express.Router();
const Task=require('../models/Task');

router.post('/',async (req,res)=>{
    try{
        const {title, assigneeId, organizationId}=req.body;

        const newTask=await Task.create({
            title:title,
            assignee: assigneeId,
            organization:organizationId
        });

        res.status(201).json(newTask);
    }
    catch(error){
        console.error(error);
        res.status(500).json({error:"Failed to create task"})
    }
});

router.get('/:orgId', async (req,res)=>{
    try{
        const {orgId}=req.params

        const tasks=await Task.find({organization: orgId}).populate('assignee');

        res.status(200).json(tasks);
    }
    catch(error){
        res.status(500).json({error:"Failed to fetch tasks"});
    }
});

module.exports=router;