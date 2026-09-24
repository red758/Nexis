import {useState, useEffect, useContext, useRef} from 'react';
import axios from 'axios';
import RoleGuard from './RoleGuard';
import {AuthContext} from '../context/AuthContext';

export default function ProjectAssets() {

  const {currentUser}=useContext(AuthContext);
  const orgId = currentUser?.organization?._id || currentUser?.organization;
  
  const [assets, setAssets]=useState([]);
  const [isUploading, setIsUploading]=useState(false);

  const fileInputRef=useRef(null);

  //Fetch existing assets
  useEffect(()=>{
    if(!orgId) return;

    const fetchAssets = async ()=>{
      try{
        const response=await axios.get(`http://localhost:5000/api/assets/${orgId}`);
        setAssets(response.data);
      }catch(error){
        console.error("Failed to fetch assets: ", error);
      }
    };

    fetchAssets();
  }, [orgId]);

  //Triggle file input when clicked
  const handleBoxClick=()=>{
    fileInputRef.current.click();
  };

  //handle actual upload process
  const handleUpload = async (e)=>{

    // BUG FIX: Ensure this is actually a file input event!
    if (!e.target || !e.target.files || e.target.files.length === 0) {
      console.log("no file found");
      return; 
    }

    const file=e.target.files[0];

    if(!file) return;

    setIsUploading(true);

    try{
      //using formData cause JSON cannot hold files
      const formData=new FormData();
      formData.append('file', file); 
      const response = await axios.post(`http://localhost:5000/api/assets/${orgId}`, formData, {
        headers: {
          'Content-Type':'multipart/form-data',
        },  
      });
      setAssets((prev)=>[response.data, ...prev]);
    }catch(error){
      console.error("Upload Failed: ", error);
      alert("Failed to upload file");
    }finally{
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = null; 
      }
    }
  };


  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">Project Assets</h3>

        {/*Input section for assets*/}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleUpload}
          className="hidden"
          accept=".jpg, .png, .jpeg, .pdf, .zip, .docx, .doc, .txt, .csv, .xlsx"
        />
        
          {/* Upload area — only visible to team members and admin */}
          <RoleGuard allow={['admin', 'developer']}>
            <div 
              onClick={!isUploading ? handleBoxClick : undefined}
              className={`mb-6 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${ isUploading ? 'border-slate-200 bg-slate-50 cursor-wait pointer-events-none' : 'border-slate-300 hover:bg-slate-50 cursor-pointer'}`}
            >
              {
                isUploading ? (
                  <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-900 mb-2"></div>
                    <p className="text-sm font-medium text-slate-700"> Uploading to Cloudinary...</p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium text-slate-700">Click to Upload</p>
                    <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG (MAX 10Mb)</p>
                  </>
                )
              }
            </div>
          </RoleGuard>

        {/* File list — everyone can see and download (placholders are used for eg) */}
        <ul className="space-y-3">
          
          {
            assets.length===0 ? (
              <p className="text-xs text-center text-slate-400 py-4">No assets uploaded yet</p>
            ) : (
              assets.map((asset)=>(
                <li key={asset._id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg group">
                  <div className="flex items-center gap-3 overflow-hidden">
                    
                    <span className="text-xl shrink-0">
                      {asset.fileName.endsWith('.pdf') ? 'doc' : 'img'}
                    </span>

                    <div className="truncate">
                      <p className="text-sm font-medium text-slate-800 truncate" title={asset.fileName}>
                        {asset.fileName}
                      </p>

                      <p className="text-xs text-slate-500 truncate">
                        Uploaded by {asset.uploadedBy ? asset.uploadedBy.name : 'Unknown'}
                      </p>
                    </div>
                  
                  </div>
                  
                  {/*view button - using cloudinary url*/}
                  <a
                    href={asset.fileUrl.replace('/upload/', '/upload/fl_attachment/')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 text-sm font-medium hover:underline shrink-0 ml-2 cursor-pointer"
                  > 
                    View 
                  </a>
                </li>
              ))
            )
          }

        </ul>
      </div>
    </div>
  );
}
