import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/DataContext';
import axios from "axios";

export default function HomePage() {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [orgName, setOrgName]=useState("");
  const [existingOrg, setExistingOrg]=useState([]);

  // Handle clicking on an organization card
  const handleEnterOrganization = (orgId) => {
    console.log("Request received to enter an organization");

    // Save this as the "Active" org so our Axios Interceptor (Bouncer) knows where we are!
    localStorage.setItem('nexis_active_org', orgId);
    
    navigate(`/org/${orgId}`);
  };

  console.log("this is current user from context: ", currentUser);

  /*const fetchOrganization=async(req,res)=>{
    try{
      e.preventDefault();

      console.log("Request received to fetch existing organizations");

      if(!orgName?.trim()){
        console.log("No organization name given");
        return;
      }
    const response=await axios.get(`http://localhost:5000/api/org/allOrg/${orgName}`);

    if(!response.data){
      console.log("Failed to fetch existing org");
      return;
    }

    setExistingOrg([response.data.allOrg]);
    console.log("existing org set")
    }catch(error){
      console.log("Failed to fetch user org: ", error);
    }
  }*/
  useEffect(()=>{
    console.log("setting user data to state: ",currentUser.memberships);
    setExistingOrg(currentUser.memberships);

  },[])

  const handleCreateOrganization=async(e)=>{
    try{
      e.preventDefault();

      console.log("Request received to create an organization");

      if(!orgName?.trim()){
        console.log("No organization name given");
        return;
      }

      const newOrgData={name:orgName, id:currentUser._id};
      console.log("This is the data being sent", newOrgData);
      
      console.log("Starting to create org");
      const response=await axios.post('http://localhost:5000/api/org/add', newOrgData);
      console.log("Finished creating org")

      if(!response){
        console.log("New Organization not created");
        window.alert("New Organization creation failed");
      }

      console.log("This is the response from creating a new Org: ", response.data);   
      
      setExistingOrg([...existingOrg, response.data.orgAdd])

    }catch(error){
      console.log("Error creating organization: ",error);
      if (error.response) console.log("Server responded with:", error.response.status);
      else if (error.request) console.log("No response received. Network/CORS issue suspected.");
    }
  }
    console.log("These are all the orgs: ", existingOrg);
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* MINIMALIST HEADER */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-slate-900 rounded-md flex items-center justify-center text-white font-bold text-lg">N</div>
          <h2 className="text-lg font-bold text-slate-900">Nexis Global</h2>
        </div>
        <button onClick={logout} className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-100 rounded-md transition-colors">
          Logout
        </button>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-12 flex flex-col gap-10">
        <div className="text-center w-full max-w-2xl mx-auto">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">Welcome, {currentUser.name}</h1>
          <p className="text-slate-500 text-sm">Select an organization to view its projects.</p>
        </div>

        {/*Creating new Projects*/}
        <form 
          onSubmit={handleCreateOrganization} 
          className="group w-full max-w-sm md:max-w-md lg:max-w-lg mx-auto p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-blue-400 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300"
        >
          <h3 className="text-xl font-extrabold text-slate-800 tracking-tight mb-5">
            Create New Organization
          </h3>
          
          <div className="flex flex-col text-left gap-1.5 mb-6">
            <label className="text-sm font-semibold text-slate-600 tracking-wide">
              Organization Name
            </label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10"
              placeholder="e.g. Nexis Industries"
            />
          </div>
          
          <button 
            type="submit"
            className="w-full py-2.5 px-4 bg-slate-900 text-white font-medium rounded-xl shadow-sm hover:bg-blue-600 active:scale-98 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md group-hover:shadow-blue-500/20"
          >
            Create Organization
          </button>
        </form>



        {/* ORGANIZATIONS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {existingOrg.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <span className="text-4xl mb-4 block">📭</span>
              <h3 className="text-lg font-bold">No Organizations</h3>
              <p className="text-slate-500 text-sm">You haven't joined any workspaces yet.</p>
            </div>
          ) : (
            existingOrg.map((Org) => (
              <div 
                key={Org.organization._id} 
                onClick={() => handleEnterOrganization(Org.organization._id)} 
                className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all cursor-pointer group flex flex-col justify-between h-[200px] relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-200 to-slate-300 group-hover:from-blue-500 group-hover:to-indigo-500 transition-all duration-300"></div>
                <div>
                  <div className="flex justify-between items-start mb-4 ">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors mb-1 line-clamp-2">
                      {Org.organization.name}
                    </h3>
                    <span className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-200 shadow-sm font-bold">
                      ➜
                    </span>
                  </div>
                  <span className="inline-block mt-2 px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold uppercase rounded-md border border-slate-200">
                    Role: {Org.role}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}