const express=require('express');
const router=express.Router();
const Task=require('../models/Task');

//Create tasks
router.post('/',async (req,res)=>{
    try{
        const {title, assigneeId, organizationId}=req.body;

        const newTask=await Task.create({
            title,
            assignee: assigneeId,
            organization:organizationId
        });

        //Websocket Shout (Access the io object)
        const io=req.app.get('io');

        io.to(organizationId).emit('task_added',{
            message: `A new task was added: "${title}"` 
        });

        res.status(201).json(newTask);
    }
    catch(error){
        console.error(error);
        res.status(500).json({error:"Failed to create task"})
    }
});

//Get tasks of the particular Workspace Organization
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