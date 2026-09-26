const mongoose=require('mongoose');

const assetSchema=new mongoose.Schema({
    
    fileName:{type:String, required:true},
    
    fileUrl:{type:String, required:true},

    cloudinaryPublicId: {type: String, required:true},
    resourceType: {type:String, required:true},
    fileExtension: {type:String, required:true},
    
    uploadedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    
    organization:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Organization',
        required:true
    },
    
    createdAt:{type:Date, default:Date.now}
});

module.exports=mongoose.model('Asset',assetSchema);