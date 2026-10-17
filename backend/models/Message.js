//to store chats

const mongoose=require('mongoose');

const messageSchema=new mongoose.Schema({
    text:{
        type:"String",
        required:true
    },
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    //determines what type of room is the message in
    roomType:{
        type:String,
        enum:['client-group','internal-group','direct'],
        required:true
    },
    //if its a group chat, then this becomes project Id.
    //if its a direct message, we will generate a unique string combining both User Id
    roomReferenceId:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
});

module.exports=mongoose.model('Message', messageSchema);