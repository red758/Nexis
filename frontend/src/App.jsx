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

  const handelUpdateStatus = async (taskId, newStatus, taskTitle)=>{
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

  if(currentUser){
    return(
      <div style={{padding:'20px', fontFamily:'sans-serif', display:'flex', gap:'40px'}}>
        
        {/*Left column tasks*/}
        <div style={{flex:2}}>
          <button onClick={handleLogout} style={{marginBottom:'20px', padding:'8px', cursor:'pointer'}}>Logout</button>
          <h2>{currentUser.organization.name} Workspace</h2>
          <p>Welcome back, {currentUser.name}</p>
          
          {/*Report Section*/}
          <div style={{marginBottom:'30px', backgroundColor:'#e0e7ff', padding:"15px", borderRadius:"8px", border:"1px solid #c7d2fe"}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px'}}>
              <h3 style={{margin:0, color:'#3730a3'}}>Dynamic Reports</h3>

              {/*The Query Panel*/}
              <select 
              value={queryType} 
                onChange={(e)=>{
                  setQueryType(e.target.value); 
                  const orgId=currentUser.organization._id ? currentUser.organization._id : currentUser.organization;
                  runDynamicQuery(orgId, e.target.value);
                }}
                style={{padding:'5px', borderRadius:'4px'}}
              >
                <option value="status">Group by Status</option>
                <option value="assignee">Group by Assignee</option>
              </select>
            </div>

            {/* Canvas for Results */}
            <div style={{display:'flex', gap:'10px', flexWrap:'wrap'}}>
                {queryResults.map((result,index)=>(
                  <div key={index} style={{backgroundColor:'white', padding:'10px 15px', borderRadius:'5px', boxShadow:'0 1px 2px rgba(0,0,0,0.1)'}}>
                    <span style={{color:'gray', fontSize:'12px', display:'block'}}>
                      {result._id}
                    </span>
                    <strong style={{fontSize:'20px'}}>{result.count}</strong>
                  </div>
                ))}
            </div>
          </div>

          {/*Form for creating tasks*/}
          <form onSubmit={handleCreateTask} style={{marginBottom:'30px'}}>
            <input type="text" placeholder="What needs to be done" value={taskTitle} onChange={(e)=>setTaskTitle(e.target.value)} required style={{padding:'10px', width:'300px'}}/>
            <button type="submit" style={{padding:'10px', backgroundColor:'blue', color:'white'}}>Add Task</button>
          </form>

          <h3>Project Tasks</h3>
          <ul style={{listStyleType:'none', padding:0}}>
            {tasks.map(task=>(
              <li key={task._id} style={{border:'1px solid black', padding:'15px', margin:'10px 0', borderRadius:'5px'}}>
                <button onClick={()=>handleDeleteTask(task._id)} style={{float:'right', backgroundColor:'red', color:'white', border:'none', padding:'5px 10px', cursor:'pointer', borderRadius:'3px', marginLeft:'10px'}}>X</button>
                <select value={task.status} onChange={(e)=>{handelUpdateStatus(task._id, e.target.value, task.title)}} style={{float:'right', padding:'5px', borderRadius:'3px', cursor:'pointer'}}>
                  <option value="Todo">Todo</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>  
                </select>
                <strong>{task.title}</strong>
                <p style={{margin:'5px 0 0 0', fontSize:'12px', color:'gray'}}>
                  Assigned to: {task.assignee ? task.assignee.name : 'Unassigned'}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/*Right column: Live notifications*/}
        <div style={{flex:1, backgroundColor:'#f9f9f9', padding:'20px', borderRadius:'8px', border:'1px solid #ddd', maxHeight:'500px', overflowY:'auto'}}>
          <h3>Live Notifications</h3>
          {notifications.length===0 ? (
            <p style={{color:'gray', fontSize:'14px'}}>No New Notifications...</p>
          ):(
            <ul style={{listStyleType:'none', padding:0}}>
              {notifications.map((note,index)=>(
                <li key={index} style={{backgroundColor:'#fff', borderLeft:'4px solid green', padding:'10px', marginBottom:'10px', boxShadow:'0 2px 4px rgba(0,0,0,0.1)'}}>
                  {note}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  return(
    <div style={{fontFamily:'sans-serif', maxWidth:'400px', margin:'100px auto', padding:'30px', border:'1px solid #ccc', borderRadius:'8px', boxShadow:'0 4px 6px rgba(0,0,0,0.1)'}}>
      <h2 style={{textAlign:'center'}}>Nexis Workspace</h2>

      {/*Toggle for registration and login page*/}
      <div style={{ display:"flex", marginBottom:"20px"}}>
        <button onClick=
          {()=>setIsLoginMode(true)} 
          style={{flex:1, padding:"10px", backgroundColor:isLoginMode ? 'black' :'#eee', 
          color: isLoginMode ? 'white' : 'black', 
          border:'none', cursor:'pointer'}}
        >
          Login
        </button>

        <button onClick=
        {()=>setIsLoginMode(false)}
        style={{flex:1, padding:'10px', backgroundColor:isLoginMode ? '#eee' :'black',
          color:isLoginMode ? 'black' : 'white',
          border:'none', cursor:'pointer'}}
        >
          Register
        </button>
      </div>
      
      {isLoginMode ? (
        /*Login Form*/
        <form onSubmit={handleLogin} style={{display:'flex', flexDirection:'column', gap:'15px'}}>
          <input type="email" placeholder="Email" value={loginData.email} onChange={e=>setLoginData({...loginData, email:e.target.value})} required style={{padding:'10px'}}/>
          <input type="password" placeholder="Password" value={loginData.password} onChange={e=>setLoginData({...loginData, password:e.target.value})} required style={{padding:'10px'}}/>
          <button type="submit" style={{padding:'12px', backgroundColor:'blue', color:'white', border:'none', borderRadius:'4px', cursor:'pointer'}}>Secure Login</button>
        </form>
      ):(
        /*Register Form*/
        <form onSubmit={handleRegister} style={{display:'flex', flexDirection:'column', gap:'15px'}}>
          <input type="text" placeholder="Full Name" value={registerData.userName} onChange={e=>setRegisterData({...registerData, userName:e.target.value})} required style={{padding:'10px'}}/>
          <input type="email" placeholder="Email" value={registerData.email} onChange={e=>setRegisterData({...registerData, email:e.target.value})} required style={{padding:'10px'}}/>
          <input type="text" placeholder="Create a Password" value={registerData.password} onChange={e=>setRegisterData({...registerData, password:e.target.value})} required style={{padding:'10px'}}/>
          <input type="text" placeholder="Organization Name" value={registerData.orgName} onChange={e=>setRegisterData({...registerData, orgName:e.target.value})} required style={{padding:'10px'}}/>
          <button type="submit" style={{padding:'12px', backgroundColor:'green', color:'white', border:'none', borderRadius:'4px', cursor:'pointer'}}>Create Account</button>
        </form>
      )}
    </div>
      
  );

}
export default App;