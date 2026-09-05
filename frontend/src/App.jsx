import { useState, useEffect } from 'react';
import axios from 'axios';
import {io} from 'socket.io-client';

//We create the connection outside the component so it doesnt re-connect every time the component re render
const socket=io('http://localhost:5000');

axios.interceptors.request.use((config)=>{
  const token=localStorage.getItem('nexis_token');
  if(token){
    config.headers['Authorization']=`Bearer ${token}`;
  }
  console.log(config);
  return config;
}, (error)=>{
  return Promise.reject(error);
});

function App() {
  const [currentUser, setCurrentUser]=useState(null);
  const [tasks, setTasks]=useState([]);
  const [taskTitle, setTaskTitle]=useState('');
  
  //To store our notifications
  const [notifications, setNotifications]=useState([]);

  //For Query features
  const [queryResults, setQueryResults]=useState([]);
  const [queryType, setQueryType]=useState('status'); //Default to grouping by status

  //Registration data
  const [registerData, setRegisterData]=useState({userName:'', email:'', password:'', orgName:''});
  const [loginData, setLoginData]=useState({email:'', password:''});
  const [isLoginMode, setIsLoginMode]=useState(true);

  //Ai features
  const [aiPrompt, setAiPrompt]=useState('');
  const [isAiLoading, setIsAiLoading]=useState(false);

  //Websocket setup
  useEffect(()=>{
    if(currentUser){
        //Get the organization id
        const orgId =currentUser.organization._id ? currentUser.organization._id : currentUser.organization;
        //Tell the server to put us this organization channel
        socket.emit('join_workspace', orgId);
        //Keep listening for the task added shout from the server
        
        socket.on('task_added',(data)=>{
          console.log('Radio message received');          
          //Add messages to our notifiactions list
          setNotifications((prev)=>[data.message, ...prev]);
          //To get instant view of new task added by different people in same organization
          fetchTasks(orgId);        
          runDynamicQuery(orgId, queryType);
        });

        socket.on('task_updated',(data)=>{
          setNotifications((prev)=>[data.message, ...prev]);
          fetchTasks(orgId);
          runDynamicQuery(orgId, queryType);
        });

      //To disconnect the socket
      return()=>{
        socket.off('task_added');
        socket.off('task_updated');
      };
    }
  },[currentUser, queryType]);

  const fetchTasks=async (orgId)=>{
    try{
      const response=await axios.get(`http://localhost:5000/api/tasks/${orgId}`);
      setTasks(response.data);
    }
    catch(error){
      console.error('Error fetching tasks: ',error);
    }
    //console.log(response.data); 
  };

  const handleRegister=async (e)=>{
    e.preventDefault();
    try{
      await axios.post('http://localhost:5000/api/users/register', registerData);
      alert("Registration succesfull you can now login");
      setIsLoginMode(true);
    }catch(error){
      console.error("Registration failed: ",error);
      alert(error.response?.data?.error || "Registration failed");
    }
  };
  
  const handleLogin = async (e) => {
    //console.log("CLICKED USER DATA:", user);
    e.preventDefault();
    console.log("LOGIN BUTTON WAS CLICKED!");
    console.log("Data ready to send:", loginData);
    try{
      const response= await axios.post('http://localhost:5000/api/users/login', loginData);
      //Save JWT token in local storage
      localStorage.setItem('nexis_token', response.data.token);
      
      const user=response.data.user;
      setCurrentUser(user);

      const orgId=user.organization._id ? user.organization._id : user.organization;
      fetchTasks(orgId);
      runDynamicQuery(orgId, 'status');
    }catch(error){
      alert(error.response?.data?.error || "Invalid email or password");
    }
  };

  const handleLogout = () => {
    //Remove JWT token from local storage
    localStorage.removeItem('nexis_token');
    setCurrentUser(null);
    setTasks([]);
    //Cut the live connection immediately. (This stops background listeners from running and prevents memory leaks.)
    socket.disconnect(); 
    //Turn the socket back on so it is ready for the next person who logins on this computer.
    socket.connect(); 
  };


  const handleCreateTask = async (e) => {
    e.preventDefault();
    const orgId = currentUser.organization._id ? currentUser.organization._id : currentUser.organization;
    const userName=currentUser.name;
    try{
      await axios.post(`http://localhost:5000/api/tasks/${userName}`, {
        title: taskTitle,
        assigneeId: currentUser._id,
        organizationId: orgId 
      });
      setTaskTitle('');
      fetchTasks(orgId);
      runDynamicQuery(orgId, queryType);
    }catch(error){
      console.error("Error creating task: ",error);
    }
  };

  const handleDeleteTask = async (taskId)=>{
    if(window.confirm("Do you want to delete this task?"));
    const orgId= currentUser.organization._id ? currentUser.organization._id : currentUser.organization;
    try{
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}`);
      fetchTasks(orgId);
      runDynamicQuery(orgId, queryType);
    }catch(error){
      console.error("Error deleting the task", error);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus, taskTitle)=>{
    const orgId=currentUser.organization._id ? currentUser.organization._id : currentUser.organization;
    try{
      await axios.put(`http://localhost:5000/api/tasks/${taskId}`,{
        status:newStatus,
        organizationId:orgId,
        title:taskTitle,
        userName:currentUser.name
      });
      fetchTasks(orgId);
      runDynamicQuery(orgId, queryType);
    }catch(error){
      console.error("Error updating the task: ",error);
    }
  };
  
  const runDynamicQuery = async (orgId, type)=>{
    try{
      const response=await axios.post(`http://localhost:5000/api/query`,{
        organizationId:orgId,
        groupBy:type
      });
      setQueryResults(response.data);
    }catch(error){
      console.error("Error running query: ",error);
    }
  };

  const handleAiGenerate=async (e)=>{
    e.preventDefault();
    setIsAiLoading(true);

    const orgId=currentUser.organization._id ? currentUser.organization._id : currentUser.organization;
    try{
      await axios.post('http://localhost:5000/api/ai/generate',{
        prompt:aiPrompt,
        assigneeId: currentUser._id,
        organizationId: orgId,
        userName: currentUser.name
      });

      setAiPrompt('');
      fetchTasks(orgId);
      runDynamicQuery(orgId, queryType);
    }catch(error){
      console.error("Error generating AI tasks: ",error);
      alert("AI tasks generation failed");
    }finally{
      setIsAiLoading(false);
    }
  };

  if(currentUser){
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">

        {/* ULTRA CLEAN NAVBAR */}
        <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-slate-900 rounded-md flex items-center justify-center text-white font-bold text-lg">
              N
            </div>
            <h2 className="text-lg font-bold text-slate-900">{currentUser.organization.name}</h2>
          </div>
          <div className="flex items-center gap-6">
            <p className="text-sm font-medium text-slate-600">Welcome, <span className="text-slate-900 font-bold">{currentUser.name}</span></p>
            <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-100 rounded-md transition-colors">
              Logout
            </button>
          </div>
        </nav>

        {/* MAIN DASHBOARD */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* FLAT AI COPILOT */}
            <div className="bg-white rounded-xl p-6 md:p-8 border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold mb-1 text-slate-900 flex items-center gap-2">✦ Nexis AI Copilot</h3>
              <p className="text-slate-500 mb-6 text-sm">Type a goal, and our AI will break it down into technical tasks instantly.</p>
              
              <form onSubmit={handleAiGenerate} className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="text"
                  placeholder="e.g. Build a secure authentication system..."
                  value={aiPrompt}
                  onChange={(e)=>setAiPrompt(e.target.value)}
                  required
                  className="flex-1 px-4 py-2 rounded-md bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                  disabled={isAiLoading}
                />
                <button
                  type="submit"
                  disabled={isAiLoading}
                  className="px-6 py-2 bg-slate-900 text-white font-medium rounded-md hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-wait"
                >
                  {isAiLoading ? 'Planning...' : 'Auto-Plan'}
                </button>
              </form>
            </div>

            {/* FLAT ANALYTICS */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900">Dynamic Reports</h3>
                <select 
                  value={queryType}
                  onChange={(e)=>{
                    setQueryType(e.target.value);
                    const orgId = currentUser.organization._id ? currentUser.organization._id : currentUser.organization;
                    runDynamicQuery(orgId, e.target.value);
                  }}
                  className="bg-white border border-slate-200 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-slate-900 font-medium cursor-pointer"
                >
                  <option value="status">Group By Status</option>
                  <option value="assignee">Group By Assignee</option>
                </select>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {queryResults.map((result, index)=>(
                  <div key={index} className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col justify-center items-center text-center">
                    <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">{result._id}</span>
                    <strong className="text-2xl font-bold text-slate-900">{result.count}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* TASKS SECTION */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">Project Tasks</h3>
              
              <form onSubmit={handleCreateTask} className="flex gap-3 mb-6 bg-white p-1.5 rounded-lg border border-slate-200 shadow-sm">
                <input 
                  type="text"
                  placeholder="Add a task..."
                  value={taskTitle}
                  onChange={(e)=>setTaskTitle(e.target.value)}
                  required
                  className="flex-1 px-3 py-1.5 outline-none bg-transparent text-sm"
                />
                <button type="submit" className="px-4 py-1.5 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors">
                  Add
                </button>
              </form>

              <ul className="space-y-3">
                {tasks.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 bg-white rounded-xl border border-dashed border-slate-300 text-sm">
                    No tasks yet. Create one above.
                  </div>
                ) : (
                  tasks.map(task=>(
                    <li key={task._id} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:border-slate-300 transition-colors group flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <strong className="text-slate-900 font-semibold block mb-1">{task.title}</strong>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          Assigned to: {task.assignee ? task.assignee.name : 'Unassigned'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <select 
                          value={task.status}
                          onChange={(e)=>handelUpdateStatus(task._id, e.target.value, task.title)}
                          className={`text-xs font-medium rounded-md px-2.5 py-1 border cursor-pointer outline-none ${
                            task.status === 'Done' ? 'bg-slate-50 text-slate-900 border-slate-200' : 
                            task.status === 'In Progress' ? 'bg-slate-100 text-slate-900 border-slate-300' : 
                            'bg-white text-slate-600 border-slate-200'
                          }`}
                        >
                          <option value='Todo'>Todo</option>
                          <option value='In Progress'>In Progress</option>
                          <option value='Done'>Done</option>
                        </select>
                        <button onClick={()=>handleDeleteTask(task._id)} className="w-7 h-7 flex items-center justify-center bg-white border border-slate-200 text-slate-400 rounded-md hover:bg-slate-100 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100" title="Delete Task">✕</button>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden sticky top-24 shadow-sm">
              <div className="bg-slate-50 border-b border-slate-200 p-4">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-500"></span>
                  </span>
                  Activity Feed
                </h3>
              </div>
              <div className="p-4 h-[600px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-slate-400 text-xs text-center mt-10">No recent activity.</p>
                ) : (
                  <ul className="space-y-3">
                    {notifications.map((note, index)=>(
                      <li key={index} className="bg-white border border-slate-200 border-l-2 border-l-slate-900 p-3 rounded-md shadow-sm text-xs text-slate-700">
                        {note}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
          
        </main>
      </div>
    );
  }

  return(
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-2xl border border-slate-200">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-semibold text-slate-900 tracking-normal">
            Nexis Workspace
          </h2>
        </div>

        {/*Toggle for registration and login page*/}
        <div className="flex p-1 rounded-lg mb-8 gap-3">
          <button onClick=
            {()=>setIsLoginMode(true)} 
            className={`flex-1 py-2 text-s font-semibold rounded-md transition-all border border-slate-50
              ${isLoginMode ? 'bg-white text-blue-600 shadow-md border border-slate-200 hover:shadow-[4px_5px_5px_rgba(0,0,0,0.2)] hover:scale-105' : 'text-slate-500 hover:text-slate-700 hover:shadow-[4px_4px_5px_rgba(0,0,0,0.2)] hover:border border-slate-200 hover:scale-105'}
            `}
          >
            Login
          </button>

          <button onClick=
          {()=>setIsLoginMode(false)}
          className={`flex-1 py-2 text-s font-semibold rounded-md transition-all border border-slate-50
              ${!isLoginMode ? 'bg-white text-blue-600 shadow-md border border-slate-200 hover:shadow-[4px_5px_5px_rgba(0,0,0,0.2)] hover:scale-105' : 'text-slate-500 hover:text-slate-700 hover:shadow-[4px_4px_5px_rgba(0,0,0,0.2)] hover:border border-slate-200 hover:scale-105'}
            `}
          >
            Register
          </button>
        </div>
        
        {isLoginMode ? (
          /*Login Form*/
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col-reverse">
              <input type="email" placeholder="name@company.com" value={loginData.email} onChange={e=>setLoginData({...loginData, email:e.target.value})} required className="peer w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"/>
              <label className="origin-left block text-sm font-medium text-slate-700 mb-1 transition-all duration-200 peer-focus:text-slate-900 transition-all peer-focus:scale-110 ">Email Address</label>
            </div>
            <div className="flex flex-col-reverse">
              <input type="password" placeholder="••••••••" value={loginData.password} onChange={e=>setLoginData({...loginData, password:e.target.value})} required className="peer w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"/>
              <label className="origin-left block text-sm font-medium text-slate-700 mb-1 transition-all duration-200 peer-focus:text-slate-900 transition-all peer-focus:scale-110 ">Password</label>
            </div>
            <button type="submit" className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all">Secure Login</button>
          </form>
        ):(
          /*Register Form*/
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div className="flex flex-col-reverse">
              <input type="text" placeholder="Full Name" value={registerData.userName} onChange={e=>setRegisterData({...registerData, userName:e.target.value})} required className="peer w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none transition-all"/>
              <label className="origin-left block text-sm font-medium text-slate-700 mb-1 transition-all duration-200 peer-focus:text-slate-900 transition-all peer-focus:scale-110 ">Full Name</label>
            </div>

            <div className="flex flex-col-reverse">
              <input type="email" placeholder="Email" value={registerData.email} onChange={e=>setRegisterData({...registerData, email:e.target.value})} required className="peer w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"/>
              <label className="origin-left block text-sm font-medium text-slate-700 mb-1 transition-all duration-200 peer-focus:text-slate-900 transition-all peer-focus:scale-110 ">Email</label>
            </div>

            <div className="flex flex-col-reverse">
              <input type="password" placeholder="••••••••" value={registerData.password} onChange={e=>setRegisterData({...registerData, password:e.target.value})} required className="peer w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"/>
              <label className="origin-left block text-sm font-medium text-slate-700 mb-1 transition-all duration-200 peer-focus:text-slate-900 transition-all peer-focus:scale-110 ">Create a Password</label>
            </div>

            <div className="flex flex-col-reverse">
              <input type="text" placeholder="Organization Name" value={registerData.orgName} onChange={e=>setRegisterData({...registerData, orgName:e.target.value})} required className="peer w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"/>
              <label className="origin-left block text-sm font-medium text-slate-700 mb-1 transition-all duration-200 peer-focus:text-slate-900 transition-all peer-focus:scale-110 ">Organization Name</label>
            </div>

            <button type="submit" className="py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-all">Create Account</button>
          </form>
        )}
      </div>
    </div>
        
  );

}
export default App;