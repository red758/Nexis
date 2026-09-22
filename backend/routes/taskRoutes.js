const express=require('express');
const router=express.Router();
const Task=require('../models/Task');
const User = require('../models/User'); 
const {requireRole}=require('../middleware/auth');

//Delete a task from organization 
router.delete('/:id', requireRole(['admin']), async (req,res)=>{
    try{
        console.log('on delete');
        //Extracting id from route parameters
        const taskId=req.params.id;

        if(!taskId){
            res.status(404).json({message:"Task not found"});
        }

        const task=await Task.findById(taskId);
        if(!task){
            return res.status(404).json({message:"Task not found"});
        } 

        const adminUser = await User.findById(req.user.userId);
        const userName = adminUser ? adminUser.name : "User";

        //console.log(task);
        await Task.findByIdAndDelete(taskId);

        const roomString = task.organization.toString();

        const io=req.app.get('io');
        io.to(roomString).emit('task_deleted',{
            message:`Task ${task.title} was deleted by ${userName}`
        });

        res.status(200).json({message:'Task deleted successfully'});
    }catch(error){
        console.error(error);
        res.status(500).json({error:'Failed to delete Task'});
    }
});

//Create tasks
router.post('/',async (req,res)=>{
    try{
        console.log('task creation started');

        const {title, assigneeId, organizationId, userName}=req.body;
        
        const newTask=await Task.create({
            title:title,
            assignee: assigneeId,
            organization:organizationId
        });

        const roomString = String(organizationId);

        //Websocket Shout (Access the io object)
        const io=req.app.get('io');

        io.to(roomString).emit('task_added',{
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

//Updating the task status
router.put('/:id',async (req,res)=>{
    try{
        const {status, organizationId, title, userName} = req.body;
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            {status:status},
            {new:true} //tells to return the updated version of task
        );

        const roomString=String(organizationId);

        const io=req.app.get('io');
        
        io.to(roomString).emit('task_updated',{
            message:`${userName} changed "${title}" status to ${status}`
        });
        res.status(200).json(updatedTask);
    }catch(error){
        console.error(error);
        res.status(500).json({error:"Failed to update the task"});
    }
});

module.exports=router;