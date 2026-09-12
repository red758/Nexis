const mongoose=require('mongoose');

const organizationSchema=new mongoose.Schema({
    name:{type:String, required: true},
    projectBrief:{
        type:String,
        default:"Welcome to your new workspace. Add your project requirements, scope, and core goals here."
    },
    createdAt:{type:Date, default:Date.now}
});

module.exports=mongoose.model('Organization', organizationSchema);