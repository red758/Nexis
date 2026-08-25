const mongoose=require('mongoose');

const userSchema= new mongoose.Schema({
    name:{type:String, required:true},
    email:{type:String, required:true, unique:true},
    organization:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Organization',
        required:true
    },
    createdAt:{type:Date, default:Date.now}
})

module.exports=mongoose.model('User',userSchema);