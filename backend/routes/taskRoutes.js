const express=require('express');
const router=express.Router();
const Task=require('../models/Task');

//Delete a task from organization 
router.delete('/:id', async (req,res)=>{
    try{
        //Extracting id from route parameters
        const taskId=req.params.id;
        console.log(taskId);
        if(!taskId){
            res.status(404).json({message:"Task not found"});
        }
        await Task.findByIdAndDelete(taskId);
        res.status(200).json({message:'Task deleted successfully'});
    }catch(error){
        console.error(error);
        res.status(500).json({error:'Failed to delete Task'});
    }
});

//Create tasks
router.post('/:name',async (req,res)=>{
    try{
        const {title, assigneeId, organizationId}=req.body;
        const userName=req.params.name;
        const newTask=await Task.create({
            title,
            assignee: assigneeId,
            organization:organizationId
        });

        //Websocket Shout (Access the io object)
        const io=req.app.get('io');

        io.to(organizationId).emit('task_added',{
            message: `A new task was added: ${title} by ${userName}` 
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