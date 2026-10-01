const express=require('express');
const router=express.Router();
const Message=require('../models/Message');
const {requireRole}=require('../middleware/auth');

router.get('/:orgId', async(req,res)=>{
    try{
        const messages=await Message.find({organization:req.params.id})
            .populate('sender','name role')
            .sort({createdAt:1})
            .limit(50);

        res.status(200).json(messages);
    } catch (error) {
        console.error("Chat fetch error:", error);
        res.status(500).json({ message: error.message });
    }
});

router.post('/', async(req,res)=>{
    try{
        const {text, senderId, organizationId}=req.body;

        const newMessage=await Message.create({
            text,
            sender: senderId,
            organization: organizationId
        });

        //collect data of user with the help of message and populate, to avoid ugly ui of message
        const populatedMessage=await Message.findById(newMessage._id).populate('sender','name role');

        //the websocket broadcast
        const io=req.app.get('io');
        const roomString=String(organizationId);

        io.to(roomString).emit('receive_message',populatedMessage);

        res.status(201).json(populatedMessage);
    }catch(error){
        console.error("Message error: ", error);
        res.status(500).json({error:"Failed to send message"});
    }
});

module.exports=router;