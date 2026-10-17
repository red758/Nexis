import {useState, useEffect, useContext} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import {AuthContext} from '../context/AuthContext';
import RoleGuard from '../components/RoleGuard';

export default function HomePage(){
    const {currentUser, logout}=useContext(AuthContext);
    const navigate=useNavigate();

    const [projects, setProjects]=useState([]);
    const [newProjectName, setNewProjectName]=useState('');
    const [isLoading, setIsLoading]=useState(true);

    const orgId=currentUser?.organization?._id || currentUser?.organization;

    useEffect(()=>{
        if (!orgId) return;

        const fetchProjects= async ()=>{
            try{
                const response=await axios.get(`http://localhost:5000/api/projects/org/${orgId}`);
                setProjects(response.data);
            }catch(error){
                console.error("Failed to load projects: ",error)
            }finally{
                setIsLoading(false);
            }
        };

        fetchProjects();
    }, [orgId]);

    //create a new project only {admin} can make
    const handleCreateProject= async (e)=>{
        e.preventDefault();
        if(!newProjectName.trim()) return;

        try{
            const response=await axios.post('http://localhost:5000/api/projects',{
                name:newProjectName,
                organizationId:orgId,
                //for now, we auto assign creator, further we will build ui to let admin pick client and dev.
                assignedMembers:[currentUser._id]
            });

            setProjects([...projects, response.data]);
            setNewProjectName('');
        }catch(error){
            console.error("Failed to create project: ",error);
            alert("Error creating project");
        }
    };

    if(isLoading){
        return(
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      
      {/* MINIMALIST HEADER */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-slate-900 rounded-md flex items-center justify-center text-white font-bold text-lg">
            N
          </div>
          <h2 className="text-lg font-bold text-slate-900">{currentUser.organization.name}</h2>
          <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded-md border border-slate-200">
            {currentUser.role}
          </span>
        </div>
        <div className="flex items-center gap-6">
          <p className="text-sm font-medium text-slate-600 hidden sm:block">
            Welcome, <span className="text-slate-900 font-bold">{currentUser.name}</span>
          </p>
          <button onClick={logout} className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-100 rounded-md transition-colors">
            Logout
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-12 flex flex-col gap-10">
        
        {/* CENTERED HEADER & CREATE SECTION */}
        <div className="flex flex-col items-center w-full max-w-2xl mx-auto text-center mb-4">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">Your Projects</h1>
          <p className="text-slate-500 text-sm mb-8">Select a workspace to view tasks, documents, and team chat.</p>

          <RoleGuard allow={['admin']}>
            {/* Sleek, unified input bar */}
            <form 
              onSubmit={handleCreateProject} 
              className="flex gap-2 w-full bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-slate-900 focus-within:border-slate-900 transition-all"
            >
              <div className="flex items-center pl-3 text-slate-400">
                <span className="text-lg font-light">+</span>
              </div>
              <input 
                type="text" 
                placeholder="Initialize new project workspace..." 
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                required
                className="flex-1 px-2 py-2 bg-transparent outline-none text-sm text-slate-900 placeholder-slate-400"
              />
              <button 
                type="submit" 
                disabled={!newProjectName.trim()}
                className="px-6 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Create
              </button>
            </form>
          </RoleGuard>
        </div>

        {/* PROJECTS GRID (Your Original Premium Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {projects.length === 0 && currentUser.role !== 'admin' ? (
            <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <span className="text-4xl mb-4">📭</span>
              <h3 className="text-lg font-bold text-slate-900">No Projects Assigned</h3>
              <p className="text-sm text-slate-500 mt-1">Wait for an Admin to invite you to a workspace.</p>
            </div>
          ) : (
            projects.map((project) => (
              <div 
                key={project._id} 
                onClick={() => navigate(`/project/${project._id}`)} 
                className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all cursor-pointer group flex flex-col justify-between h-[200px] relative overflow-hidden"
              >
                {/* Decorative top accent line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-200 to-slate-300 group-hover:from-blue-500 group-hover:to-indigo-500 transition-all duration-300"></div>
                
                <div>
                  <div className="flex justify-between items-start mb-4 ">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors mb-1 line-clamp-2">
                    {project.name}
                    </h3>
                    <span className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-200 shadow-sm font-bold">
                      ➜
                    </span>
                  </div>
                  
                  <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mt-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    {project.assignedMembers.length} Active Member{project.assignedMembers.length !== 1 && 's'}
                  </p>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-300">
                  <span className="text-xs text-slate-400 font-medium">Created {new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}

        </div>
      </main>
    </div>
  );
}