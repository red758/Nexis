const mongoose=require('mongoose');

const userSchema= new mongoose.Schema({
   
    name:{type:String, required:true},
   
    email:{type:String, required:true, unique:true},
   
    password:{type:String, required:true},

    memberships:[{

        organization:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Organization',
            required:true
        },

        role:{
            type:String,
            enum:['admin', 'developer', 'client'],
            default:'client'
        }
    
    }, {_id:false} ],
   
    createdAt:{type:Date, default:Date.now}
})

module.exports=mongoose.model('User',userSchema);