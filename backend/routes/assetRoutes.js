const express=require('express');
const router=express.Router();
const Asset=require('../models/Asset');
const { requireRole }=require('../middleware/auth');
const { upload }=require('../config/cloudinary');

//Get assets belonging to organization
router.get('/:orgId',async(req,res)=>{
    try{
        const assets=await Asset.find({organization: req.params.orgId})
            .populate('uploadedBy', 'name role') //get the uploader's name
            .sort({createdt: -1}); //gives newest files first

        res.status(200).json(assets);
    }catch(error){
        console.error("Fetch Assets Error: ",error);
        res.status(500).json({error:"Failed to fetch assets"});
    }
});

//Upload a new asset
router.post('/:orgId', requireRole(['admin', 'collaborator']), upload.single('file'), 
    async(req,res)=>{
        try{
            
            if(!req.file){
                return res.status(400).json({error:"No file uploaded"});
            }

            const newAsset=await Asset.create({
                fileName: req.file.originalname,
                fileUrl:req.file.path,
                uploadedBy: req.user.userId,
                organization: req.params.orgId
            });

            const populatedAsset=await Asset.findById(newAsset._id).populate('uploadedBy', 'name role');

            res.status(201).json(populatedAsset);
        }catch(error){
            console.error('Asset Upload Error: ',error);
            res.status(500).json({error:"Failed to upload the asset"});
        }
    }
);
