const mongoose=require('mongoose');

const projectSchema=new mongoose.Schema({
    name:{type:String, required:true},
    organization:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Organization',
        required:true
    },
    projectBrief:{
        type:String,
        default:"Welcome to the project. Add your requirements and scope here"
    },
    assignesMembers:[{
        types:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }],
    createdAt:{type:Date, default:Date.now}
});

module.exports=mongoose.model('Project', projectSchema)