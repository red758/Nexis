const cloudinary=require('cloudinary').v2;
const { CloudinaryStorage }=require('multer-storage-cloudinary');
const multer=require('multer');
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage=new CloudinaryStorage({
    cloudinary:cloudinary,
    params:{
        folder:'nexis_assets', //cloudinary will create a folder with this name 
        allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'zip', 'docx', 'doc', 'txt', 'csv', 'xlsx'], // allowed formats
        resource_type:'auto'
    }
});

const upload=multer({storage: storage});

module.exports={cloudinary, upload};