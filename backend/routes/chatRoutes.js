const express=require('express');
const router=express.Router();
const Message=require('../models/Message');
const {requireRole}=require('../middleware/auth');

router.get('/:orgId', async(req,res)=>{
    try{
        console.log(`Fetching existing chat for: ${req.params.orgId}`);
        const messages=await Message.find({organization:req.params.orgId})
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

        //Collect data of user with the help of message and populate, to avoid ugly ui of message
        const populatedMessage=await Message.findById(newMessage._id).populate('sender','name role');

        //Check if populated correctly
        console.log("Message saved and populated:", populatedMessage.text);

        //the websocket broadcast
        const io=req.app.get('io');
        const roomString=String(organizationId);

        //Check the room
        console.log(`Broadcasting to room: ${roomString}`);

        io.to(roomString).emit('receive_message',populatedMessage);

        res.status(201).json(populatedMessage);
    }catch(error){
        console.error("Message error: ", error);
        res.status(500).json({error:"Failed to send message"});
    }
});

module.exports=router;