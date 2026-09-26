const express=require('express');
const router=express.Router();
const Asset=require('../models/Asset');
const { requireRole }=require('../middleware/auth');
const { upload }=require('../config/cloudinary');
const { cloudinary } = require('../config/cloudinary');
const https = require('https');

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
router.post('/:orgId', requireRole(['admin', 'collaborator']), function (req, res, next) {
        upload.single('file')(req, res, function (err) {
            if (err) {
                console.log("CLOUDINARY/MULTER CRASHED:", err);
                return res.status(500).json({ error: err.message });
            }
            // If upload succeeds, move to the next function
            next(); 
        });
    },
        async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: "No file uploaded" });
            }

            console.log("Processing verified payload for:", req.file.originalname);

            //Extracting file extension safely
            const fileExt = req.file.originalname.split('.').pop().toLowerCase();

            //Mapping the resource_type manually based on file extension
            let resourceType = 'raw';
            const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'pdf']; 
            const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'mp3', 'wav'];

            if (imageExtensions.includes(fileExt)) {
                resourceType = 'image';
            } else if (videoExtensions.includes(fileExt)) {
                resourceType = 'video';
            }

            //FALLBACK FOR THE USER ID:
            //Checking all common variants where auth middleware might store the user ID
            const targetUserId = req.user?.userId || req.user?._id || req.user?.id;
            
            if (!targetUserId) {
                return res.status(401).json({ error: "User session identification not found in request context" });
            }

            //Saving things in MongoDB
            const newAsset = await Asset.create({
                fileName: req.file.originalname, 
                fileUrl: req.file.path,           
                cloudinaryPublicId: req.file.filename, 
                resourceType: resourceType,            
                fileExtension: fileExt,                
                uploadedBy: targetUserId,
                organization: req.params.orgId
            });

            //Populate and return response
            const populatedAsset = await Asset.findById(newAsset._id).populate('uploadedBy', 'name role');
            return res.status(201).json(populatedAsset);

        } catch (error) {
            console.error('Asset Upload Processing Error: ', error);
            return res.status(500).json({ error: "Failed to process and store uploaded asset metadata." });
        }
    }
);

//delete an Asset
router.delete('/:id', requireRole(['admin', 'collaborator']), async(req, res)=>{
    try{
        await Asset.findByIdAndDelete(req.params.id);
        res.status(200).json({message:"Asset deleted"});
    }catch(error){
        res.status(500).json({error:"Failed to delete asset"});
    }
});

// Download an asset 
// Download an asset (The Secure Node.js Fetch Method)
router.get('/download/:id', requireRole(['admin', 'collaborator']), async (req, res) => {
    try {
        const asset = await Asset.findById(req.params.id);
        if (!asset) return res.status(404).json({ error: "File not found" });

        console.log(`☁️ Fetching file from Cloudinary: ${asset.fileUrl}`);

        // 1. Ask Cloudinary for the file using modern Fetch
        const cloudResponse = await fetch(asset.fileUrl);
        
        // 2. If Cloudinary throws an error, STOP! Do not send a corrupted file to the user.
        if (!cloudResponse.ok) {
            console.error(`Cloudinary rejected the request: ${cloudResponse.status} ${cloudResponse.statusText}`);
            return res.status(500).json({ error: "Failed to pull file from cloud storage." });
        }

        // 3. Convert the response into raw binary data (Buffer)
        const arrayBuffer = await cloudResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 4. Force the browser to download it as a binary attachment
        res.setHeader('Content-Disposition', `attachment; filename="${asset.fileName}"`);
        res.setHeader('Content-Type', 'application/octet-stream');
        
        // 5. Send the perfect binary file to React!
        res.send(buffer);

    } catch (error) {
        console.error("Secure asset download proxy failed:", error);
        return res.status(500).json({ error: "Server error during download" });
    }
});



module.exports=router;