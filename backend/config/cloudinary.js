const cloudinary=require('cloudinary').v2;
const { CloudinaryStorage }=require('multer-storage-cloudinary');
const multer=require('multer');
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Set up the Storage Bridge
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // We dynamically check the file type. 
    // If it's a PDF, DOCX, ZIP, etc., we FORCE Cloudinary to treat it as 'raw' data!
    let resourceType = 'auto';
    if (file.originalname.match(/\.(pdf|zip|docx|doc|csv|xlsx|txt)$/i)) {
      resourceType = 'raw';
    }

    return {
      folder: 'nexis_assets',
      resource_type: resourceType, // Dynamically set to 'raw' or 'auto'
    };
  }
});

//Applying filter to files
const secureFileFilter=(req, file, cb)=>{
    const allowedExtensions=/\.(jpg|jpeg|png|pdf|zip|docx|doc|csv|xlsx|txt)$/i;

    if(file.originalname.match(allowedExtensions)){
        cb(null,true);
    }else{
        cb(new Error("Security Alert: Invalid file type uploaded"),false);
    }
};

const upload=multer({
    storage: storage,
    limits:{fileSize: 10*1024*1024},
    fileFilter:secureFileFilter
});

module.exports={cloudinary, upload};