const mongoose=require('mongoose');

const taskSchema=new mongoose.Schema({
    title:{type:String, required:true},
    status:{
        type:String,
        enum:['Todo','IN Progress', 'Done'],
        default:'Todo'
    },
    assignee:{type:mongoose.Schema.Types.ObjectId, ref:'User'},
    organization:{type:mongoose.Schema.Types.ObjectId, ref:'Organization', required:true},
    createdAt:{type:Date, default:Date.now}
});

module.exports=mongoose.model('Task',taskSchema);